import { useCallback, useEffect } from 'react';

const useLeaveConfirmation = (enabled = true) => {
  const beforeUnloadHandler = useCallback((event: BeforeUnloadEvent) => {
    if (!enabled) return;

    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.returnValue = '';
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('beforeunload', beforeUnloadHandler);

    // eslint-disable-next-line consistent-return
    return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
  }, [enabled, beforeUnloadHandler]);
};

export default useLeaveConfirmation;
