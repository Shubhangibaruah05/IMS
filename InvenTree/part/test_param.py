"""Various unit tests for Part Parameters"""

import django.core.exceptions as django_exceptions
from django.test import TestCase, TransactionTestCase

from .models import (Part, PartCategory, PartCategoryParameterTemplate,
                     PartParameter, PartParameterTemplate)


class TestParams(TestCase):
    """Unit test class for testing the PartParameter model"""

    fixtures = [
        'location',
        'category',
        'part',
        'params'
    ]

    def test_str(self):
        """Test the str representation of the PartParameterTemplate model"""
        t1 = PartParameterTemplate.objects.get(pk=1)
        self.assertEqual(str(t1), 'Length (mm)')

        p1 = PartParameter.objects.get(pk=1)
        self.assertEqual(str(p1), 'M2x4 LPHS : Length = 4mm')

        c1 = PartCategoryParameterTemplate.objects.get(pk=1)
        self.assertEqual(str(c1), 'Mechanical | Length | 2.8')

    def test_validate(self):
        """Test validation for part templates"""
        n = PartParameterTemplate.objects.all().count()

        t1 = PartParameterTemplate(name='abcde', units='dd')
        t1.save()

        self.assertEqual(n + 1, PartParameterTemplate.objects.all().count())

        # Test that the case-insensitive name throws a ValidationError
        with self.assertRaises(django_exceptions.ValidationError):
            t3 = PartParameterTemplate(name='aBcde', units='dd')
            t3.full_clean()
            t3.save()  # pragma: no cover


class TestCategoryTemplates(TransactionTestCase):
    """Test class for PartCategoryParameterTemplate model"""

    fixtures = [
        'location',
        'category',
        'part',
        'params'
    ]

    def test_validate(self):
        """Test that category templates are correctly applied to Part instances"""
        # Category templates
        n = PartCategoryParameterTemplate.objects.all().count()
        self.assertEqual(n, 2)

        category = PartCategory.objects.get(pk=8)

        t1 = PartParameterTemplate.objects.get(pk=2)
        c1 = PartCategoryParameterTemplate(category=category,
                                           parameter_template=t1,
                                           default_value='xyz')
        c1.save()

        n = PartCategoryParameterTemplate.objects.all().count()
        self.assertEqual(n, 3)

        # Get test part
        part = Part.objects.get(pk=1)

        # Get part parameters count
        n_param = part.get_parameters().count()
