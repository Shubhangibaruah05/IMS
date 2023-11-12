import { t } from '@lingui/macro';
import { showNotification } from '@mantine/notifications';
import { IconReload } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';

import { api } from '../../../App';
import { ApiPaths } from '../../../enums/ApiEndpoints';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { apiUrl } from '../../../states/ApiState';
import { ActionButton } from '../../buttons/ActionButton';
import { InvenTreeTable } from '../InvenTreeTable';

/*
 * Table for displaying available currencies
 */
export function CurrencyTable() {
  const { tableKey, refreshTable } = useTableRefresh('currency');

  const columns = useMemo(() => {
    return [
      {
        accessor: 'currency',
        title: t`Currency`,
        switchable: false
      },
      {
        accessor: 'rate',
        title: t`Rate`,
        switchable: false
      }
    ];
  }, []);

  const refreshCurrencies = useCallback(() => {
    api
      .post(apiUrl(ApiPaths.currency_refresh), {})
      .then(() => {
        refreshTable();
        showNotification({
          message: t`Exchange rates updated`,
          color: 'green'
        });
      })
      .catch((error) => {
        showNotification({
          title: t`Exchange rate update error`,
          message: error,
          color: 'red'
        });
      });
  }, []);

  const tableActions = useMemo(() => {
    return [
      <ActionButton
        onClick={refreshCurrencies}
        tooltip={t`Refresh currency exchange rates`}
        icon={<IconReload />}
      />
    ];
  }, []);

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.currency_list)}
      tableKey={tableKey}
      columns={columns}
      props={{
        customActionGroups: tableActions,
        dataFormatter: (data) => {
          let rates = data?.exchange_rates ?? {};

          return Object.entries(rates).map(([currency, rate]) => {
            return {
              currency: currency,
              rate: rate
            };
          });
        }
      }}
    />
  );
}
