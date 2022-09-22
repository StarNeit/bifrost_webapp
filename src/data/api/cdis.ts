import axios from 'axios';
import config from '../../config';

const GET_UPLOAD_URL = `${config.CDIS_URL}/upload-url`;

export type UploadURLResult = {
  data: {
    url: string
    fileId: string,
  }
}

export const uploadDatabaseFile = (
  url: string,
  data: ArrayBuffer | string | null | undefined,
  onUploadProgress: (event: ProgressEvent) => void,
): Promise<void> => axios.put(
  url,
  data,
  {
    headers: { 'Content-Type': 'application/octet-stream' },
    onUploadProgress,
    timeout: 0,
  },
);

export const getDbFileUploadUrl = (token: string): Promise<UploadURLResult> => axios.get(
  GET_UPLOAD_URL,
  {
    headers: {
      'xr-token': token,
    },
  },
);
