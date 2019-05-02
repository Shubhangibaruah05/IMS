"""
URL lookup for Part app. Provides URL endpoints for:

- Display / Create / Edit / Delete PartCategory
- Display / Create / Edit / Delete Part
- Create / Edit / Delete PartAttachment
- Display / Create / Edit / Delete SupplierPart

"""

from django.conf.urls import url, include

from . import views

supplier_part_detail_urls = [
    url(r'edit/?', views.SupplierPartEdit.as_view(), name='supplier-part-edit'),
    url(r'delete/?', views.SupplierPartDelete.as_view(), name='supplier-part-delete'),

    url('^.*$', views.SupplierPartDetail.as_view(), name='supplier-part-detail'),
]

supplier_part_urls = [
    url(r'^new/?', views.SupplierPartCreate.as_view(), name='supplier-part-create'),

    url(r'^(?P<pk>\d+)/', include(supplier_part_detail_urls)),
]

part_attachment_urls = [
    url('^new/?', views.PartAttachmentCreate.as_view(), name='part-attachment-create'),
    url(r'^(?P<pk>\d+)/edit/?', views.PartAttachmentEdit.as_view(), name='part-attachment-edit'),
    url(r'^(?P<pk>\d+)/delete/?', views.PartAttachmentDelete.as_view(), name='part-attachment-delete'),
]

part_detail_urls = [
    url(r'^copy/?', views.PartCopy.as_view(), name='part-copy'),
    url(r'^edit/?', views.PartEdit.as_view(), name='part-edit'),
    url(r'^delete/?', views.PartDelete.as_view(), name='part-delete'),
    url(r'^bom-export/?', views.BomDownload.as_view(), name='bom-export'),
    url(r'^thumbnail/?', views.PartImage.as_view(), name='part-image'),
    
    # Tabbed pages of the main 'PartDetail' view
    url(r'^track/?', views.PartDetail.as_view(template_name='part/track.html'), name='part-track'),
    url(r'^attachments/?', views.PartDetail.as_view(template_name='part/attachments.html'), name='part-attachments'),
    url(r'^bom/?', views.PartDetail.as_view(template_name='part/bom.html'), name='part-bom'),
    url(r'^build/?', views.PartDetail.as_view(template_name='part/build.html'), name='part-build'),
    url(r'^stock/?', views.PartDetail.as_view(template_name='part/stock.html'), name='part-stock'),
    url(r'^used/?', views.PartDetail.as_view(template_name='part/used_in.html'), name='part-used-in'),
    url(r'^allocation/?', views.PartDetail.as_view(template_name='part/allocation.html'), name='part-allocation'),
    url(r'^suppliers/?', views.PartDetail.as_view(template_name='part/supplier.html'), name='part-suppliers'),

    # Any other URLs go to the part detail page
    url(r'^.*$', views.PartDetail.as_view(), name='part-detail'),
]

part_category_urls = [
    url(r'^edit/?', views.CategoryEdit.as_view(), name='category-edit'),
    url(r'^delete/?', views.CategoryDelete.as_view(), name='category-delete'),

    url('^.*$', views.CategoryDetail.as_view(), name='category-detail'),
]

part_bom_urls = [
    url(r'^edit/?', views.BomItemEdit.as_view(), name='bom-item-edit'),
    url('^delete/?', views.BomItemDelete.as_view(), name='bom-item-delete'),

    url(r'^.*$', views.BomItemDetail.as_view(), name='bom-item-detail'),
]

# URL list for part web interface
part_urls = [

    # Create a new category
    url(r'^category/new/?', views.CategoryCreate.as_view(), name='category-create'),

    # Create a new part
    url(r'^new/?', views.PartCreate.as_view(), name='part-create'),

    # Create a new BOM item
    url(r'^bom/new/?', views.BomItemCreate.as_view(), name='bom-item-create'),

    # Individual part
    url(r'^(?P<pk>\d+)/', include(part_detail_urls)),

    # Part category
    url(r'^category/(?P<pk>\d+)/', include(part_category_urls)),

    # Part attachments
    url(r'^attachment/', include(part_attachment_urls)),

    # Bom Items
    url(r'^bom/(?P<pk>\d+)/', include(part_bom_urls)),

    # Top level part list (display top level parts and categories)
    url(r'^.*$', views.PartIndex.as_view(), name='part-index'),
]
