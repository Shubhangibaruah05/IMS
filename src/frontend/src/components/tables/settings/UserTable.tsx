import { Trans, t } from '@lingui/macro';
import { List, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { ApiPaths } from '../../../enums/ApiEndpoints';
import {
  openCreateApiForm,
  openDeleteApiForm,
  openEditApiForm
} from '../../../functions/forms';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { useInstance } from '../../../hooks/UseInstance';
import { apiUrl } from '../../../states/ApiState';
import { AddItemButton } from '../../buttons/AddItemButton';
import { EditApiForm } from '../../forms/ApiForm';
import { DetailDrawer } from '../../nav/DetailDrawer';
import { TableColumn } from '../Column';
import { BooleanColumn } from '../ColumnRenderers';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowAction, RowDeleteAction, RowEditAction } from '../RowActions';

interface GroupDetailI {
  pk: number;
  name: string;
}

export interface UserDetailI {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: GroupDetailI[];
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export function UserDrawer({
  id,
  refreshTable
}: {
  id: string;
  refreshTable: () => void;
}) {
  const {
    instance: userDetail,
    refreshInstance,
    instanceQuery: { isFetching, error }
  } = useInstance<UserDetailI>({
    endpoint: ApiPaths.user_list,
    pk: id,
    throwError: true
  });

  if (isFetching) {
    return <LoadingOverlay visible={true} />;
  }

  if (error) {
    return (
      <Text>
        {(error as any)?.response?.status === 404 ? (
          <Trans>User with id {id} not found</Trans>
        ) : (
          <Trans>An error occurred while fetching user details</Trans>
        )}
      </Text>
    );
  }

  return (
    <Stack>
      <EditApiForm
        props={{
          url: ApiPaths.user_list,
          pk: id,
          fields: {
            username: {},
            first_name: {},
            last_name: {},
            email: {},
            is_staff: {},
            is_superuser: {},
            is_active: {}
          },
          onFormSuccess: () => {
            refreshTable();
            refreshInstance();
          }
        }}
        id={`user-detail-drawer-${id}`}
      />

      <Title order={5}>
        <Trans>Groups</Trans>
      </Title>
      <Text ml={'md'}>
        {userDetail?.groups && userDetail?.groups?.length > 0 ? (
          <List>
            {userDetail?.groups?.map((group) => (
              <List.Item key={group.pk}>
                <Link to={`../group-${group.pk}`}>{group.name}</Link>
              </List.Item>
            ))}
          </List>
        ) : (
          <Trans>No groups</Trans>
        )}
      </Text>
    </Stack>
  );
}

/**
 * Table for displaying list of users
 */
export function UserTable() {
  const { tableKey, refreshTable } = useTableRefresh('users');
  const navigate = useNavigate();

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'email',
        sortable: true,
        title: t`Email`
      },
      {
        accessor: 'username',
        sortable: true,
        switchable: false,
        title: t`Username`
      },
      {
        accessor: 'first_name',
        sortable: true,
        title: t`First Name`
      },
      {
        accessor: 'last_name',
        sortable: true,
        title: t`Last Name`
      },
      {
        accessor: 'groups',
        sortable: true,
        switchable: true,
        title: t`Groups`,
        render: (record: any) => {
          return record.groups.length;
        }
      },
      BooleanColumn({
        accessor: 'is_staff',
        title: t`Staff`
      }),
      BooleanColumn({
        accessor: 'is_superuser',
        title: t`Superuser`
      }),
      BooleanColumn({
        accessor: 'is_active',
        title: t`Active`
      })
    ];
  }, []);

  const rowActions = useCallback((record: UserDetailI): RowAction[] => {
    return [
      RowEditAction({
        onClick: () => {
          openEditApiForm({
            url: ApiPaths.user_list,
            pk: record.pk,
            title: t`Edit user`,
            fields: {
              email: {},
              first_name: {},
              last_name: {}
            },
            onFormSuccess: refreshTable,
            successMessage: t`User updated`
          });
        }
      }),
      RowDeleteAction({
        onClick: () => {
          openDeleteApiForm({
            url: ApiPaths.user_list,
            pk: record.pk,
            title: t`Delete user`,
            successMessage: t`user deleted`,
            onFormSuccess: refreshTable,
            preFormContent: (
              <Text>{t`Are you sure you want to delete this user?`}</Text>
            )
          });
        }
      })
    ];
  }, []);

  const addUser = useCallback(() => {
    openCreateApiForm({
      url: ApiPaths.user_list,
      title: t`Add user`,
      fields: {
        username: {},
        email: {},
        first_name: {},
        last_name: {}
      },
      onFormSuccess: refreshTable,
      successMessage: t`Added user`
    });
  }, []);

  const tableActions = useMemo(() => {
    let actions = [];

    actions.push(
      <AddItemButton key="add-user" onClick={addUser} tooltip={t`Add user`} />
    );

    return actions;
  }, []);

  return (
    <>
      <DetailDrawer
        title={t`Edit user`}
        renderContent={(id) => {
          if (!id || !id.startsWith('user-')) return false;
          return (
            <UserDrawer
              id={id.replace('user-', '')}
              refreshTable={refreshTable}
            />
          );
        }}
      />
      <InvenTreeTable
        url={apiUrl(ApiPaths.user_list)}
        tableKey={tableKey}
        columns={columns}
        props={{
          rowActions: rowActions,
          customActionGroups: tableActions,
          onRowClick: (record) => navigate(`user-${record.pk}/`)
        }}
      />
    </>
  );
}
