import { t } from '@lingui/macro';
import {
  ActionIcon,
  Anchor,
  Badge,
  CopyButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip
} from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getValueAtPath } from 'mantine-datatable';
import { Suspense, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../App';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { InvenTreeIcon, InvenTreeIconType } from '../../functions/icons';
import { navigateToLink } from '../../functions/navigation';
import { getDetailUrl } from '../../functions/urls';
import { apiUrl } from '../../states/ApiState';
import { useGlobalSettingsState } from '../../states/SettingsState';
import { YesNoButton } from '../buttons/YesNoButton';
import { ProgressBar } from '../items/ProgressBar';
import { StylishText } from '../items/StylishText';
import { getModelInfo } from '../render/ModelType';
import { StatusRenderer } from '../render/StatusRenderer';

export type DetailsField =
  | {
      hidden?: boolean;
      icon?: InvenTreeIconType;
      name: string;
      label?: string;
      badge?: BadgeType;
      copy?: boolean;
      value_formatter?: () => ValueFormatterReturn;
    } & (
      | StringDetailField
      | BooleanField
      | LinkDetailField
      | ProgressBarField
      | StatusField
    );

type BadgeType = 'owner' | 'user' | 'group';
type ValueFormatterReturn = string | number | null;

type StringDetailField = {
  type: 'string' | 'text';
  unit?: boolean;
};

type BooleanField = {
  type: 'boolean';
};

type LinkDetailField = {
  type: 'link';
  link?: boolean;
} & (InternalLinkField | ExternalLinkField);

type InternalLinkField = {
  model: ModelType;
  model_field?: string;
  model_formatter?: (value: any) => string;
  backup_value?: string;
};

type ExternalLinkField = {
  external: true;
};

type ProgressBarField = {
  type: 'progressbar';
  progress: number;
  total: number;
};

type StatusField = {
  type: 'status';
  model: ModelType;
};

type FieldProps = {
  field_data: any;
  field_value: string | number;
  unit?: string | null;
};

/**
 * Fetches user or group info from backend and formats into a badge.
 * Badge shows username, full name, or group name depending on server settings.
 * Badge appends icon to describe type of Owner
 */
function NameBadge({ pk, type }: { pk: string | number; type: BadgeType }) {
  const { data } = useSuspenseQuery({
    queryKey: ['badge', type, pk],
    queryFn: async () => {
      let path: string = '';

      switch (type) {
        case 'owner':
          path = ApiEndpoints.owner_list;
          break;
        case 'user':
          path = ApiEndpoints.user_list;
          break;
        case 'group':
          path = ApiEndpoints.group_list;
          break;
      }

      const url = apiUrl(path, pk);

      return api
        .get(url)
        .then((response) => {
          switch (response.status) {
            case 200:
              return response.data;
            default:
              return undefined;
          }
        })
        .catch(() => {
          return undefined;
        });
    }
  });

  const settings = useGlobalSettingsState();

  // Rendering a user's rame for the badge
  function _render_name() {
    if (!data) {
      return '';
    } else if (type === 'user' && settings.isSet('DISPLAY_FULL_NAMES')) {
      if (data.first_name || data.last_name) {
        return `${data.first_name} ${data.last_name}`;
      } else {
        return data.username;
      }
    } else if (type === 'user') {
      return data.username;
    } else {
      return data.name;
    }
  }

  return (
    <Suspense fallback={<Skeleton width={200} height={20} radius="xl" />}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Badge
          color="dark"
          variant="filled"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {data?.name ?? _render_name()}
        </Badge>
        <InvenTreeIcon icon={type === 'user' ? type : data.label} />
      </div>
    </Suspense>
  );
}

/**
 * Renders the value of a 'string' or 'text' field.
 * If owner is defined, only renders a badge
 * If user is defined, a badge is rendered in addition to main value
 */
function TableStringValue(props: Readonly<FieldProps>) {
  let value = props?.field_value;

  if (props?.field_data?.value_formatter) {
    value = props.field_data.value_formatter();
  }

  if (value === undefined) {
    return '---';
  }

  if (props.field_data?.badge) {
    return <NameBadge pk={value} type={props.field_data.badge} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        wordBreak: 'break-word',
        alignItems: 'flex-start'
      }}
    >
      <Suspense fallback={<Skeleton width={200} height={20} radius="xl" />}>
        <span>
          {value ? value : props.field_data?.unit && '0'}{' '}
          {props.field_data.unit == true && props.unit}
        </span>
      </Suspense>
      {props.field_data.user && (
        <NameBadge pk={props.field_data?.user} type="user" />
      )}
    </div>
  );
}

function BooleanValue(props: Readonly<FieldProps>) {
  return <YesNoButton value={props.field_value} />;
}

function TableAnchorValue(props: Readonly<FieldProps>) {
  const navigate = useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ['detail', props.field_data.model, props.field_value],
    queryFn: async () => {
      if (!props.field_data?.model) {
        return {};
      }

      const modelDef = getModelInfo(props.field_data.model);

      if (!modelDef?.api_endpoint) {
        return {};
      }

      const url = apiUrl(modelDef.api_endpoint, props.field_value);

      return api
        .get(url)
        .then((response) => {
          switch (response.status) {
            case 200:
              return response.data;
            default:
              return {};
          }
        })
        .catch(() => {
          return {};
        });
    }
  });

  const detailUrl = useMemo(() => {
    return (
      props?.field_data?.model &&
      getDetailUrl(props.field_data.model, props.field_value)
    );
  }, [props.field_data.model, props.field_value]);

  const handleLinkClick = useCallback(
    (event: any) => {
      navigateToLink(detailUrl, navigate, event);
    },
    [detailUrl]
  );

  if (props.field_data.external) {
    return (
      <Anchor
        href={`${props.field_value}`}
        target={'_blank'}
        rel={'noreferrer noopener'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Text>{props.field_value}</Text>
          <InvenTreeIcon icon="external" iconProps={{ size: 15 }} />
        </span>
      </Anchor>
    );
  }

  let make_link = props.field_data?.link ?? true;

  // Construct the "return value" for the fetched data
  let value = undefined;

  if (props.field_data.model_formatter) {
    value = props.field_data.model_formatter(data) ?? value;
  } else if (props.field_data.model_field) {
    value = data?.[props.field_data.model_field] ?? value;
  } else {
    value = data?.name;
  }

  if (value === undefined) {
    value = data?.name ?? props.field_data?.backup_value ?? t`No name defined`;
    make_link = false;
  }

  return (
    <Suspense fallback={<Skeleton width={200} height={20} radius="xl" />}>
      {make_link ? (
        <Anchor href="#" onClick={handleLinkClick}>
          <Text>{value}</Text>
        </Anchor>
      ) : (
        <Text>{value}</Text>
      )}
    </Suspense>
  );
}

function ProgressBarValue(props: Readonly<FieldProps>) {
  return (
    <ProgressBar
      value={props.field_data.progress}
      maximum={props.field_data.total}
      progressLabel
    />
  );
}

function StatusValue(props: Readonly<FieldProps>) {
  return (
    <StatusRenderer type={props.field_data.model} status={props.field_value} />
  );
}

function CopyField({ value }: { value: string }) {
  return (
    <CopyButton value={value}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? t`Copied` : t`Copy`} withArrow>
          <ActionIcon
            color={copied ? 'teal' : 'gray'}
            onClick={copy}
            variant="transparent"
            size="sm"
          >
            {copied ? (
              <InvenTreeIcon icon="check" />
            ) : (
              <InvenTreeIcon icon="copy" />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}

export function DetailsTableField({
  item,
  field
}: {
  item: any;
  field: DetailsField;
}) {
  function getFieldType(type: string) {
    switch (type) {
      case 'text':
      case 'string':
        return TableStringValue;
      case 'boolean':
        return BooleanValue;
      case 'link':
        return TableAnchorValue;
      case 'progressbar':
        return ProgressBarValue;
      case 'status':
        return StatusValue;
      default:
        return TableStringValue;
    }
  }

  const FieldType: any = getFieldType(field.type);

  const fieldValue = useMemo(
    () => getValueAtPath(item, field.name) as string,
    [item, field.name]
  );

  return (
    <Table.Tr style={{ verticalAlign: 'top' }}>
      <Table.Td
        style={{
          width: '50',
          maxWidth: '50'
        }}
      >
        <InvenTreeIcon icon={field.icon ?? (field.name as InvenTreeIconType)} />
      </Table.Td>
      <Table.Td style={{ maxWidth: '65%' }}>
        <Text>{field.label}</Text>
      </Table.Td>
      <Table.Td style={{}}>
        <FieldType field_data={field} field_value={fieldValue} />
      </Table.Td>
      <Table.Td style={{ width: '50' }}>
        {field.copy && <CopyField value={fieldValue} />}
      </Table.Td>
    </Table.Tr>
  );
}

export function DetailsTable({
  item,
  fields,
  title
}: {
  item: any;
  fields: DetailsField[];
  title?: string;
}) {
  return (
    <Paper p="xs" withBorder radius="xs">
      <Stack gap="xs">
        {title && <StylishText size="lg">{title}</StylishText>}
        <Table striped verticalSpacing={5} horizontalSpacing="sm">
          <Table.Tbody>
            {fields
              .filter((field: DetailsField) => !field.hidden)
              .map((field: DetailsField, index: number) => (
                <DetailsTableField field={field} item={item} key={index} />
              ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
