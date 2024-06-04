"""Provides a JSON API for common components."""

import json

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.http.response import HttpResponse
from django.urls import include, path, re_path
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

import django_q.models
from django_q.tasks import async_task
from djmoney.contrib.exchange.models import ExchangeBackend, Rate
from drf_spectacular.utils import OpenApiResponse, extend_schema
from error_report.models import Error
from rest_framework import permissions, serializers
from rest_framework.exceptions import NotAcceptable, NotFound
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

import common.models
import common.serializers
from common.settings import get_global_setting
from generic.states.api import AllStatusViews, StatusView
from InvenTree.api import BulkDeleteMixin, MetadataView
from InvenTree.config import CONFIG_LOOKUPS
from InvenTree.filters import ORDER_FILTER, SEARCH_ORDER_FILTER
from InvenTree.helpers import inheritors
from InvenTree.mixins import (
    ListAPI,
    ListCreateAPI,
    RetrieveAPI,
    RetrieveUpdateAPI,
    RetrieveUpdateDestroyAPI,
)
from InvenTree.permissions import IsStaffOrReadOnly, IsSuperuser
from plugin.models import NotificationUserSetting
from plugin.serializers import NotificationUserSettingSerializer


class CsrfExemptMixin(object):
    """Exempts the view from CSRF requirements."""

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        """Overwrites dispatch to be extempt from csrf checks."""
        return super().dispatch(*args, **kwargs)


class WebhookView(CsrfExemptMixin, APIView):
    """Endpoint for receiving webhooks."""

    authentication_classes = []
    permission_classes = []
    model_class = common.models.WebhookEndpoint
    run_async = False
    serializer_class = None

    @extend_schema(
        responses={
            200: OpenApiResponse(
                description='Any data can be posted to the endpoint - everything will be passed to the WebhookEndpoint model.'
            )
        }
    )
    def post(self, request, endpoint, *args, **kwargs):
        """Process incoming webhook."""
        # get webhook definition
        self._get_webhook(endpoint, request, *args, **kwargs)

        # check headers
        headers = request.headers
        try:
            payload = json.loads(request.body)
        except json.decoder.JSONDecodeError as error:
            raise NotAcceptable(error.msg)

        # validate
        self.webhook.validate_token(payload, headers, request)
        # process data
        message = self.webhook.save_data(payload, headers, request)
        if self.run_async:
            async_task(self._process_payload, message.id)
        else:
            self._process_result(
                self.webhook.process_payload(message, payload, headers), message
            )

        data = self.webhook.get_return(payload, headers, request)
        return HttpResponse(data)

    def _process_payload(self, message_id):
        message = common.models.WebhookMessage.objects.get(message_id=message_id)
        self._process_result(
            self.webhook.process_payload(message, message.body, message.header), message
        )

    def _process_result(self, result, message):
        if result:
            message.worked_on = result
            message.save()
        else:
            message.delete()

    def _escalate_object(self, obj):
        classes = inheritors(obj.__class__)
        for cls in classes:
            mdl_name = cls._meta.model_name
            if hasattr(obj, mdl_name):
                return getattr(obj, mdl_name)
        return obj

    def _get_webhook(self, endpoint, request, *args, **kwargs):
        try:
            webhook = self.model_class.objects.get(endpoint_id=endpoint)
            self.webhook = self._escalate_object(webhook)
            self.webhook.init(request, *args, **kwargs)
            return self.webhook.process_webhook()
        except self.model_class.DoesNotExist:
            raise NotFound()


class CurrencyExchangeView(APIView):
    """API endpoint for displaying currency information."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = None

    @extend_schema(responses={200: common.serializers.CurrencyExchangeSerializer})
    def get(self, request, format=None):
        """Return information on available currency conversions."""
        # Extract a list of all available rates
        try:
            rates = Rate.objects.all()
        except Exception:
            rates = []

        # Information on last update
        try:
            backend = ExchangeBackend.objects.filter(name='InvenTreeExchange')

            if backend.exists():
                backend = backend.first()
                updated = backend.last_update
            else:
                updated = None
        except Exception:
            updated = None

        response = {
            'base_currency': get_global_setting(
                'INVENTREE_DEFAULT_CURRENCY', backup_value='USD'
            ),
            'exchange_rates': {},
            'updated': updated,
        }

        for rate in rates:
            response['exchange_rates'][rate.currency] = rate.value

        return Response(response)


class CurrencyRefreshView(APIView):
    """API endpoint for manually refreshing currency exchange rates.

    User must be a 'staff' user to access this endpoint
    """

    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = None

    def post(self, request, *args, **kwargs):
        """Performing a POST request will update currency exchange rates."""
        from InvenTree.tasks import update_exchange_rates

        update_exchange_rates(force=True)

        return Response({'success': 'Exchange rates updated'})


class SettingsList(ListAPI):
    """Generic ListView for settings.

    This is inherited by all list views for settings.
    """

    filter_backends = SEARCH_ORDER_FILTER

    ordering_fields = ['pk', 'key', 'name']

    search_fields = ['key']


class GlobalSettingsList(SettingsList):
    """API endpoint for accessing a list of global settings objects."""

    queryset = common.models.InvenTreeSetting.objects.exclude(key__startswith='_')
    serializer_class = common.serializers.GlobalSettingsSerializer

    def list(self, request, *args, **kwargs):
        """Ensure all global settings are created."""
        common.models.InvenTreeSetting.build_default_values()
        return super().list(request, *args, **kwargs)


class GlobalSettingsPermissions(permissions.BasePermission):
    """Special permission class to determine if the user is "staff"."""

    def has_permission(self, request, view):
        """Check that the requesting user is 'admin'."""
        try:
            user = request.user

            if request.method in ['GET', 'HEAD', 'OPTIONS']:
                return True
            # Any other methods require staff access permissions
            return user.is_staff

        except AttributeError:  # pragma: no cover
            return False


class GlobalSettingsDetail(RetrieveUpdateAPI):
    """Detail view for an individual "global setting" object.

    - User must have 'staff' status to view / edit
    """

    lookup_field = 'key'
    queryset = common.models.InvenTreeSetting.objects.exclude(key__startswith='_')
    serializer_class = common.serializers.GlobalSettingsSerializer

    def get_object(self):
        """Attempt to find a global setting object with the provided key."""
        key = str(self.kwargs['key']).upper()

        if (
            key.startswith('_')
            or key not in common.models.InvenTreeSetting.SETTINGS.keys()
        ):
            raise NotFound()

        return common.models.InvenTreeSetting.get_setting_object(
            key, cache=False, create=True
        )

    permission_classes = [permissions.IsAuthenticated, GlobalSettingsPermissions]


class UserSettingsList(SettingsList):
    """API endpoint for accessing a list of user settings objects."""

    queryset = common.models.InvenTreeUserSetting.objects.all()
    serializer_class = common.serializers.UserSettingsSerializer

    def list(self, request, *args, **kwargs):
        """Ensure all user settings are created."""
        common.models.InvenTreeUserSetting.build_default_values(user=request.user)
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        """Return prefetched queryset."""
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related('user')

        return queryset

    def filter_queryset(self, queryset):
        """Only list settings which apply to the current user."""
        try:
            user = self.request.user
        except AttributeError:  # pragma: no cover
            return common.models.InvenTreeUserSetting.objects.none()

        queryset = super().filter_queryset(queryset)

        queryset = queryset.filter(user=user)

        return queryset


class UserSettingsPermissions(permissions.BasePermission):
    """Special permission class to determine if the user can view / edit a particular setting."""

    def has_object_permission(self, request, view, obj):
        """Check if the user that requested is also the object owner."""
        try:
            user = request.user
        except AttributeError:  # pragma: no cover
            return False

        return user == obj.user


class UserSettingsDetail(RetrieveUpdateAPI):
    """Detail view for an individual "user setting" object.

    - User can only view / edit settings their own settings objects
    """

    lookup_field = 'key'
    queryset = common.models.InvenTreeUserSetting.objects.all()
    serializer_class = common.serializers.UserSettingsSerializer

    def get_object(self):
        """Attempt to find a user setting object with the provided key."""
        key = str(self.kwargs['key']).upper()

        if (
            key.startswith('_')
            or key not in common.models.InvenTreeUserSetting.SETTINGS.keys()
        ):
            raise NotFound()

        return common.models.InvenTreeUserSetting.get_setting_object(
            key, user=self.request.user, cache=False, create=True
        )

    permission_classes = [UserSettingsPermissions]


class NotificationUserSettingsList(SettingsList):
    """API endpoint for accessing a list of notification user settings objects."""

    queryset = NotificationUserSetting.objects.all()
    serializer_class = NotificationUserSettingSerializer

    def filter_queryset(self, queryset):
        """Only list settings which apply to the current user."""
        try:
            user = self.request.user
        except AttributeError:
            return NotificationUserSetting.objects.none()

        queryset = super().filter_queryset(queryset)
        queryset = queryset.filter(user=user)
        return queryset


class NotificationUserSettingsDetail(RetrieveUpdateAPI):
    """Detail view for an individual "notification user setting" object.

    - User can only view / edit settings their own settings objects
    """

    queryset = NotificationUserSetting.objects.all()
    serializer_class = NotificationUserSettingSerializer
    permission_classes = [UserSettingsPermissions]


class NotificationMessageMixin:
    """Generic mixin for NotificationMessage."""

    queryset = common.models.NotificationMessage.objects.all()
    serializer_class = common.serializers.NotificationMessageSerializer
    permission_classes = [UserSettingsPermissions]

    def get_queryset(self):
        """Return prefetched queryset."""
        queryset = (
            super()
            .get_queryset()
            .prefetch_related(
                'source_content_type',
                'source_object',
                'target_content_type',
                'target_object',
                'user',
            )
        )

        return queryset


class NotificationList(NotificationMessageMixin, BulkDeleteMixin, ListAPI):
    """List view for all notifications of the current user."""

    permission_classes = [permissions.IsAuthenticated]

    filter_backends = SEARCH_ORDER_FILTER

    ordering_fields = ['category', 'name', 'read', 'creation']

    search_fields = ['name', 'message']

    filterset_fields = ['category', 'read']

    def filter_queryset(self, queryset):
        """Only list notifications which apply to the current user."""
        try:
            user = self.request.user
        except AttributeError:
            return common.models.NotificationMessage.objects.none()

        queryset = super().filter_queryset(queryset)
        queryset = queryset.filter(user=user)
        return queryset

    def filter_delete_queryset(self, queryset, request):
        """Ensure that the user can only delete their *own* notifications."""
        queryset = queryset.filter(user=request.user)
        return queryset


class NotificationDetail(NotificationMessageMixin, RetrieveUpdateDestroyAPI):
    """Detail view for an individual notification object.

    - User can only view / delete their own notification objects
    """


class NotificationReadAll(NotificationMessageMixin, RetrieveAPI):
    """API endpoint to mark all notifications as read."""

    def get(self, request, *args, **kwargs):
        """Set all messages for the current user as read."""
        try:
            self.queryset.filter(user=request.user, read=False).update(read=True)
            return Response({'status': 'ok'})
        except Exception as exc:
            raise serializers.ValidationError(
                detail=serializers.as_serializer_error(exc)
            )


class NewsFeedMixin:
    """Generic mixin for NewsFeedEntry."""

    queryset = common.models.NewsFeedEntry.objects.all()
    serializer_class = common.serializers.NewsFeedEntrySerializer
    permission_classes = [IsAdminUser]


class NewsFeedEntryList(NewsFeedMixin, BulkDeleteMixin, ListAPI):
    """List view for all news items."""

    filter_backends = ORDER_FILTER

    ordering = '-published'

    ordering_fields = ['published', 'author', 'read']

    filterset_fields = ['read']


class NewsFeedEntryDetail(NewsFeedMixin, RetrieveUpdateDestroyAPI):
    """Detail view for an individual news feed object."""


class ConfigList(ListAPI):
    """List view for all accessed configurations."""

    queryset = CONFIG_LOOKUPS
    serializer_class = common.serializers.ConfigSerializer
    permission_classes = [IsSuperuser]


class ConfigDetail(RetrieveAPI):
    """Detail view for an individual configuration."""

    serializer_class = common.serializers.ConfigSerializer
    permission_classes = [IsSuperuser]

    def get_object(self):
        """Attempt to find a config object with the provided key."""
        key = self.kwargs['key']
        value = CONFIG_LOOKUPS.get(key, None)
        if not value:
            raise NotFound()
        return {key: value}


class NotesImageList(ListCreateAPI):
    """List view for all notes images."""

    queryset = common.models.NotesImage.objects.all()
    serializer_class = common.serializers.NotesImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = SEARCH_ORDER_FILTER

    search_fields = ['user', 'model_type', 'model_id']

    def perform_create(self, serializer):
        """Create (upload) a new notes image."""
        image = serializer.save()
        image.user = self.request.user
        image.save()


class ProjectCodeList(ListCreateAPI):
    """List view for all project codes."""

    queryset = common.models.ProjectCode.objects.all()
    serializer_class = common.serializers.ProjectCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]
    filter_backends = SEARCH_ORDER_FILTER

    ordering_fields = ['code']

    search_fields = ['code', 'description']


class ProjectCodeDetail(RetrieveUpdateDestroyAPI):
    """Detail view for a particular project code."""

    queryset = common.models.ProjectCode.objects.all()
    serializer_class = common.serializers.ProjectCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]


class CustomUnitList(ListCreateAPI):
    """List view for custom units."""

    queryset = common.models.CustomUnit.objects.all()
    serializer_class = common.serializers.CustomUnitSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]
    filter_backends = SEARCH_ORDER_FILTER


class CustomUnitDetail(RetrieveUpdateDestroyAPI):
    """Detail view for a particular custom unit."""

    queryset = common.models.CustomUnit.objects.all()
    serializer_class = common.serializers.CustomUnitSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]


class ErrorMessageList(BulkDeleteMixin, ListAPI):
    """List view for server error messages."""

    queryset = Error.objects.all()
    serializer_class = common.serializers.ErrorMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    filter_backends = SEARCH_ORDER_FILTER

    ordering = '-when'

    ordering_fields = ['when', 'info']

    search_fields = ['info', 'data']


class ErrorMessageDetail(RetrieveUpdateDestroyAPI):
    """Detail view for a single error message."""

    queryset = Error.objects.all()
    serializer_class = common.serializers.ErrorMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


class BackgroundTaskOverview(APIView):
    """Provides an overview of the background task queue status."""

    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    serializer_class = None

    def get(self, request, format=None):
        """Return information about the current status of the background task queue."""
        import django_q.models as q_models

        import InvenTree.status

        serializer = common.serializers.TaskOverviewSerializer({
            'is_running': InvenTree.status.is_worker_running(),
            'pending_tasks': q_models.OrmQ.objects.count(),
            'scheduled_tasks': q_models.Schedule.objects.count(),
            'failed_tasks': q_models.Failure.objects.count(),
        })

        return Response(serializer.data)


class PendingTaskList(BulkDeleteMixin, ListAPI):
    """Provides a read-only list of currently pending tasks."""

    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    queryset = django_q.models.OrmQ.objects.all()
    serializer_class = common.serializers.PendingTaskSerializer


class ScheduledTaskList(ListAPI):
    """Provides a read-only list of currently scheduled tasks."""

    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    queryset = django_q.models.Schedule.objects.all()
    serializer_class = common.serializers.ScheduledTaskSerializer

    filter_backends = SEARCH_ORDER_FILTER

    ordering_fields = ['pk', 'func', 'last_run', 'next_run']

    search_fields = ['func']

    def get_queryset(self):
        """Return annotated queryset."""
        queryset = super().get_queryset()
        return common.serializers.ScheduledTaskSerializer.annotate_queryset(queryset)


class FailedTaskList(BulkDeleteMixin, ListAPI):
    """Provides a read-only list of currently failed tasks."""

    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    queryset = django_q.models.Failure.objects.all()
    serializer_class = common.serializers.FailedTaskSerializer

    filter_backends = SEARCH_ORDER_FILTER

    ordering_fields = ['pk', 'func', 'started', 'stopped']

    search_fields = ['func']


class FlagList(ListAPI):
    """List view for feature flags."""

    queryset = settings.FLAGS
    serializer_class = common.serializers.FlagSerializer
    permission_classes = [permissions.AllowAny]


class FlagDetail(RetrieveAPI):
    """Detail view for an individual feature flag."""

    serializer_class = common.serializers.FlagSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        """Attempt to find a config object with the provided key."""
        key = self.kwargs['key']
        value = settings.FLAGS.get(key, None)
        if not value:
            raise NotFound()
        return {key: value}


class ContentTypeList(ListAPI):
    """List view for ContentTypes."""

    queryset = ContentType.objects.all()
    serializer_class = common.serializers.ContentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class ContentTypeDetail(RetrieveAPI):
    """Detail view for a ContentType model."""

    queryset = ContentType.objects.all()
    serializer_class = common.serializers.ContentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(operation_id='contenttype_retrieve_model')
class ContentTypeModelDetail(ContentTypeDetail):
    """Detail view for a ContentType model."""

    def get_object(self):
        """Attempt to find a ContentType object with the provided key."""
        model_ref = self.kwargs.get('model', None)
        if model_ref:
            qs = self.filter_queryset(self.get_queryset())
            try:
                return qs.get(model=model_ref)
            except ContentType.DoesNotExist:
                raise NotFound()
        raise NotFound()


settings_api_urls = [
    # User settings
    path(
        'user/',
        include([
            # User Settings Detail
            re_path(
                r'^(?P<key>\w+)/',
                UserSettingsDetail.as_view(),
                name='api-user-setting-detail',
            ),
            # User Settings List
            path('', UserSettingsList.as_view(), name='api-user-setting-list'),
        ]),
    ),
    # Notification settings
    path(
        'notification/',
        include([
            # Notification Settings Detail
            path(
                '<int:pk>/',
                NotificationUserSettingsDetail.as_view(),
                name='api-notification-setting-detail',
            ),
            # Notification Settings List
            path(
                '',
                NotificationUserSettingsList.as_view(),
                name='api-notification-setting-list',
            ),
        ]),
    ),
    # Global settings
    path(
        'global/',
        include([
            # Global Settings Detail
            re_path(
                r'^(?P<key>\w+)/',
                GlobalSettingsDetail.as_view(),
                name='api-global-setting-detail',
            ),
            # Global Settings List
            path('', GlobalSettingsList.as_view(), name='api-global-setting-list'),
        ]),
    ),
]

common_api_urls = [
    # Webhooks
    path('webhook/<slug:endpoint>/', WebhookView.as_view(), name='api-webhook'),
    # Uploaded images for notes
    path('notes-image-upload/', NotesImageList.as_view(), name='api-notes-image-list'),
    # Background task information
    path(
        'background-task/',
        include([
            path('pending/', PendingTaskList.as_view(), name='api-pending-task-list'),
            path(
                'scheduled/',
                ScheduledTaskList.as_view(),
                name='api-scheduled-task-list',
            ),
            path('failed/', FailedTaskList.as_view(), name='api-failed-task-list'),
            path('', BackgroundTaskOverview.as_view(), name='api-task-overview'),
        ]),
    ),
    path(
        'error-report/',
        include([
            path('<int:pk>/', ErrorMessageDetail.as_view(), name='api-error-detail'),
            path('', ErrorMessageList.as_view(), name='api-error-list'),
        ]),
    ),
    # Project codes
    path(
        'project-code/',
        include([
            path(
                '<int:pk>/',
                include([
                    path(
                        'metadata/',
                        MetadataView.as_view(),
                        {'model': common.models.ProjectCode},
                        name='api-project-code-metadata',
                    ),
                    path(
                        '', ProjectCodeDetail.as_view(), name='api-project-code-detail'
                    ),
                ]),
            ),
            path('', ProjectCodeList.as_view(), name='api-project-code-list'),
        ]),
    ),
    # Custom physical units
    path(
        'units/',
        include([
            path(
                '<int:pk>/',
                include([
                    path('', CustomUnitDetail.as_view(), name='api-custom-unit-detail')
                ]),
            ),
            path('', CustomUnitList.as_view(), name='api-custom-unit-list'),
        ]),
    ),
    # Currencies
    path(
        'currency/',
        include([
            path(
                'exchange/',
                CurrencyExchangeView.as_view(),
                name='api-currency-exchange',
            ),
            path(
                'refresh/', CurrencyRefreshView.as_view(), name='api-currency-refresh'
            ),
        ]),
    ),
    # Notifications
    path(
        'notifications/',
        include([
            # Individual purchase order detail URLs
            path(
                '<int:pk>/',
                include([
                    path(
                        '',
                        NotificationDetail.as_view(),
                        name='api-notifications-detail',
                    )
                ]),
            ),
            # Read all
            path(
                'readall/',
                NotificationReadAll.as_view(),
                name='api-notifications-readall',
            ),
            # Notification messages list
            path('', NotificationList.as_view(), name='api-notifications-list'),
        ]),
    ),
    # News
    path(
        'news/',
        include([
            path(
                '<int:pk>/',
                include([
                    path('', NewsFeedEntryDetail.as_view(), name='api-news-detail')
                ]),
            ),
            path('', NewsFeedEntryList.as_view(), name='api-news-list'),
        ]),
    ),
    # Flags
    path(
        'flags/',
        include([
            path('<str:key>/', FlagDetail.as_view(), name='api-flag-detail'),
            path('', FlagList.as_view(), name='api-flag-list'),
        ]),
    ),
    # Status
    path(
        'generic/status/',
        include([
            path(
                f'<str:{StatusView.MODEL_REF}>/',
                include([path('', StatusView.as_view(), name='api-status')]),
            ),
            path('', AllStatusViews.as_view(), name='api-status-all'),
        ]),
    ),
    # Contenttype
    path(
        'contenttype/',
        include([
            path(
                '<int:pk>/', ContentTypeDetail.as_view(), name='api-contenttype-detail'
            ),
            path(
                '<str:model>/',
                ContentTypeModelDetail.as_view(),
                name='api-contenttype-detail-modelname',
            ),
            path('', ContentTypeList.as_view(), name='api-contenttype-list'),
        ]),
    ),
]

admin_api_urls = [
    # Admin
    path('config/', ConfigList.as_view(), name='api-config-list'),
    path('config/<str:key>/', ConfigDetail.as_view(), name='api-config-detail'),
]
