import { MouseEvent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { useTranslation } from 'react-i18next';

import ConfirmationPopover from '../../../components/ConfirmationPopover';
import { Component } from '../../../types/component';

const useStyles = makeStyles((theme) => ({
  btn: {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(1),
  },
  icon: {
    fontSize: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}));

type Props = {
  onConfirm: () => void;
  message: string,
}

const Action: Component<Props> = ({
  onConfirm,
  message,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenConfirmDialog = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirm = () => {
    onConfirm();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        className={classes.btn}
        onClick={handleOpenConfirmDialog}
      >
        <DeleteIcon className={classes.icon} />
      </IconButton>

      <ConfirmationPopover
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        message={message}
        onConfirm={handleConfirm}
        confirmText={t('labels.delete')}
        cancelText={t('labels.cancel')}
      />
    </>
  );
};

export default Action;
