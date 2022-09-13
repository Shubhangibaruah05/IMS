# Generated by Django 3.2.15 on 2022-09-13 03:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0047_supplierpart_pack_size'),
    ]

    operations = [
        migrations.AddField(
            model_name='supplierpart',
            name='barcode_data',
            field=models.CharField(blank=True, help_text='Third party barcode data', max_length=500, verbose_name='Barcode Data'),
        ),
        migrations.AddField(
            model_name='supplierpart',
            name='barcode_hash',
            field=models.CharField(blank=True, help_text='Unique hash of barcode data', max_length=128, verbose_name='Barcode Hash'),
        ),
    ]
