import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { hasToken } from './functions/auth';
import { useLocalState } from './states/LocalState';

// Global API instance
export const api = axios.create({});

/*
 * Setup default settings for the Axios API instance.
 *
 * This includes:
 * - Base URL
 * - CSRF token (if available)
 */
export function setApiDefaults(backend = false) {
  const host = useLocalState.getState().host;

  api.defaults.baseURL = host;
  api.defaults.timeout = 2500;

  if (hasToken(backend)) {
    console.log('Using CSRF token');
    api.defaults.withCredentials = true;
    api.defaults.xsrfCookieName = 'csrftoken';
    api.defaults.xsrfHeaderName = 'X-CSRFToken';
  } else {
    console.log('No CSRF token');
    api.defaults.withCredentials = false;
    api.defaults.xsrfCookieName = undefined;
    api.defaults.xsrfHeaderName = undefined;
  }
}

export const queryClient = new QueryClient();
