# Generated by Django 3.2.19 on 2023-06-06 10:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('build', '0044_auto_20230528_1410'),
    ]

    operations = [
        migrations.AddField(
            model_name='builditem',
            name='build_line',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='allocations', to='build.buildline'),
        ),
        migrations.AlterField(
            model_name='builditem',
            name='bom_item',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='allocate_build_items', to='part.bomitem'),
        ),
        migrations.AlterField(
            model_name='builditem',
            name='build',
            field=models.ForeignKey(blank=True, help_text='Build to allocate parts', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='allocated_stock', to='build.build', verbose_name='Build'),
        ),
    ]
