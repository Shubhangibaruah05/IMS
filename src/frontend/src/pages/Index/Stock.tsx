import { Trans } from '@lingui/macro';
import { Group } from '@mantine/core';

import { PlaceholderPill } from '../../components/items/Placeholder';
import { StylishText } from '../../components/items/StylishText';

import { StockTable } from '../../components/tables/StockTables';

export default function Part() {
    return (
      <>
      <Group>
        <StylishText>
          <Trans>Stock Items</Trans>
        </StylishText>
        <PlaceholderPill />
      </Group>
      <StockTable />
      </>
    );
  }
  