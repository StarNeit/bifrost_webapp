import { v4 as uuid } from 'uuid';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppearanceSample,
  Assortment,
  CalibrationCondition,
  Colorant,
  Industry,
  Measurement,
  MeasurementCondition,
  MeasurementSample,
  Spectrum,
  Standard,
  SubIndustry,
  Substrate,
  Tolerance,
  BasicMaterial as BasicMaterialDM,
  User,
  UserRight,
} from '@xrite/cloud-formulation-domain-model';
import { useClient } from 'urql';

import useToast from '../useToast';
import { storeTestData } from '../../utils/test-utils';
import {
  AddStandardMutationVariables,
  ColorFilterIn,
  GetAppearanceSampleDocument,
  useAddAppearanceSampleMutation,
  useAddColorantMutation,
  useAddStandardMutation,
  useAddSubstrateMutation,
  useAddUserMutation,
  useAddUserGroupMutation,
  useAssortmentColorantsQuery,
  useAssortmentQuery,
  useDeleteAppearanceSampleMutation,
  useDeleteStandardMutation,
  useDeleteSubstrateMutation,
  useDeleteUsersMutation,
  useGetAppearanceSampleQuery,
  useGetAppearanceSamplesByStandardQuery,
  useGetSubstrateQuery,
  useListAssortmentsQuery,
  useListStandardsQuery,
  useListSubstratesQuery,
  useStandardQuery,
  useDeleteUserGroupsMutation,
  StandardQueryVariables,
  useGetAccessControlListsQuery,
  useAddAccessControlListMutation,
  useDeleteAccessControlListsMutation,
  useBasicMaterialQuery,
  useAddPrintApplicationMutation,
  useAddAccessControlListEntryMutation,
  useDeleteAccessControlListEntryMutation,
  AddAccessControlListEntryMutationVariables,
  useAssignUserToUserGroupMutation,
  useUnassignUserFromUserGroupMutation,
  useGetUserGroupQuery,
  useUpdateAppearanceSampleMutation,
  useUpdateAccessControlListMutation,
  AccessControlListIn,
  useUpdateUserGroupMutation,
  useGetAccessControlListQuery,
  useUpdateStandardMutation,
  useUpdateSubstrateMutation,
  MeasurementIn,
  ToleranceIn,
  AddColorantMutationVariables,
  useListColorAdQuery,
  CalibrationConditionIn,
  CalibrationParameterIn,
  useAddTagMutation,
  useRemoveTagMutation,
  ColorantIn,
  useGetUsersQuery,
  UserIn,
  useModifyUserMutation,
} from './graphql/generated';
import { ACL, ACLEntry, PartialACL } from '../../types/acl';
import { isNumber, isString, isValue } from '../../types/utils';

/** Throws if data is not an array or contains falsy elements. */
export function parseArray<T>(
  type: { parse: (data: Record<string, unknown>) => T },
  data: unknown,
) {
  if (!Array.isArray(data) || !data.every(Boolean)) throw new Error('Invalid data');
  return data.map((value) => type.parse(value));
}

export interface AssortmentData {
  id: string;
  name: string;
  industry: Industry;
  subIndustry: SubIndustry;
  calibrationConditions: CalibrationCondition[];
  defaultSubstrate: {
    id: string;
  }
}

export const useAssortments = () => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useListAssortmentsQuery();
  const { data, fetching, error } = result;
  const fetchedAssortments = data?.getAssortment;

  if (error) {
    showToast('Error while fetching assortments.', 'error');
  }

  const assortments = useMemo(() => fetchedAssortments
    ?.map((assortment) => ({
      id: assortment?.id,
      industry: assortment?.industry,
      name: assortment?.name,
      subIndustry: assortment?.subIndustry,
      defaultSubstrate: assortment?.defaultSubstrate,
      calibrationConditions: parseArray(
        CalibrationCondition,
        assortment?.calibrationConditions,
      ),
    }))
    .filter(
      (assortment): assortment is AssortmentData => Boolean(assortment?.id
        && assortment?.industry
        && assortment?.name
        && assortment?.subIndustry
        && assortment.calibrationConditions),
    ), [fetchedAssortments]);

  return {
    result: assortments,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useAssortment = (id?: UUID) => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useAssortmentQuery({
    variables: { id },
    pause: Boolean(!id),
  });
  const { data, fetching, error } = result;

  const assortment = useMemo(
    () => {
      const assortmentData = data?.getAssortment?.[0];
      if (!assortmentData) return undefined;
      if (assortmentData.id !== id) return undefined;
      return Assortment.parse({
        ...assortmentData,
        colorants: [],
      });
    },
    [data, id],
  );

  if (error) {
    showToast('Error while fetching assortment.', 'error');
  }

  return {
    result: assortment,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useColorants = (id?: UUID) => {
  const { showToast } = useToast();
  const variables = { id };
  const [result, reExecuteQuery] = useAssortmentColorantsQuery({
    variables,
    pause: Boolean(!id),
  });
  const { data, fetching, error } = result;

  if (error) {
    showToast('Error while fetching colorants.', 'error');
  }

  // TODO: good idea for other typing if are causing error
  const colorants = useMemo(
    () => {
      const assortmentData = data?.getAssortment?.[0];
      if (!assortmentData?.colorants) return undefined;
      if (assortmentData.id !== id) return undefined;
      const assortmentColorants = parseArray(Colorant, assortmentData.colorants);
      storeTestData('assortmentColorants', assortmentColorants);
      return assortmentColorants;
    },
    [data, id],
  );

  return {
    result: colorants,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useAddColorant = () => {
  const [result, add] = useAddColorantMutation();

  const addColorant = async (colorant: Colorant, parentId: string) => {
    const colorantIn: ColorantIn = {
      ...colorant,
      components: colorant.components.map((comp) => ({
        concentrationPercentage: comp.concentrationPercentage,
        basicMaterial: comp.basicMaterial as BasicMaterialDM,
      })),
      calibrationParameters: colorant.calibrationParameters
        .map(({ type, calibrationConditionId, data }) => {
          if (data instanceof Spectrum) {
            return {
              type,
              calibrationConditionId,
              spectralData: data,
            };
          }

          return {
            type,
            calibrationConditionId,
            values: data.values,
          };
        }),
    };

    const colorantVariables: AddColorantMutationVariables = {
      colorant: colorantIn,
      parentId,
    };

    await add(colorantVariables);
  };

  return {
    result,
    addColorant,
  };
};

type StandardsData = {
  id: string;
  name: string;
}[];
export const useStandards = () => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useListStandardsQuery();
  const { data, fetching, error } = result;
  const fetchedStandards = data?.listStandards;

  if (error) {
    showToast('Error while fetching standards.', 'error');
  }

  const standards: StandardsData = [];
  fetchedStandards?.forEach((standard) => {
    if (!standard?.id || !standard?.name) return;

    standards.push({
      id: standard.id,
      name: standard.name,
    });
  });

  return {
    result: standards,
    reExecuteQuery,
    error,
    fetching,
  };
};
// this hook is a temporary hook used for the search standard screen ...
// ... until refactoring of the main useStandards hook is done
type StandardWithNewAPIVariables = Pick<StandardQueryVariables, 'colorFilter'>
export const useStandardsWithNewAPI = (
  {
    pause: pauseFromProps = true,
    variables: variablesFromProps,
  }: { pause?: boolean, variables?: StandardWithNewAPIVariables },
) => {
  const { showToast } = useToast();

  const [variables, setVariables] = useState(variablesFromProps);
  const [pause, setPause] = useState(pauseFromProps);

  const [result, reExecuteQuery] = useStandardQuery({ variables, pause, requestPolicy: 'network-only' });
  const { data, fetching, error } = result;

  const fetchedStandards = data?.getStandard;

  if (error) {
    showToast('Error while fetching standards.', 'error');
  }

  const standards: (Standard[] | undefined) = useMemo(
    () => fetchedStandards?.map<Standard | undefined>((standard) => {
      if (!standard) return undefined;

      return Standard.parse(standard);
    }).filter(isValue) as Standard[] ?? [],
    [data, variables?.colorFilter],
  );

  const getStandards = (newVariables?: StandardQueryVariables) => {
    setPause(false);
    setVariables(newVariables);
  };

  return {
    standards,
    reExecuteQuery,
    getStandards,
    error,
    fetching,
  };
};

const transformMeasurementConditionForMutation = (condition: MeasurementCondition) => ({
  description: condition.description,
  geometry: condition.geometry,
  illumination: condition.illumination,
  transformation: condition.transformation,
});

const transformMeasurementSampleForMutation = (sample: MeasurementSample) => ({
  ...sample,
  measurementCondition: transformMeasurementConditionForMutation(sample.measurementCondition),
});

const transformMeasurementForMutation = (measurement: Measurement) => ({
  ...measurement,
  measurementSamples: measurement.measurementSamples.map(transformMeasurementSampleForMutation),
});

const transformMeasurementsForMutation = (
  measurements: Measurement[],
) => measurements.map(transformMeasurementForMutation);

export const useStandard = (
  variables?: { id?: UUID, name?: string, measurements?: [Measurement] },
) => {
  const { showToast } = useToast();

  const [insertResult, insert] = useAddStandardMutation();
  const [removalResult, remove] = useDeleteStandardMutation();
  const [updateResult, update] = useUpdateStandardMutation();

  const [result, reExecuteQuery] = useStandardQuery({
    variables,
    pause: Boolean(!variables?.id),
  });

  const { data, fetching, error } = result;

  const standard = useMemo(
    () => {
      const standardData = data?.getStandard?.[0];
      if (!standardData) return undefined;
      if (standardData.id !== variables?.id) return undefined;
      return Standard.parse(standardData);
    },
    [data, variables?.id],
  );

  const createStandard = async (standardIn: Pick<Standard, 'id' | 'name' | 'measurements' | 'creationDateTime' | 'aclId' | 'tolerances'>) => {
    const standardForDB: unknown = {
      id: standardIn.id,
      name: standardIn.name,
      creationDateTime: standardIn.creationDateTime,
      aclId: standardIn.aclId,
      measurements: transformMeasurementsForMutation(standardIn.measurements),
      tolerances: standardIn.tolerances,
    };
    await insert(standardForDB as AddStandardMutationVariables);
  };

  const updateStandard = async (args: {
    id: string;
    name: string;
    measurements: Measurement[];
    aclId?: string;
    tolerances: Tolerance[];
  }) => {
    const {
      id, name, measurements, aclId, tolerances,
    } = args;

    await update({
      standardIn: {
        id,
        creationDateTime: new Date().toISOString(), // this is not considered when doing update
        name,
        measurements: measurements as unknown as MeasurementIn[],
        aclId,
        tolerances: tolerances as ToleranceIn[],
      },
    });
  };

  // TODO: add translations
  if (error) {
    showToast('Error while fetching standard.', 'error');
  }

  if (insertResult.error) {
    showToast('Error while saving standard.', 'error');
  }

  if (removalResult.error) {
    showToast('Error while deleting standard.', 'error');
  }

  if (updateResult.error) {
    showToast('Error while updating standard.', 'error');
  }

  return {
    result: standard,
    reExecuteQuery,
    error,
    fetching,
    mutation: [createStandard, insertResult] as const,
    removal: [remove, removalResult] as const,
    update: [updateStandard, updateResult] as const,
  };
};

// TODO: this is not revalidated
export interface SubstratesData {
  id: string;
  name: string;
  calibrationConditions: CalibrationCondition[];
  measurements: Measurement[];
}
export const useSubstrates = () => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useListSubstratesQuery();
  const { data, fetching, error } = result;
  const fetchedSubstrates = data?.getSubstrate;

  if (error) {
    showToast('Error while fetching substrates.', 'error');
  }

  const substrates = useMemo(
    () => fetchedSubstrates
      ?.map((substrate) => ({
        id: substrate?.id,
        name: substrate?.name,
        calibrationConditions: parseArray(
          CalibrationCondition,
          substrate?.calibrationConditions,
        ),
        measurements: parseArray(
          Measurement,
          substrate?.measurements,
        ),
      }))
      .filter((substrate): substrate is SubstratesData => Boolean(
        substrate?.id
        && substrate?.name
        && substrate?.calibrationConditions
        && substrate.measurements,
      )),
    [fetchedSubstrates],
  );

  return {
    result: substrates,
    reExecuteQuery,
    error,
    fetching,
  };
};

export const useSubstrate = (
  substrateId?: string,
) => {
  const { showToast } = useToast();

  const [updateResult, update] = useUpdateSubstrateMutation();
  const [mutationResult, mutate] = useAddSubstrateMutation();
  const [removalResult, remove] = useDeleteSubstrateMutation();

  const [result, reExecuteQuery] = useGetSubstrateQuery({
    variables: { id: substrateId },
    pause: Boolean(!substrateId),
  });
  const { data, fetching, error } = result;

  const substrate = useMemo(
    () => {
      const substrateData = data?.getSubstrate?.[0];
      if (!substrateData) return undefined;
      if (substrateData.id !== substrateId) return undefined;
      return Substrate.parse(substrateData);
    },
    [data, substrateId],
  );

  if (error) {
    showToast('Error while fetching substrate.', 'error');
  }
  if (removalResult?.error) {
    showToast('Error while deleting substrate.', 'error');
  }

  if (updateResult.error) {
    showToast('Error while updating substrate.', 'error');
  }

  const updateSubstrate = async ({
    id,
    measurements,
    name,
    aclId,
    calibrationConditions,
    calibrationParameters,
  }: {
    id: string;
    aclId?: string;
    name: string;
    measurements: Measurement[];
    calibrationConditions?: CalibrationCondition[];
    calibrationParameters?: CalibrationParameterIn[];
  }) => {
    await update({
      substrateIn: {
        id,
        name,
        creationDateTime: new Date().toISOString(), // this is not considered when doing update
        aclId,
        calibrationConditions: calibrationConditions as unknown as CalibrationConditionIn[],
        calibrationParameters,
        measurements: measurements as unknown as MeasurementIn[],
      },
    });
  };

  return {
    result: substrate,
    reExecuteQuery,
    error,
    fetching,
    mutation: [mutate, mutationResult] as const,
    update: [updateSubstrate, updateResult] as const,
    removal: [remove, removalResult] as const,
  };
};

type FormulaLayerInput = {
  formulaComponents: Array<{
    massAmount: number,
    colorant: { id: UUID }
  }>,
  relativeThickness?: number,
  viscosity?: number,
  quantity?: {
    amount: number,
    unit: string
  },
}

type FormulaInput = {
  id: UUID,
  assortmentId: UUID,
  predictionMeasurements?: Measurement[],
  formulaLayers: FormulaLayerInput[],
  formulationSettings: string,
}

interface AppearanceSampleVariables {
  id: UUID,
  name: string,
  standardId?: UUID,
  substrateId?: UUID,
  parentAppearanceSampleId?: UUID,
  measurements?: Measurement[],
  formula?: FormulaInput
}
export const useAppearanceSample = (
  variables?: {
    query?: { parentId?: UUID },
    create?: AppearanceSampleVariables,
    delete?: { samplesToDelete: UUID[] }
  },
) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [creationResult, create] = useAddAppearanceSampleMutation();

  const [removalResult, remove] = useDeleteAppearanceSampleMutation();

  const [updateResult, update] = useUpdateAppearanceSampleMutation();

  const [result, reExecuteQuery] = useGetAppearanceSamplesByStandardQuery({
    variables: variables?.query,
    pause: Boolean(!variables?.query?.parentId),
  });
  const { data, fetching, error } = result;

  useEffect(() => {
    if (error) {
      showToast(t('messages.sampleLoadError'), 'error');
    }
  }, [error]);

  useEffect(() => {
    if (creationResult.error) {
      showToast(t('messages.sampleCreateError'), 'error');
    }
  }, [creationResult.error]);

  useEffect(() => {
    if (updateResult.error) {
      showToast(t('messages.sampleUpdateError'), 'error');
    }
  }, [updateResult.error]);

  useEffect(() => {
    if (removalResult.error) {
      showToast(t('messages.sampleDeleteError'), 'error');
    }
  }, [removalResult.error]);

  const samples = useMemo(
    () => {
      const samplesData = data?.getAppearanceSamplesByStandard;
      if (!samplesData) return undefined;
      const standardId = variables?.query?.parentId;
      if (samplesData.some((sample) => sample?.standardId !== standardId)) return undefined;
      return parseArray(AppearanceSample, samplesData);
    },
    [data, variables?.query?.parentId],
  );

  return {
    result: samples,
    reExecuteQuery,
    error,
    fetching,
    mutation: [create, creationResult] as const,
    removal: [remove, removalResult] as const,
    update: [update, updateResult] as const,
  };
};

export const useAppearanceSampleFiltered = (
  variables: {
    query: { colorFilter?: ColorFilterIn },
  },
) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [result, reExecuteQuery] = useGetAppearanceSampleQuery({
    variables: variables.query,
    pause: Boolean(!variables.query?.colorFilter),
  });
  const { data, fetching, error } = result;
  if (error) {
    showToast(t('messages.sampleLoadError'), 'error');
  }
  const filteredSamples = useMemo(
    () => {
      const samplesData = data?.getAppearanceSample;
      if (!samplesData) return undefined;
      return parseArray(AppearanceSample, samplesData);
    },
    [data, variables.query?.colorFilter],
  );

  return {
    result: filteredSamples,
    reExecuteQuery,
    error,
    fetching,
  };
};

export const useAppearanceSampleById = (
  variables: {
    query: { ids: UUID[] },
  },
) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const client = useClient();

  const [samplesById, setSamplesById] = useState<Array<AppearanceSample>>();
  const [error, setError] = useState<Error | undefined>();
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (Array.isArray(variables.query.ids)) {
      setFetching(true);
      const promises = variables.query.ids
        .map(
          (x) => client.query<{ getAppearanceSample: AppearanceSample[] }>(
            GetAppearanceSampleDocument, { id: x },
          )
            .toPromise(),
        );
      Promise.all(promises).then((results) => {
        const samples = results
          .map((sample) => (sample.data?.getAppearanceSample[0]))
          .filter((sample) => sample?.formula) as AppearanceSample[];
        setSamplesById(samples);
        setFetching(false);
      }).catch((err) => setError(err));
    }
  }, [variables?.query?.ids]);

  if (error) {
    showToast(t('messages.sampleLoadError'), 'error');
  }

  return {
    result: samplesById,
    error,
    fetching,
  };
};

export const useUser = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [creationResult, create] = useAddUserMutation();
  const [modificationResult, modify] = useModifyUserMutation();
  const [removalResult, remove] = useDeleteUsersMutation();

  if (creationResult.error) {
    showToast(t('messages.sampleCreateError'), 'error');
  }

  if (removalResult.error) {
    showToast(t('messages.sampleDeleteError'), 'error');
  }

  const addUser = async (user: User) => {
    await create({
      user: user as unknown as UserIn,
    });
  };

  const modifyUser = async (user: User) => {
    await modify({
      user: user as unknown as UserIn,
    });
  };

  return {
    creation: [addUser, creationResult] as const,
    modification: [modifyUser, modificationResult] as const,
    removal: [remove, removalResult] as const,
  };
};

export type UserData = {
  id: string;
  name: string;
  fmsUserId?: string;
  xriteUserId?: string;
  defaultACL?: ACL;
  userRights?: UserRight[];
};

export const useUserGroup = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [creationResult, create] = useAddUserGroupMutation();

  const [removalResult, remove] = useDeleteUserGroupsMutation();

  const [updateResult, update] = useUpdateUserGroupMutation();

  const [assignResult, assign] = useAssignUserToUserGroupMutation();

  const [unassignResult, unassign] = useUnassignUserFromUserGroupMutation();

  if (creationResult.error) {
    showToast(t('messages.userGroupCreateError'), 'error');
  }

  if (removalResult.error) {
    showToast(t('messages.userGroupDeleteError'), 'error');
  }

  if (updateResult.error) {
    showToast(t('messages.userGroupUpdateError'), 'error');
  }

  if (assignResult.error || unassignResult.error) {
    showToast(t('messages.userGroupModifyError'), 'error');
  }

  return {
    mutation: [create, creationResult] as const,
    update: [update, updateResult] as const,
    removal: [remove, removalResult] as const,
    assign: [assign, assignResult] as const,
    unassign: [unassign, unassignResult] as const,
  };
};

export type UserGroupData = {
  id: string;
  name: string;
  users?: UserData[],
};

export const useAccessControlLists = () => {
  const [result, reExecuteQuery] = useGetAccessControlListsQuery();
  const { data, fetching, error } = result;

  const fetchedAccessControlLists = data?.getACL;

  const accessControlLists = useMemo(
    () => fetchedAccessControlLists?.map<ACL | null>((acl) => {
      if (
        !acl?.id
        || !acl?.creationDateTime
        || !acl?.name
        || !acl?.entries
      ) return null;

      const {
        id, creationDateTime, aclId, creatorId, entries, name,
      } = acl;

      const parsedEntries = entries.map<ACLEntry | null>((entry) => {
        if (!entry?.accessFlags?.flags) return null;

        const { userGroupId, userId } = entry;

        return {
          userGroupId,
          userId,
          accessFlags: {
            flags: entry.accessFlags.flags,
          },
        };
      }).filter(isValue);

      return {
        id,
        creationDateTime,
        aclId: aclId ?? undefined,
        creatorId: creatorId ?? undefined,
        entries: parsedEntries,
        name,
      };
    }).filter(isValue) ?? [], [fetchedAccessControlLists],
  );

  return {
    accessControlLists,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useUsers = () => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useGetUsersQuery();
  const { accessControlLists } = useAccessControlLists();

  const { data, fetching, error } = result;
  const fetchedUsers = data?.getUser?.map((user) => ({
    ...user,
    defaultACL: accessControlLists?.find((acl) => acl.id === user?.defaultACLId),
  }));

  // parsing/reducing users to contain valid data
  const users: UserData[] = useMemo(() => fetchedUsers?.reduce((arr, user) => {
    if (!user?.id || !user.name) return arr;

    return [...arr, user as UserData];
  }, [] as UserData[]) ?? [], [fetchedUsers]);

  if (error) {
    showToast('Error while fetching assortments.', 'error');
  }

  return {
    result: users,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useUserGroups = () => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useGetUserGroupQuery();

  const { data, fetching, error } = result;
  const fetchedUserGroups = data?.getUserGroup;

  const { result: allUsers, error: usersError } = useUsers();

  const userGroups: UserGroupData[] = useMemo(() => {
    if (!fetchedUserGroups || !allUsers) return [];
    return fetchedUserGroups.reduce((arr, group) => {
      if (!group?.id || !group?.name) return arr;

      const parsedGroup: UserGroupData = {
        id: group.id,
        name: group.name,
        users: group.users
          ?.map((id) => allUsers.find((user) => user.id === id))
          .filter((user): user is UserData => Boolean(user)),
      };

      return [...arr, parsedGroup];
    }, [] as UserGroupData[]) ?? [];
  }, [fetchedUserGroups, allUsers]);

  if (error || usersError) {
    showToast('Error while fetching user groups.', 'error');
  }

  return {
    userGroups,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useAccessControlList = (aclId?: string) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [{ fetching, data, error }] = useGetAccessControlListQuery({
    pause: !aclId,
    variables: {
      id: aclId,
    },
  });

  const [creationResult, createACL] = useAddAccessControlListMutation();
  const [removalResult, removeACL] = useDeleteAccessControlListsMutation();
  const [updateResult, updateACL] = useUpdateAccessControlListMutation();

  if (error) {
    showToast('Error while fetching access control list.', 'error'); // todo: add translation
  }

  if (creationResult.error) {
    showToast(t('messages.accessControlListCreateError'), 'error');
  }

  if (removalResult.error) {
    showToast(t('messages.accessControlListDeleteError'), 'error');
  }

  if (updateResult.error) {
    showToast(t('messages.accessControlListUpdateError'), 'error');
  }
  const fetchedAcl = data?.getACL?.[0];
  const accessControlList: PartialACL | null = useMemo(() => {
    if (!fetchedAcl?.name) return null;

    return {
      id: fetchedAcl.id,
      name: fetchedAcl.name,
    };
  }, [fetchedAcl?.id]);

  const create = async (properties: Partial<Omit<ACL, 'creationDateTime'>>) => {
    const id = properties.id ?? uuid();
    await createACL({
      accessControlList: {
        id,
        aclId: id,
        creationDateTime: new Date().toISOString(),
        ...properties,
      },
    });
  };

  const remove = async (ids: string[]) => {
    await removeACL({ ids });
  };

  const update = async (accessControlListIn: AccessControlListIn) => {
    await updateACL({ accessControlListIn });
  };

  return {
    mutation: [create, creationResult] as const,
    removal: [remove, removalResult] as const,
    update: [update, updateResult] as const,
    accessControlList,
    fetching,
  };
};

export const useAccessControlListEntry = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [creationResult, createACLEntry] = useAddAccessControlListEntryMutation();
  const [removalResult, removeACLEntry] = useDeleteAccessControlListEntryMutation();

  if (creationResult.error) {
    showToast(t('messages.accessControlListEntryCreateError'), 'error');
  }

  if (removalResult.error) {
    showToast(t('messages.accessControlListEntryDeleteError'), 'error');
  }

  const create = async (properties: AddAccessControlListEntryMutationVariables) => {
    if (
      !properties.accessControlListEntry?.accessFlags
      || !properties.parentId
      || (
        !properties.accessControlListEntry?.userGroupId
        && !properties.accessControlListEntry?.userId
      )) return;

    await createACLEntry(properties);
  };

  const remove = async (ids: string[], aclId: string) => {
    await removeACLEntry({ ids, parentId: aclId });
  };

  return {
    mutation: [create, creationResult] as const,
    removal: [remove, removalResult] as const,
  };
};

export type BasicMaterial = {
  id: UUID;
  creationDateTime?: string;
  creatorId?: UUID;
  aclId?: UUID;
  name?: string;
  type?: string
  price?: {
    amount: number;
    currencyCode: string;
  }
};

export const useBasicMaterial = (id?: UUID) => {
  const { showToast } = useToast();
  const [result, reExecuteQuery] = useBasicMaterialQuery({
    variables: { id },
  });

  const { data, fetching, error } = result;

  const fetchedBasicMaterials = data?.getBasicMaterial;

  const basicMaterials: BasicMaterial[] = useMemo(() => fetchedBasicMaterials?.map((material) => {
    if (!material?.id) return null;

    return {
      id: material.id,
      creationDateTime: material.creationDateTime ?? undefined,
      creatorId: material.creatorId ?? undefined,
      aclId: material.aclId ?? undefined,
      name: material.name ?? undefined,
      type: material.type ?? undefined,
      price: {
        amount: material.price?.amount ?? undefined,
        currencyCode: material.price?.currencyCode ?? undefined,
      },
    };
  })
    .filter((basicMaterial) => basicMaterial !== null) as BasicMaterial[]
    ?? [], [fetchedBasicMaterials]);

  if (result.error) {
    showToast('Error while fetching Basic Materials', 'error');
  }
  return {
    basicMaterials,
    error,
    fetching,
    reExecuteQuery,
  };
};

export const useAddPrintApplication = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [creationResult, create] = useAddPrintApplicationMutation();

  if (creationResult.error) {
    showToast(t('messages.sampleCreateError'), 'error');
  }

  return {
    mutation: [create, creationResult] as const,
  };
};

export const useApplyTag = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [creationResult, create] = useAddTagMutation();
  const [removalResult, remove] = useRemoveTagMutation();

  const applyTags = (entityIds: string[], tag: string, entityType: string) => {
    return Promise.all(entityIds.map((entityId) => create(
      { tag: { value: tag }, parentId: entityId, parentType: entityType },
    )));
  };

  const removeTags = (entityIds: string[], tags: string[]) => {
    return Promise.all(entityIds.map((entityId) => remove(
      { values: tags, parentId: entityId },
    )));
  };

  if (creationResult.error) {
    showToast(t('Error while applying tags'), 'error');
  }

  if (removalResult.error) {
    showToast(t('Error while modifying tags'), 'error');
  }

  return {
    mutation: [applyTags] as const,
    removal: [removeTags] as const,
  };
};

export type ColorApplicationDeviceThicknessRatio = {
  assortmentId: string;
  deviceId: string;
  deviceName: string | undefined;
  ratio: number | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isThicknessRatio = (data: any): data is ColorApplicationDeviceThicknessRatio => (
  data
  && isString(data.assortmentId)
  && isString(data.deviceId)
  && (data.deviceName === undefined || isString(data.deviceName))
  && (data.ratio === undefined || isNumber(data.ratio))
);

export const useThicknessRatios = (assortmentId?: UUID) => {
  const { showToast } = useToast();

  const [result, reExecuteQuery] = useListColorAdQuery({
    variables: { assortmentId } as { assortmentId: string },
    pause: Boolean(!assortmentId),
  });
  const { data, fetching, error } = result;

  const thicknessRatios = useMemo(
    () => data?.getColorApplicationDeviceThicknessRatiosByAssortment
      ?.map((entry) => {
        if (!isThicknessRatio(entry)) {
          showToast('Error while fetching Thickness Objects', 'error');
          return undefined;
        }
        return {
          assortmentId: entry.assortmentId,
          deviceId: entry.deviceId,
          deviceName: entry.deviceName ?? undefined,
          ratio: entry.ratio ?? undefined,
        };
      })
      .filter((entry): entry is ColorApplicationDeviceThicknessRatio => Boolean(entry)),
    [data],
  );

  if (error) {
    showToast('Error while fetching Thickness Objects', 'error');
  }

  return {
    result: thicknessRatios,
    reExecuteQuery,
    error,
    fetching,
  };
};
