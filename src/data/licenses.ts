import axios from 'axios';
import useSWR from 'swr';

export const useLicensesList = () => {
  const { data, error, isValidating } = useSWR('licenses-list', () => axios.get('licenses-credits/licenses_list.json'));
  return { data: data?.data, error, isValidating };
};

export const useLicense = (filename: string) => {
  const { data, error, isValidating } = useSWR(filename, () => axios.get(`licenses-credits/${filename}`));
  return { data: data?.data, error, isValidating };
};
