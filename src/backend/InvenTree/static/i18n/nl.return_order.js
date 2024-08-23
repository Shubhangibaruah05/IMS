


/* globals
    companyFormFields,
    constructForm,
    formatCurrency,
    getFormFieldValue,
    global_settings,
    handleFormErrors,
    handleFormSuccess,
    imageHoverIcon,
    inventreeLoad,
    inventreePut,
    loadTableFilters,
    makeDeleteButton,
    makeEditButton,
    makeIconBadge,
    makeIconButton,
    makeRemoveButton,
    reloadBootstrapTable,
    renderDate,
    renderLink,
    returnOrderLineItemStatusDisplay,
    returnOrderStatusDisplay,
    setupFilterList,
    showApiError,
    showAlertDialog,
    thumbnailImage,
    wrapButtons,
    yesNoLabel,
*/

/* exported
    cancelReturnOrder,
    completeReturnOrder,
    createReturnOrder,
    createReturnOrderLineItem,
    editReturnOrder,
    editReturnOrderLineItem,
    issueReturnOrder,
    loadReturnOrderTable,
    loadReturnOrderLineItemTable,
*/


/*
 * Construct a set of fields for a ReturnOrder form
 */
function returnOrderFields(options={}) {

    let fields = {
        reference: {
            icon: 'fa-hashtag',
        },
        description: {},
        customer: {
            icon: 'fa-user-tie',
            secondary: {
                title: 'Add Customer',
                fields: function() {
                    var fields = companyFormFields();
                    fields.is_customer.value = true;
                    return fields;
                }
            }
        },
        customer_reference: {},
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
                let customer = getFormFieldValue('customer', {}, {modal: options.modal});

                if (customer) {
                    filters.company = customer;
                }

                return filters;
            }
        },
        address: {
            icon: 'fa-map',
            adjustFilters: function(filters) {
                let customer = getFormFieldValue('customer', {}, {modal: options.modal});

                if (customer) {
                    filters.company = customer;
                }

                return filters;
            }
        },
        responsible: {
            icon: 'fa-user',
            filters: {
                is_active: true,
            }
        }
    };

    if (!global_settings.PROJECT_CODES_ENABLED) {
        delete fields.project_code;
    }

    return fields;
}


/*
 * Create a new Return Order
 */
function createReturnOrder(options={}) {
    let fields = returnOrderFields(options);

    if (options.customer) {
        fields.customer.value = options.customer;
    }

    constructForm('/api/order/ro/', {
        method: 'POST',
        fields: fields,
        title: 'Create Return Order',
        onSuccess: function(data) {
            location.href = `/order/return-order/${data.pk}/`;
        },
    });
}


/*
 * Edit an existing Return Order
 */
function editReturnOrder(order_id, options={}) {

    constructForm(`/api/order/ro/${order_id}/`, {
        fields: returnOrderFields(options),
        title: 'Edit Return Order',
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}


/*
 * "Issue" a ReturnOrder, to mark it as "in progress"
 */
function issueReturnOrder(order_id, options={}) {

    let html = `
    <div class='alert alert-block alert-warning'>
    After placing this order, line items will no longer be editable.
    </div>`;

    constructForm(`/api/order/ro/${order_id}/issue/`, {
        method: 'POST',
        title: 'Issue Return Order',
        confirm: true,
        preFormContent: html,
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}


/*
 * Launches a modal form to cancel a ReturnOrder
 */
function cancelReturnOrder(order_id, options={}) {

    let html = `
    <div class='alert alert-danger alert-block'>
    Are you sure you wish to cancel this Return Order?
    </div>`;

    constructForm(
        `/api/order/ro/${order_id}/cancel/`,
        {
            method: 'POST',
            title: 'Cancel Return Order',
            confirm: true,
            preFormContent: html,
            onSuccess: function(response) {
                handleFormSuccess(response, options);
            }
        }
    );
}


/*
 * Launches a modal form to mark a ReturnOrder as "complete"
 */
function completeReturnOrder(order_id, options={}) {
    let html = `
    <div class='alert alert-block alert-warning'>
    Mark this order as complete?
    </div>
    `;

    constructForm(
        `/api/order/ro/${order_id}/complete/`,
        {
            method: 'POST',
            title: 'Complete Return Order',
            confirm: true,
            preFormContent: html,
            onSuccess: function(response) {
                handleFormSuccess(response, options);
            }
        }
    );
}


/*
 * Load a table of return orders
 */
function loadReturnOrderTable(table, options={}) {

    // Ensure the table starts in a known state
    $(table).bootstrapTable('destroy');

    options.params = options.params || {};
    options.params['customer_detail'] = true;

    let filters = loadTableFilters('returnorder', options.params);

    setupFilterList('returnorder', $(table), '#filter-list-returnorder', {
        download: true,
        report: {
            key: 'returnorder',
        }
    });

    let display_mode = inventreeLoad('returnorder-table-display-mode', 'list');

    let is_calendar = display_mode == 'calendar';

    $(table).inventreeTable({
        url: '/api/order/ro/',
        queryParams: filters,
        name: 'returnorder',
        sidePagination: 'server',
        original: options.params,
        showColumns: !is_calendar,
        search: !is_calendar,
        showCustomViewButton: false,
        showCustomView: is_calendar,
        disablePagination: is_calendar,
        formatNoMatches: function() {
            return 'No return orders found';
        },
        onLoadSuccess: function() {
            // TODO
        },
        columns: [
            {
                title: '',
                checkbox: true,
                visible: true,
                switchable: false,
            },
            {
                sortable: true,
                field: 'reference',
                title: 'Return Order',
                formatter: function(value, row) {
                    let html = renderLink(value, `/order/return-order/${row.pk}/`);

                    if (row.overdue) {
                        html += makeIconBadge('fa-calendar-times icon-red', 'Order is overdue');
                    }

                    return html;
                },
            },
            {
                sortable: true,
                sortName: 'customer__name',
                field: 'customer_detail',
                title: 'Klant',
                formatter: function(value, row) {

                    if (!row.customer_detail) {
                        return 'Invalid Customer';
                    }

                    return imageHoverIcon(row.customer_detail.image) + renderLink(row.customer_detail.name, `/company/${row.customer}/?display=sales-orders/`);
                }
            },
            {
                sortable: true,
                field: 'customer_reference',
                title: 'Klantreferentie',
            },
            {
                sortable: false,
                field: 'description',
                title: 'Omschrijving',
            },
            {
                field: 'project_code',
                title: 'Project Code',
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
                sortable: true,
                field: 'status_custom_key',
                title: 'Status',
                formatter: function(value, row) {
                    return returnOrderStatusDisplay(row.status_custom_key);
                }
            },
            {
                sortable: true,
                field: 'creation_date',
                title: 'Aanmaakdatum',
                formatter: function(value) {
                    return renderDate(value);
                }
            },
            {
                sortable: true,
                field: 'target_date',
                title: 'Streefdatum',
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
                field: 'responsible',
                title: 'Verantwoordelijke',
                switchable: true,
                sortable: true,
                formatter: function(value, row) {
                    if (!row.responsible_detail) {
                        return '-';
                    }

                    let html = row.responsible_detail.name;

                    if (row.responsible_detail.label == 'group') {
                        html += `<span class='float-right fas fa-users'></span>`;
                    } else {
                        html += `<span class='float-right fas fa-user'></span>`;
                    }

                    return html;
                }
            },
            {
                // TODO: Add in the 'total cost' field
                field: 'total_price',
                title: 'Total Cost',
                switchable: true,
                sortable: true,
                visible: false,
                formatter: function(value, row) {
                    return formatCurrency(value, {
                        currency: row.order_currency ?? row.customer_detail?.currency,
                    });
                }
            }
        ]
    });
}


/*
 * Construct a set of fields for a ReturnOrderLineItem form
 */
function returnOrderLineItemFields(options={}) {

    let fields = {
        order: {
            filters: {
                customer_detail: true,
            }
        },
        item: {
            filters: {
                part_detail: true,
                serialized: true,
            }
        },
        reference: {},
        outcome: {
            icon: 'fa-route',
        },
        price: {
            icon: 'fa-dollar-sign',
        },
        price_currency: {
            icon: 'fa-coins',
        },
        target_date: {
            icon: 'fa-calendar-alt',
        },
        notes: {
            icon: 'fa-sticky-note',
        },
        link: {
            icon: 'fa-link',
        },
    };

    return fields;
}


/*
 * Create a new ReturnOrderLineItem
 */
function createReturnOrderLineItem(options={}) {

    let fields = returnOrderLineItemFields();

    if (options.order) {
        fields.order.value = options.order;
        fields.order.hidden = true;
    }

    if (options.customer) {
        Object.assign(fields.item.filters, {
            customer: options.customer
        });
    }

    constructForm('/api/order/ro-line/', {
        fields: fields,
        method: 'POST',
        title: 'Artikel toevoegen',
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}


/*
 * Edit an existing ReturnOrderLineItem
 */
function editReturnOrderLineItem(pk, options={}) {

    let fields = returnOrderLineItemFields();

    constructForm(`/api/order/ro-line/${pk}/`, {
        fields: fields,
        title: 'Edit Line Item',
        onSuccess: function(response) {
            handleFormSuccess(response, options);
        }
    });
}


/*
 * Receive one or more items against a ReturnOrder
 */
function receiveReturnOrderItems(order_id, line_items, options={}) {

    if (line_items.length == 0) {
        showAlertDialog(
            'Select Line Items',
            'At least one line item must be selected'
        );
        return;
    }

    function renderLineItem(line_item) {
        let pk = line_item.pk;

        // Render thumbnail + description
        let thumb = thumbnailImage(line_item.part_detail.thumbnail);

        let buttons = '';

        if (line_items.length > 1) {
            buttons += makeRemoveButton('button-row-remove', pk, 'Rij verwijderen');
        }

        buttons = wrapButtons(buttons);

        let html = `
        <tr id='receive_row_${pk}' class='stock-receive-row'>
            <td id='part_${pk}'>
                ${thumb} ${line_item.part_detail.full_name}
            </td>
            <td id='item_${pk}'>
                ${line_item.item_detail.serial}
            </td>
            <td id='actions_${pk}'>${buttons}</td>
        </tr>`;

        return html;
    }

    let table_entries = '';

    line_items.forEach(function(item) {
        if (!item.received_date) {
            table_entries += renderLineItem(item);
        }
    });

    let html = '';

    html += `
    <table class='table table-striped table-condensed' id='order-receive-table'>
        <thead>
            <tr>
                <th>Onderdeel</th>
                <th>Serienummer</th>
            </tr>
        </thead>
        <tbody>${table_entries}</tbody>
    </table>`;

    constructForm(`/api/order/ro/${order_id}/receive/`, {
        method: 'POST',
        preFormContent: html,
        fields: {
            location: {
                filters: {
                    structural: false,
                },
                tree_picker: {
                    url: '/api/stock/location/tree/',
                },
            }
        },
        confirm: true,
        confirmMessage: 'Confirm receipt of items',
        title: 'Receive Return Order Items',
        afterRender: function(fields, opts) {
            // Add callback to remove rows
            $(opts.modal).find('.button-row-remove').click(function() {
                let pk = $(this).attr('pk');
                $(opts.modal).find(`#receive_row_${pk}`).remove();
            });
        },
        onSubmit: function(fields, opts) {
            // Extract data elements from the form
            let data = {
                items: [],
                location: getFormFieldValue('location', {}, opts),
            };

            let item_pk_values = [];

            line_items.forEach(function(item) {
                let pk = item.pk;
                let row = $(opts.modal).find(`#receive_row_${pk}`);

                if (row.exists()) {
                    data.items.push({
                        item: pk,
                    });
                    item_pk_values.push(pk);
                }
            });

            opts.nested = {
                'items': item_pk_values,
            };

            inventreePut(
                opts.url,
                data,
                {
                    method: 'POST',
                    success: function(response) {
                        $(opts.modal).modal('hide');

                        handleFormSuccess(response, options);
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
 * Load a table displaying line items for a particular ReturnOrder
 */
function loadReturnOrderLineItemTable(options={}) {

    var table = options.table;

    options.params = options.params || {};

    options.params.order = options.order;
    options.params.item_detail = true;
    options.params.order_detail = false;
    options.params.part_detail = true;

    let filters = loadTableFilters('returnorderlineitem', options.params);

    setupFilterList('returnorderlineitem', $(table), '#filter-list-returnorderlines', {download: true});

    function setupCallbacks() {
        if (options.allow_edit) {

            // Callback for "receive" button
            if (options.allow_receive) {
                $(table).find('.button-line-receive').click(function() {
                    let pk = $(this).attr('pk');

                    let line = $(table).bootstrapTable('getRowByUniqueId', pk);

                    receiveReturnOrderItems(
                        options.order,
                        [line],
                        {
                            onSuccess: function(response) {
                                reloadBootstrapTable(table);
                            }
                        }
                    );
                });
            }

            // Callback for "edit" button
            $(table).find('.button-line-edit').click(function() {
                let pk = $(this).attr('pk');

                constructForm(`/api/order/ro-line/${pk}/`, {
                    fields: returnOrderLineItemFields(),
                    title: 'Edit Line Item',
                    refreshTable: table,
                });
            });
        }

        if (options.allow_delete) {
            // Callback for "delete" button
            $(table).find('.button-line-delete').click(function() {
                let pk = $(this).attr('pk');

                constructForm(`/api/order/ro-line/${pk}/`, {
                    method: 'DELETE',
                    title: 'Delete Line Item',
                    refreshTable: table,
                });
            });
        }
    }

    $(table).inventreeTable({
        url: '/api/order/ro-line/',
        name: 'returnorderlineitems',
        formatNoMatches: function() {
            return 'No matching line items';
        },
        onPostBody: setupCallbacks,
        queryParams: filters,
        original: options.params,
        showColumns: true,
        showFooter: true,
        uniqueId: 'pk',
        columns: [
            {
                checkbox: true,
                switchable: false,
            },
            {
                field: 'part',
                sortable: true,
                switchable: false,
                title: 'Onderdeel',
                formatter: function(value, row) {
                    let part = row.part_detail;
                    let html = thumbnailImage(part.thumbnail) + ' ';
                    html += renderLink(part.full_name, `/part/${part.pk}/`);
                    return html;
                }
            },
            {
                field: 'item',
                sortable: true,
                switchable: false,
                title: 'Artikel',
                formatter: function(value, row) {
                    return renderLink(`Serienummer: ${row.item_detail.serial}`, `/stock/item/${row.item}/`);
                }
            },
            {
                field: 'reference',
                title: 'Referentie',
            },
            {
                field: 'outcome',
                title: 'Outcome',
                sortable: true,
                formatter: function(value, row) {
                    return returnOrderLineItemStatusDisplay(value);
                }
            },
            {
                field: 'price',
                title: 'Prijs',
                formatter: function(value, row) {
                    return formatCurrency(row.price, {
                        currency: row.price_currency,
                    });
                }
            },
            {
                sortable: true,
                field: 'target_date',
                title: 'Streefdatum',
                formatter: function(value, row) {
                    let html = renderDate(value);

                    if (row.overdue) {
                        html += makeIconBadge('fa-calendar-times icon-red', 'This line item is overdue');
                    }

                    return html;
                }
            },
            {
                field: 'received_date',
                title: 'Ontvangen',
                sortable: true,
                formatter: function(value) {
                    if (!value) {
                        yesNoLabel(value);
                    } else {
                        return renderDate(value);
                    }
                }
            },
            {
                field: 'notes',
                title: 'Opmerkingen',
            },
            {
                field: 'link',
                title: 'Link',
                formatter: function(value, row) {
                    if (value) {
                        return renderLink(value, value);
                    }
                }
            },
            {
                field: 'buttons',
                title: '',
                switchable: false,
                formatter: function(value, row) {
                    let buttons = '';
                    let pk = row.pk;

                    if (options.allow_edit) {

                        if (options.allow_receive && !row.received_date) {
                            buttons += makeIconButton('fa-sign-in-alt icon-green', 'button-line-receive', pk, 'Mark item as received');
                        }

                        buttons += makeEditButton('button-line-edit', pk, 'Edit line item');
                    }

                    if (options.allow_delete) {
                        buttons += makeDeleteButton('button-line-delete', pk, 'Delete line item');
                    }

                    return wrapButtons(buttons);
                }
            }
        ]
    });
}
