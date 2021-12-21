# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

import plugin.models as models
from plugin import plugin_reg


def plugin_update(queryset, new_status: bool):
    """general function for bulk changing plugins"""
    apps_changed = False

    # run through all plugins in the queryset as the save method needs to be overridden
    for plugin in queryset:
        if plugin.active is not new_status:
            plugin.active = new_status
            plugin.save(no_reload=True)
            apps_changed = True

    # reload plugins if they changed
    if apps_changed:
        plugin_reg.reload_plugins()


@admin.action(description='Activate plugin(s)')
def plugin_activate(modeladmin, request, queryset):
    """activate a set of plugins"""
    plugin_update(queryset, True)


@admin.action(description='Deactivate plugin(s)')
def plugin_deactivate(modeladmin, request, queryset):
    """deactivate a set of plugins"""
    plugin_update(queryset, False)


class PluginSettingInlineAdmin(admin.TabularInline):
    model = models.PluginSetting
    extra = 0


class PluginConfigAdmin(admin.ModelAdmin):
    """
    Custom admin with restricted id fields
    """
    
    readonly_fields = ["key", "name", ]
    list_display = ['name', 'key', 'active', '__str__', ]
    list_filter = ['active']
    actions = [plugin_activate, plugin_deactivate, ]
    inlines = [PluginSettingInlineAdmin,]

admin.site.register(models.PluginConfig, PluginConfigAdmin)
