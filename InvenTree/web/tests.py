"""Tests for PUI backend stuff."""
import json
from pathlib import Path

from InvenTree.config import get_frontend_settings
from InvenTree.unit_test import InvenTreeTestCase

from .templatetags import spa_helper


class TemplateTagTest(InvenTreeTestCase):
    """Tests for the template tag code."""

    def test_spa_bundle(self):
        """Test the 'spa_bundle' template tag"""
        resp = spa_helper.spa_bundle()
        self.assertTrue(resp.startswith('<link rel="stylesheet" href="/static/web/assets/index'))
        shipped_js = resp.split('<script type="module" src="')[1:]
        self.assertTrue(len(shipped_js) > 0)
        self.assertTrue(len(shipped_js) == 3)

        manifest_file = Path(__file__).parent.joinpath("static/web/manifest.json")
        # Try with removed manifest file
        manifest_file.rename(manifest_file.with_suffix('.json.bak'))  # Rename
        resp = resp = spa_helper.spa_bundle()
        self.assertIsNone(resp)
        manifest_file.with_suffix('.json.bak').rename(manifest_file.with_suffix('.json'))  # Name back

    def test_spa_settings(self):
        """Test the 'spa_settings' template tag"""
        resp = spa_helper.spa_settings()
        self.assertTrue(resp.startswith('<script>window.INVENTREE_SETTINGS='))
        settings_data_string = resp.replace('<script>window.INVENTREE_SETTINGS=', '').replace('</script>', '')
        settings_data = json.loads(settings_data_string)
        self.assertTrue('debug' in settings_data)
        self.assertTrue('server_list' in settings_data)
        self.assertTrue('show_server_selector' in settings_data)
        self.assertTrue('environment' in settings_data)

    def test_get_frontend_settings(self):
        """Test frontend settings retrieval."""
        settings = get_frontend_settings()
        self.assertTrue('debug' in settings)
        self.assertTrue('server_list' in settings)
        self.assertTrue('show_server_selector' in settings)
        self.assertTrue('environment' in settings)
