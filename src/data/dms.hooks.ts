import gql from 'graphql-tag';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Measurement } from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';

import { createClient } from './api/appsync.client';
import { useSession } from './authentication';
import { convertDmsMeasurementToDomainModel } from '../utils/dmsDataConverter';
import config from '../config';
import useToast from './useToast';
import { DmsMeasurementData } from '../types/dms';
import { refreshSessionExpiration } from './reducers/authentication';

export const useDmsGraphQLClient = () => {
  const session = useSession();
  const dispatch = useDispatch();

  const client = useMemo(() => {
    dispatch(refreshSessionExpiration());
    return createClient({
      token: session.token,
      awsConfig: {
        appSyncUri: config.DMS.url,
        region: 'us-east-1', // it doesn't matter since we use the full-fledged URL
        appSyncKey: config.DMS.apikey,
      },
    });
  }, [session.token]);
  return { client };
};

type Device = {
  model: string;
  deviceType: string;
  serialNumber: string;
};

type GetJobs = {getJobs: DmsMeasurementData[]};
type GetJobById = {getJobById: DmsMeasurementData};

export const useJobs = (
  device?: Device,
) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { client } = useDmsGraphQLClient();
  const [result, setResult] = useState<{ measurement: Measurement, jobId: string }[]>([]);
  const [error, setError] = useState<unknown>();
  const [fetching, setFetching] = useState(false);

  async function query(cache = true) {
    setError(undefined);
    setResult([]);
    setFetching(true);
    try {
      const colorValuesQuery = `{
        geometry
        lab {
          l
          a
          b
          illuminant
          observer
        }
        spectral {
          values
          wavelengthInterval
          wavelengthStart
        }
        illumination
        filter
        gloss
      }`;
      const response = await client?.query<GetJobs, never>({
        query: gql(`query GetJobs {
            getJobs(deviceType: "${device?.deviceType}", deviceSerialNumber: "${device?.serialNumber}") {
              jobId
              device {
                type
                serialNumber
              }
              measurementSet {
                id
                name
                creationTimestamp
                measurements {
                  colorValues {
                    ma9x ${colorValuesQuery}
                    xrga ${colorValuesQuery}
                    mat ${colorValuesQuery}
                    byk ${colorValuesQuery}
                  }
                  imageValues {
                    geometry
                    textureValues {
                      name
                      value
                      version
                    }
                    image {
                      filename
                      formats
                    }
                  }
                  temperature
                  timestamp
                }
              }
              deviceType
              deviceSerialNumber
            }
          }`),
        fetchPolicy: cache ? undefined : 'no-cache',
      });
      const converted = response?.data.getJobs.map((data) => ({
        measurement: convertDmsMeasurementToDomainModel(data),
        jobId: data.jobId,
      }));
      setResult(converted);
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
      setError(err);
    } finally {
      setFetching(false);
    }
  }

  const deleteJob = async (jobId: string) => {
    const response = await client.mutate({
      mutation: gql(`mutation deleteJobById {
        deleteJobById(jobId: "${jobId}") {
          jobId
        }
      }`),
    });

    if (response.errors) {
      showToast(t('messages.jobDeletionError'), 'error');
    } else {
      await query(false);
      showToast(t('messages.jobDeletionSuccess'), 'success');
    }
  };

  useEffect(() => {
    if (device) {
      query();
    }
  }, [
    client,
    device,
  ]);
  return {
    result,
    error,
    fetching,
    deleteJob,
  };
};

export const useJob = (
  variables: { id: UUID, calibrationStandard: string },
) => {
  const { client } = useDmsGraphQLClient();
  const [result, setResult] = useState<Measurement | undefined>();
  const [error, setError] = useState<unknown>();
  const [fetching, setFetching] = useState(false);
  useEffect(() => {
    async function query() {
      setError(undefined);
      setFetching(true);
      try {
        const response = await client?.query<GetJobById, never>({
          query: gql(`query GetJobById {
            getJobById(jobId: "${variables.id}") {
              jobId
              device {
                type
                serialNumber
              }
              measurementSet {
                id
                name
                creationTimestamp
                measurements {
                  colorValues {
                    ${variables.calibrationStandard} {
                      geometry
                      lab {
                        l
                        a
                        b
                        illuminant
                        observer
                      }
                      spectral {
                        values
                        wavelengthInterval
                        wavelengthStart
                      }
                    }
                  }
                  imageValues {
                    geometry
                    textureValues {
                      name
                      value
                      version
                    }
                    image {
                      filename
                      formats
                    }
                  }
                  temperature
                  timestamp
                }
              }
              deviceType
              deviceSerialNumber
            }
          }`),
        });
        const converted = convertDmsMeasurementToDomainModel(response.data.getJobById);
        setResult(converted);
      } catch (err) {
        setError(err);
      } finally {
        setFetching(false);
      }
    }
    query();
  }, [client, variables.id, variables.calibrationStandard]);
  return {
    result,
    error,
    fetching,
  };
};

export function useDeviceJobUpdate() {
  const [error, setError] = useState<Error | undefined>();
  const [results, setResults] = useState();
  const { client } = useDmsGraphQLClient();

  const query = gql(`subscription OnDeviceJobUpdate {
    onDeviceJobUpdate(deviceType: "MA-Tx", deviceSerialNumber: "4000128") {
      jobId
    }
  }`);

  const observer = client?.subscribe({ query });
  useEffect(() => {
    const subscription = observer?.subscribe({
      next: ({ data }) => setResults(data),
      error: (err) => setError(err),
    });

    return () => subscription?.unsubscribe();
  }, []);
  return {
    error,
    results,
  };
}
