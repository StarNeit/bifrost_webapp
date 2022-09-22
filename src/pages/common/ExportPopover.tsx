import { ComponentProps } from 'react';
import {
  Typography,
  Button,
  DialogContent,
  DialogActions,
  Popover,
  makeStyles,
  CircularProgress,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Component } from '../../types/component';
import Select from '../../components/Select';
import { FileFormat } from '../../data/api/appearanceDataExportService';

const useStyles = makeStyles((theme) => ({
  popover: {
    marginTop: theme.spacing(2.5),
    overflow: 'visible',
    background: theme.palette.background.paper,
    '-webkit-filter': `drop-shadow(0 0 1px ${theme.palette.action.active})`,
    filter: `drop-shadow(0 0 1px ${theme.palette.action.active})`,

    '&::before': {
      content: "''",
      width: theme.spacing(3),
      height: theme.spacing(2),
      position: 'absolute',
      top: 0,
      left: `calc(50% - ${theme.spacing(3)}px)`,
      right: '50%',
      marginTop: theme.spacing(-2),
      borderLeft: `${theme.spacing(3)}px solid transparent`,
      borderRight: `${theme.spacing(3)}px solid transparent`,
      borderBottom: `${theme.spacing(3)}px solid ${theme.palette.background.paper}`,
    },
  },
  successText: {
    color: theme.palette.success.main,
  },
  errorText: {
    color: theme.palette.error.main,
  },
  message: {
    marginBottom: theme.spacing(3),
  },
}));

type Props = ComponentProps<typeof Popover> & {
  onClose: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  selectedFileFormat?: FileFormat;
  setFileFormat: (arg: FileFormat) => void;
  availableFileFormats?: FileFormat[];
  message?: string;
  actionLabel?: string;
};

const ExportPopover: Component<Props> = ({
  open,
  onClose,
  anchorEl,
  onExport,
  isLoading,
  setFileFormat,
  selectedFileFormat,
  availableFileFormats,
  message,
  actionLabel,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const popoverMessage = message || t<string>('messages.selectFileFormat');
  const popoverActionLabel = actionLabel || t<string>('labels.export');
  return (
    <Popover
      data-testid="confirmation-popover"
      PaperProps={{
        className: classes.popover,
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
    >
      <DialogContent>
        <Typography
          data-testid="confirmation-popover-message"
          variant="body1"
          className={classes.message}
        >
          {popoverMessage}
        </Typography>
        <Select
          isFullWidth
          id="file-format-select"
          instanceId="file-format-select"
          data={availableFileFormats}
          disabled={!availableFileFormats}
          isMulti={false}
          idProp="id"
          labelProp={(fileFormat) => fileFormat.metadata.name}
          value={selectedFileFormat}
          onChange={setFileFormat}
        />
      </DialogContent>
      <DialogActions>
        <Button
          data-testid="confirmation-popover-cancel"
          variant="text"
          color="primary"
          onClick={onClose}
          className={classes.errorText}
        >
          {t('labels.cancel')}
        </Button>
        <Button
          data-testid="confirmation-popover-confirm"
          className={classes.successText}
          variant="text"
          onClick={onExport}
        >
          {
            isLoading
              ? (
                <CircularProgress size="24px" color="inherit" />
              )
              : popoverActionLabel
          }
        </Button>
      </DialogActions>
    </Popover>
  );
};

export default ExportPopover;
