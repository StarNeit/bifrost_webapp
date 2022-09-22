import { useEffect } from 'react';
import { makeStyles, CircularProgress } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';

import InputField from '../../../../components/InputField';
import Panel from '../../../../components/Panel';
import { Body } from '../../../../components/Typography';
import { Component } from '../../../../types/component';
import FileBrowserTable from './FileBrowserTable';
import LoadingContainer from '../../../../components/LoadingContainer';
import FileUpload from '../../../Import/FileUpload';
import { useCDISFileUpload } from '../../../../data/cdis.file.upload';
import { useWorkspaceCleaner } from '../../../../data/cdis.hooks';
import { WorkspaceEntry } from '../../../../types/cdis';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    overflow: 'hidden',
    maxHeight: '100%',
  },
  panel: {
    minWidth: theme.spacing(81),
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tablePanel: {
    background: theme.palette.action.hover,
    borderRadius: theme.spacing(0.75),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  colorsSearch: {
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    paddingLeft: theme.spacing(1),
    width: theme.spacing(16),
  },
  searchIcon: {
    color: theme.palette.text.secondary,
  },
  noFileUploadedLabel: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  fetchingEntrySpinner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',

    '&::before': {
      content: '""',
      background: theme.palette.common.black,
      opacity: 0.3,
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
  },
  tableWrapper: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
}));

type Props = {
  entries: WorkspaceEntry[] | undefined,
  entriesLoading: boolean,
  fetchingEntryDetails: boolean,
  displayedEntries: WorkspaceEntry[],
  setEntryId: (entry: string) => void;
  searchQuery: string,
  setSearchQuery: (query: string) => void;
  refetchEntries: () => Promise<boolean>;
  applicationId: string,
  headerTitle: string,
  isShowBrowseFile?: boolean,
}

const FileBrowser: Component<Props> = ({
  entriesLoading,
  entries,
  fetchingEntryDetails,
  displayedEntries,
  setEntryId,
  searchQuery,
  setSearchQuery,
  refetchEntries,
  applicationId,
  headerTitle,
  isShowBrowseFile = true,
}: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    upload,
    progress,
    hasUploading,
    uploadedSuccessfully,
    reset,
    error: uploadError,
  } = useCDISFileUpload(applicationId);

  const [cleanWorkspace] = useWorkspaceCleaner(applicationId);

  useEffect(() => {
    if (uploadedSuccessfully) {
      refetchEntries();
    }
  }, [uploadedSuccessfully]);

  return (
    <div className={classes.root}>
      <Panel
        data-testid="file-browser"
        className={classes.panel}
      >
        {isShowBrowseFile && (
          <FileUpload
            resetUploadStatus={reset}
            uploadedSuccessfully={uploadedSuccessfully}
            upload={async (file: File) => {
              if (!file) return;
              cleanWorkspace();
              upload(file);
            }}
            accept=".ifsx,.ifbx,.ifrx,.ifpx,.ifgx,.iftx,.iffx,.cxf,.mif"
            uploadProgress={progress}
            hasUploading={hasUploading}
            uploadError={uploadError}
          />
        )}
        <div className={classes.tablePanel}>
          <div className={classes.colorsSearch}>
            <Body data-testid="file-browser-colorant-header-title">
              {headerTitle}
            </Body>
            <InputField
              dataTestId="file-browser-colorant-search"
              type="text"
              value={searchQuery}
              className={classes.searchInput}
              onChange={setSearchQuery}
              startAdornment={<SearchIcon className={classes.searchIcon} />}
              placeholder={`${t('labels.search')}...`}
            />
          </div>
          <LoadingContainer fetching={entriesLoading}>
            {entries ? (
              <div className={classes.tableWrapper}>
                {fetchingEntryDetails && (
                  <div
                    data-testid="loading-existing-files"
                    className={classes.fetchingEntrySpinner}
                  >
                    <CircularProgress />
                  </div>
                )}
                <FileBrowserTable
                  entries={displayedEntries}
                  onEntrySelected={(entry) => {
                    setEntryId(entry.id);
                  }}
                />
              </div>
            ) : (
              <Body className={classes.noFileUploadedLabel}>{t('labels.noFileChosen')}</Body>
            )}
          </LoadingContainer>
        </div>
      </Panel>
    </div>
  );
};

export default FileBrowser;
