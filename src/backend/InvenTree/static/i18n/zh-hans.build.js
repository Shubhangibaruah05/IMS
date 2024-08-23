


/* globals
    addClearCallback,
    buildStatusDisplay,
    clearEvents,
    constructExpandCollapseButtons,
    constructField,
    constructForm,
    constructOrderTableButtons,
    endDate,
    formatDecimal,
    FullCalendar,
    getFormFieldValue,
    getTableData,
    global_settings,
    handleFormErrors,
    handleFormSuccess,
    imageHoverIcon,
    initializeRelatedField,
    inventreeGet,
    inventreeLoad,
    inventreePut,
    launchModalForm,
    loadTableFilters,
    locationDetail,
    makeDeleteButton,
    makeEditButton,
    makeRemoveButton,
    makeIconBadge,
    makeIconButton,
    makePartIcons,
    makeProgressBar,
    orderParts,
    reloadBootstrapTable,
    renderDate,
    renderLink,
    setupFilterList,
    shortenString,
    showAlertDialog,
    showApiError,
    startDate,
    stockStatusDisplay,
    showApiErrors,
    thumbnailImage,
    updateFieldValue,
    wrapButtons,
    yesNoLabel,
*/

/* exported
    allocateStockToBuild,
    autoAllocateStockToBuild,
    cancelBuildOrder,
    completeBuildOrder,
    createBuildOutput,
    duplicateBuildOrder,
    editBuildOrder,
    loadBuildLineTable,
    loadBuildOrderAllocatedStockTable,
    loadBuildOrderAllocationTable,
    loadBuildOutputTable,
    loadBuildTable,
*/


function buildFormFields() {
    let fields = {
        reference: {
            icon: 'fa-hashtag',
        },
        part: {
            filters: {
                assembly: true,
                virtual: false,
            }
        },
        title: {},
        quantity: {},
        project_code: {
            icon: 'fa-list',
        },
        priority: {},
        parent: {
            filters: {
                part_detail: true,
            }
        },
        sales_order: {
            icon: 'fa-truck',
        },
        batch: {},
        target_date: {
            icon: 'fa-calendar-alt',
        },
        take_from: {
            icon: 'fa-sitemap',
            filters: {
                structural: false,
            }
        },
        destination: {
            icon: 'fa-sitemap',
            filters: {
                structural: false,
            }
        },
        link: {
            icon: 'fa-link',
        },
        issued_by: {
            icon: 'fa-user',
        },
        responsible: {
            icon: 'fa-users',
            filters: {
                is_active: true,
            }
        },
    };

    if (!global_settings.PROJECT_CODES_ENABLED) {
        delete fields.project_code;
    }

    return fields;
}

/*
 * Edit an existing BuildOrder via the API
 */
function editBuildOrder(pk) {

    var fields = buildFormFields();

    // Cannot edit "part" field after creation
    delete fields['part'];

    constructForm(`/api/build/${pk}/`, {
        fields: fields,
        reload: true,
        title: '编辑生产订单',
    });
}


/*
 * Create a new build order via an API form
 */
function newBuildOrder(options={}) {
    /* Launch modal form to create a new BuildOrder.
     */

    var fields = buildFormFields();

    // Add "create_child_builds" field
    fields.create_child_builds = {};

    // Specify the target part
    if (options.part) {
        fields.part.value = options.part;
    }

    // Specify the desired quantity
    if (options.quantity) {
        fields.quantity.value = options.quantity;
    }

    // Specify the parent build order
    if (options.parent) {
        fields.parent.value = options.parent;
    }

    // Specify a parent sales order
    if (options.sales_order) {
        fields.sales_order.value = options.sales_order;
    }

    // Specify a project code
    if (options.project_code) {
        fields.project_code.value = options.project_code;
    }

    if (options.data) {
        delete options.data.pk;
    }

    constructForm(`/api/build/`, {
        fields: fields,
        data: options.data,
        follow: true,
        method: 'POST',
        title: '创建生产订单',
        onSuccess: options.onSuccess,
    });
}


/*
 * Duplicate an existing build order.
 */
function duplicateBuildOrder(build_id, options={}) {

    inventreeGet(`/api/build/${build_id}/`, {}, {
        success: function(data) {
            // Clear out data we do not want to be duplicated
            delete data['pk'];
            delete data['issued_by'];
            delete data['reference'];

            options.data = data;
            newBuildOrder(options);
        }
    });
}


/* Construct a form to cancel a build order */
function cancelBuildOrder(build_id, options={}) {

    constructForm(
        `/api/build/${build_id}/cancel/`,
        {
            method: 'POST',
            title: '取消生产订单',
            confirm: true,
            fields: {
                remove_allocated_stock: {},
                remove_incomplete_outputs: {},
            },
            preFormContent: function(opts) {
                var html = `
                <div class='alert alert-block alert-info'>
                    您确定要取消此生成吗？
                </div>`;

                if (opts.context.has_allocated_stock) {
                    html += `
                    <div class='alert alert-block alert-warning'>
                        库存项目已分配到此生产订单
                    </div>`;
                }

                if (opts.context.incomplete_outputs) {
                    html += `
                    <div class='alert alert-block alert-warning'>
                        此生产订单还有未完成的产出
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


/* Construct a form to "complete" (finish) a build order */
function completeBuildOrder(build_id, options={}) {

    constructForm(`/api/build/${build_id}/finish/`, {
        fieldsFunction: function(opts) {
            var ctx = opts.context || {};

            var fields = {
                accept_unallocated: {},
                accept_overallocated: {},
                accept_incomplete: {},
            };

            // Hide "accept overallocated" field if the build is *not* overallocated
            if (!ctx.overallocated) {
                delete fields.accept_overallocated;
            }

            // Hide "accept incomplete" field if the build has been completed
            if (!ctx.remaining || ctx.remaining == 0) {
                delete fields.accept_incomplete;
            }

            // Hide "accept unallocated" field if the build is fully allocated
            if (ctx.allocated) {
                delete fields.accept_unallocated;
            }

            return fields;
        },
        preFormContent: function(opts) {
            var ctx = opts.context || {};

            var html = '';

            if (ctx.allocated && ctx.remaining == 0 && ctx.incomplete == 0) {
                html += `
                <div class='alert alert-block alert-success'>
                生产订单已准备好标记为已完成'
                </div>`;
            } else {

                if (ctx.incomplete > 0) {
                    html += `
                    <div class='alert alert-block alert-danger'>
                    <strong>生产订单有未完成的产出</strong><br>
                    由于产出不完整，无法完成此生产订单
                    </div>`;
                } else {
                    html += `
                    <div class='alert alert-block alert-danger'>
                    <strong>生产订单未完成</strong>
                    </div>
                    `;
                }

                if (!ctx.allocated) {
                    html += `<div class='alert alert-block alert-warning'>所需库存尚未完全分配</div>`;
                }

                if (ctx.remaining > 0) {
                    html += `<div class='alert alert-block alert-warning'>未完成所需生产数量</div>`;
                }
            }

            return html;
        },
        reload: true,
        confirm: true,
        title: '完成生产订单',
        method: 'POST',
    });
}


/*
 * Construct a new build output against the provided build
 */
function createBuildOutput(build_id, options) {

    // Request build order information from the server
    inventreeGet(
        `/api/build/${build_id}/`,
        {},
        {
            success: function(build) {

                var html = '';

                var trackable = build.part_detail.trackable;
                var remaining = Math.max(0, build.quantity - build.completed);

                var fields = {
                    quantity: {
                        value: remaining,
                    },
                    serial_numbers: {
                        hidden: !trackable,
                        required: options.trackable_parts || trackable,
                    },
                    batch_code: {},
                    auto_allocate: {
                        hidden: !trackable,
                    },
                };

                // Work out the next available serial numbers
                inventreeGet(`/api/part/${build.part}/serial-numbers/`, {}, {
                    success: function(data) {
                        if (data.next) {
                            fields.serial_numbers.placeholder = `下一个可用序列号: ${data.next}`;
                        } else if (data.latest) {
                            fields.serial_numbers.placeholder = `最新序列号: ${data.latest}`;
                        }
                    },
                    async: false,
                });

                if (options.trackable_parts) {
                    html += `
                    <div class='alert alert-block alert-info'>
                        物料清单包含可跟踪的零件.<br>
                        必须单独生成生产输出.
                    </div>
                    `;
                }

                if (trackable) {
                    html += `
                    <div class='alert alert-block alert-info'>
                        可跟踪零件可以指定序列号<br>
                        输入序列号来生成多个单一生产输出
                    </div>
                    `;
                }

                constructForm(`/api/build/${build_id}/create-output/`, {
                    method: 'POST',
                    title: '创建生产输出',
                    confirm: true,
                    fields: fields,
                    preFormContent: html,
                    onSuccess: function(response) {
                        reloadBootstrapTable(options.table || '#build-output-table');
                    },
                });

            }
        }
    );

}


/*
 * Construct a set of output buttons for a particular build output
 */
function makeBuildOutputButtons(output_id, build_info, options={}) {

    var html = '';

    // Tracked parts? Must be individually allocated
    if (options.has_tracked_lines) {

        // Add a button to allocate stock against this build output
        html += makeIconButton(
            'fa-sign-in-alt icon-blue',
            'button-output-allocate',
            output_id,
            '分配库存项到此生产输出',
        );

        // Add a button to deallocate stock from this build output
        html += makeIconButton(
            'fa-minus-circle icon-red',
            'button-output-deallocate',
            output_id,
            '从生产输出中取消分配库存',
        );
    }

    // Add a button to "complete" this build output
    html += makeIconButton(
        'fa-check-circle icon-green',
        'button-output-complete',
        output_id,
        '完成生产输出',
    );

    // Add a button to "scrap" the build output
    html += makeIconButton(
        'fa-times-circle icon-red',
        'button-output-scrap',
        output_id,
        '报废生产输出',
    );

    // Add a button to "remove" this build output
    html += makeDeleteButton(
        'button-output-remove',
        output_id,
        '删除生产输出',
    );

    return wrapButtons(html);
}


/*
 * Deallocate stock against a particular build order
 *
 * Options:
 * - output: pk value for a stock item "build output"
 * - bom_item: pk value for a particular BOMItem (build item)
 */
function deallocateStock(build_id, options={}) {

    var url = `/api/build/${build_id}/unallocate/`;

    var html = `
    <div class='alert alert-block alert-warning'>
    您确定要取消分配此版本中选定的库存项目吗？
    </dvi>
    `;

    constructForm(url, {
        method: 'POST',
        confirm: true,
        preFormContent: html,
        fields: {
            output: {
                hidden: true,
                value: options.output,
            },
            build_line: {
                hidden: true,
                value: options.build_line,
            },
        },
        title: '取消分配库存项目',
        onSuccess: function(response, opts) {
            if (options.onSuccess) {
                options.onSuccess(response, opts);
            } else if (options.table) {
                // Reload the parent table
                $(options.table).bootstrapTable('refresh');
            }
        }
    });
}


/*
 * Helper function to render a single build output in a modal form
 */
function renderBuildOutput(output, options={}) {
    let pk = output.pk;

    let output_html = imageHoverIcon(output.part_detail.thumbnail);

    if (output.quantity == 1 && output.serial) {
        output_html += `序列号: ${output.serial}`;
    } else {
        output_html += `數量: ${output.quantity}`;
        if (output.part_detail && output.part_detail.units) {
            output_html += ` ${output.part_detail.units}  `;
        }
    }

    let buttons = `<div class='btn-group float-right' role='group'>`;

    buttons += makeRemoveButton('button-row-remove', pk, '移除行');

    buttons += '</div>';

    let field = constructField(
        `outputs_output_${pk}`,
        {
            type: 'raw',
            html: output_html,
        },
        {
            hideLabels: true,
        }
    );

    let quantity_field = '';

    if (options.adjust_quantity) {
        quantity_field = constructField(
            `outputs_quantity_${pk}`,
            {
                type: 'decimal',
                value: output.quantity,
                min_value: 0,
                max_value: output.quantity,
                required: true,
            },
            {
                hideLabels: true,
            }
        );

        quantity_field = `<td>${quantity_field}</td>`;
    }

    let html = `
    <tr id='output_row_${pk}'>
        <td>${field}</td>
        <td>${output.part_detail.full_name}</td>
        ${quantity_field}
        <td>${buttons}</td>
    </tr>`;

    return html;
}


/**
 * Launch a modal form to complete selected build outputs
 */
function completeBuildOutputs(build_id, outputs, options={}) {

    if (outputs.length == 0) {
        showAlertDialog(
            '选择生产输出',
            '必须选择至少一个生产输出',
        );
        return;
    }

    // Construct table entries
    var table_entries = '';

    outputs.forEach(function(output) {
        table_entries += renderBuildOutput(output);
    });

    var html = `
    <div class='alert alert-block alert-success'>
    选择的生产输出将被标记为完成
    </div>
    <table class='table table-striped table-condensed' id='build-complete-table'>
        <thead>
            <th colspan='2'>输出</th>
            <th><!-- Actions --></th>
        </thead>
        <tbody>
            ${table_entries}
        </tbody>
    </table>`;

    constructForm(`/api/build/${build_id}/complete/`, {
        method: 'POST',
        preFormContent: html,
        fields: {
            status_custom_key: {},
            location: {
                filters: {
                    structural: false,
                },
                tree_picker: {
                    url: '/api/stock/location/tree/',
                },
            },
            notes: {
                icon: 'fa-sticky-note',
            },
            accept_incomplete_allocation: {},
        },
        confirm: true,
        title: '完成生产输出',
        afterRender: function(fields, opts) {
            // Setup callbacks to remove outputs
            $(opts.modal).find('.button-row-remove').click(function() {
                var pk = $(this).attr('pk');

                $(opts.modal).find(`#output_row_${pk}`).remove();
            });
        },
        onSubmit: function(fields, opts) {

            // Extract data elements from the form
            var data = {
                outputs: [],
                status_custom_key: getFormFieldValue('status_custom_key', {}, opts),
                location: getFormFieldValue('location', {}, opts),
                notes: getFormFieldValue('notes', {}, opts),
                accept_incomplete_allocation: getFormFieldValue('accept_incomplete_allocation', {type: 'boolean'}, opts),
            };

            var output_pk_values = [];

            outputs.forEach(function(output) {
                var pk = output.pk;

                var row = $(opts.modal).find(`#output_row_${pk}`);

                if (row.exists()) {
                    data.outputs.push({
                        output: pk,
                    });
                    output_pk_values.push(pk);
                }
            });

            // Provide list of nested values
            opts.nested = {
                'outputs': output_pk_values,
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
 * Launch a modal form to scrap selected build outputs.
 * Scrapped outputs are marked as "complete", but with the "rejected" code
 * These outputs are not included in build completion calculations.
 */
function scrapBuildOutputs(build_id, outputs, options={}) {

    if (outputs.length == 0) {
        showAlertDialog(
            '选择生产输出',
            '必须选择至少一个生产输出',
        );
        return;
    }

    let table_entries = '';

    outputs.forEach(function(output) {
        table_entries += renderBuildOutput(output, {
            adjust_quantity: true,
        });
    });

    var html = `
    <div class='alert alert-block alert-danger'>
    选择的生产输出将被标记为已报废
    <ul>
        <li>报废的输出被标记为拒收</li>
        <li>已分配的库存物品将不再可用</li>
        <li>生产订单的完成状态将不会调整</li>
    </ul>
    </div>
    <table class='table table-striped table-condensed' id='build-scrap-table'>
        <thead>
            <th colspan='2'>输出</th>
            <th>數量</th>
            <th><!-- Actions --></th>
        </thead>
        <tbody>
            ${table_entries}
        </tbody>
    </table>`;

    constructForm(`/api/build/${build_id}/scrap-outputs/`, {
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
            },
            notes: {},
            discard_allocations: {},
        },
        confirm: true,
        title: '报废生产输出',
        afterRender: function(fields, opts) {
            // Setup callbacks to remove outputs
            $(opts.modal).find('.button-row-remove').click(function() {
                let pk = $(this).attr('pk');
                $(opts.modal).find(`#output_row_${pk}`).remove();
            });
        },
        onSubmit: function(fields, opts) {
            let data = {
                outputs: [],
                location: getFormFieldValue('location', {}, opts),
                notes: getFormFieldValue('notes', {}, opts),
                discard_allocations: getFormFieldValue('discard_allocations', {type: 'boolean'}, opts),
            };

            let output_pk_values = [];

            outputs.forEach(function(output) {
                let pk = output.pk;
                let row = $(opts.modal).find(`#output_row_${pk}`);
                let quantity = getFormFieldValue(`outputs_quantity_${pk}`, {}, opts);

                if (row.exists()) {
                    data.outputs.push({
                        output: pk,
                        quantity: quantity,
                    });

                    output_pk_values.push(pk);
                }
            });

            opts.nested = {
                'outputs': output_pk_values,
            };

            inventreePut(
                opts.url,
                data,
                {
                    method: 'POST',
                    success: function(response) {
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


/**
 * Launch a modal form to delete selected build outputs.
 * Deleted outputs are expunged from the database.
 */
function deleteBuildOutputs(build_id, outputs, options={}) {

    if (outputs.length == 0) {
        showAlertDialog(
            '选择生产输出',
            '必须选择至少一个生产输出',
        );
        return;
    }

    // Construct table entries
    var table_entries = '';

    outputs.forEach(function(output) {
        table_entries += renderBuildOutput(output);
    });

    var html = `
    <div class='alert alert-block alert-danger'>
    选定的生产输出将被删除
    <ul>
    <li>生产输出数据将被永久删除</li>
    <li>已分配的库存物品将退回库存</li>
    </ul>
    </div>
    <table class='table table-striped table-condensed' id='build-complete-table'>
        <thead>
            <th colspan='2'>输出</th>
            <th><!-- Actions --></th>
        </thead>
        <tbody>
            ${table_entries}
        </tbody>
    </table>`;

    constructForm(`/api/build/${build_id}/delete-outputs/`, {
        method: 'POST',
        preFormContent: html,
        fields: {},
        confirm: true,
        title: '删除生产输出',
        afterRender: function(fields, opts) {
            // Setup callbacks to remove outputs
            $(opts.modal).find('.button-row-remove').click(function() {
                var pk = $(this).attr('pk');

                $(opts.modal).find(`#output_row_${pk}`).remove();
            });
        },
        onSubmit: function(fields, opts) {
            var data = {
                outputs: [],
            };

            var output_pk_values = [];

            outputs.forEach(function(output) {
                var pk = output.pk;

                var row = $(opts.modal).find(`#output_row_${pk}`);

                if (row.exists()) {
                    data.outputs.push({
                        output: pk
                    });
                    output_pk_values.push(pk);
                }
            });

            opts.nested = {
                'outputs': output_pk_values,
            };

            inventreePut(
                opts.url,
                data,
                {
                    method: 'POST',
                    success: function(response) {
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


/**
 * Load a table showing all stock allocated to a given Build Order
 */
function loadBuildOrderAllocatedStockTable(table, buildId) {

    let params = {
        build: buildId,
        part_detail: true,
        location_detail: true,
        stock_detail: true,
        supplier_detail: true,
    };

    let filters = loadTableFilters('buildorderallocatedstock', params);
    setupFilterList(
        'buildorderallocatedstock',
        $(table),
        null,
        {
            download: true,
            custom_actions: [{
                label: 'actions',
                actions: [{
                    label: 'delete',
                    title: '删除分配',
                    icon: 'fa-trash-alt icon-red',
                    permission: 'build.delete',
                    callback: function(data) {
                        constructForm('/api/build/item/', {
                            method: 'DELETE',
                            multi_delete: true,
                            title: '删除库存分配',
                            form_data: {
                                items: data.map(item => item.pk),
                            },
                            onSuccess: function() {
                                $(table).bootstrapTable('refresh');
                            }
                        });
                    }
                }]
            }]
        }
    );

    $(table).inventreeTable({
        url: '/api/build/item/',
        queryParams: filters,
        original: params,
        sortable: true,
        search: true,
        groupBy: false,
        sidePagination: 'server',
        formatNoMatches: function() {
            return '未分配库存';
        },
        columns: [
            {
                title: '',
                visible: true,
                checkbox: true,
                switchable: false,
            },
            {
                field: 'part',
                sortable: true,
                switchable: false,
                title: '零件',
                formatter: function(value, row) {
                    return imageHoverIcon(row.part_detail.thumbnail) + renderLink(row.part_detail.full_name, `/part/${row.part_detail.pk}/`);
                }
            },
            {
                field: 'bom_reference',
                sortable: true,
                switchable: true,
                title: '參考代號',
            },
            {
                field: 'quantity',
                sortable: true,
                switchable: false,
                title: '已分配数量',
                formatter: function(value, row) {
                    let stock_item = row.stock_item_detail;
                    let text = value;

                    if (stock_item.serial && stock_item.quantity == 1) {
                        text = `# ${stock_item.serial}`;
                    }

                    return renderLink(text, `/stock/item/${stock_item.pk}/`);
                }
            },
            {
                field: 'location',
                sortable: true,
                title: '地點',
                formatter: function(value, row) {
                    if (row.location_detail) {
                        return locationDetail(row, true);
                    }
                }
            },
            {
                field: 'install_into',
                sortable: true,
                title: '产出',
                formatter: function(value, row) {
                    if (value) {
                        return renderLink(`库存项: ${value}`, `/stock/item/${value}/`);
                    }
                }
            },
            {
                field: 'sku',
                sortable: true,
                title: '供应商零件',
                formatter: function(value, row) {
                    if (row.supplier_part_detail) {
                        let text = row.supplier_part_detail.SKU;

                        return renderLink(text, `/supplier-part/${row.supplier_part_detail.pk}/`);
                    }
                }
            },
            {
                field: 'pk',
                title: '动作',
                visible: true,
                switchable: false,
                sortable: false,
                formatter: function(value, row) {
                    let buttons = '';

                    buttons += makeEditButton('build-item-edit', row.pk, '编辑库存分配');
                    buttons += makeDeleteButton('build-item-delete', row.pk, '删除构建分配');

                    return wrapButtons(buttons);
                }
            }
        ]
    });

    // Add row callbacks
    $(table).on('click', '.build-item-edit', function() {
        let pk = $(this).attr('pk');

        constructForm(
            `/api/build/item/${pk}/`,
            {
                fields: {
                    quantity: {},
                },
                title: '编辑构建分配',
                refreshTable: table
            }
        );
    });

    $(table).on('click', '.build-item-delete', function() {
        let pk = $(this).attr('pk');

        constructForm(
            `/api/build/item/${pk}/`,
            {
                method: 'DELETE',
                title: '删除构建分配',
                refreshTable: table,
            }
        );
    });
}

/**
 * Load a table showing all the BuildOrder allocations for a given part
 */
function loadBuildOrderAllocationTable(table, options={}) {

    options.params['part_detail'] = true;
    options.params['build_detail'] = true;
    options.params['location_detail'] = true;
    options.params['stock_detail'] = true;

    var filters = loadTableFilters('buildorderallocation', options.params);

    setupFilterList('buildorderallocation', $(table));

    $(table).inventreeTable({
        url: '/api/build/item/',
        queryParams: filters,
        name: 'buildorderallocation',
        groupBy: false,
        search: false,
        sortable: true,
        paginationVAlign: 'bottom',
        original: options.params,
        formatNoMatches: function() {
            return '未找到生产订单分配';
        },
        columns: [
            {
                field: 'pk',
                visible: false,
                switchable: false,
            },
            {
                field: 'build',
                sortable: true,
                switchable: false,
                title: '生產工單',
                formatter: function(value, row) {
                    let ref = row.build_detail?.reference ?? row.build;
                    let html = renderLink(ref, `/build/${row.build}/`);

                    if (row.build_detail) {
                        html += `- <small>${row.build_detail.title}</small>`;

                        html += buildStatusDisplay(row.build_detail.status_custom_key, {
                            classes: 'float-right',
                        });
                    }

                    return html;
                }
            },
            {
                field: 'quantity',
                sortable: true,
                title: '已分配数量',
                formatter: function(value, row) {
                    let link = `/stock/item/${row.stock_item}/`;
                    let text = formatDecimal(value);

                    return renderLink(text, link);
                }
            },
            {
                field: 'location_detail',
                title: '地點',
                formatter: function(value, row) {

                    if (!value) {
                        return '未指定位置';
                    }

                    let item = row.stock_item_detail;
                    item.location_detail = row.location_detail;

                    return locationDetail(item, true);
                }
            },
        ]
    });
}


/*
 * Construct a set of actions for the build output table
 */
function makeBuildOutputActions(build_info) {

    return [
        {
            label: 'complete',
            title: '已完成输出',
            icon: 'fa-check-circle icon-green',
            permission: 'build.add',
            callback: function(data) {
                completeBuildOutputs(
                    build_info.pk,
                    data,
                    {
                        success: function() {
                            $('#build-output-table').bootstrapTable('refresh');  // Reload the "in progress" table
                            $('#build-stock-table').bootstrapTable('refresh');  // Reload the "completed" table
                        }
                    }
                );
            },
        },
        {
            label: 'scrap',
            title: '报废输出',
            icon: 'fa-times-circle icon-red',
            permission: 'build.change',
            callback: function(data) {
                scrapBuildOutputs(
                    build_info.pk,
                    data,
                    {
                        success: function() {
                            $('#build-output-table').bootstrapTable('refresh');  // Reload the "in progress" table
                            $('#build-stock-table').bootstrapTable('refresh');  // Reload the "completed" table
                        }
                    }
                );
            },
        },
        {
            label: 'delete',
            title: '删除输出',
            icon: 'fa-trash-alt icon-red',
            permission: 'build.delete',
            callback: function(data) {
                deleteBuildOutputs(
                    build_info.pk,
                    data,
                    {
                        success: function() {
                            $('#build-output-table').bootstrapTable('refresh');  // Reload the "in progress" table
                            $('#build-stock-table').bootstrapTable('refresh');  // Reload the "completed" table
                        }
                    }
                )
            },
        }
    ];
}


/*
 * Display a "build output" table for a particular build.
 *
 * This displays a list of "active" (i.e. "in production") build outputs (stock items) for a given build.
 *
 * - Any required tests are displayed here for each output
 * - Additionally, if any tracked items are present in the build, the allocated items are displayed
 *
 */
function loadBuildOutputTable(build_info, options={}) {

    var table = options.table || '#build-output-table';

    var params = options.params || {};

    // test templates for the part being assembled
    let test_templates = [];

    // tracked line items for this build
    let has_tracked_lines = false;

    // Mandatory query filters
    params.part_detail = true;
    params.tests = true;
    params.is_building = true;
    params.build = build_info.pk;

    var filters = Object.assign({}, params);

    setupFilterList('builditems', $(table), options.filterTarget || '#filter-list-incompletebuilditems', {
        labels: {
            model_type: 'stockitem',
        },
        singular_name: '生产输出',
        plural_name: '生产输出',
        custom_actions: [{
            label: 'buildoutput',
            icon: 'fa-tools',
            title: '生产输出操作',
            actions: makeBuildOutputActions(build_info),
        }]
    });

    // Request list of required tests for the part being assembled
    if (build_info.testable) {
        inventreeGet(
            '/api/part/test-template/',
            {
                part: build_info.part,
                required: true,
                enabled: true,
            },
            {
                async: false,
                success: function(response) {
                    test_templates = [];
                    response.forEach(function(item) {
                        // Only include "required" tests
                        if (item.required) {
                            test_templates.push(item);
                        }
                    });
                },
                error: function() {
                    test_templates = [];
                }
            }
        );
    }

    // Callback function to load the allocated stock items
    function reloadOutputAllocations() {
        inventreeGet(
            '/api/build/line/',
            {
                build: build_info.pk,
                tracked: true,
            },
            {
                success: function(response) {
                    let build_lines = response.results || response;
                    let table_data = $(table).bootstrapTable('getData');

                    has_tracked_lines = build_lines.length > 0;

                    /* Iterate through each active build output and update allocations
                     * For each build output, we need to:
                     * - Append any existing allocations
                     * - Work out how many lines are "fully allocated"
                     */
                    for (var ii = 0; ii < table_data.length; ii++) {
                        let output = table_data[ii];

                        let fully_allocated = 0;

                        // Construct a list of allocations for this output
                        let lines = [];

                        // Iterate through each tracked build line item
                        for (let jj = 0; jj < build_lines.length; jj++) {

                            // Create a local copy of the build line
                            let line = Object.assign({}, build_lines[jj]);

                            let required = line.bom_item_detail.quantity * output.quantity;

                            let allocations = [];
                            let allocated = 0;

                            // Iterate through each allocation for this line item
                            for (let kk = 0; kk < line.allocations.length; kk++) {
                                let allocation = line.allocations[kk];

                                if (allocation.install_into == output.pk) {
                                    allocations.push(allocation);
                                    allocated += allocation.quantity;
                                }
                            }

                            line.allocations = allocations;
                            line.allocated = allocated;
                            line.quantity = required;

                            if (allocated >= required) {
                                fully_allocated += 1;
                            }

                            lines.push(line);
                        }

                        // Push the row back in
                        output.lines = lines;
                        output.fully_allocated = fully_allocated;
                        table_data[ii] = output;
                    }

                    // Update the table data
                    $(table).bootstrapTable('load', table_data);

                    if (has_tracked_lines) {
                        $(table).bootstrapTable('showColumn', 'fully_allocated');
                    } else {
                        $(table).bootstrapTable('hideColumn', 'fully_allocated');
                    }
                }
            }
        );
    }

    // Callback function to construct a child table
    function constructOutputSubTable(index, row, element) {
        let sub_table_id = `output-table-${row.pk}`;

        element.html(`
        <div class='sub-table'>
            <table class='table table-striped table-condensed' id='${sub_table_id}'></table>
        </div>
        `);

        loadBuildLineTable(
            `#${sub_table_id}`,
            build_info.pk,
            {
                output: row.pk,
                data: row.lines,
            }
        );
    }

    // Return the "passed test count" for a given row
    function getPassedTestCount(row) {
        let passed_tests = 0;

        // Iterate through the available test templates
        test_templates.forEach(function(test) {
            // Iterate through all the "test results" for the given stock item
            // If the keys match, update the result
            // As they are returned in order, the "latest" result is the one we use

            let final_result = false;

            row.tests.forEach(function(result) {
                if (result.template == test.pk) {
                    final_result = result.result;
                }
            });

            if (final_result) {
                passed_tests += 1;
            }
        });

        return passed_tests;
    }

    // Now, construct the actual table
    $(table).inventreeTable({
        url: '/api/stock/',
        queryParams: filters,
        original: params,
        showColumns: true,
        uniqueId: 'pk',
        name: 'build-outputs',
        sortable: true,
        search: true,
        sidePagination: 'client',
        detailView: true,
        detailFilter: function(index, row) {
            return has_tracked_lines;
        },
        detailFormatter: function(index, row, element) {
            return constructOutputSubTable(index, row, element);
        },
        formatNoMatches: function() {
            return '未找到激活的生产输出';
        },
        onLoadSuccess: function() {
            reloadOutputAllocations();
        },
        buttons: constructExpandCollapseButtons(table),
        columns: [
            {
                title: '',
                visible: true,
                checkbox: true,
                switchable: false,
            },
            {
                field: 'part',
                title: '零件',
                switchable: false,
                formatter: function(value, row) {
                    return imageHoverIcon(row.part_detail.thumbnail) +
                        renderLink(row.part_detail.full_name, `/part/${row.part_detail.pk}/`) +
                        makePartIcons(row.part_detail);
                }
            },
            {
                field: 'quantity',
                title: '产出',
                switchable: false,
                sortable: true,
                sorter: function(fieldA, fieldB, rowA, rowB) {

                    let serialA = parseInt(rowA.serial);
                    let serialB = parseInt(rowB.serial);

                    // Fallback to string representation
                    if (isNaN(serialA)) {
                        serialA = rowA.serial;
                    } else if (isNaN(serialB)) {
                        serialB = rowB.serial;
                    }

                    if (serialA && !serialB) {
                        // Only rowA has a serial number
                        return 1;
                    } else if (serialB && !serialA) {
                        // Only rowB has a serial number
                        return -1;
                    } else if (serialA && serialB) {
                        // Both rows have serial numbers
                        if (serialA > serialB) {
                            return 1;
                        } else if (serialA < serialB) {
                            return -1;
                        } else {
                            return 0;
                        }
                    } else {
                        // Neither row has a serial number
                        if (rowA.quantity > rowB.quantity) {
                            return 1;
                        } else if (rowA.quantity < rowB.quantity) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                },
                formatter: function(value, row) {
                    let text = '';

                    if (row.serial && row.quantity == 1) {
                        text = `序列号: ${row.serial}`;
                    } else {
                        text = `數量: ${row.quantity}`;

                    }

                    text = renderLink(text, `/stock/item/${row.pk}/`);

                    if (row.part_detail && row.part_detail.units) {
                        text += ` <small>[${row.part_detail.units}]</small>`;
                    }

                    if (row.batch) {
                        text += ` <small>(队列: ${row.batch})</small>`;
                    }

                    text += stockStatusDisplay(row.status_custom_key, {classes: 'float-right'});

                    return text;
                }
            },
            {
                field: 'fully_allocated',
                title: '已分配行',
                visible: false,
                sortable: true,
                switchable: false,
                formatter: function(value, row) {
                    if (!row.lines) {
                        return '-';
                    }

                    return makeProgressBar(row.fully_allocated, row.lines.length);
                }
            },
            {
                field: 'tests',
                title: '需要的测试',
                visible: test_templates.length > 0,
                switchable: true,
                sortable: true,
                sorter: function(valueA, valueB, rowA, rowB) {
                    let nA = getPassedTestCount(rowA);
                    let nB = getPassedTestCount(rowB);

                    if (nA > nB) {
                        return 1;
                    } else if (nA < nB) {
                        return -1;
                    } else {
                        return 0;
                    }
                },
                formatter: function(value, row) {
                    if (row.tests) {
                        return makeProgressBar(
                            getPassedTestCount(row),
                            test_templates.length
                        );
                    }
                }
            },
            {
                field: 'actions',
                title: '',
                switchable: false,
                formatter: function(value, row) {
                    return makeBuildOutputButtons(
                        row.pk,
                        build_info,
                        {
                            has_tracked_lines: has_tracked_lines,
                        }
                    )
                }
            }
        ]
    });

    /* Callbacks for the build output buttons */

    // Allocate stock button
    $(table).on('click', '.button-output-allocate', function() {
        let pk = $(this).attr('pk');

        // Retrieve build output row
        let output = $(table).bootstrapTable('getRowByUniqueId', pk);
        let lines = output.lines || [];

        allocateStockToBuild(
            build_info.pk,
            lines,
            {
                output: pk,
                success: function() {
                    $(table).bootstrapTable('refresh');
                    $('#build-stock-table').bootstrapTable('refresh');
                }
            }
        );
    });

    // Deallocate stock button
    $(table).on('click', '.button-output-deallocate', function() {
        let pk = $(this).attr('pk');

        deallocateStock(build_info.pk, {
            output: pk,
            table: table
        });
    });

    // Complete build output button
    $(table).on('click', '.button-output-complete', function() {
        let pk = $(this).attr('pk');
        let output = $(table).bootstrapTable('getRowByUniqueId', pk);

        completeBuildOutputs(
            build_info.pk,
            [output],
            {
                success: function() {
                    $(table).bootstrapTable('refresh');
                    $('#build-stock-table').bootstrapTable('refresh');
                }
            }
        );
    });

    // Scrap build output button
    $(table).on('click', '.button-output-scrap', function() {
        let pk = $(this).attr('pk');
        let output = $(table).bootstrapTable('getRowByUniqueId', pk);

        scrapBuildOutputs(
            build_info.pk,
            [output],
            {
                success: function() {
                    $(table).bootstrapTable('refresh');
                    $('#build-stock-table').bootstrapTable('refresh');
                }
            }
        );
    });

    // Remove build output button
    $(table).on('click', '.button-output-remove', function() {
        let pk = $(this).attr('pk');
        let output = $(table).bootstrapTable('getRowByUniqueId', pk);

        deleteBuildOutputs(
            build_info.pk,
            [output],
            {
                success: function() {
                    $(table).bootstrapTable('refresh');
                    $('#build-stock-table').bootstrapTable('refresh');
                }
            }
        );
    });

    // Delete multiple build outputs
    $('#multi-output-delete').click(function() {
        var outputs = getTableData(table);

        deleteBuildOutputs(
            build_info.pk,
            outputs,
            {
                success: function() {
                    // Reload the "in progress" table
                    $('#build-output-table').bootstrapTable('refresh');

                    // Reload the "completed" table
                    $('#build-stock-table').bootstrapTable('refresh');
                }
            }
        );
    });

    $('#outputs-expand').click(function() {
        $(table).bootstrapTable('expandAllRows');
    });

    $('#outputs-collapse').click(function() {
        $(table).bootstrapTable('collapseAllRows');
    });
}


/**
 * Allocate stock items to a build
 *
 * arguments:
 * - buildId: ID / PK value for the build
 * - partId: ID / PK value for the part being built
 * - line_items: A list of BuildItem objects to be allocated
 *
 * options:
 *  - output: ID / PK of the associated build output (or null for untracked items)
 *  - source_location: ID / PK of the top-level StockLocation to source stock from (or null)
 */
function allocateStockToBuild(build_id, line_items, options={}) {

    if (line_items.length == 0) {

        showAlertDialog(
            '选择零件',
            '您必须选择至少一个要分配的零件',
        );

        return;
    }

    let build = null;

    // Extract build information
    inventreeGet(`/api/build/${build_id}/`, {}, {
        async: false,
        success: function(response) {
            build = response;
        }
    });

    if (!build) {
        console.error(`Failed to find build ${build_id}`);
        return;
    }

    // ID of the associated "build output" (stock item) (or null)
    var output_id = options.output || null;

    var auto_fill_filters = {};

    var source_location = options.source_location;

    if (output_id) {
        // Request information on the particular build output (stock item)
        inventreeGet(`/api/stock/${output_id}/`, {}, {
            async: false,
            success: function(output) {
                if (output.quantity == 1 && output.serial != null) {
                    auto_fill_filters.serial = output.serial;
                }
            },
        });
    }

    function renderBuildLineRow(build_line, quantity) {

        var pk = build_line.pk;
        var sub_part = build_line.part_detail;

        var thumb = thumbnailImage(sub_part.thumbnail);

        var delete_button = `<div class='btn-group float-right' role='group'>`;

        delete_button += makeRemoveButton(
            'button-row-remove',
            pk,
            '移除行',
        );

        delete_button += `</div>`;

        var quantity_input = constructField(
            `items_quantity_${pk}`,
            {
                type: 'decimal',
                min_value: 0,
                value: quantity || 0,
                title: '指定库存分配数量',
                required: true,
            },
            {
                hideLabels: true,
            }
        );

        var allocated_display = makeProgressBar(
            build_line.allocated,
            build_line.quantity,
        );

        var stock_input = constructField(
            `items_stock_item_${pk}`,
            {
                type: 'related field',
                required: 'true',
            },
            {
                hideLabels: true,
            }
        );

        var html = `
        <tr id='items_${pk}' class='part-allocation-row'>
            <td id='part_${pk}'>
                ${thumb} ${sub_part.full_name}
            </td>
            <td id='allocated_${pk}'>
                ${allocated_display}
            </td>
            <td id='stock_item_${pk}'>
                ${stock_input}
            </td>
            <td id='quantity_${pk}'>
                ${quantity_input}
            </td>
            <td id='buttons_${pk}'>
                ${delete_button}
            </td>
        </tr>
        `;

        return html;
    }

    var table_entries = '';

    for (var idx = 0; idx < line_items.length; idx++) {
        let item = line_items[idx];

        // Ignore "consumable" BOM items
        if (item.part_detail.consumable) {
            continue;
        }

        var required = item.quantity || 0;
        var allocated = item.allocated || 0;
        var remaining = required - allocated;

        if (remaining < 0) {
            remaining = 0;
        }

        // Ensure the quantity sent to the form field is correctly formatted
        remaining = formatDecimal(remaining, 15);

        // We only care about entries which are not yet fully allocated
        if (remaining > 0) {
            table_entries += renderBuildLineRow(item, remaining);
        }
    }

    if (table_entries.length == 0) {

        showAlertDialog(
            '所有零件已分配',
            '所有选定的零件均已完全分配',
        );

        return;
    }

    var html = ``;

    // Render a "source location" input
    html += constructField(
        'take_from',
        {
            type: 'related field',
            label: '來源倉儲地點',
            help_text: '选择源位置 (留空以从所有位置取出)',
            required: false,
        },
        {},
    );

    // Create table of parts
    html += `
    <table class='table table-striped table-condensed' id='stock-allocation-table'>
        <thead>
            <tr>
                <th>零件</th>
                <th>已分配</th>
                <th style='min-width: 250px;'>庫存品項</th>
                <th>數量</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            ${table_entries}
        </tbody>
    </table>
    `;

    constructForm(`/api/build/${build_id}/allocate/`, {
        method: 'POST',
        fields: {},
        preFormContent: html,
        title: '分配库存项目给生产订单',
        afterRender: function(fields, options) {

            var take_from_field = {
                name: 'take_from',
                model: 'stocklocation',
                api_url: '/api/stock/location/',
                required: false,
                type: 'related field',
                value: source_location,
                noResults: function(query) {
                    return '没有匹配的库存位置';
                },
            };

            // Initialize "take from" field
            initializeRelatedField(
                take_from_field,
                null,
                options,
            );

            // Add callback to "clear" button for take_from field
            addClearCallback(
                'take_from',
                take_from_field,
                options,
            );

            // Initialize stock item fields
            line_items.forEach(function(line_item) {
                initializeRelatedField(
                    {
                        name: `items_stock_item_${line_item.pk}`,
                        api_url: '/api/stock/',
                        filters: {
                            bom_item: line_item.bom_item_detail.pk,
                            in_stock: true,
                            available: true,
                            part_detail: true,
                            location_detail: true,
                        },
                        model: 'stockitem',
                        required: true,
                        render_part_detail: true,
                        render_location_detail: true,
                        render_pk: false,
                        render_available_quantity: true,
                        auto_fill: true,
                        auto_fill_filters: auto_fill_filters,
                        onSelect: function(data, field, opts) {
                            // Adjust the 'quantity' field based on availability

                            if (!('quantity' in data)) {
                                return;
                            }

                            // Quantity remaining to be allocated
                            var remaining = Math.max((line_item.quantity || 0) - (line_item.allocated || 0), 0);

                            // Calculate the available quantity
                            var available = Math.max((data.quantity || 0) - (data.allocated || 0), 0);

                            // Maximum amount that we need
                            var desired = Math.min(available, remaining);

                            updateFieldValue(`items_quantity_${line_item.pk}`, desired, {}, opts);
                        },
                        adjustFilters: function(filters) {
                            // Restrict query to the selected location
                            var location = getFormFieldValue(
                                'take_from',
                                {},
                                {
                                    modal: options.modal,
                                }
                            );

                            filters.location = location;
                            filters.cascade = true;

                            return filters;
                        },
                        noResults: function(query) {
                            return '没有匹配的库存项';
                        }
                    },
                    null,
                    options,
                );
            });

            // Add remove-row button callbacks
            $(options.modal).find('.button-row-remove').click(function() {
                var pk = $(this).attr('pk');

                $(options.modal).find(`#items_${pk}`).remove();
            });
        },
        onSubmit: function(fields, opts) {

            // Extract elements from the form
            var data = {
                items: []
            };

            var item_pk_values = [];

            line_items.forEach(function(item) {

                var quantity = getFormFieldValue(
                    `items_quantity_${item.pk}`,
                    {},
                    {
                        modal: opts.modal,
                    },
                );

                var stock_item = getFormFieldValue(
                    `items_stock_item_${item.pk}`,
                    {},
                    {
                        modal: opts.modal,
                    }
                );

                if (quantity != null) {
                    data.items.push({
                        build_line: item.pk,
                        stock_item: stock_item,
                        quantity: quantity,
                        output: output_id,
                    });

                    item_pk_values.push(item.pk);
                }
            });

            // Provide nested values
            opts.nested = {
                'items': item_pk_values
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
        },
    });
}


/**
 * Automatically allocate stock items to a build
 */
function autoAllocateStockToBuild(build_id, bom_items=[], options={}) {

    var html = `
    <div class='alert alert-block alert-info'>
    <strong>自动库存分配</strong><br>
    根据提供的指导方针，库存物品将自动分配给此生产订单:
    <ul>
        <li>如果指定了位置，则仅从该位置分配库存</li>
        <li>如果认为库存可以互换，则将从找到的第一个位置进行分配</li>
        <li>如果允许使用替代品，则将在找不到主要零件库存的情况下使用</li>
    </ul>
    </div>
    `;

    var fields = {
        location: {
            value: options.location,
            filters: {
                structural: false,
            },
            tree_picker: {
                url: '/api/stock/location/tree/',
            },
        },
        exclude_location: {},
        interchangeable: {
            value: true,
        },
        substitutes: {
            value: true,
        },
        optional_items: {
            value: false,
        },
    };

    constructForm(`/api/build/${build_id}/auto-allocate/`, {
        method: 'POST',
        fields: fields,
        title: '分配库存物品',
        confirm: true,
        preFormContent: html,
        onSuccess: function(response) {
            if (options.onSuccess) {
                options.onSuccess(response);
            }
        }
    });
}


/*
 * Display a table of Build orders
 */
function loadBuildTable(table, options) {

    // Ensure the table starts in a known state
    $(table).bootstrapTable('destroy');

    var params = options.params || {};

    params['part_detail'] = true;

    var filters = loadTableFilters('build', params);

    var calendar = null;

    var filterTarget = options.filterTarget || null;

    setupFilterList('build', table, filterTarget, {
        download: true,
        report: {
            key: 'build',
        }
    });

    // Which display mode to use for the build table?
    var display_mode = inventreeLoad('build-table-display-mode', 'list');
    var tree_enable = display_mode == 'tree';

    var loaded_calendar = false;

    // Function for rendering BuildOrder calendar display
    function buildEvents(calendar) {
        var start = startDate(calendar);
        var end = endDate(calendar);

        clearEvents(calendar);

        // Extract current filters from table
        var table_options = $(table).bootstrapTable('getOptions');
        var filters = table_options.query_params || {};

        filters.min_date = start;
        filters.max_date = end;
        filters.part_detail = true;

        // Request build orders from the server within specified date range
        inventreeGet(
            '/api/build/',
            filters,
            {
                success: function(response) {

                    for (var idx = 0; idx < response.length; idx++) {

                        var order = response[idx];

                        var date = order.creation_date;

                        if (order.completion_date) {
                            date = order.completion_date;
                        } else if (order.target_date) {
                            date = order.target_date;
                        }

                        var title = `${order.reference}`;

                        var color = '#4c68f5';

                        if (order.completed) {
                            color = '#25c234';
                        } else if (order.overdue) {
                            color = '#c22525';
                        }

                        var event = {
                            title: title,
                            start: date,
                            end: date,
                            url: `/build/${order.pk}/`,
                            backgroundColor: color,
                        };

                        calendar.addEvent(event);
                    }
                }
            }
        );
    }

    $(table).inventreeTable({
        method: 'get',
        formatNoMatches: function() {
            return '没有与查询匹配的构建';
        },
        url: '/api/build/',
        queryParams: filters,
        groupBy: false,
        sidePagination: 'server',
        name: 'builds',
        original: params,
        treeEnable: tree_enable,
        uniqueId: 'pk',
        rootParentId: options.parentBuild || null,
        idField: 'pk',
        parentIdField: 'parent',
        treeShowField: tree_enable ? 'reference' : null,
        showColumns: display_mode == 'list' || display_mode == 'tree',
        showCustomView: display_mode == 'calendar',
        showCustomViewButton: false,
        disablePagination: display_mode == 'calendar',
        search: display_mode != 'calendar',
        buttons: constructOrderTableButtons({
            prefix: 'build',
            callback: function() {
                // Force complete reload of the table
                loadBuildTable(table, options);
            }
        }),
        columns: [
            {
                field: 'pk',
                title: 'ID',
                visible: false,
                switchable: false,
            },
            {
                checkbox: true,
                title: '选择',
                searchable: false,
                switchable: false,
            },
            {
                field: 'reference',
                title: '生产',
                sortable: true,
                switchable: true,
                formatter: function(value, row) {

                    var html = renderLink(value, '/build/' + row.pk + '/');

                    if (row.overdue) {
                        html += makeIconBadge('fa-calendar-times icon-red', '生产订单已逾期');
                    }

                    return html;
                }
            },
            {
                field: 'title',
                title: '描述',
                switchable: true,
            },
            {
                field: 'project_code',
                title: '專案代碼',
                sortable: true,
                switchable: global_settings.PROJECT_CODES_ENABLED,
                visible: global_settings.PROJECT_CODES_ENABLED,
                formatter: function(value, row) {
                    if (row.project_code_detail) {
                        return `<span title='${row.project_code_detail.description}'>${row.project_code_detail.code}</span>`;
                    }
                }
            },
            {
                field: 'priority',
                title: '優先等級',
                switchable: true,
                sortable: true,
            },
            {
                field: 'part',
                title: '零件',
                sortable: true,
                sortName: 'part__name',
                formatter: function(value, row) {

                    var html = imageHoverIcon(row.part_detail.thumbnail);

                    html += renderLink(row.part_detail.full_name, `/part/${row.part}/`);
                    html += makePartIcons(row.part_detail);

                    return html;
                }
            },
            {
                field: 'completed',
                title: '进度',
                sortable: true,
                formatter: function(value, row) {
                    return makeProgressBar(
                        row.completed,
                        row.quantity,
                        {
                            // style: 'max',
                        }
                    );
                }
            },
            {
                field: 'status_custom_key',
                title: '狀態',
                sortable: true,
                formatter: function(value) {
                    return buildStatusDisplay(value);
                },
            },
            {
                field: 'creation_date',
                title: '已创建',
                sortable: true,
                formatter: function(value) {
                    return renderDate(value);
                }
            },
            {
                field: 'issued_by',
                title: '發布者',
                sortable: true,
                formatter: function(value, row) {
                    if (value) {
                        return row.issued_by_detail.username;
                    } else {
                        return `<i>没有用户信息</i>`;
                    }
                }
            },
            {
                field: 'responsible',
                title: '負責人',
                sortable: true,
                formatter: function(value, row) {
                    if (!row.responsible_detail) {
                        return '-';
                    }

                    var html = row.responsible_detail.name;

                    if (row.responsible_detail.label == '组') {
                        html += `<span class='float-right fas fa-users'></span>`;
                    } else {
                        html += `<span class='float-right fas fa-user'></span>`;
                    }

                    return html;
                }
            },
            {
                field: 'target_date',
                title: '预计日期',
                sortable: true,
                formatter: function(value) {
                    return renderDate(value);
                }
            },
            {
                field: 'completion_date',
                title: '完成日期',
                sortable: true,
                formatter: function(value) {
                    return renderDate(value);
                }
            },
        ],
        customView: function(data) {
            return `<div id='build-order-calendar'></div>`;
        },
        onLoadSuccess: function() {

            if (tree_enable) {
                $(table).treegrid({
                    treeColumn: 1,
                });

                $(table).treegrid('expandAll');
            } else if (display_mode == 'calendar') {

                if (!loaded_calendar) {
                    loaded_calendar = true;

                    let el = document.getElementById('build-order-calendar');

                    calendar = new FullCalendar.Calendar(el, {
                        initialView: 'dayGridMonth',
                        nowIndicator: true,
                        aspectRatio: 2.5,
                        locale: options.locale,
                        datesSet: function() {
                            buildEvents(calendar);
                        }
                    });

                    calendar.render();
                } else {
                    calendar.render();
                }
            }
        }
    });
}


function updateAllocationTotal(id, count, required) {

    count = parseFloat(count);

    $('#allocation-total-'+id).html(count);

    var el = $('#allocation-panel-' + id);
    el.removeClass('part-allocation-pass part-allocation-underallocated part-allocation-overallocated');

    if (count < required) {
        el.addClass('part-allocation-underallocated');
    } else if (count > required) {
        el.addClass('part-allocation-overallocated');
    } else {
        el.addClass('part-allocation-pass');
    }
}

/*
 * Render a table of BuildItem objects, which are allocated against a particular BuildLine
 */
function renderBuildLineAllocationTable(element, build_line, options={}) {

    let output = options.output || 'untracked';
    let tableId = `allocation-table-${output}-${build_line.pk}`;

    // Construct a table element
    let html = `
    <div class='sub-table'>
        <table class='table table-condensed table-striped' id='${tableId}'></table>
    </div>`;

    element.html(html);

    let sub_table = $(`#${tableId}`);

    // Load the allocation items into the table
    sub_table.bootstrapTable({
        data: build_line.allocations,
        showHeader: false,
        columns: [
            {
                field: 'part',
                title: '零件',
                formatter: function(_value, row) {
                    let html = imageHoverIcon(row.part_detail.thumbnail);
                    html += renderLink(row.part_detail.full_name, `/part/${row.part_detail.pk}/`);
                    return html;
                }
            },
            {
                field: 'quantity',
                title: '已分配数量',
                formatter: function(_value, row) {
                    let text = '';
                    let url = '';
                    let serial = row.serial;

                    if (row.stock_item_detail) {
                        serial = row.stock_item_detail.serial;
                    }

                    if (serial && row.quantity == 1) {
                        text = `序列号: ${serial}`;
                    } else {
                        text = `數量: ${row.quantity}`;
                        if (row.part_detail && row.part_detail.units) {
                            text += ` <small>${row.part_detail.units}</small>`;
                        }
                    }

                    var pk = row.stock_item || row.pk;

                    url = `/stock/item/${pk}/`;

                    return renderLink(text, url);
                }
            },
            {
                field: 'location',
                title: '地點',
                formatter: function(value, row) {
                    if (row.location_detail) {
                        let text = shortenString(row.location_detail.pathstring);
                        let url = `/stock/location/${row.location_detail.pk}/`;

                        return renderLink(text, url);
                    } else {
                        return '<i>未设置位置</i>';
                    }
                }
            },
            {
                field: 'actions',
                title: '',
                formatter: function(value, row) {
                    let buttons = '';
                    buttons += makeEditButton('button-allocation-edit', row.pk, '编辑库存分配');
                    buttons += makeDeleteButton('button-allocation-delete', row.pk, '删除库存分配');
                    return wrapButtons(buttons);
                }
            }
        ]
    });

    // Callbacks
    $(sub_table).on('click', '.button-allocation-edit', function() {
        let pk = $(this).attr('pk');

        constructForm(`/api/build/item/${pk}/`, {
            fields: {
                quantity: {},
            },
            title: '编辑分配',
            onSuccess: function() {
                $(options.parent_table).bootstrapTable('refresh');
            },
        });
    });

    $(sub_table).on('click', '.button-allocation-delete', function() {
        let pk = $(this).attr('pk');

        constructForm(`/api/build/item/${pk}/`, {
            method: 'DELETE',
            title: '删除分配',
            onSuccess: function() {
                $(options.parent_table).bootstrapTable('refresh');
            },
        });
    });
}


/*
 * Load a table of BuildLine objects associated with a Build
 *
 * @param {int} build_id - The ID of the Build object
 * @param {object} options - Options for the table
 */
function loadBuildLineTable(table, build_id, options={}) {

    let name = 'build-lines';
    let params = options.params || {};
    let output = options.output;

    params.build = build_id;

    if (output) {
        params.tracked = true;
        params.output = output;
        name += `-${output}`;
    }

    let filters = loadTableFilters('buildlines', params);
    let filterTarget = options.filterTarget || '#filter-list-buildlines';

    // If data is passed directly to this function, do not setup filters
    if (!options.data) {
        setupFilterList('buildlines', $(table), filterTarget, {
            download: true,
            labels: {
                modeltype: 'buildline',
            },
            singular_name: '生产行',
            plural_name: '生产行',
        });
    }

    let table_options = {
        name: name,
        uniqueId: 'pk',
        detailView: true,
        detailFilter: function(index, row) {
            // Detail view is available if there is any allocated stock
            return row.allocated > 0;
        },
        detailFormatter: function(_index, row, element) {
            renderBuildLineAllocationTable(element, row, {
                parent_table: table,
            });
        },
        formatNoMatches: function() {
            return '未找到生产行';
        },
        columns: [
            {
                checkbox: true,
                title: '选择',
                searchable: false,
                switchable: false,
            },
            {
                field: 'bom_item',
                title: '必须零件',
                switchable: false,
                sortable: true,
                sortName: 'part',
                formatter: function(value, row) {
                    if (value == null) {
                        return `BOM item deleted`;
                    }

                    let html = '';

                    // Part thumbnail
                    html += imageHoverIcon(row.part_detail.thumbnail) + renderLink(row.part_detail.full_name, `/part/${row.part_detail.pk}/`);

                    if (row.bom_item_detail.allow_variants) {
                        html += makeIconBadge('fa-sitemap', '已允许变体库存');
                    }

                    if (row.part_detail.trackable) {
                        html += makeIconBadge('fa-directions', '可追踪零件');
                    }

                    return html;
                }
            },
            {
                field: 'reference',
                title: '參考代號',
                sortable: true,
                formatter: function(value, row) {
                    return row.bom_item_detail.reference;
                }
            },
            {
                field: 'optional',
                title: '非必須項目',
                sortable: true,
                switchable: true,
                formatter: function(value, row) {
                    return yesNoLabel(row.bom_item_detail.optional);
                }
            },
            {
                field: 'consumable',
                title: '耗材',
                sortable: true,
                switchable: true,
                formatter: function(value, row) {
                    return yesNoLabel(row.bom_item_detail.consumable);
                }
            },
            {
                field: 'allow_variants',
                title: '允许变体',
                sortable: false,
                switchable: true,
                formatter: function(value, row) {
                    return yesNoLabel(row.bom_item_detail.allow_variants);
                }
            },
            {
                field: 'inherited',
                title: '获取已继承的',
                sortable: false,
                switchable: true,
                formatter: function(value, row) {
                    return yesNoLabel(row.bom_item_detail.inherited);
                }
            },
            {
                field: 'unit_quantity',
                sortable: true,
                title: '单位数量',
                formatter: function(value, row) {
                    let text = row.bom_item_detail.quantity;

                    if (row.bom_item_detail.overage) {
                        text += ` <span class='badge bg-dark rounded-pill badge-right'>(+${row.bom_item_detail.overage})</span>`;
                    }

                    if (row.part_detail.units) {
                        text += ` <small> [${row.part_detail.units}]</small>`;
                    }

                    return text;
                }
            },
            {
                field: 'quantity',
                title: '所需数量',
                sortable: true,
            },
            {
                field: 'available_stock',
                title: '可用數量',
                sortable: true,
                formatter: function(value, row) {
                    var url = `/part/${row.part_detail.pk}/?display=part-stock`;

                    // Calculate the "available" quantity
                    let available = row.available_stock + row.available_substitute_stock;

                    if (row.bom_item_detail.allow_variants) {
                        available += row.available_variant_stock;
                    }

                    let text = '';

                    if (available > 0) {
                        text += `${formatDecimal(available)}`;

                        if (row.part_detail.units) {
                            text += ` <small>[${row.part_detail.units}]</small>`;
                        }
                    }

                    let icons = '';

                    if (row.bom_item_detail.consumable) {
                        icons += `<span class='fas fa-info-circle icon-blue float-right' title='消耗品'></span>`;
                    } else {
                        if (available < (row.quantity - row.allocated)) {
                            icons += makeIconBadge('fa-times-circle icon-red', '可用库存不足');
                        } else {
                            icons += makeIconBadge('fa-check-circle icon-green', '充足的库存');
                        }

                        if (available <= 0) {
                            icons += `<span class='badge rounded-pill bg-danger'>无可用库存</span>`;
                        } else {
                            let extra = '';
                            if ((row.available_substitute_stock > 0) && (row.available_variant_stock > 0)) {
                                extra = '包括变体和替代品库存';
                            } else if (row.available_variant_stock > 0) {
                                extra = '包括变体库存';
                            } else if (row.available_substitute_stock > 0) {
                                extra = '包括替代品库存';
                            }

                            if (extra) {
                                icons += makeIconBadge('fa-info-circle icon-blue', extra);
                            }
                        }
                    }

                    if (row.on_order && row.on_order > 0) {
                        icons += makeIconBadge('fa-shopping-cart', `已订购: ${formatDecimal(row.on_order)}`);
                    }

                    if (row.in_production && row.in_production > 0) {
                        icons += makeIconBadge('fa-tools icon-blue', `生产中: ${formatDecimal(row.in_production)}`);
                    }

                    if (row.external_stock > 0) {
                        icons += makeIconBadge('fa-sitemap', `外部库存: ${row.external_stock}`);
                    }

                    return renderLink(text, url) + icons;
                }
            },
            {
                field: 'allocated',
                title: '已分配',
                sortable: true,
                formatter: function(value, row) {
                    return makeProgressBar(row.allocated, row.quantity);
                }
            },
            {
                field: 'actions',
                title: '',
                switchable: false,
                sortable: false,
                formatter: function(value, row) {
                    let buttons = '';
                    let pk = row.pk;

                    // Consumable items do not need to be allocated
                    if (row.bom_item_detail.consumable) {
                        return `<em>消耗品</em>`;
                    }

                    if (row.part_detail.trackable && !options.output) {
                        // Tracked parts must be allocated to a specific build output
                        return `
                        <div>
                            <em>跟踪项目</em>
                            <span title='根据单个构建输出分配跟踪项目' class='fas fa-info-circle icon-blue' />
                        </div>`;
                    }

                    if (row.allocated < row.quantity) {

                        // Add a button to "build" stock for this line
                        if (row.part_detail.assembly) {
                            buttons += makeIconButton('fa-tools icon-blue', 'button-build', pk, '生产库存');
                        }

                        // Add a button to "purchase" stock for this line
                        if (row.part_detail.purchaseable) {
                            buttons += makeIconButton('fa-shopping-cart icon-blue', 'button-buy', pk, '订单库存');
                        }

                        // Add a button to "allocate" stock for this line
                        buttons += makeIconButton('fa-sign-in-alt icon-green', 'button-allocate', pk, '分配库存');
                    }

                    if (row.allocated > 0) {
                        buttons += makeRemoveButton('button-unallocate', pk, '移除库存分配');
                    }

                    return wrapButtons(buttons);
                }
            }
        ]
    };

    if (options.data) {
        Object.assign(table_options, {
            data: options.data,
            sidePagination: 'client',
            showColumns: false,
            pagination: false,
            disablePagination: true,
            search: false,
        });
    } else {
        Object.assign(table_options, {
            url: '/api/build/line/',
            queryParams: filters,
            original: params,
            search: true,
            sidePagination: 'server',
            pagination: true,
            showColumns: true,
            buttons: constructExpandCollapseButtons(table),
        });
    }

    $(table).inventreeTable(table_options);

    /* Add callbacks for allocation buttons */

    // Callback to build stock
    $(table).on('click', '.button-build', function() {
        let pk = $(this).attr('pk');
        let row = $(table).bootstrapTable('getRowByUniqueId', pk);

        // Start a new "build" for this line
        newBuildOrder({
            part: row.part_detail.pk,
            parent: build_id,
            quantity: Math.max(row.quantity - row.allocated, 0),
            ...options,
        });
    });

    // Callback to purchase stock
    $(table).on('click', '.button-buy', function() {
        let pk = $(this).attr('pk');
        let row = $(table).bootstrapTable('getRowByUniqueId', pk);

        // TODO: Refresh table after purchase order is created
        orderParts([row.part_detail], {});
    });

    // Callback to allocate stock
    $(table).on('click', '.button-allocate', function() {
        let pk = $(this).attr('pk');
        let row = $(table).bootstrapTable('getRowByUniqueId', pk);

        allocateStockToBuild(build_id, [row], {
            output: options.output,
            source_location: options.location,
            success: function() {
                $(table).bootstrapTable('refresh');
            }
        });
    });

    // Callback to un-allocate stock
    $(table).on('click', '.button-unallocate', function() {
        let pk = $(this).attr('pk');

        deallocateStock(build_id, {
            build_line: pk,
            output: output,
            onSuccess: function() {
                $(table).bootstrapTable('refresh');
            }
        });
    });
}
