import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './reducers';
import { Session } from '../types/authentication';
import { setSession } from './reducers/authentication';
import * as fms from './api/fms';
import { Unvalidated } from '../types/utils';

export const STORAGE_KEY = 'session/3';

const isValidSession = (data: Unvalidated<Session>): data is Session => {
  if (!data) return false;
  if (!data.token || typeof data.token !== 'string') return false;
  if (!data.username || typeof data.username !== 'string') return false;
  if (!data.userId || typeof data.userId !== 'number') return false;
  return true;
};

/**
 * Returns the stored session if it is valid.
 * Removes stored session data from localStorage if it is not valid.
 */
const getStoredSession = async () => {
  const serializedSession = localStorage.getItem(STORAGE_KEY);
  if (!serializedSession) return undefined;

  try {
    const session = JSON.parse(serializedSession) as Unvalidated<Session>;
    if (isValidSession(session)) {
      await fms.getUserInfo(session.token);
      return session;
    }
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
};

export const getSession = (state: RootState) => state.authentication.session;

/**
 * Returns a validated session, and a flag indicating if validation is in progress.
 */
export const useValidatedSession = () => {
  const session = useSelector(getSession);
  const dispatch = useDispatch();
  const [isValidating, setIsValidating] = useState(!session);

  async function loadStoredSession() {
    setIsValidating(true);
    const storedSession = await getStoredSession();
    setIsValidating(false);
    if (storedSession) {
      dispatch(setSession(storedSession));
    }
  }

  useEffect(() => {
    if (!session) {
      loadStoredSession();
    }
  }, [session]);

  return {
    session,
    isValidating,
  };
};

export const useAuthentication = () => {
  const [error, setError] = useState<Error | undefined>();
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();

  const login = async (username: string, password: string) => {
    setPending(true);
    setError(undefined);
    try {
      const { token } = await fms.login(username, password);
      const { userId, companyId, userAccessLevelId } = await fms.getUserInfo(token);
      const hasAdminAccess = userAccessLevelId > 1;
      const session = {
        username, token, userId, companyId, userAccessLevelId, hasAdminAccess,
      };
      dispatch(setSession(session));
    } catch (e) {
      if (e instanceof Error) setError(e);
      setPending(false);
    }
  };

  return {
    login,
    error,
    pending,
  };
};

/**
 * To be used by hooks and components that need a reference to the Session object.
 * Using it ouside of the session-only part of the component tree will throw an error.
 */
export const useSession = () => {
  const session = useSelector(getSession);
  if (!session) throw new Error('Session object referenced outside a valid user session.');
  return session;
};

export const useSessionRefresh = () => {
  const session = useSelector(getSession);
  const [waiting, setWaiting] = useState(false);

  const refresh = async () => {
    setWaiting(true);
    if (!session) throw new Error('Session object referenced outside a valid user session.');
    await fms.getUserInfo(session.token);
    setWaiting(false);
  };

  return { refresh, waiting };
};
