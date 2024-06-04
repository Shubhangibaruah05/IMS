"""User-configurable settings for the common app."""


def get_global_setting(key, backup_value=None, **kwargs):
    """Return the value of a global setting using the provided key."""
    from common.models import InvenTreeSetting

    return InvenTreeSetting.get_setting(key, backup_value=backup_value, **kwargs)


def set_global_setting(key, value, **kwargs):
    """Set the value of a global setting using the provided key."""
    from common.models import InvenTreeSetting

    return InvenTreeSetting.set_setting(key, value, **kwargs)


def get_user_setting(key, user, backup_value=None, **kwargs):
    """Return the value of a user-specific setting using the provided key."""
    from common.models import InvenTreeUserSetting

    return InvenTreeUserSetting.get_setting(
        key, backup_value=backup_value, user=user, **kwargs
    )


def set_user_setting(key, value, user, **kwargs):
    """Set the value of a user-specific setting using the provided key."""
    from common.models import InvenTreeUserSetting

    return InvenTreeUserSetting.set_setting(key, value, user=user, **kwargs)


def stock_expiry_enabled():
    """Returns True if the stock expiry feature is enabled."""
    from common.models import InvenTreeSetting

    return InvenTreeSetting.get_setting('STOCK_ENABLE_EXPIRY', False, create=False)


def prevent_build_output_complete_on_incompleted_tests():
    """Returns True if the completion of the build outputs is disabled until the required tests are passed."""
    from common.models import InvenTreeSetting

    return InvenTreeSetting.get_setting(
        'PREVENT_BUILD_COMPLETION_HAVING_INCOMPLETED_TESTS', False, create=False
    )
