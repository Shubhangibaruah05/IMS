# Generated by Django 3.2.19 on 2023-05-30 18:50

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0100_stockitem_consumed_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockitem',
            name='status',
            field=models.PositiveIntegerField(choices=[(10, 'OK'), (50, 'Attention needed'), (55, 'Damaged'), (60, 'Destroyed'), (65, 'Rejected'), (70, 'Lost'), (75, 'Quarantined'), (85, 'Returned')], default=10, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]
