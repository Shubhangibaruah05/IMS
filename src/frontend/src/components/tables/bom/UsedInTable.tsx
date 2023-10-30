import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTableRefresh } from '../../../hooks/TableRefresh';
import { ApiPaths, apiUrl } from '../../../states/ApiState';
import { ThumbnailHoverCard } from '../../images/Thumbnail';
import { TableColumn } from '../Column';
import { TableFilter } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';

/*
 * For a given part, render a table showing all the assemblies the part is used in
 */
export function UsedInTable({
  partId,
  params = {}
}: {
  partId: number;
  params?: any;
}) {
  const navigate = useNavigate();

  const { tableKey } = useTableRefresh('usedin');

  const tableColumns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'part',
        title: t`Assembled Part`,
        switchable: false,
        sortable: true,
        render: (record: any) => {
          let part = record.part_detail;
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
        accessor: 'sub_part',
        title: t`Required Part`,
        sortable: true,
        render: (record: any) => {
          let part = record.sub_part_detail;
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
        accessor: 'quantity',
        title: t`Quantity`,
        render: (record: any) => {
          // TODO: render units if appropriate
          return record.quantity;
        }
      },
      {
        accessor: 'reference',
        title: t`Reference`,
        sortable: true,
        switchable: true
      }
    ];
  }, [partId]);

  const tableFilters: TableFilter[] = useMemo(() => {
    return [];
  }, [partId]);

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.bom_list)}
      tableKey={tableKey}
      columns={tableColumns}
      props={{
        params: {
          ...params,
          uses: partId,
          part_detail: true,
          sub_part_detail: true
        },
        customFilters: tableFilters,
        onRowClick: (row) => navigate(`/part/${row.part}`)
      }}
    />
  );
}
