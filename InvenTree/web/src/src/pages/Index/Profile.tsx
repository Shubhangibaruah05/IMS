import {
  Button,
  ColorPicker,
  Container,
  Grid,
  Group,
  Title,
  SimpleGrid,
  Skeleton,
  Tabs,
  Text,
  DEFAULT_THEME,
  TextInput,
  ColorInput,
  Slider,
  Select,
  Table,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, useParams } from 'react-router-dom';
import { StylishText } from '../../components/items/StylishText';
import { InvenTreeStyle } from '../../globalStyle';
import { useToggle } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { api, queryClient } from '../../App';
import { EditButton } from '../../components/items/EditButton';
import { useLocalState } from '../../contex/LocalState';
import { useState } from 'react';
import { LoaderType } from '@mantine/styles/lib/theme/types/MantineTheme';
import { SizeMarks } from '../../defaults';

export function Profile() {
  const navigate = useNavigate();
  const { tabValue } = useParams();

  return (
    <>
      <StylishText>Profile</StylishText>
      <Tabs
        orientation="vertical"
        value={tabValue}
        onTabChange={(value) => navigate(`/profile/${value}`)}
      >
        <Tabs.List>
          <Tabs.Tab value="user">User</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="user">
          <UserPanel />
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <SettingsPanel />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

function UserPanel() {
  // view
  const { theme } = InvenTreeStyle();
  const PRIMARY_COL_HEIGHT = 300;
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

  // data
  function fetchData() {
    return api.get('user/me/').then((res) => res.data);
  }
  const { isLoading, data } = useQuery({
    queryKey: ['user-me'],
    queryFn: fetchData
  });

  return (
    <Container>
      <SimpleGrid cols={2} spacing="md">
        <Container w="100%">
          {isLoading ? (
            <Skeleton height={SECONDARY_COL_HEIGHT} />
          ) : (
            <UserInfo data={data} />
          )}
        </Container>
        <Grid gutter="md">
          <Grid.Col>
            <UserTheme height={SECONDARY_COL_HEIGHT} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Skeleton height={SECONDARY_COL_HEIGHT} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Skeleton height={SECONDARY_COL_HEIGHT} />
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  );
}

function UserInfo({ data }: { data: any }) {
  if (!data) return <Skeleton />;

  const form = useForm({ initialValues: data });
  const [editing, setEditing] = useToggle([false, true] as const);
  function SaveData(values: any) {
    api.put('user/me/', values).then((res) => {
      if (res.status === 200) {
        setEditing();
        queryClient.invalidateQueries(['user-me']);
      }
    });
  }

  return (
    <form onSubmit={form.onSubmit((values) => SaveData(values))}>
      <Group>
        <Title order={3}>Userinfo</Title>
        {EditButton(setEditing, editing)}
      </Group>
      <Group>
        {editing ? (
          <TextInput
            label="First name"
            placeholder="First name"
            {...form.getInputProps('first_name')}
          />
        ) : (
          <Text>First name: {form.values.first_name}</Text>
        )}
        {editing ? (
          <TextInput
            label="Last name"
            placeholder="Last name"
            {...form.getInputProps('last_name')}
          />
        ) : (
          <Text>Last name: {form.values.last_name}</Text>
        )}
        {editing ? (
          <TextInput
            label="Username"
            placeholder="Username"
            {...form.getInputProps('username')}
          />
        ) : (
          <Text>Username: {form.values.username}</Text>
        )}
      </Group>
      {editing ? (
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      ) : null}
    </form>
  );
}

function UserTheme({ height }: { height: number }) {
  const { theme } = InvenTreeStyle();

  function getLkp(color: string) {
    return { [DEFAULT_THEME.colors[color][6]]: color }
  }
  const lookup = Object.assign({}, ...Object.keys(DEFAULT_THEME.colors).map(clr => getLkp(clr)));

  // primary color
  function changePrimary(color: string) {
    useLocalState.setState({ primaryColor: lookup[color] });
  }
  // white color
  const [whiteColor, setWhiteColor] = useState(theme.white);
  function changeWhite(color: string) {
    useLocalState.setState({ whiteColor: color });
    setWhiteColor(color);
  }
  // black color
  const [blackColor, setBlackColor] = useState(theme.black);
  function changeBlack(color: string) {
    useLocalState.setState({ blackColor: color });
    setBlackColor(color);
  }
  // radius
  function getMark(value: number) {
    const obj = SizeMarks.find((mark) => mark.value === value);
    if (obj) return obj;
    return SizeMarks[0]
  }
  function getDefaultRadius() {
    const obj = SizeMarks.find((mark) => mark.label === useLocalState.getState().radius)
    if (obj) return obj.value;
    return 50;
  }
  const [radius, setRadius] = useState(getDefaultRadius());
  function changeRadius(value: number) {
    setRadius(value);
    useLocalState.setState({ radius: getMark(value).label });
  }
  // loader
  const loaderDate = ["bars", "oval", "dots"];
  const [loader, setLoader] = useState<LoaderType>(theme.loader);
  function changeLoader(value: LoaderType) {
    setLoader(value);
    useLocalState.setState({ loader: value });
  }

  return (
    <Container w="100%" mih={height}>
      <Title order={3}>Design</Title>
      <Table>
        <tbody>
          <tr>
            <td>Primary color</td>
            <td><ColorPicker format="hex" onChange={changePrimary} withPicker={false} swatches={Object.keys(lookup)} /></td>
          </tr>
          <tr>
            <td>White color</td>
            <td><ColorInput value={whiteColor} onChange={changeWhite} /></td>
          </tr>
          <tr>
            <td>Black color</td>
            <td><ColorInput value={blackColor} onChange={changeBlack} /></td>
          </tr>
          <tr>
            <td>Border Radius</td>
            <td><Slider label={(val) => getMark(val).label} defaultValue={50} step={25} marks={SizeMarks} value={radius} onChange={changeRadius} /></td>
          </tr>
          <tr>
            <td>Loader</td>
            <td><Select data={loaderDate} value={loader} onChange={changeLoader} /></td>
          </tr>
        </tbody>
      </Table>
    </Container>)
    ;
}

function SettingsPanel() {
  return (
    <Container>
      <Text>Settings</Text>
    </Container>
  );
}
