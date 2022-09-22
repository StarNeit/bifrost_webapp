import {
  useEffect, useState,
} from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { AccessFlags } from '@xrite/cloud-formulation-domain-model';
import InputField from '../../../components/InputField';
import { Body } from '../../../components/Typography';
import AccessControlLists from './AccessControlLists';
import UsersInList from './UsersInList';
import { ACL } from '../../../types/acl';
import { useAccessControlList, useAccessControlListEntry, useAccessControlLists } from '../../../data/api';
import Button from '../../../components/Button';
import useToast from '../../../data/useToast';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    padding: theme.spacing(4),
    columnGap: theme.spacing(4),
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    rowGap: theme.spacing(3),
  },
  row: {
    display: 'flex',
    columnGap: theme.spacing(3),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(1),
  },
  input: {
    flex: 1,
  },
}));

const AccessControl = () => {
  const classes = useStyles();
  const { showToast } = useToast();

  const {
    update: [updateAcl],
  } = useAccessControlList();

  const [aclEntriesMap, setAclEntriesMap] = useState<{
    [entryId: string]: {
      accessFlags: AccessFlags | undefined,
      isUser: boolean;
    }
  }>({});

  const [savingChanges, setSavingChanges] = useState(false);
  const [aclChanged, setAclChanged] = useState(false);

  const { accessControlLists, fetching } = useAccessControlLists();

  const [selectedAcl, setSelectedACL] = useState<ACL>();
  const [aclName, setAclName] = useState<{initialName?: string, name?: string}>({
    initialName: undefined,
    name: undefined,
  });
  const { t } = useTranslation();

  const {
    mutation: [createACLEntry],
    removal: [removeACLEntry],
  } = useAccessControlListEntry();

  // effect for always selecting the up-to-date acl with the new/deleted entries
  useEffect(() => {
    if (accessControlLists) {
      setSelectedACL(accessControlLists.find((acl) => acl.id === selectedAcl?.id));
      setAclEntriesMap({});
      setAclChanged(false);
    }
  }, [accessControlLists]);

  const handleSelectedAcl = (acl: ACL | undefined) => {
    setSelectedACL(acl);

    if (acl) {
      setAclName({
        initialName: acl.name,
        name: acl.name,
      });
    } else {
      setAclName({
        initialName: '',
        name: undefined,
      });
    }
  };

  const saveChanges = async () => {
    if (!selectedAcl?.id) return;

    setSavingChanges(true);

    if (aclName.initialName !== aclName.name) {
      await updateAcl({
        id: selectedAcl.id,
        creationDateTime: selectedAcl.creationDateTime,
        name: aclName.name,
      });
      showToast(t('messages.accessControlListSuccess'), 'success');
    }

    // TODO: this needs to be changed with update mutation
    const entryIdsToBeUpdated = Object.keys(aclEntriesMap);
    if (entryIdsToBeUpdated.length) {
      await removeACLEntry(entryIdsToBeUpdated, selectedAcl.id);

      const promises = entryIdsToBeUpdated.map((entryId) => {
        const entry = aclEntriesMap[entryId];
        return createACLEntry({
          accessControlListEntry: {
            accessFlags: {
              flags: entry?.accessFlags?.flags,
            },
            userGroupId: !entry.isUser ? entryId : undefined,
            userId: entry.isUser ? entryId : undefined,
          },
          parentId: selectedAcl.id,
        });
      });

      await Promise.all(promises);
    }

    setAclChanged(false);
    setSavingChanges(false);
    setAclName({
      initialName: aclName.name,
      name: aclName.name,
    });
  };

  return (
    <div className={classes.root}>
      <div className={classes.section}>
        <AccessControlLists
          accessControlLists={accessControlLists}
          fetching={fetching}
          selectedAcl={selectedAcl}
          onSelect={handleSelectedAcl}
        />
      </div>
      <div className={classes.section}>
        <div className={classes.row}>
          <Body>{t('labels.aclName')}</Body>
          <InputField
            className={classes.input}
            value={aclName.name ?? aclName.initialName}
            onChange={(name) => setAclName({ ...aclName, name })}
          />
        </div>

        {/* <div className={classes.column}>
          <Body>{t('labels.tags')}</Body>
          <Select
            data={['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5']}
            value={['Tag1', 'Tag2', 'Tag3']}
            isMulti
            isFullWidth
            onChange={console.log}
          />
        </div> */}
      </div>
      <div className={classes.section}>
        <UsersInList
          list={selectedAcl}
          aclEntriesMap={aclEntriesMap}
          setAclEntriesMap={setAclEntriesMap}
          setPermissionChanged={setAclChanged}
        />
        <Button
          onClick={saveChanges}
          showSpinner={savingChanges}
          disabled={
            (!aclChanged && aclName.initialName === aclName.name)
            || !aclName.name?.length
          }
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AccessControl;
