import { WSClient } from '../ws/WSClient';
import {
  CalibrationInput,
  CalibrationResults,
  CorrectionInput,
  CorrectionResults,
  FormulationInput,
  FormulationResults,
  PredictionInput,
  PredictionResults,
} from '../../../types/cfe';
import { Unvalidated } from '../../../types/utils';
import { Handlers } from '../ws/types';

/**
 * A thin utility wrapper around WSClient.
 * Provides CFE-related functionality.
 */
export default class CFEClient {
  private client: WSClient;

  constructor(socket: WebSocket) {
    this.client = new WSClient(socket);
  }

  formulate(data: FormulationInput, handlers: Handlers<Unvalidated<FormulationResults>>): void {
    this.client.send('formulate', data, handlers);
  }

  correct(data: CorrectionInput, handlers: Handlers<CorrectionResults>): void {
    this.client.send('correct', data, handlers);
  }

  predict(data: PredictionInput, handlers: Handlers<Unvalidated<PredictionResults>>): void {
    this.client.send('predict', data, handlers);
  }

  calibrate(data: CalibrationInput, handlers: Handlers<Unvalidated<CalibrationResults>>): void {
    this.client.send('calibrate', data, handlers);
  }

  close(): void {
    this.client.close();
  }
}
