import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { Body } from '../../../components/Typography';
import ValidationInput from '../../../components/ValidationInput';

import { setColorantsMaxCount } from '../../../data/reducers/formulation';
import { useFormulationDefaults } from '../../../data/api/formulationDefaults';

const useStyles = makeStyles((theme) => ({
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
  },
  input: {
    width: theme.spacing(9.75),
    height: theme.spacing(3.25),
  },
}));

const FormulationSettings = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { colorantsMaxCount } = useSelector((state) => state.formulation);
  const [defaults, setFormulationDefaults] = useFormulationDefaults();

  const onMaxColorantsChange = (value: string) => dispatch(
    setColorantsMaxCount(parseInt(value, 10)),
  );
  const onDefaultCanSizeChange = (value: string) => defaults && setFormulationDefaults({
    ...defaults,
    defaultCanSize: parseFloat(value),
  });

  return (
    <>
      <div className={classes.settingRow}>
        <Body>{t('labels.maxColorantsCount')}</Body>
        <ValidationInput
          className={classes.input}
          type="number"
          min={0}
          max={Number.MAX_SAFE_INTEGER}
          value={`${colorantsMaxCount}`}
          onChange={onMaxColorantsChange}
        />
      </div>
      <div className={classes.settingRow}>
        <Body>{t('labels.defaultCanSize')}</Body>
        <ValidationInput
          className={classes.input}
          type="number"
          min={1}
          max={Number.MAX_SAFE_INTEGER}
          value={`${defaults?.defaultCanSize}`}
          onChange={onDefaultCanSizeChange}
        />
      </div>
    </>
  );
};

export default FormulationSettings;
