"""API for the plugin app."""

from django.urls import include, re_path

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

import plugin.serializers as PluginSerializers
from common.api import GlobalSettingsPermissions
from InvenTree.mixins import (CreateAPI, ListAPI, RetrieveUpdateAPI,
                              RetrieveUpdateDestroyAPI, UpdateAPI)
from InvenTree.permissions import IsSuperuser
from plugin.base.action.api import ActionPluginView
from plugin.base.barcodes.api import barcode_api_urls
from plugin.base.locate.api import LocatePluginView
from plugin.models import PluginConfig, PluginSetting
from plugin.plugin import InvenTreePlugin
from plugin.registry import registry


class PluginList(ListAPI):
    """API endpoint for list of PluginConfig objects.

    - GET: Return a list of all PluginConfig objects
    """

    # Allow any logged in user to read this endpoint
    # This is necessary to allow certain functionality,
    # e.g. determining which label printing plugins are available
    permission_classes = [permissions.IsAuthenticated]

    serializer_class = PluginSerializers.PluginConfigSerializer
    queryset = PluginConfig.objects.all()

    def filter_queryset(self, queryset):
        """Filter for API requests.

        Filter by mixin with the `mixin` flag
        """
        queryset = super().filter_queryset(queryset)

        params = self.request.query_params

        # Filter plugins which support a given mixin
        mixin = params.get('mixin', None)

        if mixin:
            matches = []

            for result in queryset:
                if mixin in result.mixins().keys():
                    matches.append(result.pk)

            queryset = queryset.filter(pk__in=matches)

        return queryset

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        'active',
    ]

    ordering_fields = [
        'key',
        'name',
        'active',
    ]

    ordering = [
        'key',
    ]

    search_fields = [
        'key',
        'name',
    ]


class PluginDetail(RetrieveUpdateDestroyAPI):
    """API detail endpoint for PluginConfig object.

    get:
    Return a single PluginConfig object

    post:
    Update a PluginConfig

    delete:
    Remove a PluginConfig
    """

    queryset = PluginConfig.objects.all()
    serializer_class = PluginSerializers.PluginConfigSerializer


class PluginInstall(CreateAPI):
    """Endpoint for installing a new plugin."""

    queryset = PluginConfig.objects.none()
    serializer_class = PluginSerializers.PluginConfigInstallSerializer

    def create(self, request, *args, **kwargs):
        """Install a plugin via the API"""
        # Clean up input data
        data = self.clean_data(request.data)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        result = self.perform_create(serializer)
        result['input'] = serializer.data
        headers = self.get_success_headers(serializer.data)
        return Response(result, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """Saving the serializer instance performs plugin installation"""
        return serializer.save()


class PluginActivate(UpdateAPI):
    """Endpoint for activating a plugin."""

    queryset = PluginConfig.objects.all()
    serializer_class = PluginSerializers.PluginConfigEmptySerializer
    permission_classes = [IsSuperuser, ]

    def perform_update(self, serializer):
        """Activate the plugin."""
        instance = serializer.instance
        instance.active = True
        instance.save()


class PluginSettingList(ListAPI):
    """List endpoint for all plugin related settings.

    - read only
    - only accessible by staff users
    """

    queryset = PluginSetting.objects.all()
    serializer_class = PluginSerializers.PluginSettingSerializer

    permission_classes = [
        GlobalSettingsPermissions,
    ]

    filter_backends = [
        DjangoFilterBackend,
    ]

    filterset_fields = [
        'plugin__active',
        'plugin__key',
    ]


def check_plugin(plugin_slug: str) -> InvenTreePlugin:
    """Check that a plugin for the provided slug exsists and get the config.

    Args:
        plugin_slug (str): Slug for plugin.

    Raises:
        NotFound: If plugin is not installed
        NotFound: If plugin is not correctly registered
        NotFound: If plugin is not active

    Returns:
        InvenTreePlugin: The config object for the provided plugin.
    """
    # Check that the 'plugin' specified is valid!
    if not PluginConfig.objects.filter(key=plugin_slug).exists():
        raise NotFound(detail=f"Plugin '{plugin_slug}' not installed")

    # Get the list of settings available for the specified plugin
    plugin = registry.get_plugin(plugin_slug)

    if plugin is None:
        # This only occurs if the plugin mechanism broke
        raise NotFound(detail=f"Plugin '{plugin_slug}' not found")  # pragma: no cover

    # Check that the plugin is activated
    if not plugin.is_active():
        raise NotFound(detail=f"Plugin '{plugin_slug}' is not active")

    return plugin


class PluginSettingDetail(RetrieveUpdateAPI):
    """Detail endpoint for a plugin-specific setting.

    Note that these cannot be created or deleted via the API
    """

    queryset = PluginSetting.objects.all()
    serializer_class = PluginSerializers.PluginSettingSerializer

    def get_object(self):
        """Lookup the plugin setting object, based on the URL.

        The URL provides the 'slug' of the plugin, and the 'key' of the setting.
        Both the 'slug' and 'key' must be valid, else a 404 error is raised
        """
        plugin_slug = self.kwargs['plugin']
        key = self.kwargs['key']

        # Look up plugin
        plugin = check_plugin(plugin_slug)

        settings = getattr(plugin, 'settings', {})

        if key not in settings:
            raise NotFound(detail=f"Plugin '{plugin_slug}' has no setting matching '{key}'")

        return PluginSetting.get_setting_object(key, plugin=plugin)

    # Staff permission required
    permission_classes = [
        GlobalSettingsPermissions,
    ]


plugin_api_urls = [
    re_path(r'^action/', ActionPluginView.as_view(), name='api-action-plugin'),
    re_path(r'^barcode/', include(barcode_api_urls)),
    re_path(r'^locate/', LocatePluginView.as_view(), name='api-locate-plugin'),
    re_path(r'^plugins/', include([
        # Plugin settings URLs
        re_path(r'^settings/', include([
            re_path(r'^(?P<plugin>\w+)/(?P<key>\w+)/', PluginSettingDetail.as_view(), name='api-plugin-setting-detail'),
            re_path(r'^.*$', PluginSettingList.as_view(), name='api-plugin-setting-list'),
        ])),

        # Detail views for a single PluginConfig item
        re_path(r'^(?P<pk>\d+)/', include([
            re_path(r'^activate/', PluginActivate.as_view(), name='api-plugin-detail-activate'),
            re_path(r'^.*$', PluginDetail.as_view(), name='api-plugin-detail'),
        ])),

        # Plugin managment
        re_path(r'^install/', PluginInstall.as_view(), name='api-plugin-install'),
        re_path(r'^activate/', PluginActivate.as_view(), name='api-plugin-activate'),

        # Anything else
        re_path(r'^.*$', PluginList.as_view(), name='api-plugin-list'),
    ]))
]
