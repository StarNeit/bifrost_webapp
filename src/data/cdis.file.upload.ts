import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFileParse } from './cdis.hooks';
import { getDbFileUploadUrl, uploadDatabaseFile } from './api/cdis';
import { getSession } from './authentication';

const getCDISFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toUpperCase();
  return extension || '';
};

export const useCDISFileUpload = (applicationId: string) => {
  const session = useSelector(getSession);
  const [progress, setProgress] = useState(0);
  const [hasUploading, setHasUploading] = useState(false);
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const parseHandlers = {
    error: setError,
    progress: (parseProgress: number) => setProgress(0.5 + (parseProgress * 0.5)),
    results: () => {
      setUploadedSuccessfully(true);
      setHasUploading(false);
    },
  };

  const [
    parse,
    resetParse,
  ] = useFileParse(parseHandlers);

  function reset() {
    setProgress(0);
    setHasUploading(false);
    setUploadedSuccessfully(false);
    setError(null);
    resetParse();
  }

  async function upload(file: File): Promise<void> {
    if (!session) {
      throw new Error('Cannot use without session');
    }
    setError(null);
    setUploadedSuccessfully(false);
    setProgress(0);
    const fileType = getCDISFileType(file.name);
    const result = await getDbFileUploadUrl(session.token);
    setHasUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      uploadDatabaseFile(
        result.data.url,
        evt.target?.result,
        (event: ProgressEvent) => setProgress(0.5 * (event.loaded / event.total)),
      )
        .then(
          () => {
            parse(result.data.fileId, fileType, applicationId);
          },
          () => {
            //
            setError(new Error('Error uploading the file'));
            setUploadedSuccessfully(false);
          },
        );
    };
    try {
      reader.readAsArrayBuffer(file);
    } catch (e) {
      setHasUploading(false);
      setError(new Error('Error reading the file'));
    }
  }

  return {
    upload,
    reset,
    progress,
    hasUploading,
    uploadedSuccessfully,
    error, // TODO: try moving error handling to toasts
  };
};
