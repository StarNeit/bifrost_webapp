import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserTable, { Column } from '../../common/UserTable';
import {
  UserData,
  UserGroupData,
  useUserGroup,
} from '../../../data/api';
import { Component } from '../../../types/component';
import { UserEmailData, useUsersData } from '../../../data/users';

const columns: Column[] = [
  {
    field: 'name',
    label: 'Name',
    size: 28,
  },
];

type Props = {
  selectedGroup?: UserGroupData;
  users?: UserData[];
}

const UsersInGroupTable: Component<Props> = ({
  selectedGroup,
  users,
}) => {
  const { t } = useTranslation();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { currentUsers } = useUsersData();
  const {
    assign: [assignUserToUserGroup],
    unassign: [unassignUserFromUserGroup],
  } = useUserGroup();

  const nonGroupUsers = useMemo(() => {
    if (!users || !currentUsers) return [];
    const groupUserIds = users.map((user) => user.id);
    return currentUsers
      ?.filter((user): user is UserEmailData => !groupUserIds.includes(user.id));
  }, [users, currentUsers]);

  const handleCreateUser = async (value: UserEmailData) => {
    setIsFetching(true);
    await assignUserToUserGroup({ childIds: [value.id], parentId: selectedGroup?.id });
    setIsFetching(false);
  };

  const handleDeleteUser = async (id: string) => {
    setIsFetching(true);
    await unassignUserFromUserGroup({ childIds: [id], parentId: selectedGroup?.id });
    setIsFetching(false);
  };

  const usersData = users?.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <UserTable
      type="select"
      title={t('labels.usersInGroup')}
      columns={columns}
      data={usersData || []}
      confirmMessage={t('messages.deleteUserConfirmation')}
      onDelete={handleDeleteUser}
      onCreate={handleCreateUser}
      options={nonGroupUsers}
      label={(user) => user?.name ?? ''}
      isFetching={isFetching}
    />
  );
};

export default UsersInGroupTable;
