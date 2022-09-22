import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import {
  makeStyles,
  Link,
  useTheme,
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { User, UserRight, UserRightType } from '@xrite/cloud-formulation-domain-model';
import { v4 as uuid } from 'uuid';

import { Component } from '../../../types/component';
import Panel from '../../../components/Panel';
import { Body } from '../../../components/Typography';
import BifrostTable from '../../../components/Table/Table';
import AddUser from '../AddUser';
import InputField from '../../../components/InputField';
import config from '../../../config';
import { useUser, useAccessControlLists } from '../../../data/api/cfdb';
import { FMSCompanyUser } from '../../../data/api/fms';
import LoadingContainer from '../../../components/LoadingContainer';
import { UserEmailData, useUsersData } from '../../../data/users';
import { ACL } from '../../../types/acl';
import { scrollbars } from '../../../theme/components';
import { getTableHeaderMenuProperties } from '../../common/Table/HeaderCell';
import Cell from '../../common/Table/StringCell';
import { useStateObject } from '../../../utils/utils';
import useToast from '../../../data/useToast';
import { TableColumn } from '../../../components/Table/types';
import SortIndicator from '../../../components/Table/Controls/SortIndicator';
import OptionsMenu, { getTableHeaderOptions } from '../../../components/Table/Controls/OptionsMenu';
import DefaultAclCell from './DefaultAclCell';
import UserRightsCell from './UserRightsCell';
import ActionsCell from './ActionsCell';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
    height: '100%',
    ...scrollbars(theme),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(2),
    justifyContent: 'space-between',
  },
  headerLabel: {
    color: theme.palette.text.hint,
  },
  table: {
    margin: theme.spacing(0, -1.5),
  },
  rightHeader: {
    display: 'flex',
    flexDirection: 'row',
  },
  section: {
    marginTop: theme.spacing(2),
  },
  input: {
    width: theme.spacing(30),
    paddingLeft: theme.spacing(0.5),
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  createUser: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
    marginRight: theme.spacing(3),
    color: theme.palette.primary.main,
  },
  openNew: {
    alignSelf: 'center',
    marginLeft: theme.spacing(0.5),
  },
  link: {
    alignSelf: 'center',
  },
  select: {
    flex: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

type EditingRow = {
  id: string | undefined,
  fmsUserId: number | undefined,
  defaultACL: ACL | undefined,
  userRights: UserRightType[] | undefined,
};

export type UserColumn = UserEmailData & {
  editingRow: EditingRow;
  saving: boolean;
  setEditingRow: (update: Partial<EditingRow>) => void;
  allACLs: ACL[];
  saveUser: () => Promise<void>;
  deleteUser: (id: string) => void;
};

const UserManangement: Component = () => {
  const { t } = useTranslation();
  const [editingRow, setEditingRow] = useStateObject<EditingRow>({
    id: undefined,
    fmsUserId: undefined,
    defaultACL: undefined,
    userRights: undefined,
  });
  const theme = useTheme();
  const { showToast } = useToast();
  const classes = useStyles();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRowId, setSelectedRowId] = useState<string>();
  const [saving, setSaving] = useState(false);

  const {
    usersFetching,
    currentUsers,
    usersToAdd,
    companyUsers,
  } = useUsersData();

  const { accessControlLists } = useAccessControlLists();

  const displayUsers = currentUsers?.filter((user) => (
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
    || user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )) ?? [];

  const {
    creation: [addUser],
    modification: [modifyUser],
    removal: [deleteUser],
  } = useUser();

  const handleDelete = (id: string) => {
    deleteUser({ usersToDelete: [id] });
  };

  const handleUserAdded = async (
    fmsUser: FMSCompanyUser,
    defaultACLId: string | undefined,
    userRights: UserRight[],
  ) => {
    setSelectedRowId(undefined);

    setSaving(true);

    const newUser = new User({
      id: uuid(),
      name: `${fmsUser.firstName} ${fmsUser.lastName}`,
      fmsUserId: fmsUser.userId.toString(),
      xriteUserId: fmsUser.xriteUserId.toString(),
      creationDateTime: (new Date().toISOString()),
      userRights,
      defaultACLId,
    });

    await addUser(newUser);

    setSaving(false);
  };

  const handleUserModified = async (parsedUser: User) => {
    setSelectedRowId(undefined);

    setSaving(true);

    await modifyUser(parsedUser);

    setSaving(false);
  };

  const handleSaveRow = async () => {
    try {
      const {
        id,
        fmsUserId,
        defaultACL,
        userRights,
      } = editingRow;
      const fmsUser = companyUsers?.find((current) => current.userId === fmsUserId);
      if (!fmsUser || !editingRow.id) return;

      const parsedUser = User.parse({
        id,
        name: `${fmsUser.firstName} ${fmsUser.lastName}`,
        fmsUserId: fmsUser.userId.toString(),
        xriteUserId: fmsUser.xriteUserId.toString(),
        creationDateTime: (new Date()).toISOString(),
        defaultACLId: defaultACL?.id,
        userRights: userRights?.map((right) => UserRight.parse({ userRightType: right })),
      });

      setEditingRow({
        defaultACL: undefined,
        userRights: undefined,
      });

      await handleUserModified(parsedUser);

      setEditingRow({
        id: undefined,
        defaultACL: undefined,
        userRights: undefined,
        fmsUserId: undefined,
      });
    } catch (e) {
      showToast(t('messages.errorUpdatingUser'), 'error');
    }
  };

  const columns: TableColumn<UserColumn>[] = [
    {
      id: 'name',
      ...getTableHeaderMenuProperties(t<string>('labels.name')),
      accessor: 'name',
      width: theme.spacing(20),
      Cell,
    },
    {
      id: 'email',
      ...getTableHeaderMenuProperties(t<string>('labels.email')),
      accessor: 'email',
      width: theme.spacing(32),
      Cell,
    },
    {
      id: 'defaultACLId',
      ...getTableHeaderMenuProperties(t<string>('labels.defaultACL')),
      accessor: 'defaultACL',
      Cell: DefaultAclCell,
      width: theme.spacing(32),
    },
    {
      id: 'userRights',
      ...getTableHeaderMenuProperties(t<string>('labels.userRights')),
      accessor: 'userRights',
      Cell: UserRightsCell,
      width: theme.spacing(80),
    },
    {
      id: 'action',
      ...getTableHeaderMenuProperties(t<string>('labels.action')),
      accessor: 'id',
      Cell: ActionsCell,
      width: theme.spacing(20),
      disableSortBy: true,
    },
  ];

  const availableHeaderColumns = useMemo(() => getTableHeaderOptions(columns), []);
  return (
    <Panel className={classes.container}>
      <div className={classes.header}>
        <Body>{t('labels.users')}</Body>
        <div className={classes.rightHeader}>
          <Link href={config.CREATE_USER_URL} className={classes.link} target="_blank">
            <Body className={classes.createUser}>
              {t('labels.createUser')}
              <OpenInNewIcon className={classes.openNew} />
            </Body>
          </Link>
          <InputField
            placeholder={t('labels.search')}
            startAdornment={<SearchIcon />}
            className={classes.input}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>
      <BifrostTable
        data={displayUsers.map((user) => ({
          ...user,
          saving,
          editingRow,
          setEditingRow,
          allACLs: accessControlLists,
          saveUser: handleSaveRow,
          deleteUser: handleDelete,
        }))}
        columns={columns}
        onRowClick={({ id }) => setSelectedRowId(id)}
        selectedRowId={selectedRowId}
        withBorders={false}
        renderHeaderMenu={(props) => (
          <SortIndicator
            sort={props.sorted}
            hideIndicator={!props.canSort}
          />
        )}
        renderHeaderOptionsMenu={(props) => (
          <OptionsMenu
            // TODO dataTestId={dataTestId}
            availableColumns={availableHeaderColumns}
            {...props}
          />
        )}
      />
      <div>
        <LoadingContainer fetching={usersFetching}>
          <AddUser
            handleUserAdded={handleUserAdded}
            data={usersToAdd}
            saving={saving}
            acls={accessControlLists}
          />
        </LoadingContainer>
      </div>
    </Panel>
  );
};

export default UserManangement;
