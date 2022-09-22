/* eslint-disable no-param-reassign */
import {
  createClient,
  fetchExchange,
  CombinedError,
  dedupExchange,
  Exchange,
} from 'urql';
import { cacheExchange as createCacheExchange } from '@urql/exchange-graphcache';
import { devtoolsExchange } from '@urql/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import uniq from 'lodash/uniq';
import { pipe, tap } from 'wonka';

import config from '../config';
import { getSession } from './authentication';
import { setSession, refreshSessionExpiration } from './reducers/authentication';
import { isArray, isString } from '../types/utils';
import {
  AddStandardMutation,
  AddSubstrateMutation,
  DeleteAppearanceSampleMutation,
  DeleteStandardMutation,
  DeleteSubstrateMutation,
  ListStandardsDocument,
  ListStandardsQuery,
  ListStandardsQueryVariables,
  ListSubstratesDocument,
  ListSubstratesQuery,
  ListSubstratesQueryVariables,
  MutationAddStandardArgs,
  MutationAddAclArgs,
  MutationDeleteAppearanceSampleArgs,
  MutationDeleteStandardArgs,
  MutationDeleteSubstrateArgs,
  MutationDeleteAclArgs,
  AddUserMutation,
  MutationAddUserArgs,
  MutationDeleteUserArgs,
  DeleteUsersMutation,
  AddUserGroupMutation,
  MutationAddUserGroupArgs,
  DeleteUserGroupsMutation,
  MutationDeleteUserGroupArgs,
  AddAccessControlListMutation,
  GetAccessControlListsQuery,
  GetAccessControlListsQueryVariables,
  GetAccessControlListsDocument,
  DeleteAccessControlListsMutation,
  AssignUserToUserGroupMutation,
  MutationAssignUserToUserGroupArgs,
  GetUserGroupQuery,
  GetUserGroupQueryVariables,
  GetUserGroupDocument,
  UnassignUserFromUserGroupMutation,
  MutationUnassignUserFromUserGroupArgs,
  AddAccessControlListEntryMutation,
  MutationAddAclEntryArgs,
  MutationDeleteAclEntryArgs,
  DeleteAccessControlListEntryMutation,
  MutationAddSubstrateArgs,
  StandardQuery,
  StandardQueryVariables,
  StandardDocument,
  GetSubstrateQuery,
  GetSubstrateQueryVariables,
  GetSubstrateDocument,
  AddAppearanceSampleMutation,
  MutationAddAppearanceSampleArgs,
  GetAppearanceSamplesByStandardQuery,
  GetAppearanceSamplesByStandardQueryVariables,
  GetAppearanceSamplesByStandardDocument,
  GetAppearanceSampleQuery,
  GetAppearanceSampleDocument,
  GetAppearanceSampleQueryVariables,
  AddPrintApplicationMutation,
  AddPrintApplicationMutationVariables,
  AssortmentQuery,
  AssortmentQueryVariables,
  AssortmentDocument,
  AddColorantMutation,
  MutationAddColorantArgs,
  AssortmentColorantsQuery,
  AssortmentColorantsQueryVariables,
  AssortmentColorantsDocument,
  GetUsersQuery,
  GetUsersQueryVariables,
  GetUsersDocument,
  AddTagMutation,
  AddTagMutationVariables,
  RemoveTagMutation,
  RemoveTagMutationVariables,
} from './api/graphql/generated';

function getFilteredEntities<T extends { id?: string | null }>(
  entities: (T | null)[] | null | undefined,
  deletedIds: string[],
) {
  if (Array.isArray(entities)) {
    return entities.filter((element) => element?.id && !deletedIds.includes(element.id));
  }
  return entities;
}

const cacheExchange = createCacheExchange({
  keys: {
    CalibrationParameter: () => null,
    NumberArray: () => null,
    ColorSpecification: () => null,
    ColorantComponent: () => null,
    DataCube: () => null,
    Extent: () => null,
    ExtentPixels: () => null,
    FormulaComponent: () => null,
    FormulaLayer: () => null,
    Geometry: () => null,
    Illumination: () => null,
    Instrument: () => null,
    MeasurementCondition: () => null,
    MeasurementSample: () => null,
    MeasurementSpot: () => null,
    PantoneLIVE: () => null,
    Price: () => null,
    Quantity: () => null,
    RGBPrimaries: () => null,
    SpectralSampling: () => null,
    ToleranceParameter: () => null,
    Transformation: () => null,
    AccessControlListEntry: () => null,
    AccessFlags: () => null,
  },
  updates: {
    Mutation: {
      addColorant(result: AddColorantMutation, args: MutationAddColorantArgs, cache) {
        const newColorant = result.addColorant;
        const assortmentId = args.parentId;
        if (newColorant) {
          cache.updateQuery<AssortmentColorantsQuery, AssortmentColorantsQueryVariables>(
            {
              query: AssortmentColorantsDocument,
              variables: { id: assortmentId },
            },
            (data) => {
              if (data && Array.isArray(data.getAssortment)) {
                const updatingAssortment = data.getAssortment
                  .find((assortment) => assortment?.id === assortmentId);

                if (updatingAssortment) {
                  updatingAssortment.colorants?.push(newColorant);
                }
              }

              return data;
            },
          );
        }
      },
      addStandard(result: AddStandardMutation, _args: MutationAddStandardArgs, cache) {
        const newStandard = result.addStandard;
        if (newStandard) {
          cache.updateQuery<StandardQuery, StandardQueryVariables>(
            {
              query: StandardDocument,
              variables: { id: newStandard.id },
            },
            () => ({
              __typename: 'Query',
              getStandard: [newStandard],
            }),
          );

          cache.updateQuery<ListStandardsQuery, ListStandardsQueryVariables>(
            { query: ListStandardsDocument },
            (data) => {
              if (data && Array.isArray(data.listStandards)) {
                data.listStandards.push({
                  __typename: 'Standard',
                  id: newStandard.id,
                  name: newStandard.name,
                });
              }
              return data;
            },
          );
        }
      },
      deleteStandard(_result: DeleteStandardMutation, args: MutationDeleteStandardArgs, cache) {
        const deletedIds = args.ids;
        if (!(isArray(deletedIds, isString))) {
          throw new Error('Unrecognized arguments');
        }

        cache.updateQuery<ListStandardsQuery, ListStandardsQueryVariables>(
          { query: ListStandardsDocument },
          (data) => {
            if (data) data.listStandards = getFilteredEntities(data.listStandards, deletedIds);
            return data;
          },
        );

        deletedIds.forEach((id) => {
          cache.invalidate({ __typename: 'Standard', id });
        });
      },
      addSubstrate(result: AddSubstrateMutation, _args: MutationAddSubstrateArgs, cache) {
        const newSubstrate = result.addSubstrate;
        if (newSubstrate) {
          cache.updateQuery<GetSubstrateQuery, GetSubstrateQueryVariables>(
            {
              query: GetSubstrateDocument,
              variables: { id: newSubstrate.id },
            },
            () => ({
              __typename: 'Query',
              getSubstrate: [newSubstrate],
            }),
          );

          cache.updateQuery<ListSubstratesQuery, ListSubstratesQueryVariables>(
            { query: ListSubstratesDocument },
            (data) => {
              if (data && Array.isArray(data.getSubstrate)) {
                data.getSubstrate.push({
                  __typename: 'Substrate',
                  id: newSubstrate.id,
                  name: newSubstrate.name,
                  calibrationConditions: newSubstrate.calibrationConditions,
                });
              }
              return data;
            },
          );
        }
      },
      deleteSubstrate(_result: DeleteSubstrateMutation, args: MutationDeleteSubstrateArgs, cache) {
        const deletedIds = args.ids;
        if (!(isArray(deletedIds, isString))) {
          throw new Error('Unrecognized arguments');
        }

        cache.updateQuery<ListSubstratesQuery, ListSubstratesQueryVariables>(
          { query: ListSubstratesDocument },
          (data) => {
            if (data) data.getSubstrate = getFilteredEntities(data.getSubstrate, deletedIds);
            return data;
          },
        );

        deletedIds.forEach((id) => {
          cache.invalidate({ __typename: 'Substrate', id });
        });
      },
      addAppearanceSample(
        result: AddAppearanceSampleMutation,
        _args: MutationAddAppearanceSampleArgs,
        cache,
      ) {
        const newAppearanceSample = result.addAppearanceSample;
        if (newAppearanceSample) {
          cache.updateQuery<GetAppearanceSampleQuery, GetAppearanceSampleQueryVariables>(
            {
              query: GetAppearanceSampleDocument,
              variables: { id: newAppearanceSample.id },
            },
            (data) => {
              if (data && Array.isArray(data.getAppearanceSample)) {
                data.getAppearanceSample.push(newAppearanceSample);
              }
              return data;
            },
          );

          // eslint-disable-next-line max-len
          cache.updateQuery<GetAppearanceSamplesByStandardQuery, GetAppearanceSamplesByStandardQueryVariables>(
            {
              query: GetAppearanceSamplesByStandardDocument,
              variables: { parentId: newAppearanceSample.standardId },
            },
            (data) => {
              if (data && Array.isArray(data.getAppearanceSamplesByStandard)) {
                data.getAppearanceSamplesByStandard.push(newAppearanceSample);
              }
              return data;
            },
          );
        }
      },
      deleteAppearanceSample(
        _result: DeleteAppearanceSampleMutation,
        args: MutationDeleteAppearanceSampleArgs,
        cache,
      ) {
        const deletedIds = args.ids;
        if (!(isArray(deletedIds, isString))) {
          throw new Error('Unrecognized arguments');
        }

        const parentIds = deletedIds
          .map((id) => cache.resolve({ __typename: 'AppearanceSample', id }, 'standardId'))
          .filter(isString);

        uniq(parentIds).forEach((parentId) => {
          // eslint-disable-next-line max-len
          cache.updateQuery<GetAppearanceSamplesByStandardQuery, GetAppearanceSamplesByStandardQueryVariables>(
            {
              query: GetAppearanceSamplesByStandardDocument,
              variables: { parentId },
            },
            (data) => {
              // eslint-disable-next-line max-len
              if (data) data.getAppearanceSamplesByStandard = getFilteredEntities(data.getAppearanceSamplesByStandard, deletedIds);
              return data;
            },
          );
        });

        deletedIds.forEach((id) => {
          cache.invalidate({ __typename: 'AppearanceSample', id });
        });
      },
      addACLEntry(
        result: AddAccessControlListEntryMutation,
        args: MutationAddAclEntryArgs,
        cache,
      ) {
        const aclId = args.parentId;
        const newACLEntry = result.addACLEntry;

        if (!aclId || !newACLEntry) return;

        cache.updateQuery<GetAccessControlListsQuery, GetAccessControlListsQueryVariables>(
          { query: GetAccessControlListsDocument },
          (data) => {
            if (data && Array.isArray(data.getACL)) {
              const modifiedAcl = data.getACL.find((acl) => acl?.id === aclId);

              if (modifiedAcl?.entries && Array.isArray(modifiedAcl.entries)) {
                modifiedAcl.entries.push(newACLEntry);
              }
            }
            return data;
          },
        );
      },
      deleteACLEntry(
        _result: DeleteAccessControlListEntryMutation,
        args: MutationDeleteAclEntryArgs,
        cache,
      ) {
        const removedEntryIds = args.ids;
        if (!(isArray(removedEntryIds, isString))) {
          throw new Error('Unrecognized arguments');
        }
        const aclId = args.parentId;

        cache.updateQuery<GetAccessControlListsQuery, GetAccessControlListsQueryVariables>(
          { query: GetAccessControlListsDocument },
          (data) => {
            if (data && Array.isArray(data.getACL)) {
              const modifiedAcl = data.getACL.find((acl) => acl?.id === aclId);

              if (modifiedAcl?.entries && Array.isArray(modifiedAcl.entries)) {
                modifiedAcl.entries = modifiedAcl.entries.filter((entry) => (
                  (entry?.userGroupId && !removedEntryIds.includes(entry.userGroupId))
                  || (entry?.userId && !removedEntryIds.includes(entry.userId))
                ));
              }
            }
            return data;
          },
        );
      },
      addUser(result: AddUserMutation, args: MutationAddUserArgs, cache) {
        const newUser = result.addUser;
        if (newUser) {
          cache.updateQuery<GetUsersQuery, GetUsersQueryVariables>(
            { query: GetUsersDocument },
            (data) => {
              if (data && Array.isArray(data.getUser)) {
                data.getUser.push(newUser);
              }
              return data;
            },
          );
        }
      },
      deleteUser(_result: DeleteUsersMutation, args: MutationDeleteUserArgs, cache) {
        const deletedIds = args.ids;
        if (!(isArray(deletedIds, isString))) {
          throw new Error('Unrecognized arguments');
        }

        cache.updateQuery<GetUsersQuery, GetUsersQueryVariables>(
          { query: GetUsersDocument },
          (data) => {
            if (data) data.getUser = getFilteredEntities(data.getUser, deletedIds);
            return data;
          },
        );

        deletedIds.forEach((id) => {
          cache.invalidate({ __typename: 'User', id });
        });
      },
      addUserGroup(result: AddUserGroupMutation, args: MutationAddUserGroupArgs, cache) {
        const newUserGroup = result.addUserGroup;
        if (newUserGroup) {
          cache.updateQuery<GetUserGroupQuery, GetUserGroupQueryVariables>(
            { query: GetUserGroupDocument },
            (data) => {
              if (data && Array.isArray(data.getUserGroup)) {
                data.getUserGroup.push(newUserGroup);
              }
              return data;
            },
          );
        }
      },
      deleteUserGroup(_result: DeleteUserGroupsMutation, args: MutationDeleteUserGroupArgs, cache) {
        const deletedIds = args.ids;
        if (!(isArray(deletedIds, isString))) {
          throw new Error('Unrecognized arguments');
        }

        cache.updateQuery<GetUserGroupQuery, GetUserGroupQueryVariables>(
          { query: GetUserGroupDocument },
          (data) => {
            if (data) data.getUserGroup = getFilteredEntities(data.getUserGroup, deletedIds);
            return data;
          },
        );

        deletedIds.forEach((id) => {
          cache.invalidate({ __typename: 'UserGroup', id });
        });
      },
      assignUserToUserGroup(
        _result: AssignUserToUserGroupMutation,
        args: MutationAssignUserToUserGroupArgs,
        cache,
      ) {
        const { childIds, parentId } = args;
        if (Array.isArray(childIds) && parentId) {
          cache.updateQuery<GetUserGroupQuery, GetUserGroupQueryVariables>(
            { query: GetUserGroupDocument },
            (data) => {
              if (data && Array.isArray(data.getUserGroup)) {
                const userGroup = data.getUserGroup.find((group) => group?.id === parentId);
                if (userGroup) {
                  userGroup.users?.push(...childIds);
                }
              }
              return data;
            },
          );
        }
      },
      unassignUserFromUserGroup(
        _result: UnassignUserFromUserGroupMutation,
        args: MutationUnassignUserFromUserGroupArgs,
        cache,
      ) {
        const { childIds, parentId } = args;
        if (Array.isArray(childIds) && parentId) {
          cache.updateQuery<GetUserGroupQuery, GetUserGroupQueryVariables>(
            { query: GetUserGroupDocument },
            (data) => {
              if (data && Array.isArray(data.getUserGroup)) {
                const userGroup = data.getUserGroup.find((group) => group?.id === parentId);
                if (userGroup) {
                  userGroup.users = userGroup.users?.filter((id) => !childIds.includes(id));
                }
              }
              return data;
            },
          );
        }
      },
      addACL(result: AddAccessControlListMutation, args: MutationAddAclArgs, cache) {
        const newACL = result.addACL;
        if (newACL) {
          cache.updateQuery<GetAccessControlListsQuery, GetAccessControlListsQueryVariables>(
            { query: GetAccessControlListsDocument },
            (data) => {
              if (data && Array.isArray(data.getACL)) {
                data.getACL.push(newACL);
              }
              return data;
            },
          );
        }
      },
      deleteACL(
        _result: DeleteAccessControlListsMutation,
        args: MutationDeleteAclArgs,
        cache,
      ) {
        const deletedIds = args.ids;
        if (!(isArray(deletedIds, isString))) {
          throw new Error('Unrecognized arguments');
        }

        cache.updateQuery<GetAccessControlListsQuery, GetAccessControlListsQueryVariables>(
          { query: GetAccessControlListsDocument },
          (data) => {
            if (data) data.getACL = getFilteredEntities(data.getACL, deletedIds);
            return data;
          },
        );

        deletedIds.forEach((id) => {
          cache.invalidate({ __typename: 'AccessControlList', id });
        });
      },
      addPrintApplication(
        result: AddPrintApplicationMutation,
        args: AddPrintApplicationMutationVariables,
        cache,
      ) {
        const newPrintApplication = result.addPrintApplication;
        const assortmentId = args.parentType === 'assortment' ? args.parentId : undefined;

        if (!assortmentId || !newPrintApplication) return;

        cache.updateQuery<AssortmentQuery, AssortmentQueryVariables>(
          {
            query: AssortmentDocument,
            variables: { id: assortmentId },
          },
          (data) => {
            const assortment = data?.getAssortment?.[0];
            if (assortment) {
              assortment.printApplications?.push(newPrintApplication);
            }
            return data;
          },
        );
      },
      addTag(
        _result: AddTagMutation,
        args: AddTagMutationVariables,
        cache,
      ) {
        if (args?.parentId && args?.parentType) {
          const existingTags = cache.resolve(
            { __typename: args.parentType, id: args.parentId },
            'tags',
          );
          if (!isArray(existingTags, isString)) return;
          cache.writeFragment(gql`
            fragment _tags_ on ${args.parentType} {
              id
              tags
            }
          `, { id: args.parentId, tags: [...existingTags, args.tag?.value] });
        }
      },
      deleteTag(
        _result: RemoveTagMutation,
        args: RemoveTagMutationVariables,
        cache,
      ) {
        if (args && args.values && args.parentId && _result.deleteTag === 1) {
          const existingTags = cache.resolve(
            { __typename: 'Colorant', id: args.parentId },
            'tags',
          );
          if (!isArray(existingTags, isString)) return;
          cache.writeFragment(gql`
            fragment _tags_ on Colorant {
              id
              tags
            }
          `, { id: args.parentId, tags: existingTags.filter((tag) => !args.values?.includes(tag)) });
        }
      },
    },
  },
});

function createResponseExchange(onResponse: (error?: CombinedError) => void): Exchange {
  return ({ forward }) => (operations$) => {
    return pipe(
      forward(operations$),
      tap((response) => onResponse(response.error)),
    );
  };
}

const createCFDBClientWithToken = (
  token: string,
  onResponse: (error?: CombinedError) => void,
) => createClient({
  url: config.CFDB_URL,
  maskTypename: true,
  fetchOptions: {
    headers: {
      'x-api-key': config.CFDB_API_KEY,
      'xr-token': token,
    },
  },
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange,
    createResponseExchange(onResponse),
    fetchExchange,
  ],
});

const is401GraphQLError = (graphQLError: GraphQLError) => {
  try {
    const message = JSON.parse(graphQLError?.message);
    return (message?.payload?.[0]?.error === 401);
  } catch (error) {
    return false;
  }
};

export const useCFDBClient = () => {
  const session = useSelector(getSession);
  const dispatch = useDispatch();
  const onResponse = (error?: CombinedError) => {
    if (error) {
      const has401Error = error.graphQLErrors.some(is401GraphQLError);
      if (has401Error) dispatch(setSession());
    } else {
      dispatch(refreshSessionExpiration());
    }
  };
  const client = useMemo(
    () => session && createCFDBClientWithToken(session.token, onResponse),
    [session],
  );

  return client;
};

export { Provider } from 'urql';
