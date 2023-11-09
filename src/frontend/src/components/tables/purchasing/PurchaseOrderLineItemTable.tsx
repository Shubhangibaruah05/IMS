import { t } from '@lingui/macro';
import { Text } from '@mantine/core';
import { IconSquareArrowRight } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';

import { ProgressBar } from '../../../components/items/ProgressBar';
import { purchaseOrderLineItemFields } from '../../../forms/PurchaseOrderForms';
import { openCreateApiForm, openEditApiForm } from '../../../functions/forms';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { ApiPaths, apiUrl } from '../../../states/ApiState';
import { UserRoles, useUserState } from '../../../states/UserState';
import { ActionButton } from '../../buttons/ActionButton';
import { AddItemButton } from '../../buttons/AddItemButton';
import { Thumbnail } from '../../images/Thumbnail';
import { RenderStockLocation } from '../../render/Stock';
import {
  CurrencyColumn,
  LinkColumn,
  TargetDateColumn,
  TotalPriceColumn
} from '../ColumnRenderers';
import { InvenTreeTable } from '../InvenTreeTable';
import {
  RowDeleteAction,
  RowDuplicateAction,
  RowEditAction
} from '../RowActions';
import { TableHoverCard } from '../TableHoverCard';

/*
 * Display a table of purchase order line items, for a specific order
 */
export function PurchaseOrderLineItemTable({
  orderId,
  params
}: {
  orderId: number;
  params?: any;
}) {
  const { tableKey, refreshTable } = useTableRefresh(
    'purchase-order-line-item'
  );

  const user = useUserState();

  const rowActions = useCallback(
    (record: any) => {
      let received = (record?.received ?? 0) >= (record?.quantity ?? 0);

      return [
        {
          hidden: received,
          title: t`Receive line item`,
          icon: <IconSquareArrowRight />,
          color: 'green'
        },
        RowEditAction({
          hidden: !user.hasAddRole(UserRoles.purchase_order),
          onClick: () => {
            let supplier = record?.supplier_part_detail?.supplier;

            if (!supplier) {
              return;
            }

            let fields = purchaseOrderLineItemFields({
              supplierId: supplier
            });

            openEditApiForm({
              url: ApiPaths.purchase_order_line_list,
              pk: record.pk,
              title: t`Edit Line Item`,
              fields: fields,
              onFormSuccess: refreshTable,
              successMessage: t`Line item updated`
            });
          }
        }),
        RowDuplicateAction({
          hidden: !user.hasAddRole(UserRoles.purchase_order)
        }),
        RowDeleteAction({
          hidden: !user.hasDeleteRole(UserRoles.purchase_order)
        })
      ];
    },
    [orderId, user]
  );

  const tableColumns = useMemo(() => {
    return [
      {
        accessor: 'part',
        title: t`Part`,
        sortable: true,
        switchable: false,
        render: (record: any) => {
          return (
            <Thumbnail
              text={record?.part_detail?.name}
              src={record?.part_detail?.thumbnail ?? record?.part_detail?.image}
            />
          );
        }
      },
      {
        accessor: 'description',
        title: t`Part Description`,

        sortable: false,
        render: (record: any) => record?.part_detail?.description
      },
      {
        accessor: 'reference',
        title: t`Reference`,
        sortable: true
      },
      {
        accessor: 'quantity',
        title: t`Quantity`,
        sortable: true,
        switchable: false,
        render: (record: any) => {
          let supplier_part = record?.supplier_part_detail ?? {};
          let part = record?.part_detail ?? supplier_part?.part_detail ?? {};
          let extra = [];

          if (supplier_part.pack_quantity_native != 1) {
            let total = record.quantity * supplier_part.pack_quantity_native;

            extra.push(
              <Text key="pack-quantity">
                {t`Pack Quantity`}: {supplier_part.pack_quantity}
              </Text>
            );

            extra.push(
              <Text key="total-quantity">
                {t`Total Quantity`}: {total} {part?.units}
              </Text>
            );
          }

          return (
            <TableHoverCard
              value={record.quantity}
              extra={extra}
              title={t`Quantity`}
            />
          );
        }
      },
      {
        accessor: 'received',
        title: t`Received`,
        sortable: false,

        render: (record: any) => (
          <ProgressBar
            progressLabel={true}
            value={record.received}
            maximum={record.quantity}
          />
        )
      },
      {
        accessor: 'pack_quantity',
        sortable: false,
        title: t`Pack Quantity`,
        render: (record: any) => record?.supplier_part_detail?.pack_quantity
      },
      {
        accessor: 'SKU',
        title: t`Supplier Code`,
        switchable: false,
        sortable: true,
        render: (record: any) => record?.supplier_part_detail?.SKU
      },
      {
        accessor: 'supplier_link',
        title: t`Supplier Link`,

        sortable: false,
        render: (record: any) => record?.supplier_part_detail?.link
      },
      {
        accessor: 'MPN',
        title: t`Manufacturer Code`,
        sortable: true,

        render: (record: any) =>
          record?.supplier_part_detail?.manufacturer_part_detail?.MPN
      },
      CurrencyColumn({
        accessor: 'purchase_price',
        title: t`Unit Price`
      }),
      TotalPriceColumn(),
      TargetDateColumn(),
      {
        accessor: 'destination',
        title: t`Destination`,
        sortable: false,
        render: (record: any) =>
          record.destination
            ? RenderStockLocation({ instance: record.destination_detail })
            : '-'
      },
      {
        accessor: 'notes',
        title: t`Notes`
      },
      LinkColumn()
    ];
  }, [orderId, user]);

  const addLine = useCallback(() => {
    openCreateApiForm({
      url: ApiPaths.purchase_order_line_list,
      title: t`Add Line Item`,
      fields: purchaseOrderLineItemFields({}),
      onFormSuccess: refreshTable,
      successMessage: t`Line item added`
    });
  }, []);

  // Custom table actions
  const tableActions = useMemo(() => {
    return [
      <AddItemButton
        tooltip={t`Add line item`}
        onClick={addLine}
        hidden={!user?.hasAddRole(UserRoles.purchase_order)}
      />,
      <ActionButton text={t`Receive items`} icon={<IconSquareArrowRight />} />
    ];
  }, [orderId, user]);

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.purchase_order_line_list)}
      tableKey={tableKey}
      columns={tableColumns}
      props={{
        enableSelection: true,
        enableDownload: true,
        params: {
          ...params,
          order: orderId,
          part_detail: true
        },
        rowActions: rowActions,
        customActionGroups: tableActions
      }}
    />
  );
}
