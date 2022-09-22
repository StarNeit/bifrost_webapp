import { makeStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';

import { Body } from '../../../components/Typography';
import Select from '../../../components/Select';
import InputField from '../../../components/InputField';
import IconSquareButton from '../../../components/IconSquareButton';
import FixedTable from './Tables/FixedTable';
import CommonTable from './Tables/CommonTable';
import { scrollbars } from '../../../theme/components';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  row: {
    display: 'flex',
    marginBottom: theme.spacing(3.25),
  },
  label: {
    minWidth: theme.spacing(25.5),
    display: 'flex',
    alignItems: 'center',
  },
  selectWrapper: {
    minWidth: theme.spacing(32),
    marginRight: theme.spacing(1.5),
  },
  tables: {
    display: 'flex',
  },
  scrollableWrapper: {
    overflowX: 'auto',
    display: 'flex',
    ...scrollbars(theme),
  },
  createNew: {
    width: '100%',
    height: theme.spacing(7),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.surface[3],
    borderRadius: theme.spacing(1),
    minWidth: theme.spacing(50),
  },
}));

const AssortmentColorants = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleChangeAssortment = () => {
    // TODO: Edit;
  };

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Body className={classes.label}>Assortment</Body>
        <div className={classes.selectWrapper}>
          <Select
            isFullWidth
            data={[]}
            isMulti={false}
            onChange={handleChangeAssortment}
          />
        </div>
        <IconSquareButton icon={DeleteIcon} />
      </div>

      <div className={classes.row}>
        <Body className={classes.label}>
          {`${t('labels.filterBy')} ${t('labels.name')}`}
        </Body>
        <div className={classes.selectWrapper}>
          <InputField
            value=""
            placeholder={`${t('labels.enterAliasName')}...`}
          />
        </div>
      </div>

      <div className={classes.tables}>
        <FixedTable />

        <div className={classes.scrollableWrapper}>
          <CommonTable title="Latin America" />
          <CommonTable title="Europe Alias2" />
          <CommonTable title="Asia" />

          <div className={classes.createNew}>
            <Body>{t('labels.createNewAliasGroup')}</Body>
            <IconSquareButton icon={AddIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssortmentColorants;
