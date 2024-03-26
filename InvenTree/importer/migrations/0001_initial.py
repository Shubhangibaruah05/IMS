# Generated by Django 4.2.11 on 2024-03-22 01:09

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import importer.validators

from InvenTree.helpers import GetExportFormats
from importer.status_codes import DataImportStatusCode


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DataImportSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True, verbose_name='Timestamp')),
                ('data_file', models.FileField(help_text='Data file to import', upload_to='import', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=GetExportFormats()), importer.validators.validate_data_file], verbose_name='Data File')),
                ('model_type', models.CharField(max_length=100, validators=[importer.validators.validate_importer_model_type])),
                ('status', models.PositiveIntegerField(choices=DataImportStatusCode.items(), default=DataImportStatusCode.INITIAL, help_text='Import status')),
                ('field_defaults', models.JSONField(blank=True, null=True, verbose_name='Field Defaults', validators=[importer.validators.validate_field_defaults])),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
        ),
        migrations.CreateModel(
            name='DataImportColumnMap',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('column', models.CharField(max_length=100, verbose_name='Column')),
                ('field', models.CharField(max_length=100, verbose_name='Field')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='column_mappings', to='importer.dataimportsession', verbose_name='Import Session')),
            ],
            options={
                'unique_together': {('session', 'column'), ('session', 'field')},
            },
        ),
        migrations.CreateModel(
            name='DataImportRow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('row_index', models.PositiveIntegerField(default=0, verbose_name='Row Index')),
                ('row_data', models.JSONField(blank=True, null=True, verbose_name='Original row data')),
                ('data', models.JSONField(blank=True, null=True, verbose_name='Data')),
                ('errors', models.JSONField(blank=True, null=True, verbose_name='Errors')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rows', to='importer.dataimportsession', verbose_name='Import Session')),
                ('valid', models.BooleanField(default=False, verbose_name='Valid')),
                ('complete', models.BooleanField(default=False, verbose_name='Complete')),
            ],
        ),
    ]
