import { makeStyles } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';

import { ChildrenProps, Component } from '../types/component';
import colors from '../theme/colors';
import SnackbarErrorIcon from './SnackbarErrorIcon';

const useStyles = makeStyles({
  success: { backgroundColor: `${colors.success.main} !important` },
  error: { backgroundColor: `${colors.error.main} !important` },
  warning: { backgroundColor: `${colors.warning.main} !important` },
  info: { backgroundColor: `${colors.info.main} !important` },
});

const SnackProvider: Component<ChildrenProps> = ({ children }: ChildrenProps) => {
  const classes = useStyles();
  return (
    <SnackbarProvider
      maxSnack={4}
      classes={{
        variantSuccess: classes.success,
        variantError: classes.error,
        variantWarning: classes.warning,
        variantInfo: classes.info,
      }}
      preventDuplicate
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      iconVariant={{
        error: <SnackbarErrorIcon />,
      }}
    >
      {children}
    </SnackbarProvider>
  );
};

export default SnackProvider;
