import { useEffect, useState } from 'react';
import { UserRight, UserRightType } from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';
import { makeStyles, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { Component } from '../../types/component';
import Select from '../../components/Select';
import { FMSCompanyUser } from '../../data/api/fms';
import LoadingContainer from '../../components/LoadingContainer';
import { ACL } from '../../types/acl';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: theme.spacing(2),
    flex: 1,
    height: theme.spacing(4),
    margin: theme.spacing(2),
  },
  button: {
    minWidth: theme.spacing(3),
    borderRadius: theme.spacing(4),
    justifyContent: 'center',
    alignContent: 'center',
    margin: theme.spacing(0.5),
    padding: theme.spacing(0),
    marginLeft: theme.spacing(2),
  },
  select: {
    flex: 1,
    maxWidth: theme.spacing(32),
  },
  check: {
    color: theme.palette.success.main,
  },
  close: {
    color: theme.palette.error.main,
  },
}));

type Props = {
  handleUserAdded: (
    fmsUser: FMSCompanyUser,
    defaultACLId: string | undefined,
    userRights: UserRight[],
  ) => void;
  saving: boolean;
  data?: FMSCompanyUser[];
  acls?: ACL[];
}

const AddUser: Component<Props> = ({
  handleUserAdded,
  data,
  saving,
  acls,
}) => {
  const allUserRights = Object.values(UserRightType)
    .map((right) => UserRight.parse({ userRightType: right }));
  const classes = useStyles();
  const { t } = useTranslation();
  const [addUser, setAddUser] = useState(false);
  const [fmsUser, setFmsUser] = useState<FMSCompanyUser>();

  const [userRights, setUserRights] = useState<UserRight[]>([]);
  const [defaultACL, setDefaultACL] = useState<ACL>();

  useEffect(() => {
    if (fmsUser && fmsUser.userAccessLevelId > 1) {
      setUserRights(allUserRights);
    } else {
      setUserRights([]);
    }
  }, [fmsUser]);

  const clearNewUser = () => {
    setAddUser(false);
    setFmsUser(undefined);
    setUserRights([]);
  };

  const handleConfirm = () => {
    if (!fmsUser) return;
    if (fmsUser.userAccessLevelId > 1) {
      handleUserAdded(fmsUser, defaultACL?.id, allUserRights);
    } else {
      handleUserAdded(fmsUser, defaultACL?.id, userRights);
    }
    clearNewUser();
  };

  if (!addUser && !saving) {
    return (
      <AddIcon className={classes.container} onClick={() => setAddUser(true)} />
    );
  }

  return (
    <div className={classes.container}>
      <Select
        data={data}
        value={fmsUser}
        isFullWidth
        onChange={setFmsUser}
        isMulti={false}
        className={classes.select}
        labelProp={(user) => `${user.firstName} ${user.lastName}`}
        idProp="userId"
      />
      {fmsUser && (
        <Select
          data={acls}
          value={defaultACL}
          isFullWidth
          placeholder={t('labels.selectDefaultACL')}
          onChange={setDefaultACL}
          isMulti={false}
          className={classes.select}
          labelProp="name"
          idProp="id"
        />
      )}
      {fmsUser && defaultACL && (
        <Select
          data={allUserRights}
          value={userRights}
          isMulti
          isFullWidth
          placeholder={t('labels.selectUserRights')}
          onChange={(selection) => {
            if (fmsUser.userAccessLevelId < 2) {
              setUserRights(selection);
            }
          }}
          className={classes.select}
          labelProp={(userRight) => t(`labels.${userRight.userRightType}`)}
          idProp="userRightType"
        />
      )}
      {
        saving
          ? (
            <Button disableRipple variant="text" disabled className={classes.button} onClick={handleConfirm}>
              <LoadingContainer fetching />
            </Button>
          ) : (
            <>
              <Button disableRipple variant="text" className={classes.button} onClick={handleConfirm}>
                <CheckIcon className={classes.check} />
              </Button>
              <Button disableRipple variant="text" className={classes.button} onClick={clearNewUser}>
                <CloseIcon className={classes.close} />
              </Button>
            </>
          )
      }
    </div>
  );
};

export default AddUser;
