import {
  isArray,
  isNumber,
  isString,
  Unvalidated,
} from '../../../types/utils';

/**
 * WebSocket CloseEvent codes.
 * These can be passed with a reason string when we close a WebSocket connection.
 * Custom CloseEvent codes must be in the 4000-4999 range.
 */
export const CloseEventCode = {
  UNAUTHORIZED: 4001,
  TIMEOUT: 4002,
};

/**
 * Used by the CFE in error messages.
 */
export enum ErrorCode {
  GENERIC_ERROR = 1,
  GENERIC_FMS_ERROR = 2,
  NOT_AUTHORIZED_ERROR = 3,
  NO_LICENSE_ERROR = 4,
}

export interface Handlers<T> {
  progress?(amount: number): void
  error?(error: Error): void
  results?(data: T): void
}

export interface ProgressMessage {
  requestId: string
  responseType: 'progress'
  payload: { value: number }
}

interface ErrorMessageObject { message: string, errorCode: ErrorCode }

export interface ErrorMessage {
  requestId: string
  responseType: 'error'
  payload: ErrorMessageObject[]
}

export interface ResultMessage {
  requestId: string
  responseType: 'result' | 'intermediateResult'
  payload: unknown
}

export type WSMessage = ProgressMessage | ErrorMessage | ResultMessage

export type WSClientMessage<T> = {
  command: string,
  payload: T
}

// type validation

export const isProgressMessage = (
  message: Unvalidated<WSMessage>,
): message is ProgressMessage => Boolean(
  message
  && isString(message.requestId)
  && message.responseType === 'progress'
  && message.payload
  && isNumber((message.payload as ProgressMessage['payload']).value),
);

const isErrorMessageObject = (
  value: Unvalidated<ErrorMessageObject>,
): value is ErrorMessageObject => Boolean(
  value
  && isString(value.message)
  && (value.errorCode as number) in ErrorCode,
);

export const isErrorMessage = (
  message: Unvalidated<WSMessage>,
): message is ErrorMessage => Boolean(
  message
  && isString(message.requestId)
  && message.responseType === 'error'
  && isArray(message.payload, isErrorMessageObject),
);

export const isResultMessage = (
  message: Unvalidated<WSMessage>,
): message is ResultMessage => Boolean(
  message
  && isString(message.requestId)
  && (message.responseType === 'result' || message.responseType === 'intermediateResult'),
);
