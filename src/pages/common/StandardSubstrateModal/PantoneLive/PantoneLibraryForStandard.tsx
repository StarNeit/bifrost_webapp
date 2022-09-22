import { useEffect, useState } from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import { Measurement } from '@xrite/cloud-formulation-domain-model';

import Panel from '../../../../components/Panel';
import { Body, Tiny } from '../../../../components/Typography';
import { Component } from '../../../../types/component';
import Select from '../../../../components/Select';
import { PantoneLivePalette } from '../../../../types/cdis';
import { useGetStandardDetails, useGetStandards } from '../../../../data/cdis.hooks';
import { usePantoneLiveLibraries, usePantoneLiveSelect } from '../../../../data/pantone';

import InputField from '../../../../components/InputField';
import LoadingContainer from '../../../../components/LoadingContainer';
import FileBrowserTable from '../FileBrowser/FileBrowserTable';

const PANTONE_LIVE_WORKSPACE_ID = 'bifrostpantonelive';

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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
  tablePanel: {
    background: theme.palette.action.hover,
    borderRadius: theme.spacing(0.75),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  librarySelect: {
    width: theme.spacing(37.5),
  },
  librarySearch: {
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
  noJobsLabel: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  colorsSearch: {
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableWrapper: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
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
  noFileUploadedLabel: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

type Props = {
  onStandardSelected: (measurement: Measurement, standardName: string) => void;
};

const PantoneLibraryForStandard: Component<Props> = ({
  onStandardSelected,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [standardId, setStandardId] = useState('');
  const [selectedLibrary, selectLibrary] = useState<PantoneLivePalette>();

  const { libraries, isLoading: librariesAreLoading } = usePantoneLiveLibraries();

  const { selectPantoneLivePalette, isLoading } = usePantoneLiveSelect(PANTONE_LIVE_WORKSPACE_ID);

  const {
    result: standards,
    loading: standardsLoading,
  } = useGetStandards(PANTONE_LIVE_WORKSPACE_ID);

  const {
    result: standardDetails,
    loading: fetchingStandardDetails,
  } = useGetStandardDetails(PANTONE_LIVE_WORKSPACE_ID, standardId);

  useEffect(() => {
    if (standardDetails) {
      onStandardSelected(standardDetails.measurements[0], standardDetails.name);
    }
  }, [standardDetails]);

  const lowercaseSearchQuery = searchQuery.toLowerCase();
  const displayedStandards = standards
    ?.filter((entry) => entry.name.toLowerCase().includes(lowercaseSearchQuery)) ?? [];

  const changeLibrary = (library: PantoneLivePalette) => {
    selectLibrary(library);
    selectPantoneLivePalette(library.id);
  };

  return (
    <div className={classes.root}>
      <Panel
        data-testid="pantone-library"
        className={classes.panel}
      >
        <div className={classes.header}>
          <Tiny data-testid="dms-browser-header-title">{t('labels.availableLibraries')}</Tiny>
          <div className={classes.librarySelect}>
            <Select
              id="pantone-libraries-select"
              data={libraries}
              value={selectedLibrary}
              labelProp="name"
              isMulti={false}
              onChange={changeLibrary}
              isLoading={librariesAreLoading}
              isFullWidth
            />
          </div>
        </div>
        <div className={classes.tablePanel}>
          <div className={classes.colorsSearch}>
            <Body data-testid="file-browser-colorant-header-title">
              {t('labels.standards')}
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
          <LoadingContainer fetching={standardsLoading || isLoading}>
            {standards ? (
              <div className={classes.tableWrapper}>
                {fetchingStandardDetails && (
                  <div
                    data-testid="loading-existing-files"
                    className={classes.fetchingEntrySpinner}
                  >
                    <CircularProgress />
                  </div>
                )}
                <FileBrowserTable
                  entries={displayedStandards}
                  onEntrySelected={(entry) => setStandardId(entry.id)}
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

export default PantoneLibraryForStandard;
