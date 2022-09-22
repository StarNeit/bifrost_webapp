import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { mutate } from 'swr';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import CDISClient from './api/cdis.client';
import { waitForSocketReady } from './api/ws/utils';
import { WSClient } from './api/ws/WSClient';
import config from '../config';
import { useSession } from './authentication';
import useToast from './useToast';
import { PantoneLivePalette } from '../types/cdis';
import { refreshSessionExpiration } from './reducers/authentication';

const { CDIS_WS_URL } = config;

type PantoneLiveConnectionStatus =
  | 'closed'
  | 'connecting-authenticated'
  | 'connecting-public'
  | 'connected-authenticated'
  | 'connected-public'
type PantoneLiveConnectionStatusListener = (status: PantoneLiveConnectionStatus) => void;

class PantoneLiveConnection {
  /** Only available once connected. Check status before accessing. */
  client?: CDISClient

  status: PantoneLiveConnectionStatus = 'closed'

  constructor(readonly token: string) {}

  private async initialize() {
    const socket = new WebSocket(`${CDIS_WS_URL}?xr-token=${this.token}`);
    const wsClient = new WSClient(socket);
    const client = new CDISClient(wsClient);
    socket.addEventListener('close', () => {
      this.client = undefined;
      this.updateStatus('closed');
    });
    await waitForSocketReady(socket);
    this.client = client;
  }

  private statusListeners: PantoneLiveConnectionStatusListener[] = []

  private updateStatus(newStatus: PantoneLiveConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  /** Subscribe to status changes. Useful for synchronizing react state. */
  addStatusListener(listener: PantoneLiveConnectionStatusListener) {
    this.statusListeners.push(listener);
  }

  removeStatusListener(listener: PantoneLiveConnectionStatusListener) {
    this.statusListeners = this.statusListeners.filter((l) => l !== listener);
  }

  async login(userId: string, passwordHash: string) {
    if (this.status === 'connecting-authenticated') {
      throw new Error('PantoneLIVE is already connecting');
    }

    this.updateStatus('connecting-authenticated');

    if (!this.client) {
      await this.initialize();
    }

    return new Promise<void>((resolve, reject) => {
      const payload = {
        credentials: {
          userId,
          passwordHash,
        },
      };

      this.client?.authPantoneLive(payload, {
        error: (e) => {
          this.client?.close();
          this.client = undefined;
          this.updateStatus('closed');
          reject(e);
        },
        results: () => {
          this.updateStatus('connected-authenticated');
          resolve();
        },
      });
    });
  }

  /** Creates a new socket. Does not authenticate the connection. */
  async skipLogin() {
    if (this.status === 'connecting-public') {
      throw new Error('PantoneLIVE is already connecting');
    }
    if (this.status === 'closed') {
      this.updateStatus('connecting-public');
      await this.initialize();
      this.updateStatus('connected-public');
    }
  }

  close() {
    this.client?.close();
    this.client = undefined;
    this.statusListeners = [];
    this.updateStatus('closed');
  }
}

let pantoneLiveConnectionInstance: PantoneLiveConnection | undefined;
function getPantoneLiveConnection(token: string) {
  if (pantoneLiveConnectionInstance?.token !== token) {
    pantoneLiveConnectionInstance?.close();
    pantoneLiveConnectionInstance = new PantoneLiveConnection(token);
  }
  return pantoneLiveConnectionInstance;
}

export function usePantoneLiveConnection() {
  const session = useSession();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const pantoneConnection = getPantoneLiveConnection(session.token);
  const [status, setStatus] = useState(pantoneConnection.status);

  useEffect(() => {
    pantoneConnection.addStatusListener(setStatus);
    return () => pantoneConnection.removeStatusListener(setStatus);
  }, [pantoneConnection]);

  const login = useCallback(
    async (userId: string, passwordHash: string) => {
      try {
        await pantoneConnection.login(userId, passwordHash);
        dispatch(refreshSessionExpiration());
      } catch (error) {
        showToast(t('messages.invalidLogin'), 'error');
      }
    },
    [pantoneConnection],
  );
  const skipLogin = useCallback(
    async () => {
      await pantoneConnection.skipLogin();
      dispatch(refreshSessionExpiration());
    },
    [pantoneConnection],
  );

  return {
    status,
    client: pantoneConnection.client,
    login,
    skipLogin,
  };
}

export function usePantoneLiveLibraries() {
  const { showToast } = useToast();
  const { client } = usePantoneLiveConnection();
  const [libraries, setLibraries] = useState<PantoneLivePalette[]>();
  const [isLoading, setLoading] = useState(false);

  const listPantoneLivePalettes = async () => {
    if (!client) throw new Error('PantoneLIVE client not found');

    setLoading(true);
    const handlers = {
      error: (error: Error) => {
        showToast(error.message, 'error');
        setLibraries(undefined);
        setLoading(false);
      },
      results: (results: PantoneLivePalette[]) => {
        setLibraries(results);
        setLoading(false);
      },
    };
    client.listPantoneLivePalettes(handlers);
  };

  useEffect(() => { listPantoneLivePalettes(); }, []);

  return {
    isLoading,
    libraries,
  };
}

export function usePantoneLiveSelect(applicationId: string) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const { client } = usePantoneLiveConnection();

  const selectPantoneLivePalette = async (
    paletteId: string,
  ) => {
    if (!client) throw new Error('PantoneLIVE client not found');

    setIsLoading(true);
    setProgress(0.001);
    const payload = {
      applicationId,
      paletteId,
    };
    const handlers = {
      error: (error: Error) => {
        showToast(error.message, 'error');
        setProgress(0);
        setIsLoading(false);
      },
      progress: setProgress,
      results: () => {
        mutate(['/workspace/standards', applicationId]);
        setIsLoading(false);
      },
    };
    client.selectPaletteRequest(payload, handlers);
  };

  return {
    progress: progress * 100,
    isLoading,
    selectPantoneLivePalette,
  };
}
