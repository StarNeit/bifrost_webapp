/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { WSClient } from '../ws/WSClient';
import Client from './CFEClient';

jest.mock('../ws/WSClient');
const MockedWSClient = WSClient as jest.Mock<WSClient>;

/**
 * CFEClient is a thin utility wrapper around WSClient, so we restrict the tests to
 * the functionality between the two: calling WSClient's "send" and "close" functions.
 *
 * We cast all the input parameters as 'any' since CFEClient is only responsible with
 * passing them to WSClient.
 */
describe('CFE Client', () => {
  beforeEach(() => {
    MockedWSClient.mockClear();
  });

  it('should create a WSClient instance from the provided socket', () => {
    const socket: any = {};

    const client = new Client(socket);

    expect(MockedWSClient).toHaveBeenCalledWith(socket);
  });

  it('should send a formulation message', () => {
    const inputData: any = {};
    const handlers: any = {};
    const socket: any = {};

    const client = new Client(socket);
    client.formulate(inputData, handlers);
    const wsClientInstance = MockedWSClient.mock.instances[0];

    expect(wsClientInstance.send).toHaveBeenCalledWith('formulate', inputData, handlers);
  });

  it('should send a correction message', () => {
    const inputData: any = {};
    const handlers: any = {};
    const socket: any = {};

    const client = new Client(socket);
    client.correct(inputData, handlers);
    const wsClientInstance = MockedWSClient.mock.instances[0];

    expect(wsClientInstance.send).toHaveBeenCalledWith('correct', inputData, handlers);
  });

  it('should close a WSClient', () => {
    const socket: any = {};

    const client = new Client(socket);
    client.close();
    const wsClientInstance = MockedWSClient.mock.instances[0];

    expect(wsClientInstance.close).toHaveBeenCalled();
  });
});
