"""Sample plugin which demonstrates user interface integrations."""

from django.utils.translation import gettext_lazy as _

from part.models import Part
from plugin import InvenTreePlugin
from plugin.helpers import render_template, render_text
from plugin.mixins import SettingsMixin, UserInterfaceMixin


class SampleUserInterfacePlugin(SettingsMixin, UserInterfaceMixin, InvenTreePlugin):
    """A sample plugin which demonstrates user interface integrations."""

    NAME = 'SampleUI'
    SLUG = 'sampleui'
    TITLE = 'Sample User Interface Plugin'
    DESCRIPTION = 'A sample plugin which demonstrates user interface integrations'
    VERSION = '1.0'

    SETTINGS = {
        'ENABLE_PART_PANELS': {
            'name': _('Enable Part Panels'),
            'description': _('Enable custom panels for Part views'),
            'default': True,
            'validator': bool,
        },
        'ENABLE_PURCHASE_ORDER_PANELS': {
            'name': _('Enable Purchase Order Panels'),
            'description': _('Enable custom panels for Purchase Order views'),
            'default': False,
            'validator': bool,
        },
    }

    def get_custom_panels(self, instance_type: str, instance_id: int, request):
        """Return a list of custom panels to be injected into the UI."""
        panels = []

        # First, add a custom panel which will appear on every type of page
        # This panel will contain a simple message

        content = render_text(
            """
            This is a <i>sample panel</i> which appears on every page.
            It renders a simple string of <b>HTML</b> content.

            <br>
            <h5>Instance Details:</h5>
            <ul>
            <li>Instance Type: {{ instance_type }}</li>
            <li>Instance ID: {{ instance_id }}</li>
            </ul>
            """,
            context={'instance_type': instance_type, 'instance_id': instance_id},
        )

        panels.append({
            'name': 'sample_panel',
            'label': 'Sample Panel',
            'content': content,
        })

        # Next, add a custom panel which will appear on the 'part' page
        # Note that this content is rendered from a template file,
        # using the django templating system
        if self.get_setting('ENABLE_PART_PANELS') and instance_type == 'part':
            try:
                part = Part.objects.get(pk=instance_id)
            except (Part.DoesNotExist, ValueError):
                part = None

            if part:
                content = render_template(
                    self, 'uidemo/custom_part_panel.html', context={'part': part}
                )

                panels.append({
                    'name': 'part_panel',
                    'label': 'Part Panel',
                    'content': content,
                })

        # Next, add a custom panel which will appear on the 'purchaseorder' page
        if (
            self.get_setting('ENABLE_PURCHASE_ORDER_PANELS')
            and instance_type == 'purchaseorder'
        ):
            panels.append({
                'name': 'purchase_order_panel',
                'label': 'Purchase Order Panel',
                'content': 'This is a custom panel which appears on the <b>Purchase Order</b> view page.',
            })

        return panels
