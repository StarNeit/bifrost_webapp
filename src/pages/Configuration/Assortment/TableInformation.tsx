import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useTranslation } from 'react-i18next';

import InputField from '../../../components/InputField';
import { Body } from '../../../components/Typography';
import Select from '../../../components/Select';
import { Component } from '../../../types/component';
import IconSquareButton from '../../../components/IconSquareButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  content: {
    minWidth: theme.spacing(50),
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(0, 1.5),
  },
  lgInput: {
    height: theme.spacing(7),
    marginBottom: theme.spacing(0.75),
  },
  row: {
    display: 'flex',
    padding: theme.spacing(0.875, 1.5),
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    minWidth: theme.spacing(15),
  },
  smSelect: {
    width: theme.spacing(8),
  },
  inputWrapper: {
    position: 'relative',
  },
  actions: {
    position: 'absolute',
    right: theme.spacing(1.5),
    top: theme.spacing(1.5),
    display: 'flex',
    '& button:first-child': {
      marginRight: theme.spacing(1.75),
    },
  },
}));

type Props = {
  isEditable?: boolean,
  title?: string,
};

const TableInformation: Component<Props> = ({
  isEditable = false,
  title = '',
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleChangeAccess = () => {
    // TODO: Please Edit
  };

  const handleChangeCurrency = () => {
    // TODO: Please Edit
  };

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.inputWrapper}>
          <InputField className={classes.lgInput} value={title} />
          {isEditable && (
            <div className={classes.actions}>
              <IconSquareButton icon={EditIcon} />
              <IconSquareButton icon={DeleteIcon} />
            </div>
          )}
        </div>
        <div className={classes.row}>
          <Body className={classes.label}>
            {t('labels.access')}
          </Body>
          <Select
            data={[]}
            isMulti={false}
            isFullWidth
            onChange={handleChangeAccess}
          />
        </div>
        <div className={classes.row}>
          <Body className={classes.label}>
            {t('labels.currency')}
          </Body>
          <div className={classes.smSelect}>
            <Select
              data={[]}
              isFullWidth
              isMulti={false}
              onChange={handleChangeCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableInformation;
