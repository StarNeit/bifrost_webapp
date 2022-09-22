import { CellProps } from 'react-table';
import { Button, makeStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';

import Delete from '../Delete';
import LoadingContainer from '../../../components/LoadingContainer';
import { UserColumn } from '.';

const useStyles = makeStyles((theme) => ({
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.spacing(8.13),
  },
  check: {
    color: theme.palette.success.main,
  },
  close: {
    color: theme.palette.error.main,
  },
  actionButton: {
    minWidth: theme.spacing(3),
    borderRadius: theme.spacing(4),
    justifyContent: 'center',
    alignContent: 'center',
    margin: theme.spacing(0.5),
    padding: theme.spacing(0),
    marginLeft: theme.spacing(2),
  },
}));

const ActionsCell = ({ value, row: { original } }: CellProps<UserColumn>) => {
  const classes = useStyles();

  if (value === 'addUser') return null;

  const {
    saveUser: saveRow,
    editingRow: editing,
    saving: isSaving,
    setEditingRow: setData,
    deleteUser,
  } = original;

  if (value === editing?.id) {
    if (isSaving) {
      return <LoadingContainer fetching />;
    }

    return (
      <div className={classes.actions}>
        <Button disableRipple variant="text" className={classes.actionButton} onClick={saveRow}>
          <CheckIcon className={classes.check} />
        </Button>
        <Button
          disableRipple
          variant="text"
          className={classes.actionButton}
          onClick={() => setData({
            id: undefined,
            fmsUserId: undefined,
            defaultACL: undefined,
            userRights: undefined,
          })}
        >
          <CloseIcon className={classes.close} />
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.actions}>
      <Delete id={value} onDelete={deleteUser} />
      <Button
        disableRipple
        variant="text"
        className={classes.actionButton}
        onClick={() => {
          setData({
            id: value,
            defaultACL: original.defaultACL,
            userRights: original.userRights?.map((right) => right.userRightType),
            fmsUserId: parseInt(original.fmsUserId ?? '', 10),
          });
        }}
      >
        <EditIcon />
      </Button>
    </div>
  );
};

export default ActionsCell;
