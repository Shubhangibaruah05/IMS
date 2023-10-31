import { t } from '@lingui/macro';
import { Alert, LoadingOverlay, Stack, Text } from '@mantine/core';
import {
  IconBookmark,
  IconBoxPadding,
  IconChecklist,
  IconHistory,
  IconInfoCircle,
  IconNotes,
  IconPaperclip,
  IconSitemap
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PlaceholderPanel } from '../../components/items/Placeholder';
import { PageDetail } from '../../components/nav/PageDetail';
import { PanelGroup, PanelType } from '../../components/nav/PanelGroup';
import { StockLocationTree } from '../../components/nav/StockLocationTree';
import { AttachmentTable } from '../../components/tables/general/AttachmentTable';
import { NotesEditor } from '../../components/widgets/MarkdownEditor';
import { useInstance } from '../../hooks/UseInstance';
import { ApiPaths, apiUrl } from '../../states/ApiState';

export default function StockDetail() {
  const { id } = useParams();

  const [treeOpen, setTreeOpen] = useState(false);

  const {
    instance: stockitem,
    refreshInstance,
    instanceQuery
  } = useInstance({
    endpoint: ApiPaths.stock_item_list,
    pk: id,
    params: {
      part_detail: true,
      location_detail: true,
      path_detail: true
    }
  });

  const stockPanels: PanelType[] = useMemo(() => {
    return [
      {
        name: 'details',
        label: t`Details`,
        icon: <IconInfoCircle />,
        content: <PlaceholderPanel />
      },
      {
        name: 'tracking',
        label: t`Stock Tracking`,
        icon: <IconHistory />,
        content: <PlaceholderPanel />
      },
      {
        name: 'allocations',
        label: t`Allocations`,
        icon: <IconBookmark />,
        content: <PlaceholderPanel />,
        hidden:
          !stockitem?.part_detail?.salable && !stockitem?.part_detail?.component
      },
      {
        name: 'testdata',
        label: t`Test Data`,
        icon: <IconChecklist />,
        hidden: !stockitem?.part_detail?.trackable
      },
      {
        name: 'installed_items',
        label: t`Installed Items`,
        icon: <IconBoxPadding />,
        content: <PlaceholderPanel />,
        hidden: !stockitem?.part_detail?.assembly
      },
      {
        name: 'child_items',
        label: t`Child Items`,
        icon: <IconSitemap />,
        content: <PlaceholderPanel />
      },
      {
        name: 'attachments',
        label: t`Attachments`,
        icon: <IconPaperclip />,
        content: (
          <AttachmentTable
            endpoint={ApiPaths.stock_attachment_list}
            model="stock_item"
            pk={stockitem.pk ?? -1}
          />
        )
      },
      {
        name: 'notes',
        label: t`Notes`,
        icon: <IconNotes />,
        content: (
          <NotesEditor
            url={apiUrl(ApiPaths.stock_item_list, stockitem.pk)}
            data={stockitem.notes ?? ''}
            allowEdit={true}
          />
        )
      }
    ];
  }, [stockitem, id]);

  const breadcrumbs = useMemo(
    () => [
      { name: t`Stock`, url: '/stock' },
      ...(stockitem.location_path ?? []).map((l: any) => ({
        name: l.name,
        url: `/stock/location/${l.pk}`
      }))
    ],
    [stockitem]
  );

  return (
    <Stack>
      <LoadingOverlay visible={instanceQuery.isFetching} />
      <StockLocationTree
        opened={treeOpen}
        onClose={() => setTreeOpen(false)}
        selectedLocation={stockitem?.location}
      />
      <PageDetail
        title={t`Stock Items`}
        subtitle={stockitem.part_detail?.full_name ?? 'name goes here'}
        detail={
          <Alert color="teal" title="Stock Item">
            <Text>Quantity: {stockitem.quantity ?? 'idk'}</Text>
          </Alert>
        }
        breadcrumbs={breadcrumbs}
        breadcrumbAction={() => {
          setTreeOpen(true);
        }}
      />
      <PanelGroup pageKey="stockitem" panels={stockPanels} />
    </Stack>
  );
}
