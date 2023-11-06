import { t } from '@lingui/macro';
import { Text } from '@mantine/core';
import { ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTableRefresh } from '../../../hooks/TableRefresh';
import { ApiPaths, apiUrl } from '../../../states/ApiState';
import { useUserState } from '../../../states/UserState';
import { ThumbnailHoverCard } from '../../images/Thumbnail';
import { YesNoButton } from '../../items/YesNoButton';
import { TableColumn } from '../Column';
import { TableFilter } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowAction, RowDeleteAction, RowEditAction } from '../RowActions';
import { TableHoverCard } from '../TableHoverCard';

export function BomTable({
  partId,
  params = {}
}: {
  partId: number;
  params?: any;
}) {
  const navigate = useNavigate();

  const user = useUserState();

  const { tableKey } = useTableRefresh('bom');

  const tableColumns: TableColumn[] = useMemo(() => {
    return [
      // TODO: Improve column rendering
      {
        accessor: 'part',
        title: t`Part`,
        render: (row) => {
          let part = row.sub_part_detail;

          return (
            part && (
              <ThumbnailHoverCard
                src={part.thumbnail || part.image}
                text={part.full_name}
                alt={part.description}
                link=""
              />
            )
          );
        }
      },
      {
        accessor: 'description',
        title: t`Description`,
        render: (row) => row?.sub_part_detail?.description
      },
      {
        accessor: 'reference',

        title: t`Reference`
      },
      {
        accessor: 'quantity',
        title: t`Quantity`
      },
      {
        accessor: 'substitutes',
        title: t`Substitutes`,

        render: (row) => {
          let substitutes = row.substitutes ?? [];

          return substitutes.length > 0 ? (
            row.length
          ) : (
            <YesNoButton value={false} />
          );
        }
      },
      {
        accessor: 'optional',
        title: t`Optional`,

        sortable: true,
        render: (row) => {
          return <YesNoButton value={row.optional} />;
        }
      },
      {
        accessor: 'consumable',
        title: t`Consumable`,

        sortable: true,
        render: (row) => {
          return <YesNoButton value={row.consumable} />;
        }
      },
      {
        accessor: 'allow_variants',
        title: t`Allow Variants`,

        sortable: true,
        render: (row) => {
          return <YesNoButton value={row.allow_variants} />;
        }
      },
      {
        accessor: 'inherited',
        title: t`Gets Inherited`,

        sortable: true,
        render: (row) => {
          // TODO: Update complexity here
          return <YesNoButton value={row.inherited} />;
        }
      },
      {
        accessor: 'price_range',
        title: t`Price Range`,

        sortable: false,
        render: (row) => {
          let min_price = row.pricing_min || row.pricing_max;
          let max_price = row.pricing_max || row.pricing_min;

          // TODO: Custom price range rendering component
          return `${min_price} - ${max_price}`;
        }
      },
      {
        accessor: 'available_stock',
        title: t`Available`,

        render: (row) => {
          let extra: ReactNode[] = [];

          let available_stock: number = row?.available_stock ?? 0;
          let substitute_stock: number = row?.substitute_stock ?? 0;
          let variant_stock: number = row?.variant_stock ?? 0;
          let on_order: number = row?.on_order ?? 0;

          if (available_stock <= 0) {
            return <Text color="red" italic>{t`No stock`}</Text>;
          }

          if (substitute_stock > 0) {
            extra.push(
              <Text key="substitute">{t`Includes substitute stock`}</Text>
            );
          }

          if (variant_stock > 0) {
            extra.push(<Text key="variant">{t`Includes variant stock`}</Text>);
          }

          if (on_order > 0) {
            extra.push(
              <Text key="on_order">
                {t`On order`}: {on_order}
              </Text>
            );
          }

          return (
            <TableHoverCard
              value={available_stock}
              extra={extra}
              title={t`Available Stock`}
            />
          );
        }
      },
      {
        accessor: 'can_build',
        title: t`Can Build`,

        sortable: true // TODO: Custom sorting via API
        // TODO: Reference bom.js for canBuildQuantity method
      },
      {
        accessor: 'note',
        title: t`Notes`,
        switchable: true
      }
    ];
  }, [partId, params]);

  const tableFilters: TableFilter[] = useMemo(() => {
    return [];
  }, [partId, params]);

  const rowActions = useCallback(
    (record: any) => {
      // TODO: Check user permissions here,
      // TODO: to determine which actions are allowed

      let actions: RowAction[] = [];

      if (!record.validated) {
        actions.push({
          title: t`Validate`
        });
      }

      // TODO: Action on edit
      actions.push(RowEditAction({}));

      // TODO: Action on delete
      actions.push(RowDeleteAction({}));

      return actions;
    },
    [partId, user]
  );

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.bom_list)}
      tableKey={tableKey}
      columns={tableColumns}
      props={{
        params: {
          ...params,
          part: partId,
          part_detail: true,
          sub_part_detail: true
        },
        customFilters: tableFilters,
        onRowClick: (row) => navigate(`/part/${row.sub_part}`),
        rowActions: rowActions
      }}
    />
  );
}
