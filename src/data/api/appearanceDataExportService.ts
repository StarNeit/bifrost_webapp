import {
  AppearanceSample,
  Assortment,
  Standard,
  Substrate,
} from '@xrite/cloud-formulation-domain-model';
import axios, { AxiosResponse } from 'axios';

import config from '../../config';
import { RecipeOutputMode, RecipeUnit, TotalMode } from '../../types/recipe';
import { isArray, isEnumValue, isString } from '../../types/utils';

const APPEARANCE_DATA_EXPORT_SERVICE_URL = `${config.APPEARANCE_DATA_EXPORT_SERVICE_URL}/converters`;

export type DispenserPayload = {
  appearanceSample: AppearanceSample,
  assortment: Assortment,
  standardName: string,
  recipeOutputMode: RecipeOutputMode,
  recipeUnit: RecipeUnit,
  totalMode: TotalMode,
  isCorrection: boolean,
  originalAppearanceSample?: AppearanceSample,
};

export type FilePayload = {
  objects: (
    Standard
    | AppearanceSample
    | Substrate
  )[]
};

export enum FormatType {
  File = 'file',
  Dispenser = 'dispenser',
}

export type FileFormat = {
  id: string;
  type: FormatType;
  metadata: {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFileFormat = (data: any): data is FileFormat => (
  data
  && isString(data.id)
  && isEnumValue(data.type, FormatType)
  && data.metadata
  && isString(data.metadata.name)
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFileFormats = (data: any): data is FileFormat[] => (
  data
  && isArray(data, isFileFormat)
);

export async function getFileFormats(token: string, type: FormatType): Promise<FileFormat[]> {
  const { data } = await axios.get(APPEARANCE_DATA_EXPORT_SERVICE_URL, {
    headers: {
      'xr-token': token,
    },
  });

  if (!isFileFormats(data)) return [];

  return data?.filter((converter) => converter.type === type);
}

function getFileName(disposition: string): string | undefined {
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  let fileName: string | undefined;
  if (utf8FilenameRegex.test(disposition)) {
    const regexFileName = utf8FilenameRegex.exec(disposition);
    if (regexFileName) {
      fileName = decodeURIComponent(regexFileName[1]);
    }
  } else {
    const matches = asciiFilenameRegex.exec(disposition);
    if (matches != null && matches[2]) {
      // eslint-disable-next-line prefer-destructuring
      fileName = matches[2];
    }
  }
  return fileName;
}

function openFile(response: AxiosResponse<BlobPart>, backupFileName: string) {
  const filename = getFileName(response?.headers?.['content-disposition']);

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.setAttribute('download', filename);
  } else {
    link.setAttribute('download', backupFileName);
  }
  document.body.appendChild(link);
  link.click();
}

export type ExportPayload =
{
  type: FormatType.Dispenser,
  payload: DispenserPayload,
}
| {
  type: FormatType.File,
  payload: FilePayload,
}

export async function downloadFile(
  token: string, { payload, type }: ExportPayload, formatId: string,
) {
  const response = await axios.post(`${APPEARANCE_DATA_EXPORT_SERVICE_URL}/${formatId}`,
    payload,
    {
      headers: {
        'xr-token': token,
      },
      responseType: 'blob',
    });

  const backupFileName = type === FormatType.Dispenser ? `${formatId}.rez` : formatId;
  openFile(response, backupFileName);
}
