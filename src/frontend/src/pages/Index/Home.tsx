import { Trans } from '@lingui/macro';
import { Group, Stack } from '@mantine/core';
import { Button } from '@mantine/core';
import { useState } from 'react';

import { ApiForm, ApiFormFieldType } from '../../components/forms/ApiForm';
import { PlaceholderPill } from '../../components/items/Placeholder';
import { StylishText } from '../../components/items/StylishText';

export default function Home() {
  const [partFormOpened, setPartFormOpened] = useState(false);
  const [poFormOpened, setPoFormOpened] = useState(false);
  const [companyFormOpened, setCompanyFormOpened] = useState(false);

  const partFields: ApiFormFieldType[] = [
    {
      name: 'name'
    },
    {
      name: 'description'
    },
    {
      name: 'keywords'
    },
    {
      name: 'category'
    },
    {
      name: 'assembly'
    },
    {
      name: 'trackable'
    },
    {
      name: 'virtual'
    },
    {
      name: 'minimum_stock'
    }
  ];

  const poFields: ApiFormFieldType[] = [
    {
      name: 'reference'
    },
    {
      name: 'supplier'
    },
    {
      name: 'target_date'
    }
  ];

  const companyFields: ApiFormFieldType[] = [
    {
      name: 'name'
    },
    {
      name: 'description'
    },
    {
      name: 'website'
    },
    {
      name: 'email'
    },
    {
      name: 'contact'
    },
    {
      name: 'is_customer'
    }
  ];

  return (
    <>
      <Group>
        <StylishText>
          <Trans>Home</Trans>
        </StylishText>
        <PlaceholderPill />
      </Group>
      <ApiForm
        name="part-edit"
        url="/part/"
        pk={1}
        fields={partFields}
        method="PUT"
        title="Edit Part"
        opened={partFormOpened}
        onClose={() => setPartFormOpened(false)}
        fetchInitialData={true}
      />
      <ApiForm
        name="po-edit"
        url="/order/po/"
        pk={1}
        fields={poFields}
        method="PUT"
        title="Edit Purchase Order"
        opened={poFormOpened}
        onClose={() => setPoFormOpened(false)}
        fetchInitialData={true}
      />
      <ApiForm
        name="company-edit"
        url="/company/"
        pk={1}
        fields={companyFields}
        method="PUT"
        title="Edit Company"
        opened={companyFormOpened}
        onClose={() => setCompanyFormOpened(false)}
        fetchInitialData={true}
      />
      <Stack align="flex-start" spacing="xs">
        <Button
          onClick={() => setPartFormOpened(true)}
          variant="outline"
          color="blue"
        >
          Edit Part Form
        </Button>
        <Button
          variant="outline"
          color="blue"
          onClick={() => setPoFormOpened(true)}
        >
          Edit Purchase Order Form
        </Button>
        <Button
          variant="outline"
          color="blue"
          onClick={() => setCompanyFormOpened(true)}
        >
          Edit Company Form
        </Button>
      </Stack>
    </>
  );
}
