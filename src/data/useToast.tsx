import { useSnackbar, VariantType } from 'notistack';

import SnackbarCloseAction from '../components/SnackbarCloseAction';

const useToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showToast = (message: string, variant: VariantType) => {
    return enqueueSnackbar(message, {
      variant,
      autoHideDuration: 10000,
      persist: variant === 'error' || variant === 'warning',
      action: (key) => <SnackbarCloseAction dataTestId="close-snackbar" dataTestVariant={variant} snackId={key} />,
    });
  };

  return { showToast, closeToast: closeSnackbar };
};

export default useToast;
