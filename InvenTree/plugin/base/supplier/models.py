"""Model defintion for supplier mixin."""
from django.db import models
from django.utils.translation import gettext_lazy as _

import common.models
from plugin import registry
from plugin.models import PluginConfig
from plugin.plugin import InvenTreePlugin


class ConnectionSetting(common.models.BaseInvenTreeSetting):
    """This model represents settings for an individual connection."""

    typ = 'connection'

    class Meta:
        """Meta for ConnectionSetting."""
        unique_together = [
            ('connection', 'connection_key', 'plugin', 'key'),
        ]

    plugin = models.ForeignKey(
        PluginConfig,
        related_name='connection_settings',
        null=False,
        verbose_name=_('Plugin'),
        on_delete=models.CASCADE,
    )

    connection = models.ForeignKey(
        common.models.WebConnection,
        related_name='settings',
        null=False,
        verbose_name=_('Connection'),
        on_delete=models.CASCADE,
    )

    connection_key = models.CharField(
        max_length=255,
        verbose_name=_('Connection key'),
        help_text=_('connection key'),
    )

    @classmethod
    def get_setting_definition(cls, key, **kwargs):
        """Overwritten settings definition loader. See PluginSettings as reference."""
        if 'settings' not in kwargs:

            plugin = kwargs.pop('plugin', None)
            connection_key = kwargs.pop('connection_key', None)

            if issubclass(plugin.__class__, InvenTreePlugin):
                plugin = plugin.plugin_config()

            mixin_reg = getattr(registry, 'mixins_suppliers', None)
            if plugin and connection_key and mixin_reg:
                plugin_connection_settings = mixin_reg.get(plugin.key, None)
                if plugin_connection_settings:
                    connection_settings = plugin_connection_settings.get(connection_key, None)
                    if connection_settings:
                        kwargs['settings'] = connection_settings.settings

        return super().get_setting_definition(key, **kwargs)

    def get_kwargs(self):
        """Explicit kwargs required to uniquely identify a particular setting object, in addition to the 'key' parameter."""
        return {
            'plugin': self.plugin,
            'connection_key': self.connection_key,
            'connection': self.connection,
        }

    def __str__(self) -> str:
        """Pretty display name for ConenctionSetting."""
        return f'{self.plugin.key} \ {self.connection_key} \ {self.connection.name} : {self.key}'
