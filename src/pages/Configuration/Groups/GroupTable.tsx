import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useTranslation } from 'react-i18next';

import UserTable, { Column } from '../../common/UserTable';
import { UserGroupData, useUserGroup } from '../../../data/api';
import { Component } from '../../../types/component';

const columns: Column[] = [
  {
    field: 'name',
    label: 'Name',
  },
  {
    field: 'size',
    label: '# of Users',
  },
];

type Props = {
  groups: UserGroupData[],
  selectedGroup?: UserGroupData,
  selectGroup?: (id: string | number) => void,
  isFetching: boolean,
}

const GroupTable: Component<Props> = ({
  groups,
  selectedGroup,
  selectGroup,
  isFetching,
}) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const {
    mutation: [addUserGroup],
    removal: [deleteUserGroup],
  } = useUserGroup();

  const handleCreateGroup = async (value: string) => {
    setIsSaving(true);
    await addUserGroup({
      userGroup: {
        id: uuid(),
        name: value,
        users: [],
        creationDateTime: (new Date()).toISOString(),
      },
    });
    setIsSaving(false);
  };

  const handleDeleteGroup = async (id: string) => {
    setIsSaving(true);
    await deleteUserGroup({ userGroupsToDelete: [id] });
    setIsSaving(false);
  };

  const groupsData = groups.map((item) => ({
    id: item.id,
    name: item.name,
    size: item.users?.length || 0,
  }));

  return (
    <UserTable
      title={t('labels.groups')}
      type="text"
      columns={columns}
      data={groupsData}
      confirmMessage={t('messages.deleteGroupConfirmation')}
      onDelete={handleDeleteGroup}
      onCreate={handleCreateGroup}
      isFetching={isSaving || isFetching}
      selectedId={selectedGroup?.id}
      selectGroup={selectGroup}
    />
  );
};

export default GroupTable;
