import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@material-ui/icons/Delete';
import { IconButton, makeStyles } from '@material-ui/core';

import ConfirmationPopover from '../../../components/ConfirmationPopover';

const useStyles = makeStyles((theme) => ({
  iconBtn: {
    padding: theme.spacing(0.5),
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(0.5),
    marginRight: theme.spacing(1.5),
    '& svg': {
      fontSize: theme.spacing(2),
    },
  },
  delete: {
    color: theme.palette.text.primary,
  },
}));

type Props<T> = {
  data: T;
  onConfirm: (data: T) => Promise<void>;
  loading?: boolean;
};

export default function DeleteButton<T>({ data, onConfirm, loading }: Props<T>) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLButtonElement>();

  const handleClose = () => {
    setDeleteAnchorEl(undefined);
  };

  return (
    <>
      <IconButton
        className={classes.iconBtn}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          setDeleteAnchorEl(e.currentTarget);
        }}
      >
        <DeleteIcon className={classes.delete} />
      </IconButton>
      <ConfirmationPopover
        anchorEl={deleteAnchorEl}
        onClose={handleClose}
        open={Boolean(deleteAnchorEl)}
        message="Are you sure you want to delete this list?"
        onConfirm={() => {
          onConfirm(data);
        }}
        confirmText={t('labels.delete')}
        cancelText={t('labels.cancel')}
        isLoading={loading}
      />
    </>
  );
}
