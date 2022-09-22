import useSWR from 'swr';
import { getDevices } from './api/fms';

import { useSession } from './authentication';

const useUserDevices = () => {
  const session = useSession();
  const { data, isValidating } = useSWR('devices', () => getDevices(session.token));

  return {
    devices: data,
    loading: isValidating,
  };
};

export default useUserDevices;
