"""This module provides template tags for handeling plugins."""

from django import template
from django.conf import settings as djangosettings
from django.urls import reverse

from common.models import InvenTreeSetting
from common.notifications import storage
from plugin import registry

register = template.Library()


@register.simple_tag()
def plugin_list(*args, **kwargs):
    """List of all installed plugins."""
    return registry.plugins


@register.simple_tag()
def inactive_plugin_list(*args, **kwargs):
    """List of all inactive plugins."""
    return registry.plugins_inactive


@register.simple_tag()
def plugin_settings(plugin, *args, **kwargs):
    """List of all settings for the plugin."""
    return registry.mixins_settings.get(plugin)


@register.simple_tag(takes_context=True)
def plugin_settings_content(context, plugin, *args, **kwargs):
    """Get the settings content for the plugin."""
    plg = registry.get_plugin(plugin)
    if hasattr(plg, 'get_settings_content'):
        return plg.get_settings_content(context.request)
    return None


@register.simple_tag()
def plugin_connections(plugin, *args, **kwargs):
    """List of all connections for the plugin."""
    ret = {}
    plg = registry.mixins_suppliers.get(plugin)
    if plg:
        for key, val in plg.items():
            qs = registry.get_plugin(plugin).db.webconnections.filter(connection_key=key)
            ret[key] = {
                'setup': val,
                'connections': qs,
                'show': len(qs) < 1 or val.multiple,
            }
    return ret


@register.simple_tag()
def mixin_enabled(plugin, key, *args, **kwargs):
    """Is the mixin registerd and configured in the plugin?"""
    return plugin.mixin_enabled(key)


@register.simple_tag()
def mixin_available(mixin, *args, **kwargs):
    """Returns True if there is at least one active plugin which supports the provided mixin."""
    return len(registry.with_mixin(mixin)) > 0


@register.simple_tag()
def navigation_enabled(*args, **kwargs):
    """Is plugin navigation enabled?"""
    if djangosettings.PLUGIN_TESTING:
        return True
    return InvenTreeSetting.get_setting('ENABLE_PLUGINS_NAVIGATION')  # pragma: no cover


@register.simple_tag()
def safe_url(view_name, *args, **kwargs):
    """Safe lookup fnc for URLs.

    Returns None if not found
    """
    try:
        return reverse(view_name, args=args, kwargs=kwargs)
    except Exception:
        return None


@register.simple_tag()
def plugin_errors(*args, **kwargs):
    """All plugin errors in the current session."""
    return registry.errors


@register.simple_tag(takes_context=True)
def notification_settings_list(context, *args, **kwargs):
    """List of all user notification settings."""
    return storage.get_usersettings(user=context.get('user', None))


@register.simple_tag(takes_context=True)
def notification_list(context, *args, **kwargs):
    """List of all notification methods."""
    return [{
        'slug': a.METHOD_NAME,
        'icon': a.METHOD_ICON,
        'setting': a.GLOBAL_SETTING,
        'plugin': a.plugin,
        'description': a.__doc__,
        'name': a.__name__
    } for a in storage.liste]
