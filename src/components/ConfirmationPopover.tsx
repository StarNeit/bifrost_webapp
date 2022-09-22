import { ComponentProps } from 'react';
import {
  DialogTitle,
  Button,
  DialogContent,
  DialogActions,
  Popover,
  makeStyles,
  CircularProgress,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import clsx from 'clsx';
import { Component } from '../types/component';
import { Body } from './Typography';

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
}));

type Props = Omit<ComponentProps<typeof Popover>, 'onClose'> & {
  message: string,
  onClose?: React.MouseEventHandler<HTMLButtonElement>,
  onBackdropClose?: () => void,
  cancelText?: string,
  confirmText?: string,
  onConfirm?: React.MouseEventHandler<HTMLButtonElement>,
  isDestructive?: boolean,
  isLoading?: boolean,
};

const ConfirmationPopover: Component<Props> = ({
  open,
  onClose,
  onBackdropClose = onClose,
  anchorEl,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  isLoading,
  isDestructive = true,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

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
      onClose={onBackdropClose}
      anchorEl={anchorEl}
    >
      {title && (
        <DialogTitle>{title}</DialogTitle>
      )}
      <DialogContent>
        <Body data-testid="confirmation-popover-message" variant="body1">
          {message}
        </Body>
      </DialogContent>
      <DialogActions>
        <Button
          data-testid="confirmation-popover-cancel"
          variant="text"
          color="primary"
          onClick={onClose}
        >
          {cancelText ?? t('labels.cancel')}
        </Button>
        <Button
          data-testid="confirmation-popover-confirm"
          className={clsx({
            [classes.successText]: !isDestructive,
            [classes.errorText]: isDestructive,
          })}
          variant="text"
          onClick={onConfirm}
        >
          {(!isLoading && confirmText) ?? t('labels.ok')}
          {isLoading && (
            <CircularProgress size="24px" color="inherit" />
          )}
        </Button>
      </DialogActions>
    </Popover>
  );
};

export default ConfirmationPopover;
