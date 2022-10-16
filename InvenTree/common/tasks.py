"""Tasks (processes that get offloaded) for common app."""

import logging
from datetime import datetime, timedelta

from django.core.exceptions import AppRegistryNotReady

from InvenTree.tasks import ScheduledTask, scheduled_task

logger = logging.getLogger('inventree')


@scheduled_task(ScheduledTask.DAILY)
def delete_old_notifications():
    """Remove old notifications from the database.

    Anything older than ~3 months is removed
    """
    try:
        from common.models import NotificationEntry
    except AppRegistryNotReady:  # pragma: no cover
        logger.info("Could not perform 'delete_old_notifications' - App registry not ready")
        return

    before = datetime.now() - timedelta(days=90)

    # Delete notification records before the specified date
    NotificationEntry.objects.filter(updated__lte=before).delete()
