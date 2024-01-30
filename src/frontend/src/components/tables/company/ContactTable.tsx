import { t } from '@lingui/macro';
import { useCallback, useMemo } from 'react';

import { ApiEndpoints } from '../../../enums/ApiEndpoints';
import { UserRoles } from '../../../enums/Roles';
import { contactFields } from '../../../forms/CompanyForms';
import {
  openCreateApiForm,
  openDeleteApiForm,
  openEditApiForm
} from '../../../functions/forms';
import { useTable } from '../../../hooks/UseTable';
import { apiUrl } from '../../../states/ApiState';
import { useUserState } from '../../../states/UserState';
import { AddItemButton } from '../../buttons/AddItemButton';
import { TableColumn } from '../Column';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowDeleteAction, RowEditAction } from '../RowActions';

export function ContactTable({
  companyId,
  params
}: {
  companyId: number;
  params?: any;
}) {
  const user = useUserState();

  const table = useTable('contact');

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'name',
        title: t`Name`,
        sortable: true,
        switchable: false
      },
      {
        accessor: 'phone',
        title: t`Phone`,
        switchable: true,
        sortable: false
      },
      {
        accessor: 'email',
        title: t`Email`,
        switchable: true,
        sortable: false
      },
      {
        accessor: 'role',
        title: t`Role`,
        switchable: true,
        sortable: false
      }
    ];
  }, []);

  const rowActions = useCallback(
    (record: any) => {
      let can_edit =
        user.hasChangeRole(UserRoles.purchase_order) ||
        user.hasChangeRole(UserRoles.sales_order);
      let can_delete =
        user.hasDeleteRole(UserRoles.purchase_order) ||
        user.hasDeleteRole(UserRoles.sales_order);

      return [
        RowEditAction({
          hidden: !can_edit,
          onClick: () => {
            openEditApiForm({
              url: ApiEndpoints.contact_list,
              pk: record.pk,
              title: t`Edit Contact`,
              fields: contactFields(),
              successMessage: t`Contact updated`,
              onFormSuccess: table.refreshTable
            });
          }
        }),
        RowDeleteAction({
          hidden: !can_delete,
          onClick: () => {
            openDeleteApiForm({
              url: ApiEndpoints.contact_list,
              pk: record.pk,
              title: t`Delete Contact`,
              successMessage: t`Contact deleted`,
              onFormSuccess: table.refreshTable,
              preFormWarning: t`Are you sure you want to delete this contact?`
            });
          }
        })
      ];
    },
    [user]
  );

  const addContact = useCallback(() => {
    var fields = contactFields();

    fields['company'].value = companyId;

    openCreateApiForm({
      url: ApiEndpoints.contact_list,
      title: t`Create Contact`,
      fields: fields,
      successMessage: t`Contact created`,
      onFormSuccess: table.refreshTable
    });
  }, [companyId]);

  const tableActions = useMemo(() => {
    let can_add =
      user.hasAddRole(UserRoles.purchase_order) ||
      user.hasAddRole(UserRoles.sales_order);

    return [
      <AddItemButton
        tooltip={t`Add contact`}
        onClick={addContact}
        disabled={!can_add}
      />
    ];
  }, [user]);

  return (
    <InvenTreeTable
      url={apiUrl(ApiEndpoints.contact_list)}
      tableState={table}
      columns={columns}
      props={{
        rowActions: rowActions,
        tableActions: tableActions,
        params: {
          ...params,
          company: companyId
        }
      }}
    />
  );
}
