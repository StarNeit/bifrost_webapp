/* eslint-disable @typescript-eslint/ban-types */
import { Dispatch, Middleware } from '@reduxjs/toolkit';
import axios from 'axios';

import { STORAGE_KEY as SESSION_STORAGE_KEY } from '../data/authentication';
import { RootState } from '../data/reducers';
import { refreshSessionExpiration, setSession, showSessionExpirationWarning } from '../data/reducers/authentication';
import config from '../config';

let interceptorId: number;
function setUpAxiosInterceptor(dispatch: Dispatch) {
  interceptorId = axios.interceptors.response.use(
    (response) => {
      dispatch(refreshSessionExpiration());
      return response;
    },
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        dispatch(setSession());
      }
      return Promise.reject(error);
    },
  );
}
function cleanUpAxiosInterceptor() {
  axios.interceptors.response.eject(interceptorId);
}

let sessionExpirationTimeoutId: NodeJS.Timeout;
let sessionWarningTimeoutId: NodeJS.Timeout;

function stopSessionTimers() {
  clearTimeout(sessionExpirationTimeoutId);
  clearTimeout(sessionWarningTimeoutId);
}

function startSessionTimers(dispatch: Dispatch) {
  // adding 2 seconds to warning time to allow for refresh request time
  const warningTime = config.SESSION_EXPIRATION_TIME - config.SESSION_WARNING_COUNTDOWN_TIME - 2000;
  sessionWarningTimeoutId = setTimeout(() => {
    dispatch(showSessionExpirationWarning());
  }, warningTime);
  sessionExpirationTimeoutId = setTimeout(() => {
    dispatch(setSession());
  }, config.SESSION_EXPIRATION_TIME);
}

export const sessionMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  if (setSession.match(action)) {
    if (action.payload) { // on session start
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(action.payload));
      setUpAxiosInterceptor(store.dispatch);
      startSessionTimers(store.dispatch);
    } else { // on session end
      localStorage.removeItem(SESSION_STORAGE_KEY);
      cleanUpAxiosInterceptor();
      stopSessionTimers();
    }
  }

  if (refreshSessionExpiration.match(action)) {
    stopSessionTimers();
    const isAuthenticated = Boolean(store.getState().authentication.session);
    if (isAuthenticated) {
      startSessionTimers(store.dispatch);
    }
  }

  return next(action);
};
