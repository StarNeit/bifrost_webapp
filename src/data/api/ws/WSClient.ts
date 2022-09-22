import { startOperation } from './operation';
import { Handlers } from './types';

export class WSClient {
  private socket: WebSocket;

  private nextRequestId = 0;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  send<T, TResult>(command: string, payload: T, handlers: Handlers<TResult>): void {
    const requestId = String(this.nextRequestId);
    startOperation(requestId, command, payload, this.socket, handlers);
    this.nextRequestId += 1;
  }

  close(): void {
    return this.socket.close();
  }

  isOpen(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }
}
