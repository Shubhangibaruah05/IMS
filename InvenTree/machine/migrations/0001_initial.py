# Generated by Django 3.2.19 on 2023-05-31 20:10

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MachineConfig',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(help_text='Name of machine', max_length=255, unique=True, verbose_name='Name')),
                ('machine_type_key', models.CharField(help_text='Type of machine', max_length=255, verbose_name='Machine Type')),
                ('driver_key', models.CharField(help_text='Driver used for the machine', max_length=255, verbose_name='Driver')),
                ('active', models.BooleanField(default=True, help_text='Machines can be disabled', verbose_name='Active')),
            ],
        ),
        migrations.CreateModel(
            name='MachineSetting',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(help_text='Settings key (must be unique - case insensitive)', max_length=50)),
                ('value', models.CharField(blank=True, help_text='Settings value', max_length=200)),
                ('config_type', models.CharField(choices=[('M', 'Machine'), ('D', 'Driver')], max_length=1, verbose_name='Config type')),
                ('machine_config', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to='machine.machineconfig', verbose_name='Machine Config')),
            ],
            options={
                'unique_together': {('machine_config', 'config_type', 'key')},
            },
        ),
    ]
