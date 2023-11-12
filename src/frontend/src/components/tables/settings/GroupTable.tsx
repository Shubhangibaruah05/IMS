import { t } from '@lingui/macro';
import { Text } from '@mantine/core';
import { useCallback, useMemo } from 'react';

import { ApiPaths } from '../../../enums/ApiEndpoints';
import {
  openCreateApiForm,
  openDeleteApiForm,
  openEditApiForm
} from '../../../functions/forms';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { apiUrl } from '../../../states/ApiState';
import { AddItemButton } from '../../buttons/AddItemButton';
import { TableColumn } from '../Column';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowAction, RowDeleteAction, RowEditAction } from '../RowActions';

/**
 * Table for displaying list of groups
 */
export function GroupTable() {
  const { tableKey, refreshTable } = useTableRefresh('groups');

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'name',
        sortable: true,
        title: t`Name`
      }
    ];
  }, []);

  const rowActions = useCallback((record: any): RowAction[] => {
    return [
      RowEditAction({
        onClick: () => {
          openEditApiForm({
            url: ApiPaths.group_list,
            pk: record.pk,
            title: t`Edit group`,
            fields: {
              name: {}
            },
            onFormSuccess: refreshTable,
            successMessage: t`Group updated`
          });
        }
      }),
      RowDeleteAction({
        onClick: () => {
          openDeleteApiForm({
            url: ApiPaths.group_list,
            pk: record.pk,
            title: t`Delete group`,
            successMessage: t`Group deleted`,
            onFormSuccess: refreshTable,
            preFormContent: (
              <Text>{t`Are you sure you want to delete this group?`}</Text>
            )
          });
        }
      })
    ];
  }, []);

  const addGroup = useCallback(() => {
    openCreateApiForm({
      url: ApiPaths.group_list,
      title: t`Add group`,
      fields: { name: {} },
      onFormSuccess: refreshTable,
      successMessage: t`Added group`
    });
  }, []);

  const tableActions = useMemo(() => {
    let actions = [];

    actions.push(
      <AddItemButton
        key={'add-group'}
        onClick={addGroup}
        tooltip={t`Add group`}
      />
    );

    return actions;
  }, []);

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.group_list)}
      tableKey={tableKey}
      columns={columns}
      props={{
        rowActions: rowActions,
        customActionGroups: tableActions
      }}
    />
  );
}
