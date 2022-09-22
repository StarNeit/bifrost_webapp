import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { IconButton } from '@material-ui/core';
import { Measurement } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../../../types/component';
import Table, { Column } from '../../../components/Table';
import ColorSquare from '../../../components/ColorSquare';
import { calculatePreviewRGB, isMeasurementSampleSupported } from '../../../utils/colorimetry';
import { isMeasurementMultiAngle } from '../../../utils/utils';
import { Body } from '../../../components/Typography';
import ConfirmationPopover from '../../../components/ConfirmationPopover';
import { Job } from '../../../types/dms';
import { formatDate } from '../../../utils/formatDate';

const useStyles = makeStyles((theme) => ({
  table: {
    borderRadius: theme.spacing(0.75),
    overflowY: 'auto',
  },
  colorSquare: {
    width: theme.spacing(10),
    minHeight: theme.spacing(4.125),
  },
  iconButton: {
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1),
    '& svg': {
      color: theme.palette.text.primary,
      fontSize: theme.spacing(2),
    },

    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
}));

type Props = {
  jobs: { measurement: Measurement, jobId: string }[];
  onJobDeleted: (jobId: string) => void;
  onJobSelected?: (job: { measurement: Measurement, jobId: string }) => void;
};

const DMSBrowserTable: Component<Props> = ({
  jobs,
  onJobDeleted,
  onJobSelected,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const [selectedRowId, setSelectedRowId] = useState<string>();
  const [deleteButtonRef, setDeleteButtonRef] = useState<HTMLButtonElement | undefined>();
  const [deletingJobName, setDeletingJobName] = useState<string | undefined>();

  const deleteJobHandler = async (jobName?: string) => {
    if (jobName) {
      const job = jobs.filter((m) => m.measurement.dmsMeasurementId === jobName)[0];
      onJobDeleted(job.jobId);
    }
  };

  const columns = [
    {
      id: 'preview',
      headerText: t('labels.preview'),
      cellComponent: ({ simulation, isMultiAngle }: Job) => {
        return (
          <ColorSquare
            colors={simulation}
            isGradient={isMultiAngle}
            className={classes.colorSquare}
          />
        );
      },
    },
    {
      id: 'name',
      headerText: t('labels.name'),
      inlineStyle: {
        minWidth: theme.spacing(24),
      },
    },
    {
      id: 'dateCreated',
      headerText: t('labels.dateCreated'),
      cellComponent: ({ dateCreated }: Job) => (
        <Body>{formatDate(dateCreated, 'dd MMM yyyy HH:mm:ss')}</Body>
      ),
      inlineStyle: {
        minWidth: theme.spacing(24),
      },
    },
    {
      id: 'actions',
      headerText: t('labels.actions'),
      cellComponent: ({ name }: Job) => (
        <IconButton
          disableRipple
          className={classes.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteButtonRef(e.currentTarget);
            setDeletingJobName(name);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const rowStyle = {
    padding: theme.spacing(0, 0.5),
    height: theme.spacing(5.75),
    cursor: 'pointer',
  };

  const data: Job[] = jobs?.map((job) => {
    const isMultiAngle = isMeasurementMultiAngle(job.measurement);

    const rgbs = job.measurement.measurementSamples
      ?.filter((value) => isMeasurementSampleSupported(value))
      .map((sample) => {
        const rgb = calculatePreviewRGB(sample);
        return {
          rgb: {
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],
          },
        };
      });
    return {
      id: job.measurement.id,
      dateCreated: job.measurement.creationDateTime,
      name: job.measurement.dmsMeasurementId ?? '',
      simulation: rgbs,
      isMultiAngle,
    };
  });

  return (
    <>
      <Table
        testId="dms-browser-jobs-table"
        initialColumns={columns as Column[]}
        data={data}
        className={classes.table}
        selectedRowId={selectedRowId}
        rowStyle={rowStyle}
        onRowClick={(row, index) => {
          onJobSelected?.(jobs[index]);
          setSelectedRowId(jobs[index].jobId);
        }}
        isNoRowStyle
      />
      <ConfirmationPopover
        open={Boolean(deleteButtonRef)}
        onClose={() => {
          setDeleteButtonRef(undefined);
        }}
        anchorEl={deleteButtonRef}
        message={t('messages.deleteJobConfirmation')}
        confirmText={t('labels.delete')}
        cancelText={t('labels.cancel')}
        onConfirm={() => {
          deleteJobHandler(deletingJobName);
          setDeleteButtonRef(undefined);
        }}
      />
    </>
  );
};

export default DMSBrowserTable;
