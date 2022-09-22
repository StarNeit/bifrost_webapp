import { useState } from 'react';
import { makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@material-ui/icons/Delete';
import { Component } from '../../types/component';
import ConfirmationPopover from '../../components/ConfirmationPopover';

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: theme.spacing(3),
    borderRadius: theme.spacing(4),
    justifyContent: 'center',
    alignContent: 'center',
    margin: theme.spacing(0.5),
    padding: theme.spacing(0),
    marginLeft: theme.spacing(2),
  },
}));

type Props = {
  id: string,
  onDelete: (id: string) => void;
};

const Delete: Component<Props> = ({ id, onDelete }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [deleteButtonRef, setDeleteButtonRef] = useState<HTMLButtonElement | undefined>();

  const handleConfirm = () => {
    onDelete(id);
    setDeleteButtonRef(undefined);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDeleteButtonRef(event.currentTarget);
  };

  return (
    <>
      <Button disableRipple variant="text" className={classes.button} onClick={handleClick}>
        <DeleteIcon />
      </Button>
      <ConfirmationPopover
        open={Boolean(deleteButtonRef)}
        onClose={() => { setDeleteButtonRef(undefined); }}
        anchorEl={deleteButtonRef}
        message={t('messages.deleteUserConfirmation')}
        confirmText={t('labels.delete')}
        cancelText={t('labels.cancel')}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default Delete;
