"""Sample plugin which demonstrates custom validation functionality"""

from datetime import datetime

from django.core.exceptions import ValidationError

from plugin import InvenTreePlugin
from plugin.mixins import SettingsMixin, ValidationMixin


class CustomValidationMixin(SettingsMixin, ValidationMixin, InvenTreePlugin):
    """A sample plugin class for demonstrating custom validation functions.

    Simple of examples of custom validator code.
    """

    NAME = "CustomValidator"
    SLUG = "validator"
    TITLE = "Custom Validator Plugin"
    DESCRIPTION = "A sample plugin for demonstrating custom validation functionality"
    VERSION = "0.2"

    SETTINGS = {
        'ILLEGAL_PART_CHARS': {
            'name': 'Illegal Part Characters',
            'description': 'Characters which are not allowed to appear in Part names',
            'default': '!@#$%^&*()~`'
        },
        'IPN_MUST_CONTAIN_Q': {
            'name': 'IPN Q Requirement',
            'description': 'Part IPN field must contain the character Q',
            'default': False,
            'validator': bool,
        },
        'SERIAL_MUST_BE_PALINDROME': {
            'name': 'Palindromic Serials',
            'description': 'Serial numbers must be palindromic',
            'default': False,
            'validator': bool,
        },
        'BATCH_CODE_PREFIX': {
            'name': 'Batch prefix',
            'description': 'Required prefix for batch code',
            'default': '',
        }
    }

    def validate_part_name(self, name: str, part):
        """Custom validation for Part name field:

        - Name must be shorter than the description field
        - Name cannot contain illegal characters
        """

        if len(part.description) < len(name):
            raise ValidationError("Part description cannot be shorter than the name")

        illegal_chars = self.get_setting('ILLEGAL_PART_CHARS')

        for c in illegal_chars:
            if c in name:
                raise ValidationError(f"Illegal character in part name: '{c}'")

    def validate_part_ipn(self, ipn: str, part):
        """Validate part IPN"""

        if self.get_setting('IPN_MUST_CONTAIN_Q') and 'Q' not in ipn:
            raise ValidationError("IPN must contain 'Q'")

    def validate_serial_number(self, serial: str, part):
        """Validate serial number for a given StockItem"""

        if self.get_setting('SERIAL_MUST_BE_PALINDROME'):
            if serial != serial[::-1]:
                raise ValidationError("Serial must be a palindrome")

        # Serial must start with the same letter as the linked part, for some reason
        if serial[0] != part.name[0]:
            raise ValidationError("Serial number must start with same letter as part")

    def validate_batch_code(self, batch_code: str, item):
        """Ensure that a particular batch code meets specification"""

        prefix = self.get_setting('BATCH_CODE_PREFIX')

        if not batch_code.startswith(prefix):
            raise ValidationError(f"Batch code must start with '{prefix}'")

        if not item.location or not item.location.parent:
            if not batch_code.startswith('T'):
                raise ValidationError("Batch code must start with 'T' for a top level location")

    def generate_batch_code(self):
        """Generate a new batch code."""

        now = datetime.now()
        return f"BATCH-{now.year}:{now.month}:{now.day}"
