import useSWR, { cache } from 'swr';
import axios from 'axios';
import {
  useEffect,
  useState,
} from 'react';
import type {
  AppearanceSample,
  Assortment,
  ColorApplicationDevice,
  ColorApplicationDeviceThicknessCalibration,
  Standard,
  Substrate,
} from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import CDISClient from './api/cdis.client';
import { WSClient } from './api/ws/WSClient';
import { createWSClient } from './api/ws/utils';
import config from '../config';
import { useSession } from './authentication';
import { Handlers } from './api/ws/types';
import useToast from './useToast';
import { useDebouncedCallback } from '../utils/utils';
import { isValue } from '../types/utils';
import { WorkspaceObject, WorkspaceEntry } from '../types/cdis';
import { refreshSessionExpiration } from './reducers/authentication';

const { CDIS_WS_URL, CDIS_URL } = config;

type FileParse<T> = [
  parse: (fileId: string, fileType: string, applicationId: string) => void,
  reset: () => void,
  progress: number,
  result: T | undefined,
  error: Error | undefined,
]

type WorkspaceCleaner = [
  clean: () => Promise<void>,
  error: Error | undefined,
]

export type WorkspaceData = {
  assortments?: WorkspaceEntry[],
  recipes?: WorkspaceEntry[],
  standards?: WorkspaceEntry[],
  substrates?: WorkspaceEntry[],
  thicknessobjects?: WorkspaceEntry[],
  trials?: WorkspaceEntry[],
};

type WorkspaceHook = [
  result: WorkspaceData | undefined,
  reset: () => void,
  error: Error | undefined,
  loading: boolean,
  isEmpty: boolean,
  getWorkspace: () => void,
];

type WorkspaceStandardsHook = {
  result: WorkspaceEntry[] | undefined,
  error: Error | undefined,
  loading: boolean,
  revalidate: () => Promise<boolean>,
};

type Import = [
  importWorkspaceObject: (
    objectType: WorkspaceObject,
    objectId: string,
    applicationId: string,
  ) => void,
  reset: () => void,
  progress: number,
  result: unknown,
  error: Error | undefined,
]

type ImportAll = {
  importWorkspaceObjects: (
    objectIds: {
      [key in WorkspaceObject]?: string[];
    },
  ) => Promise<void>,
  progress: number,
  loading: boolean,
  rejectedObjectIds: string[],
  importedObjectIds: string[],
  reset: () => void,
}

type ThicknessObject = ColorApplicationDevice & {
  thicknessCalibrations: ColorApplicationDeviceThicknessCalibration[]
};

type AnyWorkspaceObject = AppearanceSample | Assortment | Standard | Substrate | ThicknessObject;

type WorkspaceObjectPayload = {
  objectId: string;
  applicationId: string;
  objectType: string;
};

const fetcher = async (url: string, applicationId: string, sessionToken: string) => {
  return axios?.get(`${CDIS_URL}${url}`, {
    headers: {
      'x-application-id': applicationId,
      'xr-token': sessionToken,
    },
  }).then((res) => res.data);
};

export const useClient = (URL: string): { getClient: () => Promise<CDISClient> } => {
  let client: WSClient;
  let cdisClient: CDISClient;
  const dispatch = useDispatch();

  const getClient = async () => {
    if (!client || !client.isOpen()) {
      client = await createWSClient(URL);
      cdisClient = new CDISClient(client);
      dispatch(refreshSessionExpiration());
    }
    return cdisClient;
  };

  useEffect(() => {
    return () => client?.close();
  }, []);

  return { getClient };
};

export function useFileParse<T>(externalHandlers: Handlers<unknown>): FileParse<T> {
  const session = useSession();
  const [error, setError] = useState<Error | undefined>();
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<T>();

  const { getClient } = useClient(`${CDIS_WS_URL}?xr-token=${session.token}`);

  const handlers = {
    error: (e: Error) => { setError(e); externalHandlers.error?.(e); },
    progress: (value: number) => { setProgress(value); externalHandlers.progress?.(value); },
    results: (res: unknown) => {
      // TODO: validate res
      setResults(res as T);
      externalHandlers.results?.(res);
    },
  };

  function reset() {
    setResults(undefined);
    setProgress(0);
    setError(undefined);
  }
  const parse = async (fileId: string, fileType: string, applicationId: string) => {
    const client = await getClient();
    const payload = {
      fileId,
      applicationId,
      fileType: fileType.toUpperCase(),
    };
    client.parseFile(payload, handlers);
  };

  return [
    parse,
    reset,
    progress * 100,
    results,
    error,
  ];
}

export function useImportAll(applicationId: string): ImportAll {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const session = useSession();

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const [importedObjectIds, setImportedObjectIds] = useState<string[]>([]);
  const [rejectedObjectIds, setRejectedObjectIds] = useState<string[]>([]);

  const resetProgress = useDebouncedCallback(() => setProgress(0), 1000);

  const { getClient } = useClient(`${CDIS_WS_URL}?xr-token=${session.token}`);

  const reset = () => {
    setProgress(0);
    setLoading(false);
    setImportedObjectIds([]);
    setRejectedObjectIds([]);
  };

  // 1. Standards, 2. Substrates, 3. Assortments, 4. Recipes, 5. Trials, 6. Thickness Objects
  const importWorkspaceObjects = async (
    workspaceObjects: {
      [key in WorkspaceObject]?: string[];
    },
  ) => {
    reset();
    setLoading(true);

    const client = await getClient();

    const importPayload = (id: string, objectType: WorkspaceObject) => new Promise<
      WorkspaceObjectPayload
    >((resolve, reject) => {
      const payload = {
        objectId: id,
        objectType,
        applicationId,
      };

      client.import(payload, {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        progress: () => {},
        results: () => resolve(payload),
        error: (e) => reject(e),
      });
    });

    // Separates percentage for each entity
    // Ex. 5 entities -> 100 / (5 + 1) = 16.67%, so each imported entity gives around 16% progress
    const eachObjectPercentage = 100 / (Object.keys(workspaceObjects).length + 1);

    const processPayloads = async (
      objectIds: string[],
      objectType: WorkspaceObject,
      error: string,
      success: string,
    ) => {
      const promises = objectIds.map((id) => importPayload(id, objectType));

      const response = await Promise.allSettled(promises);
      response.forEach((result) => {
        if (result.status === 'rejected') {
          showToast(
            t(`messages.${error}`, {
              reason: result.reason,
            }),
            'error',
          );
        }
      });

      setProgress((prevProgress) => (
        Number(Math.min(1, prevProgress + (eachObjectPercentage / 100)).toFixed(2))
      ));

      setImportedObjectIds((prevImportedObjectIds) => ([
        ...prevImportedObjectIds,
        ...response
          .filter((res): res is PromiseFulfilledResult<WorkspaceObjectPayload> => res.status === 'fulfilled')
          .map((res) => res.value.objectId),
      ]));

      setRejectedObjectIds((prevRejectedObjectIds) => ([
        ...prevRejectedObjectIds,
        ...response
          .map((res, index) => {
            if (res.status === 'rejected') return index;
            return null;
          })
          .filter(isValue)
          .map((index) => objectIds[index]),

      ]));

      const hasFulfilled = response.some((entry) => entry.status === 'fulfilled');

      if (hasFulfilled) {
        showToast(t(`messages.${success}`), 'success');
      }
    };

    if (workspaceObjects.standards?.length) {
      await processPayloads(workspaceObjects.standards, 'standards', 'standardImportError', 'standardsImportSuccess');
    }

    if (workspaceObjects.substrates?.length) {
      await processPayloads(workspaceObjects.substrates, 'substrates', 'substrateImportError', 'substratesImportSuccess');
    }

    if (workspaceObjects.assortments?.length) {
      await processPayloads(workspaceObjects.assortments, 'assortments', 'assortmentImportError', 'assortmentsImportSuccess');
    }

    if (workspaceObjects.recipes?.length) {
      await processPayloads(workspaceObjects.recipes, 'recipes', 'recipeImportError', 'recipesImportSuccess');
    }

    if (workspaceObjects.trials?.length) {
      await processPayloads(workspaceObjects.trials, 'trials', 'trialImportError', 'trialsImportSuccess');
    }

    if (workspaceObjects.thicknessobjects?.length) {
      await processPayloads(workspaceObjects.thicknessobjects, 'thicknessobjects', 'thicknessObjectImportError', 'thicknessObjectsImportSuccess');
    }

    // finish the progress
    setProgress(1);
    setLoading(false);

    // reset the progress after certain amount of time
    resetProgress();
  };

  return {
    importWorkspaceObjects,
    progress: progress * 100,
    loading,
    importedObjectIds,
    rejectedObjectIds,
    reset,
  };
}

export function useImport(applicationId: string): Import {
  const session = useSession();
  const [error, setError] = useState<Error | undefined>();
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState();

  const { getClient } = useClient(`${CDIS_WS_URL}?xr-token=${session.token}`);

  const handlers = {
    error: (err: Error) => {
      setError(err);
      setResults(undefined);
      setProgress(0);
    },
    progress: setProgress,
    results: setResults,
  };

  function reset() {
    setResults(undefined);
    setProgress(0);
    setError(undefined);
  }

  const importWorkspaceObject = async (
    objectType: WorkspaceObject,
    objectId: string,
  ) => {
    setProgress(0.001);
    const client = await getClient();
    const payload = {
      objectId,
      objectType,
      applicationId,
    };
    client.import(payload, handlers);
  };

  return [
    importWorkspaceObject,
    reset,
    progress * 100,
    results,
    error,
  ];
}

export function useWorkspaceCleaner(applicationId: string): WorkspaceCleaner {
  const session = useSession();
  const [error, setError] = useState<Error>();

  const clean = async () => {
    setError(undefined);
    try {
      await axios.delete(`${CDIS_URL}/workspace`, {
        headers: {
          'xr-token': session.token,
          'x-application-id': applicationId,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      throw new Error('Workspace cleanup failed');
    }
  };

  return [clean, error];
}

type WorkspaceStandardDetailsHook = {
  result: Standard | undefined,
  error: Error | undefined,
  loading: boolean,
};

export function useGetStandardDetails(appId: string, id?: string): WorkspaceStandardDetailsHook {
  const session = useSession();
  const endpoint = id ? `/workspace/standards/${id}` : null;
  const {
    data: result,
    error,
    isValidating: loading,
  } = useSWR(endpoint, (url: string) => fetcher(url, appId, session.token), {
    revalidateOnFocus: false,
  });

  return {
    result,
    loading,
    error,
  };
}

type WorkspaceSubstrateDetailsHook = {
  result: Substrate | undefined,
  error: Error | undefined,
  loading: boolean,
};

export function useGetSubstrateDetails(appId: string, id?: string): WorkspaceSubstrateDetailsHook {
  const session = useSession();
  const endpoint = id ? `/workspace/substrates/${id}` : null;
  const {
    data: result,
    error,
    isValidating: loading,
  } = useSWR(endpoint, (url: string) => fetcher(url, appId, session.token), {
    revalidateOnFocus: false,
  });

  return {
    result,
    loading,
    error,
  };
}

export function useGetStandards(appId: string): WorkspaceStandardsHook {
  const session = useSession();
  const {
    data: result,
    isValidating: loading,
    error,
    revalidate,
  } = useSWR(['/workspace/standards', appId], (url) => fetcher(url, appId, session.token), {
    revalidateOnFocus: false,
  });

  return {
    result,
    loading,
    error,
    revalidate,
  };
}

export function useGetSubstrates(appId: string): WorkspaceStandardsHook {
  const session = useSession();
  const {
    data: result,
    isValidating: loading,
    error,
    revalidate,
  } = useSWR('/workspace/substrates', (url) => fetcher(url, appId, session.token), {
    revalidateOnFocus: false,
  });

  return {
    result,
    loading,
    error,
    revalidate,
  };
}

export function useGetWorkspace(applicationId: string): WorkspaceHook {
  const session = useSession();
  const [error, setError] = useState<Error>();
  const [result, setResult] = useState<WorkspaceData>();
  const [isEmpty, setIsEmpty] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setError(undefined);
    setResult(undefined);
    setIsEmpty(true);
    setLoading(false);
  }
  async function getWorkspaceObjects() {
    setError(undefined);
    setLoading(true);
    try {
      const response = await axios.get<unknown>(`${CDIS_URL}/workspace`, {
        headers: {
          'xr-token': session.token,
          'x-application-id': applicationId,
        },
      });
      // TODO: verify instead of cast
      const availableObjects = response.data as WorkspaceObject[] | undefined;
      if (Array.isArray(availableObjects)) {
        const getObject = async (item: WorkspaceObject) => {
          const objectResponse = await axios.get(`${CDIS_URL}/workspace/${item}`, {
            headers: {
              'xr-token': session.token,
              'x-application-id': applicationId,
            },
          });
          return objectResponse.data;
        };

        const availableObjectsData = await Promise.all(availableObjects.map(getObject));
        let emptyObjects = 0;
        const objects = availableObjects.reduce(
          (acc, object, index) => {
            emptyObjects = availableObjectsData[index].length === 0
              ? emptyObjects + 1
              : emptyObjects;
            acc[object] = availableObjectsData[index];
            return acc;
          }, {} as WorkspaceData,
        );
        if (emptyObjects === availableObjectsData.length) {
          setIsEmpty(true);
        } else {
          setIsEmpty(false);
        }
        setResult(objects);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }
  return [result, reset, error, loading, isEmpty, getWorkspaceObjects];
}

export function useWorkspaceObject(
  applicationId?: string,
  objectId?: string,
  objectType?: WorkspaceObject,
) {
  const session = useSession();
  const key = (objectType && objectId) ? `${objectType}/${objectId}` : null;

  const {
    data,
    error,
    isValidating,
  } = useSWR(
    key,
    // TODO: validate data
    () => axios.get<AnyWorkspaceObject>(`${CDIS_URL}/workspace/${objectType}/${objectId}`, {
      headers: {
        'x-application-id': applicationId,
        'xr-token': session.token,
      },
    }),
    { revalidateOnMount: !cache.has(key) },
  );

  const result = data?.data;
  const loading = isValidating;

  return [result, error, loading] as const;
}
