import { t } from '@lingui/macro';
import { SimpleGrid } from '@mantine/core';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { ApiEndpoints } from '../../../enums/ApiEndpoints';
import { useTable } from '../../../hooks/UseTable';
import { apiUrl } from '../../../states/ApiState';
import { TableColumn } from '../../../tables/Column';
import { InvenTreeTable } from '../../../tables/InvenTreeTable';
import {
  SupplierPriceBreakColumns,
  calculateSupplierPartUnitPrice
} from '../../../tables/purchasing/SupplierPriceBreakTable';

export default function SupplierPricingPanel({ part }: { part: any }) {
  const table = useTable('pricing-supplier');

  const columns: TableColumn[] = useMemo(() => {
    return SupplierPriceBreakColumns();
  }, []);

  const supplierPricingData = useMemo(() => {
    return table.records.map((record: any) => {
      return {
        quantity: record.quantity,
        supplier_price: record.price,
        unit_price: calculateSupplierPartUnitPrice(record),
        name: record.part_detail?.SKU
      };
    });
  }, [table.records]);

  return (
    <SimpleGrid cols={2}>
      <InvenTreeTable
        url={apiUrl(ApiEndpoints.supplier_part_pricing_list)}
        columns={columns}
        tableState={table}
        props={{
          params: {
            base_part: part.pk,
            supplier_detail: true,
            part_detail: true
          }
        }}
      />
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={supplierPricingData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="unit_price" fill="#8884d8" label={t`Unit Price`} />
          <Bar
            dataKey="supplier_price"
            fill="#82ca9d"
            label={t`Supplier Price`}
          />
        </BarChart>
      </ResponsiveContainer>
    </SimpleGrid>
  );
}
