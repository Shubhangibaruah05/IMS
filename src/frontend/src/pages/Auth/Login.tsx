import { Trans, t } from '@lingui/macro';
import { Center, Container, Group, Select, Stack, Text } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { useEffect } from 'react';

import { AuthenticationForm } from '../../components/forms/AuthenticationForm';
import { HostOptionsForm } from '../../components/forms/HostOptionsForm';
import { EditButton } from '../../components/items/EditButton';
import { defaultHostKey } from '../../defaults/defaultHostList';
import { useLocalState } from '../../states/LocalState';
import { HostList } from '../../states/states';

export default function Login() {
  const [hostKey, setHost, hostList] = useLocalState((state) => [
    state.hostKey,
    state.setHost,
    state.hostList
  ]);
  const hostname =
    hostList[hostKey] === undefined ? t`No selection` : hostList[hostKey].name;
  const [hostEdit, setHostEdit] = useToggle([false, true] as const);
  const hostListData = Object.keys(hostList).map((key) => ({
    value: key,
    label: hostList[key].name
  }));
  const [HostListEdit, setHostListEdit] = useToggle([false, true] as const);

  // Data manipulation functions
  function ChangeHost(newHost: string): void {
    setHost(hostList[newHost].host, newHost);
    setHostEdit(false);
  }
  function SaveOptions(newHostList: HostList): void {
    useLocalState.setState({ hostList: newHostList });
    if (newHostList[hostKey] === undefined) {
      setHost('', '');
    }
    setHostListEdit();
  }
  // Set default host to localhost if no host is selected
  useEffect(() => {
    if (hostKey === '') {
      ChangeHost(defaultHostKey);
    }
  }, []);

  return (
    <Center mih="100vh">
      <Container w="md" miw={400}>
        <Stack>
          <EditHostList
            hostList={hostList}
            SaveOptions={SaveOptions}
            HostListEdit={HostListEdit}
          />
          {!HostListEdit && (
            <AuthenticationForm
              hostname={hostname}
              editing={hostEdit}
              setEditing={setHostEdit}
              selectElement={
                <SelectHost
                  hostKey={hostKey}
                  ChangeHost={ChangeHost}
                  hostListData={hostListData}
                  HostListEdit={HostListEdit}
                  hostEdit={hostEdit}
                  setHostListEdit={setHostListEdit}
                />
              }
            />
          )}
        </Stack>
      </Container>
    </Center>
  );
}

const SelectHost = ({
  hostKey,
  ChangeHost,
  hostListData,
  HostListEdit,
  hostEdit,
  setHostListEdit
}: {
  hostKey: string;
  ChangeHost: (newHost: string) => void;
  hostListData: any;
  HostListEdit: boolean;
  hostEdit: boolean;
  setHostListEdit: (value?: React.SetStateAction<boolean> | undefined) => void;
}) => {
  if (!hostEdit) return <></>;
  return (
    <Group>
      <Select
        value={hostKey}
        onChange={ChangeHost}
        data={hostListData}
        disabled={HostListEdit}
      />
      <EditButton
        setEditing={setHostListEdit}
        editing={HostListEdit}
        disabled={HostListEdit}
      />
    </Group>
  );
};

const EditHostList = ({
  hostList,
  SaveOptions,
  HostListEdit
}: {
  hostList: HostList;
  SaveOptions: (newHostList: HostList) => void;
  HostListEdit: boolean;
}) => {
  if (!HostListEdit) return null;
  return (
    <>
      <Text>
        <Trans>Edit host options</Trans>
      </Text>
      <HostOptionsForm data={hostList} saveOptions={SaveOptions} />
    </>
  );
};
