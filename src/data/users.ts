import { UserRight } from '@xrite/cloud-formulation-domain-model';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { ACL } from '../types/acl';
import { useUsers } from './api/cfdb';
import { FMSCompanyUser, getCompanyUsers } from './api/fms';
import { useSession } from './authentication';
import useToast from './useToast';

type UserData = {
  id: string;
  name: string;
  fmsUserId?: string;
  xriteUserId?: string;
  defaultACL?: ACL;
  userRights?: UserRight[];
}[];

export type UserEmailData = {
  name: string;
  id: string;
  email: string;
  fmsUserId?: string;
  defaultACL?: ACL;
  userRights?: UserRight[];
}

const getUsersToAdd = (users: UserData | undefined, fmsUsers: FMSCompanyUser[]) => {
  const usersXriteId = users?.map((user) => user.xriteUserId);
  return fmsUsers.filter((fms) => !usersXriteId?.includes(fms.xriteUserId.toString()));
};

export const useUsersData = () => {
  const {
    result: users,
    fetching: usersFetching,
  } = useUsers();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const session = useSession();

  const {
    data: companyUsers,
    error,
    isValidating: companyUsersFetching,
  } = useSWR('companyUsers', () => getCompanyUsers(session.token, session.companyId));

  const currentUsers = useMemo(() => {
    try {
      if (!companyUsers) return undefined;
      return users?.map((user) => {
        const fmsUser = companyUsers.find(
          (fms) => fms.xriteUserId.toString() === user?.xriteUserId,
        );
        if (!fmsUser) {
          showToast(t('messages.fmsUserDataNotFound', { user: user.name }), 'warning');
        }

        return {
          name: user.name,
          id: user.id,
          email: fmsUser?.email || '',
          fmsUserId: user.fmsUserId,
          defaultACL: user.defaultACL,
          userRights: user.userRights,
        } as UserEmailData;
      });
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), 'error');
      return undefined;
    }
  }, [users, companyUsers]);

  const usersToAdd = companyUsers && getUsersToAdd(users, companyUsers);

  if (error) showToast(error, 'error');

  return {
    usersFetching: usersFetching || companyUsersFetching,
    currentUsers,
    usersToAdd,
    companyUsers,
  };
};
