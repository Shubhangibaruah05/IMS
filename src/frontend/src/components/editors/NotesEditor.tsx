import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertAdmonition,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  Separator,
  UndoRedo,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useQuery } from '@tanstack/react-query';
import { type useCallback, useEffect, useMemo } from 'react';
import React from 'react';

import { api } from '../../App';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import { ModelInformationDict } from '../render/ModelType';

/*
 * Upload an drag-n-dropped image to the server against a model type and instance.
 */
async function uploadNotesImage(
  image: File,
  modelType: ModelType,
  modelId: number
): Promise<string> {
  const formData = new FormData();
  formData.append('image', image);

  formData.append('model_type', modelType);
  formData.append('model_id', modelId.toString());

  const response = await api.post(
    apiUrl(ApiEndpoints.notes_image_upload),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.image;
}

export default function NotesEditor({
  modelType,
  modelId
}: {
  modelType: ModelType;
  modelId: number;
}) {
  const ref = React.useRef<MDXEditorMethods>(null);

  const user = useUserState();

  // TODO: Use user information to determine if the user has permission to edit notes

  const noteUrl: string = useMemo(() => {
    const modelInfo = ModelInformationDict[modelType];
    return apiUrl(modelInfo.api_endpoint, modelId);
  }, [modelType, modelId]);

  const imageUploadHandler = useCallback(
    (image: File): Promise<string> => {
      return uploadNotesImage(image, modelType, modelId);
    },
    [modelType, modelId]
  );

  const dataQuery = useQuery({
    queryKey: [noteUrl],
    queryFn: () =>
      api
        .get(noteUrl)
        .then((response) => response.data?.notes ?? '')
        .catch(() => ''),
    enabled: true
  });

  useEffect(() => {
    ref.current?.setMarkdown(dataQuery.data ?? '');
  }, [dataQuery.data, ref.current]);

  return (
    <MDXEditor
      ref={ref}
      markdown={''}
      plugins={[
        directivesPlugin({
          directiveDescriptors: [AdmonitionDirectiveDescriptor]
        }),
        headingsPlugin(),
        imagePlugin({ imageUploadHandler: imageUploadHandler }),
        linkPlugin(),
        linkDialogPlugin(),
        listsPlugin(),
        markdownShortcutPlugin(),
        quotePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              {' '}
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <ListsToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertAdmonition />
              <InsertThematicBreak />
            </>
          )
        })
      ]}
    />
  );
}
