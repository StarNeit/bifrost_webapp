import { IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useSnackbar, SnackbarKey } from 'notistack';

import { Component } from '../types/component';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    background: theme.palette.action.active,
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
  dataTestId?: string,
  dataTestVariant?: string,
  snackId: SnackbarKey;
}

const SnackbarCloseAction: Component<Props> = ({
  snackId,
  dataTestId,
  dataTestVariant,
}: Props) => {
  const classes = useStyles();
  const { closeSnackbar } = useSnackbar();
  return (
    <IconButton
      data-testid={dataTestId}
      data-test-variant={dataTestVariant}
      disableRipple
      className={classes.iconButton}
      onClick={() => closeSnackbar(snackId)}
    >
      <CloseIcon />
    </IconButton>
  );
};

export default SnackbarCloseAction;
