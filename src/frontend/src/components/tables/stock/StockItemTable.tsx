import { t } from '@lingui/macro';
import { Group, Stack, Text } from '@mantine/core';
import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTableRefresh } from '../../../hooks/TableRefresh';
import { ApiPaths, apiUrl } from '../../../states/ApiState';
import { Thumbnail } from '../../images/Thumbnail';
import { ModelType } from '../../render/ModelType';
import { TableStatusRenderer } from '../../renderers/StatusRenderer';
import { TableColumn } from '../Column';
import { TableFilter } from '../Filter';
import { RowAction } from '../RowActions';
import { TableHoverCard } from '../TableHoverCard';
import { InvenTreeTable } from './../InvenTreeTable';

/**
 * Construct a list of columns for the stock item table
 */
function stockItemTableColumns(): TableColumn[] {
  return [
    {
      accessor: 'part',
      sortable: true,
      title: t`Part`,
      render: function (record: any) {
        let part = record.part_detail ?? {};
        return (
          <Group spacing="xs" noWrap={true}>
            <Thumbnail
              src={part?.thumbnail || part?.image}
              alt={part?.name}
              size={24}
            />
            <Text>{part?.full_name}</Text>
          </Group>
        );
      }
    },
    {
      accessor: 'part_detail.description',
      sortable: false,
      switchable: true,
      title: t`Description`
    },
    {
      accessor: 'quantity',
      sortable: true,
      title: t`Stock`,
      render: (record) => {
        // TODO: Push this out into a custom renderer
        let quantity = record?.quantity ?? 0;
        let allocated = record?.allocated ?? 0;
        let available = quantity - allocated;
        let text = quantity;
        let part = record?.part_detail ?? {};
        let extra: ReactNode[] = [];
        let color = undefined;

        if (record.serial && quantity == 1) {
          text = `# ${record.serial}`;
        }

        if (record.is_building) {
          color = 'blue';
          extra.push(
            <Text size="sm">{t`This stock item is in production`}</Text>
          );
        }

        if (record.sales_order) {
          extra.push(
            <Text size="sm">{t`This stock item has been assigned to a sales order`}</Text>
          );
        }

        if (record.customer) {
          extra.push(
            <Text size="sm">{t`This stock item has been assigned to a customer`}</Text>
          );
        }

        if (record.belongs_to) {
          extra.push(
            <Text size="sm">{t`This stock item is installed in another stock item`}</Text>
          );
        }

        if (record.consumed_by) {
          extra.push(
            <Text size="sm">{t`This stock item has been consumed by a build order`}</Text>
          );
        }

        if (record.expired) {
          extra.push(<Text size="sm">{t`This stock item has expired`}</Text>);
        } else if (record.stale) {
          extra.push(<Text size="sm">{t`This stock item is stale`}</Text>);
        }

        if (allocated > 0) {
          if (allocated >= quantity) {
            color = 'orange';
            extra.push(
              <Text size="sm">{t`This stock item is fully allocated`}</Text>
            );
          } else {
            extra.push(
              <Text size="sm">{t`This stock item is partially allocated`}</Text>
            );
          }
        }

        if (available != quantity) {
          if (available > 0) {
            extra.push(
              <Text size="sm" color="orange">
                {t`Available` + `: ${available}`}
              </Text>
            );
          } else {
            extra.push(
              <Text size="sm" color="red">{t`No stock available`}</Text>
            );
          }
        }

        if (quantity <= 0) {
          color = 'red';
          extra.push(
            <Text size="sm">{t`This stock item has been depleted`}</Text>
          );
        }

        return (
          <TableHoverCard
            value={
              <Group spacing="xs" position="left">
                <Text color={color}>{text}</Text>
                {part.units && (
                  <Text size="xs" color={color}>
                    [{part.units}]
                  </Text>
                )}
              </Group>
            }
            title={t`Stock Information`}
            extra={extra.length > 0 && <Stack spacing="xs">{extra}</Stack>}
          />
        );
      }
    },
    {
      accessor: 'status',
      sortable: true,
      switchable: true,
      filter: true,
      title: t`Status`,
      render: TableStatusRenderer(ModelType.stockitem)
    },
    {
      accessor: 'batch',
      sortable: true,
      switchable: true,
      title: t`Batch`
    },
    {
      accessor: 'location',
      sortable: true,
      switchable: true,
      title: t`Location`,
      render: function (record: any) {
        // TODO: Custom renderer for location
        // TODO: Note, if not "In stock" we don't want to display the actual location here
        return record?.location_detail?.pathstring ?? record.location ?? '-';
      }
    }
    // TODO: stocktake column
    // TODO: expiry date
    // TODO: last updated
    // TODO: purchase order
    // TODO: Supplier part
    // TODO: purchase price
    // TODO: stock value
    // TODO: packaging
    // TODO: notes
  ];
}

/**
 * Construct a list of available filters for the stock item table
 */
function stockItemTableFilters(): TableFilter[] {
  return [
    {
      name: 'test_filter',
      label: t`Test Filter`,
      description: t`This is a test filter`,
      type: 'choice',
      choiceFunction: () => [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' }
      ]
    }
  ];
}

/*
 * Load a table of stock items
 */
export function StockItemTable({ params = {} }: { params?: any }) {
  let tableColumns = useMemo(() => stockItemTableColumns(), []);
  let tableFilters = useMemo(() => stockItemTableFilters(), []);

  const { tableKey, refreshTable } = useTableRefresh('stockitem');

  function stockItemRowActions(record: any): RowAction[] {
    let actions: RowAction[] = [];

    // TODO: Custom row actions for stock table
    return actions;
  }

  const navigate = useNavigate();

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.stock_item_list)}
      tableKey={tableKey}
      columns={tableColumns}
      props={{
        enableDownload: true,
        enableSelection: true,
        customFilters: tableFilters,
        rowActions: stockItemRowActions,
        onRowClick: (record) => navigate(`/stock/item/${record.pk}`),
        params: {
          ...params,
          part_detail: true,
          location_detail: true,
          supplier_part_detail: true
        }
      }}
    />
  );
}
