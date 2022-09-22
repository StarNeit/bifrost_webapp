import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { makeStyles } from '@material-ui/core';
import { UserRight, UserRightType } from '@xrite/cloud-formulation-domain-model';

import LoadingContainer from '../../../components/LoadingContainer';
import { UserColumn } from '.';
import Select from '../../../components/Select';
import Cell from '../../common/Table/StringCell';

const useStyles = makeStyles((theme) => ({
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  select: {
    flex: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const UserRightsCell = ({ value, row: { original } }: CellProps<UserColumn, UserRight[]>) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const allUserRights = Object.values(UserRightType);

  const { editingRow: editing, saving: isSaving, setEditingRow: setData } = original;

  if (original.id === editing?.id) {
    if (isSaving) {
      return <LoadingContainer fetching />;
    }

    return (
      <div className={classes.actions}>
        <Select
          data={allUserRights}
          value={editing.userRights}
          isMulti
          isFullWidth
          placeholder={t('labels.selectUserRights')}
          onChange={(newRights) => setData({ userRights: newRights })}
          className={classes.select}
          labelProp={(userRight: UserRightType) => t(`labels.${userRight}`)}
        />
      </div>
    );
  }
  return (
    <Cell value={value?.map((userRight) => t(`labels.${userRight.userRightType}`)).join(', ') ?? ''} />
  );
};

export default UserRightsCell;
