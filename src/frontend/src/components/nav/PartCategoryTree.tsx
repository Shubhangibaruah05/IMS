import { t } from '@lingui/macro';
import { Drawer, Group, Text } from '@mantine/core';

import { StylishText } from '../items/StylishText';

export function PartCategoryTree({
  opened,
  onClose,
  selectedCategory
}: {
  opened: boolean;
  onClose: () => void;
  selectedCategory?: number | null;
}) {
  return (
    <Drawer
      opened={opened}
      size="md"
      position="left"
      onClose={onClose}
      withCloseButton={true}
      styles={{
        header: {
          width: '100%'
        },
        title: {
          width: '100%'
        }
      }}
      title={
        <Group position="apart" noWrap={true}>
          <StylishText size="lg">{t`Part Categories`}</StylishText>
        </Group>
      }
    >
      <Text>Hello world</Text>
    </Drawer>
  );
}
