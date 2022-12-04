import { Trans } from '@lingui/macro';
import {
  Container, Group, Menu,
  Tabs, Text, UnstyledButton
} from '@mantine/core';
import {
  IconChevronDown,
  IconDashboard, IconHeart, IconLanguage, IconLogout, IconSettings, IconUserCircle
} from '@tabler/icons';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { languages } from "../../translation";
import { useApiState } from '../../context/ApiState';
import { useLocalState } from '../../context/LocalState';
import { tabs } from '../../defaults';
import { InvenTreeStyle } from '../../globalStyle';
import { ColorToggle } from '../items/ColorToggle';
import { InvenTreeLogo } from '../items/InvenTreeLogo';
import { ScanButton } from '../items/ScanButton';


export function Header() {
  const { classes, theme, cx } = InvenTreeStyle();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const navigate = useNavigate();
  const { tabValue } = useParams();
  const [hostKey, hostList, locale] = useLocalState((state) => [
    state.hostKey,
    state.hostList,
    state.language
  ]);
  const [username, servername] = useApiState((state) => [
    state.user.name,
    state.server.instance
  ]);

  // Language
  function switchLanguage() { useLocalState.setState({ language: languages[(languages.indexOf(locale) + 1) % languages.length] }); }
  function enablePsuedo() { useLocalState.setState({ language: 'pseudo-LOCALE' }); }

  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab.name} key={tab.name}>
      {tab.text}
    </Tabs.Tab>
  ));

  return (
    <div className={classes.layoutHeader}>
      <Container className={classes.layoutHeaderSection}>
        <Group position="apart">
          <Group>
            <InvenTreeLogo />
            {hostList[hostKey].name}|{servername}
          </Group>
          <Group>
            <ScanButton />
            <ColorToggle />
            <Menu
              width={260}
              position="bottom-end"
              transition="pop-top-right"
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.layoutHeaderUser, {
                    [classes.layoutHeaderUserActive]: userMenuOpened
                  })}
                >
                  <Group spacing={7}>
                    <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                      {username}
                    </Text>
                    <IconChevronDown size={12} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item icon={<IconHeart size={14} color={theme.colors.red[6]} stroke={1.5} />}><Trans>Notifications</Trans></Menu.Item>
                <Menu.Item icon={<IconUserCircle size={14} stroke={1.5} />} component={Link} to="/profile/user"><Trans>Profile</Trans></Menu.Item>

                <Menu.Label><Trans>Settings</Trans></Menu.Label>
                <Menu.Item icon={<IconLanguage size={14} stroke={1.5} />} onClick={switchLanguage}><Trans>Current language {locale}</Trans></Menu.Item>
                <Menu.Item icon={<IconLanguage size={14} stroke={1.5} />} onClick={enablePsuedo}><Trans>Switch to pseudo language</Trans></Menu.Item>
                <Menu.Item icon={<IconSettings size={14} stroke={1.5} />}><Trans>Account settings</Trans></Menu.Item>
                <Menu.Item icon={<IconLogout size={14} stroke={1.5} />} component={Link} to="/logout"><Trans>Logout</Trans></Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
      <Container>
        <Tabs
          defaultValue="Home"
          variant="outline"
          classNames={{
            root: classes.tabs,
            tabsList: classes.tabsList,
            tab: classes.tab
          }}
          value={tabValue}
          onTabChange={(value) =>
            value == '/' ? navigate('/') : navigate(`/${value}`)
          }
        >
          <Tabs.List>
            <Tabs.Tab
              value={'/'}
              key={'dash'}
              icon={<IconDashboard size={14} />}
            />
            {items}
          </Tabs.List>
        </Tabs>
      </Container>
    </div>
  );
}
