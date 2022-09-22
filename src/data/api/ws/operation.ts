import { Handlers, CloseEventCode } from './types';
import { parseMessage, UnauthorizedError } from './utils';

const OPERATION_RESULT_TIMEOUT = 15.5 * 60 * 1000;
const COMPLETED_OPERATION_PROGRESS = 1;

export function startOperation<T, TResult>(
  requestId: string,
  command: string,
  payload: T,
  socket: WebSocket,
  handlers: Handlers<TResult>,
): void {
  const request = {
    command,
    requestId,
    payload,
  };
  const serializedRequest = JSON.stringify(request);
  socket.send(serializedRequest);

  function getTimeoutID(ms: number) {
    return setTimeout(() => {
      socket.close(CloseEventCode.TIMEOUT);
    }, ms);
  }

  let timeoutId = getTimeoutID(OPERATION_RESULT_TIMEOUT);

  let resultArrived = false;

  function onMessage(event: MessageEvent<string>) {
    const data = parseMessage(event.data);

    if (data.requestId !== requestId) {
      return;
    }

    switch (data.responseType) {
      case 'error': {
        const { message } = data.payload[0];
        handlers.error?.(new Error(message));
        clearTimeout(timeoutId);
        break;
      }

      case 'progress': {
        const progress = data.payload.value;
        if (!resultArrived) handlers.progress?.(progress);
        clearTimeout(timeoutId);
        timeoutId = getTimeoutID(OPERATION_RESULT_TIMEOUT);
        break;
      }

      case 'intermediateResult':
        handlers.results?.(data.payload as TResult);
        clearTimeout(timeoutId);
        timeoutId = getTimeoutID(OPERATION_RESULT_TIMEOUT);
        break;

      case 'result':
        resultArrived = true;
        handlers.progress?.(COMPLETED_OPERATION_PROGRESS);
        handlers.results?.(data.payload as TResult);
        clearTimeout(timeoutId);
        break;

      default:
        break;
    }
  }

  function onClose(event: CloseEvent) {
    if (resultArrived) return;
    if (event.code === CloseEventCode.UNAUTHORIZED) {
      handlers.error?.(new UnauthorizedError());
    } else if (event.code === CloseEventCode.TIMEOUT) {
      handlers.error?.(new Error(`Operation ${requestId} timed out.`));
    } else {
      handlers.error?.(new Error(`Operation ${requestId} disconnected unexpectedly.`));
    }
    resultArrived = true;
    clearTimeout(timeoutId);
    socket.removeEventListener('message', onMessage);
    socket.removeEventListener('close', onClose);
  }

  socket.addEventListener('message', onMessage);
  socket.addEventListener('close', onClose);
}
