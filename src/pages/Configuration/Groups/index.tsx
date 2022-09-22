import { useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

import GroupTable from './GroupTable';
import UsersInGroupTable from './UsersInGroupTable';
import { Body } from '../../../components/Typography';
import InputField from '../../../components/InputField';
import { useUserGroup, useUserGroups } from '../../../data/api';
import { scrollbars } from '../../../theme/components';
import Button from '../../../components/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  table: {
    background: theme.palette.surface[2],
    borderRadius: theme.spacing(1),
    overflowY: 'auto',
    flex: 1,
    ...(scrollbars(theme)),
  },
  content: {
    flex: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3.25),
  },
  input: {
    width: theme.spacing(30),
    marginLeft: theme.spacing(4),
    flex: 1,
  },
  label: {
    marginBottom: theme.spacing(1.25),
  },
  button: {
    padding: theme.spacing(0.5, 1.5),
    marginLeft: theme.spacing(2),
    fontSize: 12,
  },
}));

const Groups = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    update: [updateUserGroup, { fetching: updatingUserGroup }],
  } = useUserGroup();

  const [groupName, setGroupName] = useState<string>();
  const { userGroups, fetching } = useUserGroups();

  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const selectedGroup = useMemo(
    () => userGroups.find((group) => group.id === selectedGroupId),
    [userGroups, selectedGroupId],
  );

  const handleChangeGroup = (id: string | number) => {
    if (typeof id === 'string') setSelectedGroupId(id);

    setGroupName(undefined);
  };

  const handleGroupNameChange = () => {
    if (!selectedGroup) return;

    updateUserGroup({
      userGroupIn: {
        id: selectedGroup.id,
        // on update mutation is irrelevant what we send as creationDateTime
        creationDateTime: (new Date()).toISOString(),
        users: [],
        name: groupName,
      },
    });
  };

  return (
    <div className={classes.root}>
      <div className={classes.table}>
        <GroupTable
          groups={userGroups}
          selectedGroup={selectedGroup}
          selectGroup={handleChangeGroup}
          isFetching={fetching}
        />
      </div>
      <div className={classes.content}>
        <div className={classes.row}>
          <Body>{t('labels.groupName')}</Body>
          <InputField
            className={classes.input}
            onChange={(newName) => setGroupName(newName)}
            value={groupName ?? selectedGroup?.name}
          />
          <Button
            className={classes.button}
            disabled={
              groupName === selectedGroup?.name
              || groupName === undefined
              || groupName === ''
            }
            onClick={handleGroupNameChange}
            showSpinner={updatingUserGroup}
          >
            {t('labels.save')}
          </Button>
        </div>

      </div>
      <div className={classes.content}>
        <div className={classes.table}>
          <UsersInGroupTable
            selectedGroup={selectedGroup}
            users={selectedGroup?.users}
          />
        </div>
      </div>
    </div>
  );
};

export default Groups;
