import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles, Button, InputLabel, FormControl,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { Component } from '../../../types/component';
import LoadingContainer from '../../../components/LoadingContainer';
import InputField from '../../../components/InputField';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    height: theme.spacing(4),
    margin: theme.spacing(2),
  },
  button: {
    minWidth: theme.spacing(3),
    borderRadius: theme.spacing(4),
    justifyContent: 'center',
    alignContent: 'center',
    margin: theme.spacing(0.5),
    padding: theme.spacing(0),
    marginLeft: theme.spacing(2),
  },
  addButton: {
    height: theme.spacing(4),
    borderRadius: theme.spacing(1),
    justifyContent: 'center',
    alignContent: 'center',
    margin: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
  },
  select: {
    flex: 1,
  },
  half: {
    flex: 3,
  },
  check: {
    color: theme.palette.success.main,
  },
  close: {
    color: theme.palette.error.main,
  },
  label: {
    color: theme.palette.text.primary,
    marginTop: theme.spacing(-2),
    marginLeft: theme.spacing(1),
  },
}));

type Props = {
  handleUserAdded: (arg: string) => void;
  saving: boolean;
  disabled?: boolean;
}

const AddPrintApplication: Component<Props> = ({ handleUserAdded, saving, disabled }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [addUser, setAddUser] = useState(false);
  const [newUser, setNewUser] = useState<string>('');

  const clearNewUser = () => {
    setNewUser('');
    setAddUser(false);
  };

  const handleConfirm = () => {
    if (!newUser) return;
    handleUserAdded(newUser);
    clearNewUser();
  };

  if (!addUser && !saving) {
    return (
      <Button disableRipple variant="text" className={classes.addButton} disabled={disabled}>
        <AddIcon
          className={classes.container}
          onClick={() => setAddUser(true)}
        />
      </Button>
    );
  }

  return (
    <div className={classes.container}>
      <FormControl>
        <InputLabel className={classes.label}>{t('labels.newPrintApplication')}</InputLabel>
        <InputField
          dataTestId="add-print-application-input-name"
          value={newUser}
          onChange={(selection) => setNewUser(selection)}
          disabled={saving}
        />
      </FormControl>
      {
        saving
          ? (
            <Button disableRipple variant="text" disabled>
              <LoadingContainer fetching />
            </Button>
          ) : (
            <>
              <Button disableRipple variant="text" className={classes.button} onClick={handleConfirm}>
                <CheckIcon className={classes.check} />
              </Button>
              <Button disableRipple variant="text" className={classes.button} onClick={clearNewUser}>
                <CloseIcon className={classes.close} />
              </Button>
            </>
          )
      }

      <div className={classes.half} />
    </div>
  );
};

export default AddPrintApplication;
