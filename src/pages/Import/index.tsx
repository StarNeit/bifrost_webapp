import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core';
import { useEffect } from 'react';
import { Component } from '../../types/component';
import Page from '../../components/Page';
import Button from '../../components/Button';
import { Title } from '../../components/Typography';
import { useCDISFileUpload } from '../../data/cdis.file.upload';
import {
  useWorkspaceCleaner, useGetWorkspace, useImportAll,
} from '../../data/cdis.hooks';
import Workspace from './Workspace';
import FileUpload from './FileUpload';
import useToast from '../../data/useToast';
import WorkspaceContext from './workspaceContext';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    maxWidth: theme.spacing(160),
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: theme.spacing(10),
  },
  workspaceBar: {
    height: '100%',
    display: 'flex',
    flex: `4 0 ${theme.spacing(62.5)}px`,
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  objectDetailsBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    flex: '6 0 auto',
    marginLeft: theme.spacing(2),
    width: '480px', // TODO layout will be improved
    maxWidth: theme.spacing(160),
  },
  headerButton: {
    fontSize: theme.spacing(1.5),
    height: theme.spacing(5.25),
  },
}));

const Import: Component = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { showToast } = useToast();

  const applicationId = 'bifrostimport';

  const [
    workspace,
    resetWorkspace,
    workspaceError,
    isWorkspaceLoading,
    isWorkspaceEmpty,
    getWorkspace,
  ] = useGetWorkspace(applicationId);

  const {
    upload,
    reset: resetUpload,
    progress,
    hasUploading,
    uploadedSuccessfully,
    error: uploadError,
  } = useCDISFileUpload(applicationId);

  const {
    importWorkspaceObjects,
    progress: importProgress,
    loading,
    importedObjectIds,
    rejectedObjectIds,
    reset,
  } = useImportAll(applicationId);

  const [clearWorkspace, cleanerError] = useWorkspaceCleaner(applicationId);

  const cleanUp = () => {
    resetUpload();
    // swallow promise rejection, we handle an error by returning it from the hook
    clearWorkspace().then(() => resetWorkspace(), () => null);
  };

  useEffect(() => {
    resetUpload();
  }, [uploadError]);

  useEffect(() => {
    getWorkspace();
  }, [uploadedSuccessfully]);

  useEffect(() => {
    if (cleanerError) {
      showToast(t('messages.workspaceCleanupError'), 'error');
    }
  }, [cleanerError]);

  useEffect(() => {
    if (uploadError) {
      // TODO: add translation
      showToast('Error while processing the file', 'error');
    }
  }, [uploadError]);

  const importAll = () => {
    if (!workspace) return;

    const workspaceObjects: Record<string, string[]> = {};
    Object.entries(workspace).forEach(([type, data]) => {
      if (!data?.length) return;

      workspaceObjects[type] = data?.map(({ id }) => id);
    });

    importWorkspaceObjects(workspaceObjects);
  };

  return (
    <Page title={t('labels.dbImport')}>
      <div className={classes.root}>
        <Title>{t('titles.DataImport')}</Title>
        <div className={classes.topBar}>
          {/* workspace header */}
          <div className={classes.workspaceBar}>
            <FileUpload
              uploadedSuccessfully={uploadedSuccessfully}
              resetUploadStatus={resetUpload}
              upload={upload}
              accept=".ifsx,.ifbx,.ifrx,.ifpx,.ifgx,.iftx,.iffx,.cxf,.mif"
              uploadProgress={progress}
              hasUploading={hasUploading}
              uploadError={uploadError}
            />
            <Button
              variant="primary"
              onClick={importAll}
              progress={importProgress}
              showSpinner={loading}
              disabled={isWorkspaceEmpty}
              className={classes.headerButton}
            >
              {t('labels.importAll')}
            </Button>
          </div>

          <div className={classes.objectDetailsBar}>
            <Button
              data-testid="data-import-clear-button"
              variant="primary"
              disabled={isWorkspaceEmpty}
              onClick={cleanUp}
              className={classes.headerButton}
            >
              {t('labels.clear')}
            </Button>
          </div>
        </div>
        <WorkspaceContext.Provider value={{
          importedObjectIds,
          rejectedObjectIds,
          importingAllObjects: loading,
          applicationId: 'bifrostimport',
          isEmpty: isWorkspaceEmpty,
          isLoading: isWorkspaceLoading || hasUploading,
          error: workspaceError,
          workspace,
          reset,
        }}
        >
          <Workspace />
        </WorkspaceContext.Provider>
      </div>
    </Page>
  );
};

export default Import;
