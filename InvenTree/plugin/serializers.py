"""JSON serializers for plugin app."""

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers

from common.serializers import GenericReferencedSettingSerializer
from plugin.installer import install_plugin
from plugin.models import NotificationUserSetting, PluginConfig, PluginSetting


class MetadataSerializer(serializers.ModelSerializer):
    """Serializer class for model metadata API access."""

    metadata = serializers.JSONField(required=True)

    class Meta:
        """Metaclass options."""

        fields = [
            'metadata',
        ]

    def __init__(self, model_type, *args, **kwargs):
        """Initialize the metadata serializer with information on the model type"""
        self.Meta.model = model_type
        super().__init__(*args, **kwargs)

    def update(self, instance, data):
        """Perform update on the metadata field:

        - If this is a partial (PATCH) update, try to 'merge' data in
        - Else, if it is a PUT update, overwrite any existing metadata
        """
        if self.partial:
            # Default behaviour is to "merge" new data in
            metadata = instance.metadata.copy() if instance.metadata else {}
            metadata.update(data['metadata'])
            data['metadata'] = metadata

        return super().update(instance, data)


class PluginConfigSerializer(serializers.ModelSerializer):
    """Serializer for a PluginConfig."""

    class Meta:
        """Meta for serializer."""
        model = PluginConfig
        fields = [
            'pk',
            'key',
            'name',
            'active',
            'meta',
            'mixins',
            'is_builtin',
            'is_sample',
        ]

        read_only_fields = [
            'key',
            'is_builtin',
            'is_sample',
        ]

    meta = serializers.DictField(read_only=True)
    mixins = serializers.DictField(read_only=True)


class PluginConfigInstallSerializer(serializers.Serializer):
    """Serializer for installing a new plugin."""

    class Meta:
        """Meta for serializer."""
        fields = [
            'url',
            'packagename',
            'confirm',
        ]

    url = serializers.CharField(
        required=False,
        allow_blank=True,
        label=_('Source URL'),
        help_text=_('Source for the package - this can be a custom registry or a VCS path')
    )
    packagename = serializers.CharField(
        required=False,
        allow_blank=True,
        label=_('Package Name'),
        help_text=_('Name for the Plugin Package - can also contain a version indicator'),
    )
    confirm = serializers.BooleanField(
        label=_('Confirm plugin installation'),
        help_text=_('This will install this plugin now into the current instance. The instance will go into maintenance.')
    )

    def validate(self, data):
        """Validate inputs.

        Make sure both confirm and url are provided.
        """
        super().validate(data)

        # check the base requirements are met
        if not data.get('confirm'):
            raise ValidationError({'confirm': _('Installation not confirmed')})
        if (not data.get('url')) and (not data.get('packagename')):
            msg = _('Either packagename of URL must be provided')
            raise ValidationError({'url': msg, 'packagename': msg})

        return data

    def save(self):
        """Install a plugin from a package registry and set operational results as instance data."""
        data = self.validated_data

        packagename = data.get('packagename', '')
        url = data.get('url', '')

        return install_plugin(url, packagename=packagename)

        """
        command = 'python -m pip install'.split()
        command.extend(install_name)
        ret = {'command': ' '.join(command)}
        success = False
        # execute pypi
        try:
            result = subprocess.check_output(command, cwd=settings.BASE_DIR.parent)
            ret['result'] = str(result, 'utf-8')
            ret['success'] = True
            success = True
        except subprocess.CalledProcessError as error:  # pragma: no cover
            ret['result'] = str(error.output, 'utf-8')
            ret['error'] = True

        # save plugin to plugin_file if installed successful
        if success:
            # Read content of plugin file
            plg_lines = open(settings.PLUGIN_FILE).readlines()
            with open(settings.PLUGIN_FILE, "a") as plugin_file:
                # Check if last line has a newline
                if plg_lines[-1][-1:] != '\n':
                    plugin_file.write('\n')
                # Write new plugin to file
                plugin_file.write(f'{" ".join(install_name)}  # Installed {timezone.now()} by {str(self.context["request"].user)}\n')

        # Check for migrations
        offload_task(check_for_migrations, worker=True)

        return ret
        """


class PluginConfigEmptySerializer(serializers.Serializer):
    """Serializer for a PluginConfig."""
    ...


class PluginActivateSerializer(serializers.Serializer):
    """Serializer for activating or deactivating a plugin"""

    model = PluginConfig

    active = serializers.BooleanField(
        required=False, default=True,
        label=_('Activate Plugin'),
        help_text=_('Activate this plugin')
    )

    def update(self, instance, validated_data):
        """Apply the new 'active' value to the plugin instance"""

        instance.active = validated_data.get('active', True)
        instance.save()
        return instance


class PluginSettingSerializer(GenericReferencedSettingSerializer):
    """Serializer for the PluginSetting model."""

    MODEL = PluginSetting
    EXTRA_FIELDS = [
        'plugin',
    ]

    plugin = serializers.CharField(source='plugin.key', read_only=True)


class NotificationUserSettingSerializer(GenericReferencedSettingSerializer):
    """Serializer for the PluginSetting model."""

    MODEL = NotificationUserSetting
    EXTRA_FIELDS = ['method', ]

    method = serializers.CharField(read_only=True)
