/* eslint-disable react/destructuring-assignment */
import { Row } from 'react-table';
import {
  memo, useRef, useState,
} from 'react';
import {
  Checkbox, CircularProgress, makeStyles,
} from '@material-ui/core';
import { AccessFlag, AccessFlags, Flag } from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';

import DeleteButton from './DeleteButton';
import useToast from '../../../data/useToast';
import SearchableTable from '../../../components/SearchableTable';
import CreatingTool from '../../common/UserTable/CreatingTool';
import {
  useUserGroups,
  useUsers,
  UserGroupData,
  UserData,
  useAccessControlListEntry,
} from '../../../data/api';
import { ACL, ACLEntry } from '../../../types/acl';
import { AccessControlListEntryIn } from '../../../data/api/graphql/generated';
import { scrollbars } from '../../../theme/components';

const useStyles = makeStyles((theme) => ({
  tableRoot: {
    background: theme.palette.surface[2],
    borderRadius: theme.spacing(0.75),
    overflowX: 'hidden',
    overflowY: 'auto',
    ...scrollbars(theme),
  },
  tool: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.375),
  },
}));

type EntryMap = {
  [entryId: string]: {
    accessFlags: AccessFlags | undefined,
    isUser: boolean;
  }
};

type Props = {
  list?: ACL;
  aclEntriesMap: EntryMap;
  setAclEntriesMap: React.Dispatch<React.SetStateAction<EntryMap>>;
  setPermissionChanged: React.Dispatch<React.SetStateAction<boolean>>;
};

const isUser = (item: UserData | UserGroupData) => {
  return (item as UserData)?.xriteUserId;
};

const UsersInList = ({
  list: selectedList,
  aclEntriesMap,
  setAclEntriesMap,
  setPermissionChanged,
}: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const deletedEntryId = useRef('');

  const [isCreatingEditable, setIsCreatingEditable] = useState(false);

  const {
    mutation: [createACLEntry, { fetching: isCreating }],
    removal: [removeACLEntry, { fetching: isDeleting }],
  } = useAccessControlListEntry();

  const { result: users, fetching: fetchingUsers } = useUsers();
  const { userGroups, fetching: fetchingUserGroups } = useUserGroups();

  const selectedUserIDs = selectedList?.entries.map((entry) => entry.userId);
  const selectedUsersInList = users.filter((user) => selectedUserIDs?.includes(user.id));

  const selectedGroupIDs = selectedList?.entries.map((entry) => entry.userGroupId);
  const selectedGroupsInList = userGroups.filter((group) => (selectedGroupIDs?.includes(group.id)));

  const availableUsers = users.filter((user) => (!selectedUserIDs?.includes(user.id)));
  const availableGroups = userGroups.filter((group) => (!selectedGroupIDs?.includes(group.id)));

  const availableUsersAndGroups: UserGroupData[] | UserData[] = [
    ...availableUsers,
    ...availableGroups,
  ];

  const updatePermissions = async (
    permission: Flag,
    value: boolean,
    entry?: ACLEntry,
  ) => {
    const id = entry?.userId ?? entry?.userGroupId;
    if (!entry || !selectedList || !id) return;
    setPermissionChanged(true);

    const { flags } = entry.accessFlags;
    const oldFlags = aclEntriesMap[id]?.accessFlags?.flags ?? flags;

    const accessFlags = new AccessFlags({ flags: oldFlags });
    accessFlags.set(permission, value);

    setAclEntriesMap({
      ...aclEntriesMap,
      [id]: {
        accessFlags,
        isUser: Boolean(entry.userId),
      },
    });
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!selectedList) return;

    deletedEntryId.current = userId;

    await removeACLEntry([userId], selectedList.id);

    showToast(t('messages.resourceDeleteSuccess', {
      name,
    }), 'success');
  };

  const handleConfirm = async (entry: UserData | UserGroupData) => {
    if (!selectedList) return;

    const { id, name } = entry;
    const idField = isUser(entry) ? 'userId' : 'userGroupId';

    const accessControlListEntryIn: AccessControlListEntryIn = {
      accessFlags: {
        flags: '----',
      },
      [idField]: id,
    };

    await createACLEntry({
      parentId: selectedList.id,
      accessControlListEntry: accessControlListEntryIn,
    });

    showToast(t('messages.resourceCreateSuccess', {
      name,
    }), 'success');
  };

  const handleCheckbox = (row: Row, flag: Flag) => {
    const entryId = (row.original as UserGroupData | UserData).id;
    const entry = selectedList?.entries.find((aclEntry) => {
      return aclEntry.userId === entryId || aclEntry.userGroupId === entryId;
    });

    const id = entry?.userId ?? entry?.userGroupId ?? '';
    const mapEntryAccessFlags = aclEntriesMap[id];
    return (
      <Checkbox
        color="primary"
        defaultChecked={mapEntryAccessFlags
          ? mapEntryAccessFlags.accessFlags?.flags.includes(flag.char)
          : entry?.accessFlags?.flags.includes(flag.char)}
        onChange={(event) => updatePermissions(
          flag,
          event.currentTarget.checked,
          entry,
        )}
      />
    );
  };

  const prefixUserGroup = (entry: UserGroupData | UserData) => {
    if (isUser(entry)) {
      return `(U) ${entry.name}`;
    }
    return `(G) ${entry.name}`;
  };

  return (
    <>
      <div className={classes.tableRoot}>
        <SearchableTable
          title={t('titles.usersInList')}
          loading={fetchingUsers || fetchingUserGroups}
          data={[...selectedUsersInList, ...selectedGroupsInList]}
          columns={[{
            id: 'name',
            Header: t<string>('labels.name'),
            accessor: 'name',
            width: 'auto',
            Cell: ({ row }) => {
              const entry = (row.original as UserGroupData | UserData);
              return prefixUserGroup(entry);
            },
          },
          {
            id: 'r',
            Header: 'R',
            width: 70,
            Cell: ({ row }) => handleCheckbox(row, AccessFlag.read),
          },
          {
            id: 'w',
            Header: 'W',
            width: 70,
            Cell: ({ row }) => handleCheckbox(row, AccessFlag.write),
          },
          {
            id: 'd',
            Header: 'D',
            width: 70,
            Cell: ({ row }) => handleCheckbox(row, AccessFlag.delete),
          },
          {
            id: 'a',
            Header: 'A',
            width: 70,
            Cell: ({ row }) => handleCheckbox(row, AccessFlag.administrate),
          }, {
            id: 'action',
            Header: t<string>('labels.actions'),
            width: 100,
            Cell: ({ row, data }) => {
              const { id: userId, name } = (row.original as UserGroupData | UserData);
              return deletedEntryId.current === userId
              && isDeleting
                ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteButton
                    data={data[0] as ACL}
                    onConfirm={() => handleDelete(userId, name)}
                  />
                );
            },
          }]}
        />
        {!(fetchingUsers || fetchingUserGroups) && selectedList && (
          <div className={classes.tool}>
            <CreatingTool
              onCheck={handleConfirm}
              isFetching={isCreating}
              isEditable={isCreatingEditable}
              onSetEditable={setIsCreatingEditable}
              placeholder={t('labels.user')}
              type="select"
              options={availableUsersAndGroups}
              label={(item) => {
                if (item) {
                  return prefixUserGroup(item);
                }
                return '';
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default memo(UsersInList);
