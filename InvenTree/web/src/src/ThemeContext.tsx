import { t } from '@lingui/macro';
import { ColorScheme, ColorSchemeProvider, MantineProvider, MantineThemeOverride } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { QrCodeModal } from './components/modals/QrCodeModal';
import { useLocalState } from './context/LocalState';


export function ThemeContext({ children }: { children: JSX.Element; }) {
    const [primaryColor, whiteColor, blackColor, radius, loader] = useLocalState((state) => [state.primaryColor, state.whiteColor, state.blackColor, state.radius, state.loader]);

    // Color Scheme
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'scheme',
        defaultValue: preferredColorScheme
    });
    const toggleColorScheme = (value?: ColorScheme) => {
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
        myTheme.colorScheme = colorScheme;
    };

    // Theme
    const myTheme: MantineThemeOverride = {
        colorScheme: colorScheme,
        primaryColor: primaryColor,
        white: whiteColor,
        black: blackColor,
        loader: loader,
        defaultRadius: radius,
    };

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} >
            <MantineProvider theme={myTheme} withGlobalStyles withNormalizeCSS >
                <NotificationsProvider>
                    <ModalsProvider labels={{ confirm: t`Submit`, cancel: t`Cancel` }} modals={{ qr: QrCodeModal }}>
                        {children}
                    </ModalsProvider>
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}
