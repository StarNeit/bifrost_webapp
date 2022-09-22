import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { useTranslation } from 'react-i18next';

import { Component } from '../../types/component';
import FileInput from '../../components/FileInput';
import { Tiny } from '../../components/Typography';
import useToast from '../../data/useToast';

const useStyles = makeStyles((theme) => ({
  uploadContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    height: theme.spacing(6),
  },
  fileUpload: {
    width: theme.spacing(48),
  },
  fileSpinner: {
    marginLeft: theme.spacing(1),
  },
  uploadButton: {
    padding: theme.spacing(1, 2),
    marginLeft: theme.spacing(2),
  },
  fileNameWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: theme.spacing(1),
    width: theme.spacing(4),
  },
  checkIcon: {
    color: theme.palette.success.main,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
}));

type Props = {
  upload: (file: File) => Promise<void>,
  resetUploadStatus: () => void,
  uploadProgress: number,
  hasUploading: boolean,
  uploadedSuccessfully: boolean,
  uploadError: Error | null,
  accept: string,
}

const FileUpload: Component<Props> = (props: Props) => {
  const {
    upload,
    resetUploadStatus,
    uploadProgress,
    hasUploading,
    uploadedSuccessfully,
    uploadError,
    accept,
  } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const { showToast, closeToast } = useToast();
  const [file, setFile] = useState<File | null>();
  const [startingUpload, setStartingUpload] = useState(false);

  useEffect(() => {
    if (uploadProgress && uploadProgress > 0) {
      setStartingUpload(false);
    }
  }, [uploadProgress]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (uploadedSuccessfully) {
      const key = showToast(t('messages.fileUploadedSuccessfully'), 'success');
      return () => closeToast(key);
    }
  }, [uploadedSuccessfully]);

  useEffect(() => {
    if (uploadError) {
      showToast(t('messages.errorUploadingFile'), 'error');
    }
  }, [uploadError]);

  return (
    <div className={classes.uploadContainer}>
      <Tiny data-testid="file-upload-title">
        {file ? (
          <div className={classes.fileNameWrapper}>
            <span data-testid="uploaded-file-name">{file?.name}</span>
            {(!uploadError && (startingUpload || hasUploading)) && (
              <CircularProgress
                data-testid="file-upload-loading-spinner"
                variant={startingUpload ? 'indeterminate' : 'determinate'}
                value={uploadProgress * 100}
                size={32}
                className={classes.fileSpinner}
              />
            )}
            {uploadedSuccessfully && (
              <CheckCircleIcon className={clsx(classes.statusIcon, classes.checkIcon)} />
            )}
            {uploadError && (
              <ErrorIcon className={clsx(classes.statusIcon, classes.errorIcon)} />
            )}
          </div>
        ) : t('messages.selectFile')}
      </Tiny>
      <FileInput
        dataTestId="file-upload-button"
        accept={accept}
        disabled={hasUploading && !uploadError}
        onChange={(event) => {
          if (event.target.files && event.target.files.item.length > 0) {
            const selected = event.target.files.item(0);
            if (!selected) return;
            resetUploadStatus();
            setFile(selected);
            upload(selected);
            setStartingUpload(true);
          }
        }}
      />
    </div>
  );
};

export default FileUpload;
