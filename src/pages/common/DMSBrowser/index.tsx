import { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';
import { Measurement } from '@xrite/cloud-formulation-domain-model';

import InputField from '../../../components/InputField';
import Panel from '../../../components/Panel';
import { Body, Tiny } from '../../../components/Typography';
import { Component } from '../../../types/component';
import { useJobs } from '../../../data/dms.hooks';
import DMSBrowserTable from './DMSBrowserTable';
import useUserDevices from '../../../data/useUserDevices';
import LoadingContainer from '../../../components/LoadingContainer';
import Select from '../../../components/Select';

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
  jobsSearch: {
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
  tableSpinner: {
    color: theme.palette.primary.main,
    alignSelf: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  noJobsLabel: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

type DeviceSubtype = { model: string, deviceType: string, serialNumber: string };

type Props = {
  onJobSelected: (job: Measurement) => void;
}

const DMSBrowser: Component<Props> = ({ onJobSelected }: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { devices, loading: fetchingDevices } = useUserDevices();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [device, setDevice] = useState<DeviceSubtype>();
  const { result: allJobs, fetching: fetchingJobs, deleteJob } = useJobs(device);

  const displayedJobs = allJobs?.filter((job) => {
    return job.measurement.dmsMeasurementId?.toLowerCase()?.includes(searchQuery.toLowerCase());
  }) ?? [];

  const changeDevice = (newDevice: DeviceSubtype) => {
    setDevice(newDevice);
  };

  return (
    <div className={classes.root}>
      <Panel
        data-testid="dms-browser"
        className={classes.panel}
      >
        <div className={classes.header}>
          <Tiny data-testid="dms-browser-header-title">{t('labels.devices')}</Tiny>
          <Select
            id="dms-browser-select-device"
            enableVirtualization
            data={devices}
            isMulti={false}
            idProp={({ model, serialNumber }) => `${model}-${serialNumber}`}
            labelProp={({ model, serialNumber }) => `${model}-${serialNumber}`}
            value={device}
            onChange={changeDevice}
            isLoading={fetchingDevices}
          />
        </div>
        <div data-testid="dms-browser-jobs" className={classes.tablePanel}>
          <div className={classes.jobsSearch}>
            <Body data-testid="dms-browser-jobs-header-title">{t('labels.sample')}</Body>
            <InputField
              dataTestId="dms-browser-jobs-search"
              type="text"
              value={searchQuery}
              className={classes.searchInput}
              onChange={setSearchQuery}
              startAdornment={<SearchIcon className={classes.searchIcon} />}
              placeholder={`${t('labels.search')}...`}
            />
          </div>
          <LoadingContainer fetching={fetchingJobs}>
            {displayedJobs.length !== 0 ? (
              <DMSBrowserTable
                jobs={displayedJobs}
                onJobDeleted={deleteJob}
                onJobSelected={({ measurement }) => onJobSelected(measurement)}
              />
            ) : (
              <Body data-testid="no-selections-label" className={classes.noJobsLabel}>{t('labels.noJobsAvailableForSelection')}</Body>
            )}
          </LoadingContainer>
        </div>
      </Panel>
    </div>
  );
};

export default DMSBrowser;
