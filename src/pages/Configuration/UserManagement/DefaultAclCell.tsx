import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { makeStyles } from '@material-ui/core';

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

const DefaultAclCell = (props: CellProps<UserColumn>) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { row: { original } } = props;
  const {
    allACLs,
    editingRow: editing,
    saving: isSaving,
    setEditingRow: setData,
  } = original;

  if (original.id === editing.id) {
    if (isSaving) {
      return <LoadingContainer fetching />;
    }
    return (
      <div className={classes.actions}>
        <Select
          data={allACLs}
          value={editing?.defaultACL}
          isFullWidth
          placeholder={t('labels.selectDefaultACL')}
          onChange={(newACL) => setData({ defaultACL: newACL })}
          isMulti={false}
          className={classes.select}
          labelProp="name"
          idProp="id"
        />
      </div>
    );
  }

  return <Cell value={original.defaultACL?.name ?? ''} />;
};

export default DefaultAclCell;
