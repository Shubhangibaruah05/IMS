"""API endpoints for barcode plugins."""

import logging

from django.urls import path, re_path
from django.utils.translation import gettext_lazy as _

from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from InvenTree.helpers import hash_barcode
from plugin import registry
from plugin.builtin.barcodes.inventree_barcode import \
    InvenTreeInternalBarcodePlugin
from users.models import RuleSet

from . import serializers as barcode_serializers

logger = logging.getLogger('inventree')


class BarcodeView(CreateAPIView):
    """Custom view class for handling a barcode scan"""

    # Default serializer class (can be overridden)
    serializer_class = barcode_serializers.BarcodeSerializer

    def queryset(self):
        """This API view does not have a queryset"""
        return None

    # Default permission classes (can be overridden)
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def create(self, request, *args, **kwargs):
        """Handle create method - override default create"""

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        barcode = str(data.pop('barcode')).strip()

        return self.handle_barcode(barcode, request, **data)

    def handle_barcode(self, barcode: str, request, **kwargs):
        """Handle barcode scan.

        Arguments:
            barcode: Raw barcode value
            request: HTTP request object

        kwargs:
            Any custom fields passed by the specific serializer
        """
        raise NotImplementedError(f"handle_barcode not implemented for {self.__class__}")


class BarcodeScan(BarcodeView):
    """Endpoint for handling generic barcode scan requests.

    Barcode data are decoded by the client application,
    and sent to this endpoint (as a JSON object) for validation.

    A barcode could follow the internal InvenTree barcode format,
    or it could match to a third-party barcode format (e.g. Digikey).
    """

    def handle_barcode(self, barcode: str, request, **kwargs):
        """Perform barcode scan action

        Arguments:
            barcode: Raw barcode value
            request: HTTP request object

        kwargs:
            Any custom fields passed by the specific serializer
        """

        # Note: the default barcode handlers are loaded (and thus run) first
        plugins = registry.with_mixin('barcode')

        # Look for a barcode plugin which knows how to deal with this barcode
        plugin = None
        response = {}

        for current_plugin in plugins:

            result = current_plugin.scan(barcode)

            if result is None:
                continue

            if "error" in result:
                logger.info("%s.scan(...) returned an error: %s",
                            current_plugin.__class__.__name__, result["error"])
                if not response:
                    plugin = current_plugin
                    response = result
            else:
                plugin = current_plugin
                response = result
                break

        response['plugin'] = plugin.name if plugin else None
        response['barcode_data'] = barcode
        response['barcode_hash'] = hash_barcode(barcode)

        # A plugin has not been found!
        if plugin is None:
            response['error'] = _('No match found for barcode data')

            raise ValidationError(response)
        else:
            response['success'] = _('Match found for barcode data')
            return Response(response)


class BarcodeAssign(BarcodeView):
    """Endpoint for assigning a barcode to a stock item.

    - This only works if the barcode is not already associated with an object in the database
    - If the barcode does not match an object, then the barcode hash is assigned to the StockItem
    """

    serializer_class = barcode_serializers.BarcodeAssignSerializer

    def handle_barcode(self, barcode: str, request, **kwargs):
        """Respond to a barcode assign request.

        Checks inputs and assign barcode (hash) to StockItem.
        """

        # Here we only check against 'InvenTree' plugins
        plugins = registry.with_mixin('barcode', builtin=True)

        # First check if the provided barcode matches an existing database entry
        for plugin in plugins:
            result = plugin.scan(barcode)

            if result is not None:
                result["error"] = _("Barcode matches existing item")
                result["plugin"] = plugin.name
                result["barcode_data"] = barcode

                raise ValidationError(result)

        barcode_hash = hash_barcode(barcode)

        valid_labels = []

        for model in InvenTreeInternalBarcodePlugin.get_supported_barcode_models():
            label = model.barcode_model_type()
            valid_labels.append(label)

            if instance := kwargs.get(label, None):

                # Check that the user has the required permission
                app_label = model._meta.app_label
                model_name = model._meta.model_name

                table = f"{app_label}_{model_name}"

                if not RuleSet.check_table_permission(request.user, table, "change"):
                    raise PermissionDenied({
                        "error": f"You do not have the required permissions for {table}"
                    })

                instance.assign_barcode(
                    barcode_data=barcode,
                    barcode_hash=barcode_hash,
                )

                return Response({
                    'success': f"Assigned barcode to {label} instance",
                    label: {
                        'pk': instance.pk,
                    },
                    "barcode_data": barcode,
                    "barcode_hash": barcode_hash,
                })

        # If we got here, it means that no valid model types were provided
        raise ValidationError({
            'error': f"Missing data: provide one of '{valid_labels}'",
        })


class BarcodeUnassign(BarcodeView):
    """Endpoint for unlinking / unassigning a custom barcode from a database object"""

    serializer_class = barcode_serializers.BarcodeUnassignSerializer

    def create(self, request, *args, **kwargs):
        """Respond to a barcode unassign request."""

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        supported_models = InvenTreeInternalBarcodePlugin.get_supported_barcode_models()

        supported_labels = [model.barcode_model_type() for model in supported_models]
        model_names = ', '.join(supported_labels)

        matched_labels = []

        for label in supported_labels:
            if label in data:
                matched_labels.append(label)

        if len(matched_labels) == 0:
            raise ValidationError({
                'error': f"Missing data: Provide one of '{model_names}'"
            })

        if len(matched_labels) > 1:
            raise ValidationError({
                'error': f"Multiple conflicting fields: '{model_names}'",
            })

        # At this stage, we know that we have received a single valid field
        for model in supported_models:

            label = model.barcode_model_type()

            if instance := data.get(label, None):

                # Check that the user has the required permission
                app_label = model._meta.app_label
                model_name = model._meta.model_name

                table = f"{app_label}_{model_name}"

                if not RuleSet.check_table_permission(request.user, table, "change"):
                    raise PermissionDenied({
                        "error": f"You do not have the required permissions for {table}"
                    })

                # Unassign the barcode data from the model instance
                instance.unassign_barcode()

                return Response({
                    'success': f'Barcode unassigned from {label} instance',
                })

        # If we get to this point, something has gone wrong!
        raise ValidationError({
            'error': 'Could not unassign barcode',
        })


class BarcodePOReceive(BarcodeView):
    """Endpoint for handling receiving parts by scanning their barcode.

    Barcode data are decoded by the client application,
    and sent to this endpoint (as a JSON object) for validation.

    The barcode should follow a third-party barcode format (e.g. Digikey)
    and ideally contain order_number and quantity information.

    The following parameters are available:

    - barcode: The raw barcode data (required)
    - purchase_order: The purchase order containing the item to receive (optional)
    - location: The destination location for the received item (optional)
    """

    serializer_class = barcode_serializers.BarcodePOReceiveSerializer

    def handle_barcode(self, barcode: str, request, **kwargs):
        """Handle a barcode scan for a purchase order item."""

        logger.debug("BarcodePOReceive: scanned barcode - '%s'", barcode)

        # Extract optional fields from the dataset
        purchase_order = kwargs.get('purchase_order', None)
        location = kwargs.get('location', None)

        plugins = registry.with_mixin("barcode")

        # Look for a barcode plugin which knows how to deal with this barcode
        plugin = None
        response = {}

        internal_barcode_plugin = next(filter(
            lambda plugin: plugin.name == "InvenTreeBarcode", plugins
        ))

        if internal_barcode_plugin.scan(barcode):
            response["error"] = _("Item has already been received")
            raise ValidationError(response)

        # Now, look just for "supplier-barcode" plugins
        plugins = registry.with_mixin("supplier-barcode")

        for current_plugin in plugins:

            result = current_plugin.scan_receive_item(
                barcode,
                request.user,
                purchase_order=purchase_order,
                location=location,
            )

            if result is None:
                continue

            if "error" in result:
                logger.info("%s.scan_receive_item(...) returned an error: %s",
                            current_plugin.__class__.__name__, result["error"])
                if not response:
                    plugin = current_plugin
                    response = result
            else:
                plugin = current_plugin
                response = result
                break

        response["plugin"] = plugin.name if plugin else None
        response["barcode_data"] = barcode
        response["barcode_hash"] = hash_barcode(barcode)

        # A plugin has not been found!
        if plugin is None:
            response["error"] = _("No match for supplier barcode")
            raise ValidationError(response)
        elif "error" in response:
            raise ValidationError(response)
        else:
            return Response(response)


barcode_api_urls = [
    # Link a third-party barcode to an item (e.g. Part / StockItem / etc)
    path('link/', BarcodeAssign.as_view(), name='api-barcode-link'),

    # Unlink a third-party barcode from an item
    path('unlink/', BarcodeUnassign.as_view(), name='api-barcode-unlink'),

    # Receive a purchase order item by scanning its barcode
    path("po-receive/", BarcodePOReceive.as_view(), name="api-barcode-po-receive"),

    # Catch-all performs barcode 'scan'
    re_path(r'^.*$', BarcodeScan.as_view(), name='api-barcode-scan'),
]
