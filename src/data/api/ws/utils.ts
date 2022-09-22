import { Unvalidated } from '../../../types/utils';
import {
  ErrorCode,
  isErrorMessage,
  isProgressMessage,
  isResultMessage,
  WSMessage,
} from './types';
import { WSClient } from './WSClient';

export const waitForSocketReady = (socket: WebSocket) => new Promise<void>((resolve, reject) => {
  if (socket.readyState === WebSocket.OPEN) {
    resolve();
    return;
  }
  socket.addEventListener('open', () => resolve());
  socket.addEventListener('close', (event) => reject(event.reason));
});

/**
 * Parse and validate incoming websocket messages (event.data).
 *
 * Throws if parsing or validation fails.
 */
export const parseMessage = (data: string): WSMessage => {
  try {
    const parsedData: Unvalidated<WSMessage> = JSON.parse(data);
    if (
      isProgressMessage(parsedData)
      || isErrorMessage(parsedData)
      || isResultMessage(parsedData)
    ) return parsedData;
  } catch (error) {
    throw new Error('Failed parsing message data');
  }
  throw new Error('Invalid message data');
};

export class UnauthorizedError extends Error {}

export const isUnauthorizedErrorMessageEvent = (event: MessageEvent) => {
  const message = parseMessage(event.data);
  return (
    message.responseType === 'error'
    && message.payload[0]?.errorCode === ErrorCode.NOT_AUTHORIZED_ERROR
  );
};

export async function createWSClient(URL: string): Promise<WSClient> {
  const socket = new WebSocket(URL);
  const wsClient = new WSClient(socket);
  await waitForSocketReady(socket);
  return wsClient;
}
