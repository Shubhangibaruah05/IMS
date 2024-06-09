# Generated by Django 4.2.12 on 2024-06-08 12:38

from django.db import migrations
from django.core.files.storage import default_storage


def update_attachments(apps, schema_editor):
    """Migrate any existing attachment models to the new attachment table."""

    Attachment = apps.get_model('common', 'attachment')

    # Legacy attachment types to convert:
    # app_label, table name, target model, model ref
    legacy_models = [
        ('build', 'BuildOrderAttachment', 'build', 'build'),
        ('company', 'CompanyAttachment', 'company', 'company'),
        ('company', 'ManufacturerPartAttachment', 'manufacturerpart', 'manufacturer_part'),
        ('order', 'PurchaseOrderAttachment', 'purchaseorder', 'order'),
        ('order', 'SalesOrderAttachment', 'salesorder', 'order'),
        ('order', 'ReturnOrderAttachment', 'order', 'order'),
        ('part', 'PartAttachment', 'part', 'part'),
        ('stock', 'StockItemAttachment', 'stockitem', 'stock_item')
    ]

    # Get the "ContentType" model
    ContentType = apps.get_model('contenttypes', 'ContentType') 

    for app, model, target_model, model_ref in legacy_models:
        LegacyAttachmentModel = apps.get_model(app, model)

        if LegacyAttachmentModel.objects.count() == 0:
            continue

        # Find the ContentType model which matches the target table
        content_type = ContentType.objects.get(app_label=app, model=target_model)

        to_create = []

        for attachment in LegacyAttachmentModel.objects.all():

            # Find the size of the file (if exists)
            if attachment.attachment and default_storage.exists(attachment.attachment.name):
                try:
                    file_size = default_storage.size(attachment.attachment.name)
                except NotImplementedError:
                    file_size = 0
            else:
                file_size = 0

            to_create.append(
                Attachment(
                    model_type=content_type,
                    model_id=getattr(attachment, model_ref).pk,
                    attachment=attachment.attachment,
                    link=attachment.link,
                    comment=attachment.comment,
                    upload_date=attachment.upload_date,
                    upload_user=attachment.user,
                    file_size=file_size
                )
            )

        if len(to_create) > 0:
            print(f"Migrating {len(to_create)} attachments for the legacy '{model}' model.")
            Attachment.objects.bulk_create(to_create)


def delete_attachments(apps, schema_editor):
    """Reverse data migration removes any Attachment objects."""

    Attachment = apps.get_model('common', 'attachment')

    if n := Attachment.objects.count():
        Attachment.objects.all().delete()
        print(f"Deleted {n} Attachments in reverse migration")


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0025_attachment'),
    ]

    operations = [
        migrations.RunPython(update_attachments, reverse_code=delete_attachments)
    ]
