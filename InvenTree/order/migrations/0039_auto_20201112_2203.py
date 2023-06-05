# Generated by Django 3.0.7 on 2020-11-12 11:03

from django.db import migrations
import djmoney.models.fields
import common.settings


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0038_auto_20201112_1737'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseorderlineitem',
            name='purchase_price',
            field=djmoney.models.fields.MoneyField(blank=True, decimal_places=4, default_currency=common.settings.currency_code_default, help_text='Unit purchase price', max_digits=19, null=True, verbose_name='Purchase Price'),
        ),
    ]
