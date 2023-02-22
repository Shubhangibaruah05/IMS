# Generated by Django 2.2 on 2019-05-26 02:15

import InvenTree.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('part', '0005_auto_20190526_1119'),
    ]

    operations = [
        migrations.AlterField(
            model_name='part',
            name='name',
            field=models.CharField(help_text='Part name (must be unique)', max_length=100, unique=True),
        ),
        migrations.AlterUniqueTogether(
            name='part',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='part',
            name='revision',
        ),
    ]
