import { makeStyles } from '@material-ui/core/styles';
import FormulationSettings from './FormulationSettings';
import SortingCriteria from './SortingCriteria';
import { useFormulationConfiguration } from '../../../data/configurations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    display: 'flex',
  },
  setting: {
    maxWidth: theme.spacing(55.5),
    width: '100%',
    marginRight: theme.spacing(8.25),
  },
}));

const Formulation = () => {
  const classes = useStyles();

  const {
    configuration,
    isLoading,
    isUpdating,
    setConfiguration,
  } = useFormulationConfiguration();

  return (
    <div className={classes.root}>
      <div className={classes.setting}>
        <FormulationSettings />
      </div>
      <SortingCriteria
        criteria={configuration?.sortingCriteria}
        saveCriteria={(sortingCriteria) => setConfiguration({ sortingCriteria })}
        isLoading={isLoading || isUpdating}
      />
    </div>
  );
};

export default Formulation;
