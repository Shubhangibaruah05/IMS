import { t } from '@lingui/macro';
import {
  Alert,
  DefaultMantineColor,
  Divider,
  LoadingOverlay,
  Text
} from '@mantine/core';
import { Button, Group, Stack } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useState } from 'react';
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import { api, queryClient } from '../../App';
import { ApiPaths } from '../../enums/ApiEndpoints';
import {
  NestedDict,
  constructField,
  constructFormUrl,
  extractAvailableFields,
  mapFields
} from '../../functions/forms';
import { invalidResponse } from '../../functions/notifications';
import {
  ApiFormField,
  ApiFormFieldSet,
  ApiFormFieldType
} from './fields/ApiFormField';

export interface ApiFormAction {
  text: string;
  variant?: 'outline';
  color?: DefaultMantineColor;
  onClick: () => void;
}

/**
 * Properties for the ApiForm component
 * @param url : The API endpoint to fetch the form data from
 * @param pk : Optional primary-key value when editing an existing object
 * @param method : Optional HTTP method to use when submitting the form (default: GET)
 * @param fields : The fields to render in the form
 * @param submitText : Optional custom text to display on the submit button (default: Submit)4
 * @param submitColor : Optional custom color for the submit button (default: green)
 * @param fetchInitialData : Optional flag to fetch initial data from the server (default: true)
 * @param preFormContent : Optional content to render before the form fields
 * @param postFormContent : Optional content to render after the form fields
 * @param successMessage : Optional message to display on successful form submission
 * @param onFormSuccess : A callback function to call when the form is submitted successfully.
 * @param onFormError : A callback function to call when the form is submitted with errors.
 */
export interface ApiFormProps {
  url: ApiPaths;
  pk?: number | string | undefined;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  fields?: ApiFormFieldSet;
  submitText?: string;
  submitColor?: string;
  fetchInitialData?: boolean;
  ignorePermissionCheck?: boolean;
  preFormContent?: JSX.Element;
  postFormContent?: JSX.Element;
  successMessage?: string;
  onFormSuccess?: (data: any) => void;
  onFormError?: () => void;
  actions?: ApiFormAction[];
}

export function OptionsApiForm({
  props: _props,
  id: pId
}: {
  props: ApiFormProps;
  id?: string;
}) {
  const props = useMemo(
    () => ({
      ..._props,
      method: _props.method || 'GET'
    }),
    [_props]
  );

  const id = useId(pId);

  const url = useMemo(
    () => constructFormUrl(props.url, props.pk),
    [props.url, props.pk]
  );

  const { data } = useQuery({
    enabled: true,
    queryKey: ['form-options-data', id, props.method, props.url, props.pk],
    queryFn: () =>
      api.options(url).then((res) => {
        let fields: Record<string, ApiFormFieldType> | null = {};

        if (!props.ignorePermissionCheck) {
          fields = extractAvailableFields(res, props.method);
        }

        return fields;
      }),
    throwOnError: (error: any) => {
      if (error.response) {
        invalidResponse(error.response.status);
      } else {
        notifications.show({
          title: t`Form Error`,
          message: error.message,
          color: 'red'
        });
      }

      return false;
    }
  });

  const formProps: ApiFormProps = useMemo(() => {
    const _props = { ...props };

    if (!_props.fields) return _props;

    for (const [k, v] of Object.entries(_props.fields)) {
      _props.fields[k] = constructField({
        field: v,
        definition: data?.[k]
      });
    }

    return _props;
  }, [data, props]);

  if (!data) {
    return <LoadingOverlay visible={true} />;
  }

  return <ApiForm id={id} props={formProps} />;
}

/**
 * An ApiForm component is a modal form which is rendered dynamically,
 * based on an API endpoint.
 */
export function ApiForm({ id, props }: { id: string; props: ApiFormProps }) {
  const defaultValues: FieldValues = useMemo(
    () =>
      mapFields(props.fields ?? {}, (_path, field) => {
        return field.default ?? undefined;
      }),
    [props.fields]
  );

  // Form errors which are not associated with a specific field
  const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

  // Form state
  const form = useForm({
    criteriaMode: 'all',
    defaultValues
  });
  const { isValid, isDirty, isLoading: isFormLoading } = form.formState;

  // Cache URL
  const url = useMemo(
    () => constructFormUrl(props.url, props.pk),
    [props.url, props.pk]
  );

  // Query manager for retrieving initial data from the server
  const initialDataQuery = useQuery({
    enabled: false,
    queryKey: ['form-initial-data', id, props.method, props.url, props.pk],
    queryFn: async () => {
      return api
        .get(url)
        .then((response) => {
          const processFields = (fields: ApiFormFieldSet, data: NestedDict) => {
            const res: NestedDict = {};

            for (const [k, field] of Object.entries(fields)) {
              const dataValue = data[k];

              if (
                field.field_type === 'nested object' &&
                field.children &&
                typeof dataValue === 'object'
              ) {
                res[k] = processFields(field.children, dataValue);
              } else {
                res[k] = dataValue;
              }
            }

            return res;
          };
          const initialData: any = processFields(
            props.fields ?? {},
            response.data
          );

          // Update form values, but only for the fields specified for this form
          form.reset(initialData);

          return response;
        })
        .catch((error) => {
          console.error('Error fetching initial data:', error);
        });
    }
  });

  // Fetch initial data on form load
  useEffect(() => {
    // Fetch initial data if the fetchInitialData property is set
    if (props.fetchInitialData) {
      queryClient.removeQueries({
        queryKey: ['form-initial-data', id, props.method, props.url, props.pk]
      });
      initialDataQuery.refetch();
    }
  }, []);

  const submitForm: SubmitHandler<FieldValues> = async (data) => {
    setNonFieldErrors([]);

    let method = props.method?.toLowerCase() ?? 'get';

    let hasFiles = false;
    mapFields(props.fields ?? {}, (_path, field) => {
      if (field.field_type === 'file upload') {
        hasFiles = true;
      }
    });

    return api({
      method: method,
      url: url,
      data: data,
      headers: {
        'Content-Type': hasFiles ? 'multipart/form-data' : 'application/json'
      }
    })
      .then((response) => {
        switch (response.status) {
          case 200:
          case 201:
          case 204:
            // Form was submitted successfully

            // Optionally call the onFormSuccess callback
            if (props.onFormSuccess) {
              props.onFormSuccess(response.data);
            }

            // Optionally show a success message
            if (props.successMessage) {
              notifications.show({
                title: t`Success`,
                message: props.successMessage,
                color: 'green'
              });
            }

            break;
          default:
            // Unexpected state on form success
            invalidResponse(response.status);
            props.onFormError?.();
            break;
        }

        return response;
      })
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              // Data validation errors
              const nonFieldErrors: string[] = [];
              const processErrors = (errors: any, _path?: string) => {
                for (const [k, v] of Object.entries(errors)) {
                  const path = _path ? `${_path}.${k}` : k;

                  if (k === 'non_field_errors') {
                    nonFieldErrors.push((v as string[]).join(', '));
                    continue;
                  }

                  if (typeof v === 'object' && Array.isArray(v)) {
                    form.setError(path, { message: v.join(', ') });
                  } else {
                    processErrors(v, path);
                  }
                }
              };

              processErrors(error.response.data);
              setNonFieldErrors(nonFieldErrors);
              break;
            default:
              // Unexpected state on form error
              invalidResponse(error.response.status);
              props.onFormError?.();
              break;
          }
        } else {
          invalidResponse(0);
          props.onFormError?.();
        }

        return error;
      });
  };

  const isLoading = useMemo(
    () => isFormLoading || initialDataQuery.isFetching,
    [isFormLoading, initialDataQuery.isFetching]
  );

  const onFormError = useCallback<SubmitErrorHandler<FieldValues>>(() => {
    props.onFormError?.();
  }, [props.onFormError]);

  return (
    <Stack>
      <Divider />
      <Stack spacing="sm">
        <LoadingOverlay visible={isLoading} />
        {(!isValid || nonFieldErrors.length > 0) && (
          <Alert radius="sm" color="red" title={t`Form Errors Exist`}>
            {nonFieldErrors.length > 0 && (
              <Stack spacing="xs">
                {nonFieldErrors.map((message) => (
                  <Text key={message}>{message}</Text>
                ))}
              </Stack>
            )}
          </Alert>
        )}
        {props.preFormContent}
        <Stack spacing="xs">
          {Object.entries(props.fields ?? {}).map(
            ([fieldName, field]) =>
              !field.hidden && (
                <ApiFormField
                  key={fieldName}
                  fieldName={fieldName}
                  definition={field}
                  control={form.control}
                />
              )
          )}
        </Stack>
        {props.postFormContent}
      </Stack>
      <Divider />
      <Group position="right">
        {props.actions?.map((action, i) => (
          <Button
            key={i}
            onClick={action.onClick}
            variant={action.variant ?? 'outline'}
            radius="sm"
            color={action.color}
          >
            {action.text}
          </Button>
        ))}
        <Button
          onClick={form.handleSubmit(submitForm, onFormError)}
          variant="outline"
          radius="sm"
          color={props.submitColor ?? 'green'}
          disabled={isLoading || (props.fetchInitialData && !isDirty)}
        >
          {props.submitText ?? t`Submit`}
        </Button>
      </Group>
    </Stack>
  );
}
