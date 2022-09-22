import { EngineType } from '../../../types/cfe';
import { CloseEventCode } from '../ws/types';
import CFEClient from './CFEClient';
import { isUnauthorizedErrorMessageEvent, waitForSocketReady } from '../ws/utils';

const FMS_SESSION_TOKEN_FIELD = 'xr-token';

type GetClientOptions = {
  /**
   * Called when a new connection is created. Not called when an existing connection is returned.
   */
  onNewConnection?: () => void,
}

export default class CFEClientManager {
  readonly token: string

  private readonly cfeURL: string | undefined

  private clients: Record<string, CFEClient> = {}

  constructor(token: string, cfeURL: string) {
    this.token = token;
    this.cfeURL = cfeURL;
  }

  private getEngineTypeUrl(engineType: EngineType) {
    return `${this.cfeURL}?${FMS_SESSION_TOKEN_FIELD}=${encodeURIComponent(this.token)}&engineType=${encodeURIComponent(engineType)}`;
  }

  private async createNewClient(engineType: EngineType) {
    const url = this.getEngineTypeUrl(engineType);
    const socket = new WebSocket(url);
    const client = new CFEClient(socket);

    socket.addEventListener('close', () => {
      delete this.clients[engineType];
    });

    socket.addEventListener('message', (event) => {
      if (isUnauthorizedErrorMessageEvent(event)) {
        socket.close(CloseEventCode.UNAUTHORIZED);
      }
    });

    await waitForSocketReady(socket);
    return client;
  }

  async get(engineType: EngineType, options?: GetClientOptions): Promise<CFEClient> {
    if (!this.clients[engineType]) {
      this.clients[engineType] = await this.createNewClient(engineType);
      options?.onNewConnection?.();
    }
    return this.clients[engineType];
  }

  close(): void {
    Object.values(this.clients).forEach((client) => {
      client.close();
    });
  }
}
