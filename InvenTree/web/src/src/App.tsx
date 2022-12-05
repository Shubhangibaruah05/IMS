import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useApiState } from './context/ApiState';
import { AuthProvider } from './context/AuthContext';
import { useLocalState } from './context/LocalState';
import { useSessionState } from './context/SessionState';
import { UserProps } from './context/states';
import { defaultHostList } from './defaults';
import ErrorPage from './pages/ErrorPage';
import { Dashboard } from './pages/Index/Dashboard';
import { Home } from './pages/Index/Home';
import { Part } from './pages/Index/Part';
import { Profile } from './pages/Index/Profile/Profile';
import Layout from './pages/layout';
import { Login } from './pages/Login';
import { Logout } from './pages/Logout';
import { ThemeContext } from './ThemeContext';
import { LanguageContext } from './translation';

// Error tracking
Sentry.init({
  dsn: 'https://84f0c3ea90c64e5092e2bf5dfe325725@o1047628.ingest.sentry.io/4504160008273920',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0
});

// API
export const api = axios.create({});
export function setApiDefaults() {
  const host = useLocalState.getState().host;
  const token = useSessionState.getState().token;

  api.defaults.baseURL = host;
  api.defaults.headers.common['Authorization'] = `Token ${token}`;
}
export const queryClient = new QueryClient();

// States
export async function fetchServerSession() {
  // Fetch user data
  await api.get('/user/me/').then((response) => {
    const user: UserProps = {
      name: `${response.data.first_name} ${response.data.last_name}`,
      email: response.data.email,
      username: response.data.username
    };
    useApiState.getState().setUser(user);
  });
  // Fetch server data
  await api.get('/').then((response) => {
    useApiState.getState().setServer(response.data);
  });
}

// Routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'home/',
        element: <Home />
      },
      {
        path: 'part/',
        element: <Part />
      },
      {
        path: '/profile/:tabValue',
        element: <Profile />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: '/logout',
    element: <Logout />,
    errorElement: <ErrorPage />
  }
]);

// Main App
export default function App() {
  const [hostList] = useLocalState((state) => [state.hostList]);

  // Local state initialization
  if (Object.keys(hostList).length === 0) {
    console.log('Loading default host list');
    useLocalState.setState({ hostList: defaultHostList });
  }
  setApiDefaults();

  // Server Session
  const [fetchedServerSession, setFetchedServerSession] = useState(false);
  const sessionState = useSessionState.getState();
  const [token] = sessionState.token ? [sessionState.token] : [null];
  if (token && !fetchedServerSession) {
    setFetchedServerSession(true);
    fetchServerSession();
  }

  // Main App component
  return (
    <LanguageContext>
      <ThemeContext>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeContext>
    </LanguageContext>
  );
}
