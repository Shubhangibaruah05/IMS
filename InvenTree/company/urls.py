"""
URL lookup for Company app
"""

from django.conf.urls import url, include

from . import views


company_detail_urls = [

    url(r'^thumb-download/', views.CompanyImageDownloadFromURL.as_view(), name='company-image-download'),

    # Any other URL
    url(r'^.*$', views.CompanyDetail.as_view(), name='company-detail'),
]


company_urls = [

    url(r'^(?P<pk>\d+)/', include(company_detail_urls)),

    url(r'suppliers/', views.CompanyIndex.as_view(), name='supplier-index'),
    url(r'manufacturers/', views.CompanyIndex.as_view(), name='manufacturer-index'),
    url(r'customers/', views.CompanyIndex.as_view(), name='customer-index'),

    # Redirect any other patterns to the 'company' index which displays all companies
    url(r'^.*$', views.CompanyIndex.as_view(), name='company-index'),
]

manufacturer_part_urls = [
    
    url(r'^(?P<pk>\d+)/', include([
        url('^.*$', views.ManufacturerPartDetail.as_view(template_name='company/manufacturer_part.html'), name='manufacturer-part-detail'),
    ])),
]

supplier_part_detail_urls = [
    url(r'^edit/?', views.SupplierPartEdit.as_view(), name='supplier-part-edit'),

    url('^.*$', views.SupplierPartDetail.as_view(template_name='company/supplier_part.html'), name='supplier-part-detail'),
]

supplier_part_urls = [
    url(r'^new/?', views.SupplierPartCreate.as_view(), name='supplier-part-create'),

    url(r'delete/', views.SupplierPartDelete.as_view(), name='supplier-part-delete'),

    url(r'^(?P<pk>\d+)/', include(supplier_part_detail_urls)),
]
