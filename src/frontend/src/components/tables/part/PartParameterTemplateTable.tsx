import { t } from '@lingui/macro';
import { Text } from '@mantine/core';
import { useCallback, useMemo } from 'react';

import { partParameterTemplateFields } from '../../../forms/PartForms';
import {
  openCreateApiForm,
  openDeleteApiForm,
  openEditApiForm
} from '../../../functions/forms';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { ApiPaths, apiUrl } from '../../../states/ApiState';
import { UserRoles, useUserState } from '../../../states/UserState';
import { AddItemButton } from '../../buttons/AddItemButton';
import { TableColumn } from '../Column';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowDeleteAction, RowEditAction } from '../RowActions';

export function PartParameterTemplateTable() {
  const { tableKey, refreshTable } = useTableRefresh(
    'part-parameter-templates'
  );

  const user = useUserState();

  const tableColumns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'name',
        title: t`Name`,
        sortable: true,
        switchable: false
      },
      {
        accessor: 'units',
        title: t`Units`,
        sortable: true
      },
      {
        accessor: 'description',
        title: t`Description`,
        sortbale: false
      },
      {
        accessor: 'checkbox',
        title: t`Checkbox`
      },
      {
        accessor: 'choices',
        title: t`Choices`
      }
    ];
  }, []);

  // Callback for row actions
  const rowActions = useCallback(
    (record: any) => {
      return [
        RowEditAction({
          hidden: !user.hasChangeRole(UserRoles.part),
          onClick: () => {
            openEditApiForm({
              url: ApiPaths.part_parameter_template_list,
              pk: record.pk,
              title: t`Edit Parameter Template`,
              fields: partParameterTemplateFields(),
              successMessage: t`Parameter template updated`,
              onFormSuccess: refreshTable
            });
          }
        }),
        RowDeleteAction({
          hidden: !user.hasDeleteRole(UserRoles.part),
          onClick: () => {
            openDeleteApiForm({
              url: ApiPaths.part_parameter_template_list,
              pk: record.pk,
              title: t`Delete Parameter Template`,
              successMessage: t`Parameter template deleted`,
              onFormSuccess: refreshTable,
              preFormContent: <Text>{t`Remove parameter template`}</Text>
            });
          }
        })
      ];
    },
    [user]
  );

  const addParameterTemplate = useCallback(() => {
    openCreateApiForm({
      url: ApiPaths.part_parameter_template_list,
      title: t`Create Parameter Template`,
      fields: partParameterTemplateFields(),
      successMessage: t`Parameter template created`,
      onFormSuccess: refreshTable
    });
  }, []);

  const tableActions = useMemo(() => {
    return [
      <AddItemButton
        tooltip={t`Add parameter template`}
        onClick={addParameterTemplate}
        disabled={!user.hasAddRole(UserRoles.part)}
      />
    ];
  }, [user]);

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.part_parameter_template_list)}
      tableKey={tableKey}
      columns={tableColumns}
      props={{
        rowActions: rowActions,
        customActionGroups: tableActions
      }}
    />
  );
}
