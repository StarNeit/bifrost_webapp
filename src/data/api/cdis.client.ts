import {
  ImportResponse,
  ImportWorkspaceObjectRequest,
  PantoneAuthRequest,
  PantoneLivePalette,
  ParseFileRequest,
  ParseFileResponse,
  SelectPaletteRequest,
} from '../../types/cdis';
import { Handlers } from './ws/types';
import { WSClient } from './ws/WSClient';

export default class CDISClient {
  constructor(private readonly client: WSClient) { }

  parseFile(payload: ParseFileRequest, handlers: Handlers<ParseFileResponse>) {
    this.client.send('parse-file', payload, handlers);
  }

  import(payload: ImportWorkspaceObjectRequest, handlers: Handlers<ImportResponse>) {
    this.client.send('import-from-workspace', payload, handlers);
  }

  authPantoneLive(payload: PantoneAuthRequest, handlers: Handlers<never>) {
    this.client.send('set-pantone-live-credentials', payload, handlers);
  }

  listPantoneLivePalettes(handlers: Handlers<PantoneLivePalette[]>) {
    this.client.send('list-pantone-live-palettes', {}, handlers);
  }

  selectPaletteRequest(payload: SelectPaletteRequest, handlers: Handlers<unknown>) {
    this.client.send('select-pantone-live-palette', payload, handlers);
  }

  close() {
    this.client.close();
  }
}
