


/* globals
    addClearCallback,
    addFieldCallback,
    barcodeDialog,
    calculateTotalPrice,
    clearEvents,
    closeModal,
    constructFormBody,
    companyFormFields,
    constructField,
    constructForm,
    constructOrderTableButtons,
    createSupplierPart,
    endDate,
    formatCurrency,
    formatDecimal,
    FullCalendar,
    initializeChoiceField,
    initializeRelatedField,
    getFormFieldElement,
    getFormFieldValue,
    getTableData,
    global_settings,
    handleFormErrors,
    handleFormSuccess,
    imageHoverIcon,
    inventreeGet,
    inventreeLoad,
    inventreePut,
    launchModalForm,
    loadTableFilters,
    makeCopyButton,
    makeDeleteButton,
    makeEditButton,
    makeIconBadge,
    makeIconButton,
    makeProgressBar,
    makeRemoveButton,
    purchaseOrderStatusDisplay,
    reloadBootstrapTable,
    renderClipboard,
    renderDate,
    renderLink,
    showAlertDialog,
    showApiError,
    showBarcodeMessage,
    setRelatedFieldData,
    setupFilterList,
    startDate,
    stockCodes,
    supplierPartFields,
    thumbnailImage,
    updateFieldValue,
    wrapButtons,
*/

/* exported
    cancelPurchaseOrder,
    completePurchaseOrder,
    createPurchaseOrder,
    createPurchaseOrderLineItem,
    duplicatePurchaseOrder,
    editPurchaseOrder,
    editPurchaseOrderLineItem,
    issuePurchaseOrder,
    loadPurchaseOrderLineItemTable,
    loadPurchaseOrderTable,
    newPurchaseOrderFromOrderWizard,
    newSupplierPartFromOrderWizard,
    orderParts,
    removeOrderRowFromOrderWizard,
    removePurchaseOrderLineItem,
*/



/*
 * Construct a set of fields for a purchase order form
 */
function purchaseOrderFields(options={}) {

    var fields = {
        reference: {
            icon: 'fa-hashtag',
        },
        description: {},
        supplier: {
            icon: 'fa-building',
            secondary: {
                title: 'Add Supplier',
                fields: function() {
                    var fields = companyFormFields();

                    fields.is_supplier.value = true;

                    return fields;
                }
            }
        },
        supplier_reference: {},
        project_code: {
            icon: 'fa-list',
        },
        order_currency: {
            icon: 'fa-coins',
        },
        target_date: {
            icon: 'fa-calendar-alt',
        },
        link: {
            icon: 'fa-link',
        },
        contact: {
            icon: 'fa-user',
            adjustFilters: function(filters) {
                let supplier = getFormFieldValue('supplier', {}, {modal: options.modal});

                if (supplier) {
                    filters.company = supplier;
                }

                return filters;
            }
        },
        address: {
            icon: 'fa-map',
            adjustFilters: function(filters) {
                let supplier = getFormFieldValue('supplier', {}, {modal: options.modal});

                if (supplier) {
                    filters.company = supplier;
                }

                return filters;
            }
        },
        responsible: {
            icon: 'fa-user',
            filters: {
                is_active: true,
            }
        },
    };

    if (options.supplier) {
        fields.supplier.value = options.supplier;
    }

    if (options.hide_supplier) {
        fields.supplier.hidden = true;
    }

    // Add fields for order duplication (only if required)
    if (options.duplicate_order) {
        fields.duplicate_order = {
            value: options.duplicate_order,
            group: 'duplicate',
            required: 'true',
            type: 'related field',
            model: 'purchaseorder',
            filters: {
                supplier_detail: true,
            },
            api_url: '/api/order/po/',
            label: 'Orden de compra',
            help_text: 'Select purchase order to duplicate',
        };

        fields.duplicate_line_items = {
            value: true,
            group: 'duplicate',
            type: 'boolean',
            label: 'Duplicate Line Items',
            help_text: 'Duplicate all line items from the selected order',
        };

        fields.duplicate_extra_lines = {
            value: true,
            group: 'duplicate',
            type: 'boolean',
            label: 'Duplicate Extra Lines',
            help_text: 'Duplicate extra line items from the selected order',
        };
    }

    if (!global_settings.PROJECT_CODES_ENABLED) {
        delete fields.project_code;
    }

    return fields;
}


/*
 * Edit an existing PurchaseOrder
 */
function editPurchaseOrder(pk, options={}) {

    var fields = purchaseOrderFields(options);

    constructForm(`/api/order/po/${pk}/`, {
        fields: fields,
        title: 'Edit Purchase Order',
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}


// Create a new PurchaseOrder
function createPurchaseOrder(options={}) {

    var fields = purchaseOrderFields(options);

    var groups = {};

    if (options.duplicate_order) {
        groups.duplicate = {
            title: 'Duplication Options',
            collapsible: false,
        };
    }

    constructForm('/api/order/po/?supplier_detail=true', {
        method: 'POST',
        fields: fields,
        groups: groups,
        data: options.data,
        onSuccess: function(data) {

            if (options.onSuccess) {
                options.onSuccess(data);
            } else {
                // Default action is to redirect browser to the new PurchaseOrder
                location.href = `/order/purchase-order/${data.pk}/`;
            }
        },
        title: options.title || 'Crear orden de compra',
    });
}

/*
 * Duplicate an existing PurchaseOrder
 * Provides user with option to duplicate line items for the order also.
 */
function duplicatePurchaseOrder(order_id, options={}) {

    options.duplicate_order = order_id;

    inventreeGet(`/api/order/po/${order_id}/`, {}, {
        success: function(data) {

            // Clear out data we do not want to be duplicated
            delete data['pk'];
            delete data['reference'];

            options.data = data;

            createPurchaseOrder(options);
        }
    });
}


/* Construct a set of fields for the PurchaseOrderLineItem form */
function poLineItemFields(options={}) {
    var fields = {
        order: {
            filters: {
                supplier_detail: true,
            }
        },
        part: {
            icon: 'fa-shapes',
            filters: {
                part_detail: true,
                supplier_detail: true,
                supplier: options.supplier,
            },
            onEdit: function(value, name, field, opts) {
                // If the pack_quantity != 1, add a note to the field
                var pack_quantity = 1;
                var units = '';

                // Remove any existing note fields
                $(opts.modal).find('#info-pack-size').remove();

                if (value == null) {
                    return;
                }

                // Request information about the particular supplier part
                inventreeGet(`/api/company/part/${value}/`,
                    {
                        part_detail: true,
                    },
                    {
                        success: function(response) {
                            // Extract information from the returned query
                            pack_quantity = response.pack_quantity_native || 1;
                            units = response.part_detail.units || '';
                        },
                    }
                ).then(function() {
                    // Update pack size information
                    if (pack_quantity != 1) {
                        var txt = `<span class='fas fa-info-circle icon-blue'></span> Cantidad de paquete: ${formatDecimal(pack_quantity)} ${units}`;
                        $(opts.modal).find('#hint_id_quantity').after(`<div class='form-info-message' id='info-pack-size'>${txt}</div>`);
                    }
                });
            },
            secondary: {
                method: 'POST',
                title: 'Add Supplier Part',
                fields: function(data) {
                    var fields = supplierPartFields({
                        part: data.part,
                    });

                    fields.supplier.value = options.supplier;

                    // Adjust manufacturer part query based on selected part
                    fields.manufacturer_part.adjustFilters = function(query, opts) {

                        var part = getFormFieldValue('part', {}, opts);

                        if (part) {
                            query.part = part;
                        }

                        return query;
                    };

                    return fields;
                }
            }
        },
        quantity: {},
        reference: {},
        purchase_price: {
            icon: 'fa-dollar-sign',
            onInput: function(value, name, field, opts) {
                updateFieldValue('auto_pricing', value === '', {}, opts);
            }
        },
        purchase_price_currency: {
            icon: 'fa-coins',
        },
        auto_pricing: {
            onEdit: function(value, name, field, opts) {
                if (value) {
                    updateFieldValue('purchase_price', '', {}, opts);
                }
            }
        },
        target_date: {
            icon: 'fa-calendar-alt',
        },
        destination: {
            icon: 'fa-sitemap',
            filters: {
                structural: false,
            }
        },
        notes: {
            icon: 'fa-sticky-note',
        },
        link: {
            icon: 'fa-link',
        }
    };

    if (options.order) {
        fields.order.value = options.order;
        fields.order.hidden = true;
    }

    if (options.currency) {
        fields.purchase_price_currency.value = options.currency;
    }

    if (options.target_date) {
        fields.target_date.value = options.target_date;
    }

    if (options.create) {
        fields.merge_items = {};
    }

    return fields;
}



// Create a new PurchaseOrderLineItem
function createPurchaseOrderLineItem(order, options={}) {

    let fields = poLineItemFields({
        order: order,
        supplier: options.supplier,
        currency: options.currency,
        target_date: options.target_date,
        update_pricing: true,
        create: true,
    });

    constructForm('/api/order/po-line/', {
        fields: fields,
        method: 'POST',
        title: 'Añadir partida',
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}


/*
 * Launches a modal form to mark a PurchaseOrder as "complete"
 */
function completePurchaseOrder(order_id, options={}) {

    constructForm(
        `/api/order/po/${order_id}/complete/`,
        {
            method: 'POST',
            title: 'Complete Purchase Order',
            confirm: true,
            fieldsFunction: function(opts) {
                var fields = {
                    accept_incomplete: {},
                };

                if (opts.context.is_complete) {
                    delete fields['accept_incomplete'];
                }

                return fields;
            },
            preFormContent: function(opts) {

                var html = `
                <div class='alert alert-block alert-info'>
                    Mark this order as complete?
                </div>`;

                if (opts.context.is_complete) {
                    html += `
                    <div class='alert alert-block alert-success'>
                        All line items have been received
                    </div>`;
                } else {
                    html += `
                    <div class='alert alert-block alert-warning'>
                        This order has line items which have not been marked as received.</br>
                        Completing this order means that the order and line items will no longer be editable.
                    </div>`;
                }

                return html;
            },
            onSuccess: function(response) {
                handleFormSuccess(response, options);
            }
        }
    );
}


/*
 * Launches a modal form to mark a PurchaseOrder as 'cancelled'
 */
function cancelPurchaseOrder(order_id, options={}) {

    constructForm(
        `/api/order/po/${order_id}/cancel/`,
        {
            method: 'POST',
            title: 'Cancel Purchase Order',
            confirm: true,
            preFormContent: function(opts) {
                var html = `
                <div class='alert alert-info alert-block'>
                    Are you sure you wish to cancel this purchase order?
                </div>`;

                if (!opts.context.can_cancel) {
                    html += `
                    <div class='alert alert-danger alert-block'>
                        This purchase order can not be cancelled
                    </div>`;
                }

                return html;
            },
            onSuccess: function(response) {
                handleFormSuccess(response, options);
            }
        }
    );
}


/*
 * Launches a modal form to mark a PurchaseOrder as "issued"
 */
function issuePurchaseOrder(order_id, options={}) {

    let html = `
    <div class='alert alert-block alert-warning'>
    After placing this order, line items will no longer be editable.
    </div>`;

    constructForm(`/api/order/po/${order_id}/issue/`, {
        method: 'POST',
        title: 'Issue Purchase Order',
        confirm: true,
        preFormContent: html,
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}




function newSupplierPartFromOrderWizard(e) {
    /* Create a new supplier part directly from an order form.
     * Launches a secondary modal and (if successful),
     * back-populates the selected row.
     */

    e = e || window.event;

    var src = e.srcElement || e.target;

    var part = $(src).attr('part');

    if (!part) {
        part = $(src).closest('button').attr('part');
    }

    createSupplierPart({
        part: part,
        onSuccess: function(data) {

            // TODO: 2021-08-23 - This whole form wizard needs to be refactored.
            // In the future, use the API forms functionality to add the new item
            // For now, this hack will have to do...

            var dropdown = `#id_supplier_part_${part}`;

            var pk = data.pk;

            inventreeGet(
                `/api/company/part/${pk}/`,
                {
                    supplier_detail: true,
                },
                {
                    success: function(response) {
                        var text = '';

                        if (response.supplier_detail) {
                            text += response.supplier_detail.name;
                            text += ' | ';
                        }

                        text += response.SKU;

                        var option = new Option(text, pk, true, true);

                        $('#modal-form').find(dropdown).append(option).trigger('change');
                    }
                }
            );
        }
    });
}




/*
 * Create a new form to order parts based on the list of provided parts.
 */
function orderParts(parts_list, options={}) {

    var parts = [];

    var parts_seen = {};

    parts_list.forEach(function(part) {
        if (part.purchaseable) {

            // Prevent duplicates
            if (!(part.pk in parts_seen)) {
                parts_seen[part.pk] = true;
                parts.push(part);
            }
        }
    });

    if (parts.length == 0) {
        showAlertDialog(
            'Select Parts',
            'At least one purchaseable part must be selected',
        );
        return;
    }

    // Render a single part within the dialog
    function renderPart(part, opts={}) {

        var pk = part.pk;

        var thumb = thumbnailImage(part.thumbnail || part.image);

        // Default quantity value
        var quantity = part.quantity || 1;

        if (quantity < 0) {
            quantity = 0;
        }

        var quantity_input = constructField(
            `quantity_${pk}`,
            {
                type: 'decimal',
                min_value: 0,
                value: quantity,
                title: 'Quantity to order',
                required: true,
            },
            {
                hideLabels: true,
            }
        );

        var supplier_part_prefix = `
            <button type='button' class='input-group-text button-row-new-sp' pk='${pk}' title='New supplier part'>
                <span class='fas fa-plus-circle icon-green'></span>
            </button>
        `;

        var supplier_part_input = constructField(
            `part_${pk}`,
            {
                type: 'related field',
                required: true,
                prefixRaw: supplier_part_prefix,
            },
            {
                hideLabels: true,
            }
        );

        var purchase_order_prefix = `
            <button type='button' class='input-group-text button-row-new-po' pk='${pk}' title='New purchase order'>
                <span class='fas fa-plus-circle icon-green'></span>
            </button>
        `;

        var purchase_order_input = constructField(
            `order_${pk}`,
            {
                type: 'related field',
                required: true,
                prefixRaw: purchase_order_prefix,
            },
            {
                hideLabels: 'true',
            }
        );

        const merge_item_input = constructField(
            `merge_item_${pk}`,
            {
                type: 'boolean',
                value: true,
            },
            { hideLabels: true },
        );

        let buttons = '';

        if (parts.length > 1) {
            buttons += makeRemoveButton(
                'button-row-remove',
                pk,
                'Eliminar fila',
            );
        }

        // Button to add row to purchase order
        buttons += makeIconButton(
            'fa-shopping-cart icon-blue',
            'button-row-add',
            pk,
            'Add to purchase order',
        );

        buttons = wrapButtons(buttons);

        var html = `
        <tr id='order_row_${pk}' class='part-order-row'>
            <td id='td_part_${pk}'>${thumb} ${part.full_name}</td>
            <td id='td_supplier_part_${pk}'>${supplier_part_input}</td>
            <td id='td_order_${pk}'>${purchase_order_input}</td>
            <td id='td_quantity_${pk}'>${quantity_input}</td>
            <td id='td_merge_item_${pk}'>${merge_item_input}</td>
            <td id='td_actions_${pk}'>${buttons}</td>
        </tr>`;

        return html;
    }

    // Remove a single row form this dialog
    function removeRow(pk, opts) {
        // Remove the row
        $(opts.modal).find(`#order_row_${pk}`).remove();

        // If the modal is now "empty", dismiss it
        if (!($(opts.modal).find('.part-order-row').exists())) {
            closeModal(opts.modal);
            // If there is a onSuccess callback defined, call it
            if (options && options.onSuccess) {
                options.onSuccess();
            }
        }
    }

    var table_entries = '';

    parts.forEach(function(part) {
        table_entries += renderPart(part);
    });

    var html = '';

    // Add table
    html += `
    <table class='table table-striped table-condensed' id='order-parts-table'>
        <thead>
            <tr>
                <th>Parte</th>
                <th style='min-width: 300px;'>Parte del proveedor</th>
                <th style='min-width: 300px;'>Orden de compra</th>
                <th style='min-width: 50px;'>Cantidad</th>
                <th style='min-width: 50px;'>Merge</th>
                <th><!-- Actions --></th>
            </tr>
        </thead>
        <tbody>
            ${table_entries}
        </tbody>
    </table>
    `;

    // Construct API filters for the SupplierPart field
    var supplier_part_filters = {
        supplier_detail: true,
        part_detail: true,
    };

    if (options.supplier) {
        supplier_part_filters.supplier = options.supplier;
    }

    if (options.manufacturer) {
        supplier_part_filters.manufacturer = options.manufacturer;
    }

    if (options.manufacturer_part) {
        supplier_part_filters.manufacturer_part = options.manufacturer_part;
    }

    // Construct API filters for the PurchaseOrder field
    var order_filters = {
        status: 10,
        supplier_detail: true,
    };

    if (options.supplier) {
        order_filters.supplier = options.supplier;
    }

    constructFormBody({}, {
        preFormContent: html,
        title: 'Partes del pedido',
        hideSubmitButton: true,
        closeText: 'Cerrar',
        afterRender: function(fields, opts) {
            parts.forEach(function(part) {

                var pk = part.pk;

                // Filter by base part
                supplier_part_filters.part = pk;

                if (part.manufacturer_part) {
                    // Filter by manufacturer part
                    supplier_part_filters.manufacturer_part = part.manufacturer_part;
                }

                // Callback function when supplier part is changed
                // This is used to update the "pack size" attribute
                var onSupplierPartChanged = function(value, name, field, opts) {
                    var pack_quantity = 1;
                    var units = '';

                    $(opts.modal).find(`#info-pack-size-${pk}`).remove();

                    if (typeof value === 'object') {
                        value = value.pk;
                    }

                    if (value != null) {
                        inventreeGet(
                            `/api/company/part/${value}/`,
                            {
                                part_detail: true,
                            },
                            {
                                success: function(response) {
                                    pack_quantity = response.pack_quantity_native || 1;
                                    units = response.part_detail.units || '';
                                    if(response.supplier) {
                                        order_filters.supplier = response.supplier;
                                        options.supplier = response.supplier;
                                    }
                                }
                            }
                        ).then(function() {
                            if (pack_quantity != 1) {
                                var txt = `<span class='fas fa-info-circle icon-blue'></span> Cantidad de paquete: ${pack_quantity} ${units}`;
                                $(opts.modal).find(`#id_quantity_${pk}`).after(`<div class='form-info-message' id='info-pack-size-${pk}'>${txt}</div>`);
                            }
                        });
                    }
                };

                var supplier_part_field = {
                    name: `part_${part.pk}`,
                    model: 'supplierpart',
                    api_url: '/api/company/part/',
                    required: true,
                    type: 'related field',
                    auto_fill: true,
                    value: options.supplier_part,
                    filters: supplier_part_filters,
                    onEdit: onSupplierPartChanged,
                    noResults: function(query) {
                        return 'No matching supplier parts';
                    }
                };

                // Configure the "supplier part" field
                initializeRelatedField(supplier_part_field, null, opts);
                addFieldCallback(`part_${part.pk}`, supplier_part_field, opts);

                // Configure the "purchase order" field
                initializeRelatedField({
                    name: `order_${part.pk}`,
                    model: 'purchaseorder',
                    api_url: '/api/order/po/',
                    required: true,
                    type: 'related field',
                    auto_fill: false,
                    value: options.order,
                    filters: order_filters,
                    noResults: function(query) {
                        return 'No matching purchase orders';
                    }
                }, null, opts);

                // Request 'requirements' information for each part
                inventreeGet(`/api/part/${part.pk}/requirements/`, {}, {
                    success: function(response) {
                        let required = response.required || 0;
                        let allocated = response.allocated || 0;
                        let available = response.available_stock || 0;
                        let on_order = response.on_order || 0;

                        // Based on what we currently 'have' on hand, what do we need to order?
                        let deficit = Math.max(required - allocated, 0);

                        if (available < deficit) {
                            var q = deficit - available;

                            // If we have some on order, subtract that from the quantity we need to order
                            if (on_order > 0) {
                                q -= on_order;
                            }

                            q = Math.max(q, 0);

                            updateFieldValue(
                                `quantity_${part.pk}`,
                                q,
                                {},
                                opts
                            );
                        }
                    }
                });
            });

            // Add callback for "add to purchase order" button
            $(opts.modal).find('.button-row-add').click(function() {
                var pk = $(this).attr('pk');

                opts.field_suffix = null;

                // Extract information from the row
                var data = {
                    quantity: getFormFieldValue(`quantity_${pk}`, {type: 'decimal'}, opts),
                    part: getFormFieldValue(`part_${pk}`, {}, opts),
                    order: getFormFieldValue(`order_${pk}`, {}, opts),
                    merge_items: getFormFieldValue(`merge_item_${pk}`, {type: 'boolean'}, opts),
                };

                // Duplicate the form options, to prevent 'field_suffix' override
                var row_opts = Object.assign(opts);
                row_opts.field_suffix = `_${pk}`;

                inventreePut(
                    '/api/order/po-line/',
                    data,
                    {
                        method: 'POST',
                        success: function(response) {
                            removeRow(pk, opts);
                        },
                        error: function(xhr) {
                            switch (xhr.status) {
                            case 400:
                                handleFormErrors(xhr.responseJSON, fields, row_opts);
                                break;
                            default:
                                console.error(`Error adding line to purchase order`);
                                showApiError(xhr, options.url);
                                break;
                            }
                        }
                    }
                );
            });

            // Add callback for "remove row" button
            $(opts.modal).find('.button-row-remove').click(function() {
                var pk = $(this).attr('pk');

                removeRow(pk, opts);
            });

            // Add callback for "new supplier part" button
            $(opts.modal).find('.button-row-new-sp').click(function() {
                var pk = $(this).attr('pk');

                // Launch dialog to create new supplier part
                createSupplierPart({
                    part: pk,
                    onSuccess: function(response) {
                        setRelatedFieldData(
                            `part_${pk}`,
                            response,
                            opts
                        );
                    }
                });
            });

            // Add callback for "new purchase order" button
            $(opts.modal).find('.button-row-new-po').click(function() {
                var pk = $(this).attr('pk');

                // Launch dialog to create new purchase order
                const poOptions = {
                    onSuccess: function(response) {
                        setRelatedFieldData(
                            `order_${pk}`,
                            response,
                            opts
                        );
                    }
                }

                if(options.supplier) {
                    poOptions.supplier = options.supplier;
                    poOptions.hide_supplier = true;
                }

                createPurchaseOrder(poOptions);
            });
        }
    });
}



/* Create a new purchase order directly from an order form.
 * Launches a secondary modal and (if successful),
 * back-fills the newly created purchase order.
 */
function newPurchaseOrderFromOrderWizard(e) {

    e = e || window.event;

    var src = e.target || e.srcElement;

    var supplier = $(src).attr('supplierid');

    createPurchaseOrder({
        supplier: supplier,
        onSuccess: function(data) {

            // TODO: 2021-08-23 - The whole form wizard needs to be refactored
            // In the future, the drop-down should be using a dynamic AJAX request
            // to fill out the select2 options!

            var pk = data.pk;

            inventreeGet(
                `/api/order/po/${pk}/`,
                {
                    supplier_detail: true,
                },
                {
                    success: function(response) {
                        var text = response.reference;

                        if (response.supplier_detail) {
                            text += ` ${response.supplier_detail.name}`;
                        }

                        var dropdown = `#id-purchase-order-${supplier}`;

                        var option = new Option(text, pk, true, true);

                        $('#modal-form').find(dropdown).append(option).trigger('change');
                    }
                }
            );
        }
    });
}



/**
 * Receive stock items against a PurchaseOrder
 * Uses the PurchaseOrderReceive API endpoint
 *
 * arguments:
 * - order_id, ID / PK for the PurchaseOrder instance
 * - line_items: A list of PurchaseOrderLineItems objects to be allocated
 *
 * options:
 *  -
 */
function receivePurchaseOrderItems(order_id, line_items, options={}) {

    // Zero items selected?
    if (line_items.length == 0) {

        showAlertDialog(
            'Select Line Items',
            'At least one line item must be selected',
        );
        return;
    }

    function renderLineItem(line_item, opts={}) {

        var pk = line_item.pk;

        // Part thumbnail + description
        var thumb = thumbnailImage(line_item.part_detail.thumbnail);

        var quantity = (line_item.quantity || 0) - (line_item.received || 0);

        if (quantity < 0) {
            quantity = 0;
        }

        var units = line_item.part_detail.units || '';
        let pack_quantity = line_item.supplier_part_detail.pack_quantity;
        let native_pack_quantity = line_item.supplier_part_detail.pack_quantity_native || 1;

        let pack_size_div = '';

        var received = quantity * native_pack_quantity;

        if (native_pack_quantity != 1) {
            pack_size_div = `
            <div class='alert alert-small alert-block alert-info'>
                Cantidad de paquete: ${pack_quantity}<br>
                Received Quantity: <span class='pack_received_quantity' id='items_received_quantity_${pk}'>${received}</span> ${units}
            </div>`;
        }

        // Quantity to Receive
        var quantity_input = constructField(
            `items_quantity_${pk}`,
            {
                type: 'decimal',
                min_value: 0,
                value: quantity,
                title: 'Quantity to receive',
                required: true,
            },
            {
                hideLabels: true,
            }
        );

        // Add in options for "batch code" and "serial numbers"
        var batch_input = constructField(
            `items_batch_code_${pk}`,
            {
                type: 'string',
                required: false,
                label: 'Numero de lote',
                help_text: 'Introduzca el código de lote para los artículos de almacén entrantes',
                icon: 'fa-layer-group',
            },
            {
                hideLabels: true,
            }
        );

        // Hidden barcode input
        const barcode_input = constructField(
            `items_barcode_${pk}`,
            {
                type: 'string',
                required: 'false',
                hidden: 'true'
            }
        );

        // Hidden serial number input
        const sn_input = constructField(
            `items_serial_numbers_${pk}`,
            {
                type: 'string',
                required: false,
                label: 'Números de serie',
                help_text: 'Introduzca números de serie para artículos de almacén entrantes',
                icon: 'fa-hashtag',
            },
            {
                hideLabels: true,
            }
        );

        // Hidden packaging input
        const packaging_input = constructField(
            `items_packaging_${pk}`,
            {
                type: 'string',
                required: false,
                label: 'Paquetes',
                help_text: 'Specify packaging for incoming stock items',
                icon: 'fa-boxes',
                value: line_item.supplier_part_detail.packaging,
            },
            {
                hideLabels: true,
            }
        );

        // Hidden note input
        const note_input = constructField(
            `items_note_${pk}`,
            {
                type: 'string',
                required: false,
                label: 'Nota',
                icon: 'fa-sticky-note',
                value: '',
            },
            {
                hideLabels: true,
            }
        );

        var quantity_input_group = `${quantity_input}${pack_size_div}`;

        // Construct list of StockItem status codes
        var choices = [];

        for (var key in stockCodes) {
            choices.push({
                value: stockCodes[key].key,
                display_name: stockCodes[key].value,
            });
        }

        var destination_input = constructField(
            `items_location_${pk}`,
            {
                type: 'related field',
                label: 'Ubicación',
                required: false,
                icon: 'fa-sitemap',
            },
            {
                hideLabels: true,
            }
        );

        var status_input = constructField(
            `items_status_${pk}`,
            {
                type: 'choice',
                label: 'Stock Status',
                required: true,
                choices: choices,
                value: 10, // OK
            },
            {
                hideLabels: true,
            }
        );

        // Button to remove the row
        let buttons = '';

        if (global_settings.BARCODE_ENABLE) {
            buttons += makeIconButton('fa-qrcode', 'button-row-add-barcode', pk, 'Add barcode');
            buttons += makeIconButton('fa-unlink icon-red', 'button-row-remove-barcode', pk, 'Remove barcode', {hidden: true});
        }

        buttons += makeIconButton('fa-sitemap', 'button-row-add-location', pk, 'Specify location', {
            collapseTarget: `row-destination-${pk}`
        });

        buttons += makeIconButton(
            'fa-layer-group',
            'button-row-add-batch',
            pk,
            'Add batch code',
            {
                collapseTarget: `row-batch-${pk}`
            }
        );

        buttons += makeIconButton(
            'fa-boxes',
            'button-row-add-packaging',
            pk,
            'Specify packaging',
            {
                collapseTarget: `row-packaging-${pk}`
            }
        );

        if (line_item.part_detail.trackable) {
            buttons += makeIconButton(
                'fa-hashtag',
                'button-row-add-serials',
                pk,
                'Add serial numbers',
                {
                    collapseTarget: `row-serials-${pk}`,
                }
            );
        }

        buttons += makeIconButton(
            'fa-sticky-note',
            'button-row-add-note',
            pk,
            'Add note',
            {
                collapseTarget: `row-note-${pk}`,
            }
        );

        if (line_items.length > 1) {
            buttons += makeRemoveButton('button-row-remove', pk, 'Eliminar fila');
        }

        buttons = wrapButtons(buttons);

        let progress = makeProgressBar(line_item.received, line_item.quantity);

        var html = `
        <tr id='receive_row_${pk}' class='stock-receive-row'>
            <td id='part_${pk}'>
                ${thumb} ${line_item.part_detail.full_name}
            </td>
            <td id='sku_${pk}'>
                ${line_item.supplier_part_detail.SKU}
            </td>
            <td id='received_${pk}'>
                ${progress}
            </td>
            <td id='quantity_${pk}'>
                ${quantity_input_group}
            </td>
            <td id='status_${pk}'>
                ${status_input}
            </td>
            <td id='actions_${pk}'>
                ${barcode_input}
                ${buttons}
            </td>
        </tr>
        <!-- Hidden rows for extra data entry -->
        <tr id='row-destination-${pk}' class='collapse'>
            <td colspan='2'></td>
            <th>Ubicación</th>
            <td colspan='2'>${destination_input}</td>
            <td></td>
        </tr>
        <tr id='row-batch-${pk}' class='collapse'>
            <td colspan='2'></td>
            <th>Lote</th>
            <td colspan='2'>${batch_input}</td>
            <td></td>
        </tr>
        <tr id='row-packaging-${pk}' class='collapse'>
            <td colspan='2'></td>
            <th>Paquetes</th>
            <td colspan='2'>${packaging_input}</td>
            <td></td>
        </tr>
        <tr id='row-serials-${pk}' class='collapse'>
            <td colspan='2'></td>
            <th>Serials</th>
            <td colspan=2'>${sn_input}</td>
            <td></td>
        </tr>
        <tr id='row-note-${pk}' class='collapse'>
            <td colspan='2'></td>
            <th>Nota</th>
            <td colspan='2'>${note_input}</td>
        <td></td>
        `;

        return html;
    }

    var table_entries = '';

    line_items.forEach(function(item) {
        if (item.received < item.quantity) {
            table_entries += renderLineItem(item);
        }
    });

    var html = ``;

    // Add table
    html += `
    <table class='table table-condensed' id='order-receive-table'>
        <thead>
            <tr>
                <th>Parte</th>
                <th>Order Code</th>
                <th>Recibido</th>
                <th style='min-width: 50px;'>Quantity to Receive</th>
                <th style='min-width: 150px;'>Estado</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            ${table_entries}
        </tbody>
    </table>
    `;

    constructForm(`/api/order/po/${order_id}/receive/`, {
        method: 'POST',
        fields: {
            location: {
                filters: {
                    structural: false,
                },
                tree_picker: {
                    url: '/api/stock/location/tree/',
                },
            },
        },
        preFormContent: html,
        confirm: true,
        confirmMessage: 'Confirm receipt of items',
        title: 'Receive Purchase Order Items',
        afterRender: function(fields, opts) {

            // Run initialization routines for each line in the form
            line_items.forEach(function(item) {

                var pk = item.pk;

                var name = `items_location_${pk}`;

                var field_details = {
                    name: name,
                    api_url: '/api/stock/location/',
                    filters: {

                    },
                    type: 'related field',
                    model: 'stocklocation',
                    required: false,
                    auto_fill: false,
                    value: item.destination || item.part_detail.default_location,
                    render_description: false,
                };

                // Initialize the location field
                initializeRelatedField(
                    field_details,
                    null,
                    opts,
                );

                // Add 'clear' button callback for the location field
                addClearCallback(
                    name,
                    field_details,
                    opts
                );

                // Setup stock item status field
                initializeChoiceField(
                    {
                        name: `items_status_${pk}`,
                    },
                    null,
                    opts
                );

                // Add change callback for quantity field
                if (item.supplier_part_detail.pack_quantity_native != 1) {
                    $(opts.modal).find(`#id_items_quantity_${pk}`).change(function() {
                        var value = $(opts.modal).find(`#id_items_quantity_${pk}`).val();

                        var el = $(opts.modal).find(`#quantity_${pk}`).find('.pack_received_quantity');

                        var actual = value * item.supplier_part_detail.pack_quantity_native;
                        actual = formatDecimal(actual);
                        el.text(actual);
                    });
                }
            });

            // Add callbacks to add barcode
            if (global_settings.BARCODE_ENABLE) {
                $(opts.modal).find('.button-row-add-barcode').click(function() {
                    var btn = $(this);
                    let pk = btn.attr('pk');

                    // Scan to see if the barcode matches an existing StockItem
                    barcodeDialog('Scan Item Barcode', {
                        details: 'Scan barcode on incoming item (must not match any existing stock items)',
                        onScan: function(response, barcode_options) {
                            // A 'success' result means that the barcode matches something existing in the database
                            showBarcodeMessage(barcode_options.modal, 'El código de barras coincide con artículo existente');
                        },
                        onError400: function(response, barcode_options) {
                            if (response.barcode_data && response.barcode_hash) {
                                // Success! Hide the modal and update the value
                                $(barcode_options.modal).modal('hide');

                                btn.hide();
                                $(opts.modal).find(`#button-row-remove-barcode-${pk}`).show();
                                updateFieldValue(`items_barcode_${pk}`, response.barcode_data, {}, opts);
                            } else {
                                showBarcodeMessage(barcode_options.modal, 'Invalid barcode data');
                            }
                        }
                    });
                });

                $(opts.modal).find('.button-row-remove-barcode').click(function() {
                    var btn = $(this);
                    let pk = btn.attr('pk');

                    btn.hide();
                    $(opts.modal).find(`#button-row-add-barcode-${pk}`).show();
                    updateFieldValue(`items_barcode_${pk}`, '', {}, opts);
                });
            }

            // Add callbacks to remove rows
            $(opts.modal).find('.button-row-remove').click(function() {
                var pk = $(this).attr('pk');

                $(opts.modal).find(`#receive_row_${pk}`).remove();
            });
        },
        onSubmit: function(fields, opts) {
            // Extract data elements from the form
            var data = {
                items: [],
                location: getFormFieldValue('location', {}, opts),
            };

            var item_pk_values = [];

            line_items.forEach(function(item) {

                var pk = item.pk;

                // Extract data for each line
                var quantity = getFormFieldValue(`items_quantity_${pk}`, {}, opts);
                var status = getFormFieldValue(`items_status_${pk}`, {}, opts);
                var location = getFormFieldValue(`items_location_${pk}`, {}, opts);

                if (quantity != null) {

                    var line = {
                        line_item: pk,
                        quantity: quantity,
                        status: status,
                        location: location,
                    };

                    if (global_settings.BARCODE_ENABLE) {
                        line.barcode = getFormFieldValue(`items_barcode_${pk}`, {}, opts);
                    }

                    if (getFormFieldElement(`items_batch_code_${pk}`).exists()) {
                        line.batch_code = getFormFieldValue(`items_batch_code_${pk}`);
                    }

                    if (getFormFieldElement(`items_packaging_${pk}`).exists()) {
                        line.packaging = getFormFieldValue(`items_packaging_${pk}`);
                    }

                    if (getFormFieldElement(`items_note_${pk}`).exists()) {
                        line.note = getFormFieldValue(`items_note_${pk}`);
                    }

                    if (getFormFieldElement(`items_serial_numbers_${pk}`).exists()) {
                        line.serial_numbers = getFormFieldValue(`items_serial_numbers_${pk}`);
                    }

                    data.items.push(line);
                    item_pk_values.push(pk);
                }

            });

            // Provide list of nested values
            opts.nested = {
                'items': item_pk_values,
            };

            inventreePut(
                opts.url,
                data,
                {
                    method: 'POST',
                    success: function(response) {
                        // Hide the modal
                        $(opts.modal).modal('hide');

                        if (options.success) {
                            options.success(response);
                        }
                    },
                    error: function(xhr) {
                        switch (xhr.status) {
                        case 400:
                            handleFormErrors(xhr.responseJSON, fields, opts);
                            break;
                        default:
                            $(opts.modal).modal('hide');
                            showApiError(xhr, opts.url);
                            break;
                        }
                    }
                }
            );
        }
    });
}


/*
 * Edit a purchase order line item in a modal form.
 */
function editPurchaseOrderLineItem(e) {
    e = e || window.event;

    var src = e.target || e.srcElement;

    var url = $(src).attr('url');

    // TODO: Migrate this to the API forms
    launchModalForm(url, {
        reload: true,
    });
}

/*
 * Delete a purchase order line item in a modal form
 */
function removePurchaseOrderLineItem(e) {

    e = e || window.event;

    var src = e.target || e.srcElement;

    var url = $(src).attr('url');

    // TODO: Migrate this to the API forms
    launchModalForm(url, {
        reload: true,
    });
}


/*
 * Load a table displaying list of purchase orders
 */
function loadPurchaseOrderTable(table, options) {
    // Ensure the table starts in a known state
    $(table).bootstrapTable('destroy');

    options.params = options.params || {};

    options.params['supplier_detail'] = true;

    var filters = loadTableFilters('purchaseorder', options.params);

    setupFilterList('purchaseorder', $(table), '#filter-list-purchaseorder', {
        download: true,
        report: {
            key: 'purchaseorder',
        }
    });

    var display_mode = inventreeLoad('purchaseorder-table-display-mode', 'list');

    // Function for rendering PurchaseOrder calendar display
    function buildEvents(calendar) {

        var start = startDate(calendar);
        var end = endDate(calendar);

        clearEvents(calendar);

        // Extract current filters from table
        var table_options = $(table).bootstrapTable('getOptions');
        var filters = table_options.query_params || {};

        filters.supplier_detail = true;
        filters.min_date = start;
        filters.max_date = end;

        // Request purchase orders from the server within specified date range
        inventreeGet(
            '/api/order/po/',
            filters,
            {
                success: function(response) {
                    for (var idx = 0; idx < response.length; idx++) {

                        let order = response[idx];
                        let date = order.creation_date;

                        if (order.complete_date) {
                            date = order.complete_date;
                        } else if (order.target_date) {
                            date = order.target_date;
                        }

                        let title = order.reference;

                        if (order.supplier_detail) {
                            title += `- ${order.supplier_detail.name}`;
                        }

                        let color = '#4c68f5';

                        if (order.complete_date) {
                            color = '#25c235';
                        } else if (order.overdue) {
                            color = '#c22525';
                        } else {
                            color = '#4c68f5';
                        }

                        var event = {
                            title: title,
                            start: date,
                            end: date,
                            url: `/order/purchase-order/${order.pk}/`,
                            backgroundColor: color,
                        };

                        calendar.addEvent(event);
                    }
                }
            }
        );
    }

    $(table).inventreeTable({
        url: '/api/order/po/',
        queryParams: filters,
        name: 'purchaseorder',
        groupBy: false,
        sidePagination: 'server',
        original: options.params,
        showColumns: display_mode == 'list',
        disablePagination: display_mode == 'calendar',
        showCustomViewButton: false,
        showCustomView: display_mode == 'calendar',
        search: display_mode != 'calendar',
        formatNoMatches: function() {
            return 'No purchase orders found';
        },
        buttons: constructOrderTableButtons({
            prefix: 'purchaseorder',
            disableTreeView: true,
            callback: function() {
                // Reload the entire table
                loadPurchaseOrderTable(table, options);
            }
        }),
        columns: [
            {
                title: '',
                visible: true,
                checkbox: true,
                switchable: false,
            },
            {
                field: 'reference',
                title: 'Orden de compra',
                sortable: true,
                switchable: false,
                formatter: function(value, row) {

                    var html = renderLink(value, `/order/purchase-order/${row.pk}/`);

                    if (row.overdue) {
                        html += makeIconBadge('fa-calendar-times icon-red', 'Order is overdue');
                    }

                    return html;
                }
            },
            {
                field: 'supplier_detail',
                title: 'Proveedor',
                sortable: true,
                sortName: 'supplier__name',
                formatter: function(value, row) {
                    if (row.supplier_detail) {
                        return imageHoverIcon(row.supplier_detail.image) + renderLink(row.supplier_detail.name, `/company/${row.supplier}/?display=purchase-orders`);
                    } else {
                        return '-';
                    }
                }
            },
            {
                field: 'supplier_reference',
                title: 'Referencia del proveedor',
            },
            {
                field: 'description',
                title: 'Descripción',
            },
            {
                field: 'project_code',
                title: 'Código del proyecto',
                switchable: global_settings.PROJECT_CODES_ENABLED,
                visible: global_settings.PROJECT_CODES_ENABLED,
                sortable: true,
                formatter: function(value, row) {
                    if (row.project_code_detail) {
                        return `<span title='${row.project_code_detail.description}'>${row.project_code_detail.code}</span>`;
                    }
                }
            },
            {
                field: 'status_custom_key',
                title: 'Estado',
                switchable: true,
                sortable: true,
                formatter: function(value, row) {
                    return purchaseOrderStatusDisplay(row.status_custom_key);
                }
            },
            {
                field: 'creation_date',
                title: 'Fecha',
                sortable: true,
                formatter: function(value) {
                    return renderDate(value);
                }
            },
            {
                field: 'target_date',
                title: 'Fecha objetivo',
                sortable: true,
                formatter: function(value) {
                    return renderDate(value);
                }
            },
            {
                field: 'line_items',
                title: 'Items',
                sortable: true,
            },
            {
                field: 'total_price',
                title: 'Costo Total',
                switchable: true,
                sortable: true,
                formatter: function(value, row) {
                    return formatCurrency(value, {
                        currency: row.order_currency ?? row.supplier_detail?.currency,
                    });
                },
            },
            {
                field: 'responsible',
                title: 'Responsable',
                switchable: true,
                sortable: true,
                formatter: function(value, row) {

                    if (!row.responsible_detail) {
                        return '-';
                    }

                    var html = row.responsible_detail.name;

                    if (row.responsible_detail.label == 'group') {
                        html += `<span class='float-right fas fa-users'></span>`;
                    } else {
                        html += `<span class='float-right fas fa-user'></span>`;
                    }

                    return html;
                }
            },
        ],
        customView: function(data) {
            return `<div id='purchase-order-calendar'></div>`;
        },
        onLoadSuccess: function() {

            if (display_mode == 'calendar') {
                let el = document.getElementById('purchase-order-calendar');

                let calendar = new FullCalendar.Calendar(el, {
                    initialView: 'dayGridMonth',
                    nowIndicator: true,
                    aspectRatio: 2.5,
                    locale: options.locale,
                    datesSet: function() {
                        buildEvents(calendar);
                    }
                });

                calendar.render();
            }
        }
    });
}


/*
 * Delete the selected Purchase Order Line Items from the database
 */
function deletePurchaseOrderLineItems(items, options={}) {

    function renderItem(item, opts={}) {

        var part = item.part_detail;
        var thumb = thumbnailImage(item.part_detail.thumbnail || item.part_detail.image);
        var MPN = item.supplier_part_detail.manufacturer_part_detail ? item.supplier_part_detail.manufacturer_part_detail.MPN : '-';

        var html = `
        <tr>
            <td>${thumb} ${part.full_name}</td>
            <td>${part.description}</td>
            <td>${item.supplier_part_detail.SKU}</td>
            <td>${MPN}</td>
            <td>${item.quantity}
        </tr>
        `;

        return html;
    }

    var rows = '';
    var ids = [];

    items.forEach(function(item) {
        rows += renderItem(item);
        ids.push(item.pk);
    });

    var html = `
    <div class='alert alert-block alert-danger'>
    All selected Line items will be deleted
    </div>

    <table class='table table-striped table-condensed'>
        <tr>
            <th>Parte</th>
            <th>Descripción</th>
            <th>SKU</th>
            <th>MPN</th>
            <th>Cantidad</th>
        </tr>
        ${rows}
    </table>
    `;

    constructForm('/api/order/po-line/', {
        method: 'DELETE',
        multi_delete: true,
        title: 'Delete selected Line items?',
        form_data: {
            items: ids,
        },
        preFormContent: html,
        refreshTable: '#po-line-table',
    });
}


/**
 * Load a table displaying line items for a particular PurchasesOrder
 * @param {String} table - HTML ID tag e.g. '#table'
 * @param {Object} options - options which must provide:
 *      - order (integer PK)
 *      - supplier (integer PK)
 *      - allow_edit (boolean)
 *      - allow_receive (boolean)
 */
function loadPurchaseOrderLineItemTable(table, options={}) {

    options.params = options.params || {};

    options.params['order'] = options.order;
    options.params['part_detail'] = true;

    // Override 'editing' if order is not pending
    if (!options.pending && !global_settings.PURCHASEORDER_EDIT_COMPLETED_ORDERS) {
        options.allow_edit = false;
    }

    var filters = loadTableFilters('purchaseorderlineitem', options.params);

    setupFilterList('purchaseorderlineitem', $(table), options.filter_target || '#filter-list-purchase-order-lines', {
        download: true,
    });

    function setupCallbacks() {
        if (options.allow_edit) {

            // Callback for "duplicate" button
            $(table).find('.button-line-duplicate').click(function() {
                var pk = $(this).attr('pk');

                inventreeGet(`/api/order/po-line/${pk}/`, {}, {
                    success: function(data) {

                        var fields = poLineItemFields({
                            supplier: options.supplier,
                        });

                        constructForm('/api/order/po-line/', {
                            method: 'POST',
                            fields: fields,
                            data: data,
                            title: 'Duplicate Line Item',
                            refreshTable: table,
                        });
                    }
                });
            });

            // Callback for "edit" button
            $(table).find('.button-line-edit').click(function() {
                var pk = $(this).attr('pk');

                var fields = poLineItemFields(options);

                constructForm(`/api/order/po-line/${pk}/`, {
                    fields: fields,
                    title: 'Edit Line Item',
                    refreshTable: table,
                });
            });

            // Callback for "delete" button
            $(table).find('.button-line-delete').click(function() {
                var pk = $(this).attr('pk');

                constructForm(`/api/order/po-line/${pk}/`, {
                    method: 'DELETE',
                    title: 'Delete Line Item',
                    refreshTable: table,
                });
            });

            // Callback for bulk deleting multiple lines
            $('#po-lines-bulk-delete').off('click').on('click', function() {
                var rows = getTableData('   #po-line-table');

                deletePurchaseOrderLineItems(rows);
            });
        }

        if (options.allow_receive) {
            $(table).find('.button-line-receive').click(function() {
                var pk = $(this).attr('pk');

                var line_item = $(table).bootstrapTable('getRowByUniqueId', pk);

                if (!line_item) {
                    console.warn('getRowByUniqueId returned null');
                    return;
                }

                receivePurchaseOrderItems(
                    options.order,
                    [
                        line_item,
                    ],
                    {
                        success: function() {
                            // Reload the line item table
                            reloadBootstrapTable(table);

                            // Reload the "received stock" table
                            reloadBootstrapTable('#stock-table');
                        }
                    }
                );
            });
        }
    }

    $(table).inventreeTable({
        onPostBody: setupCallbacks,
        name: 'purchaseorderlines',
        sidePagination: 'server',
        formatNoMatches: function() {
            return 'No se encontraron artículos de línea';
        },
        queryParams: filters,
        original: options.params,
        url: '/api/order/po-line/',
        showFooter: true,
        uniqueId: 'pk',
        columns: [
            {
                checkbox: true,
                visible: true,
                switchable: false,
            },
            {
                field: 'part',
                sortable: true,
                sortName: 'part_name',
                title: 'Parte',
                switchable: false,
                formatter: function(value, row, index, field) {
                    if (row.part_detail) {
                        return imageHoverIcon(row.part_detail.thumbnail) + renderLink(row.part_detail.full_name, `/part/${row.part_detail.pk}/`);
                    } else {
                        return '-';
                    }
                },
                footerFormatter: function() {
                    return 'Total';
                }
            },
            {
                field: 'part_detail.description',
                title: 'Descripción',
            },
            {
                sortable: true,
                sortName: 'SKU',
                field: 'supplier_part_detail.SKU',
                title: 'SKU',
                formatter: function(value, row, index, field) {
                    if (value) {
                        return renderClipboard(renderLink(value, `/supplier-part/${row.part}/`));
                    } else {
                        return '-';
                    }
                },
            },
            {
                sortable: false,
                field: 'supplier_part_detail.link',
                title: 'Enlace',
                formatter: function(value, row, index, field) {
                    if (value) {
                        return renderLink(value, value, {external: true});
                    } else {
                        return '';
                    }
                },
            },
            {
                sortable: true,
                sortName: 'MPN',
                field: 'supplier_part_detail.manufacturer_part_detail.MPN',
                title: 'MPN',
                formatter: function(value, row, index, field) {
                    if (row.supplier_part_detail && row.supplier_part_detail.manufacturer_part) {
                        return renderClipboard(renderLink(value, `/manufacturer-part/${row.supplier_part_detail.manufacturer_part}/`));
                    } else {
                        return '-';
                    }
                },
            },
            {
                sortable: true,
                field: 'reference',
                title: 'Referencia',
            },
            {
                sortable: true,
                switchable: false,
                field: 'quantity',
                title: 'Cantidad',
                formatter: function(value, row) {
                    let units = '';

                    if (row.part_detail && row.part_detail.units) {
                        units = ` ${row.part_detail.units}`;
                    }

                    let data = value;

                    if (row.supplier_part_detail && row.supplier_part_detail.pack_quantity_native != 1.0) {
                        let pack_quantity = row.supplier_part_detail.pack_quantity;
                        let total = value * row.supplier_part_detail.pack_quantity_native;
                        data += `<span class='fas fa-info-circle icon-blue float-right' title='Cantidad de paquete: ${pack_quantity} - Cantidad Total: ${total}${units}'></span>`;
                    }

                    return data;
                },
                footerFormatter: function(data) {
                    return data.map(function(row) {
                        return +row['quantity'];
                    }).reduce(function(sum, i) {
                        return sum + i;
                    }, 0);
                }
            },
            {
                sortable: false,
                switchable: true,
                field: 'supplier_part_detail.pack_quantity',
                title: 'Cantidad de paquete',
                formatter: function(value, row) {
                    var units = row.part_detail.units;

                    if (units) {
                        value += ` ${units}`;
                    }

                    return value;
                }
            },
            {
                sortable: true,
                field: 'purchase_price',
                title: 'Precio Unitario',
                formatter: function(value, row) {
                    return formatCurrency(row.purchase_price, {
                        currency: row.purchase_price_currency,
                    });
                }
            },
            {
                field: 'total_price',
                sortable: true,
                title: 'Precio Total',
                formatter: function(value, row) {
                    return formatCurrency(row.purchase_price * row.quantity, {
                        currency: row.purchase_price_currency
                    });
                },
                footerFormatter: function(data) {
                    return calculateTotalPrice(
                        data,
                        function(row) {
                            return row.purchase_price ? row.purchase_price * row.quantity : null;
                        },
                        function(row) {
                            return row.purchase_price_currency;
                        }
                    );
                }
            },
            {
                sortable: true,
                field: 'target_date',
                switchable: true,
                title: 'Fecha objetivo',
                formatter: function(value, row) {
                    if (row.target_date) {
                        var html = renderDate(row.target_date);

                        if (row.overdue) {
                            html += makeIconBadge('fa-calendar-times icon-red', 'This line item is overdue');
                        }

                        return html;

                    } else if (row.order_detail && row.order_detail.target_date) {
                        return `<em>${renderDate(row.order_detail.target_date)}</em>`;
                    } else {
                        return '-';
                    }
                }
            },
            {
                sortable: false,
                field: 'received',
                switchable: false,
                title: 'Recibido',
                formatter: function(value, row, index, field) {
                    return makeProgressBar(row.received, row.quantity, {
                        id: `order-line-progress-${row.pk}`,
                    });
                },
                sorter: function(valA, valB, rowA, rowB) {

                    if (rowA.received == 0 && rowB.received == 0) {
                        return (rowA.quantity > rowB.quantity) ? 1 : -1;
                    }

                    var progressA = parseFloat(rowA.received) / rowA.quantity;
                    var progressB = parseFloat(rowB.received) / rowB.quantity;

                    return (progressA < progressB) ? 1 : -1;
                }
            },
            {
                field: 'destination',
                title: 'Destinación',
                formatter: function(value, row) {
                    if (value) {
                        return renderLink(row.destination_detail.pathstring, `/stock/location/${value}/`);
                    } else {
                        return '-';
                    }
                }
            },
            {
                field: 'notes',
                title: 'Notas',
            },
            {
                field: 'link',
                title: 'Enlace',
                formatter: function(value) {
                    if (value) {
                        return renderLink(value, value);
                    }
                }
            },
            {
                switchable: false,
                field: 'buttons',
                title: '',
                formatter: function(value, row, index, field) {
                    let buttons = '';
                    let pk = row.pk;

                    if (options.allow_receive && row.received < row.quantity) {
                        buttons += makeIconButton('fa-sign-in-alt icon-green', 'button-line-receive', pk, 'Receive line item');
                    }

                    if (options.allow_edit) {
                        buttons += makeCopyButton('button-line-duplicate', pk, 'Duplicate line item');
                        buttons += makeEditButton('button-line-edit', pk, 'Edit line item');
                        buttons += makeDeleteButton('button-line-delete', pk, 'Delete line item');
                    }

                    return wrapButtons(buttons);
                },
            }
        ]
    });
}
