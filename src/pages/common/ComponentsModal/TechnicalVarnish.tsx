import {
  Grid,
  makeStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Caption } from '../../../components/Typography';
import { ConcentrationPercentages, FormulationComponent } from '../../../types/formulation';
import TransferList from './TransferList';

const useStyles = makeStyles((theme) => ({
  growingSection: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  inputRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    minHeight: theme.spacing(5.25),

    '&>p': {
      marginRight: theme.spacing(2),
      width: theme.spacing(22),
    },
  },
  componentsHeader: {
    marginBottom: theme.spacing(1.5),
  },
}));

type Props = {
  isFetching?: boolean;
  technicalVarnishes: FormulationComponent[] | undefined;
  components: FormulationComponent[] | undefined;
  selectedComponentIds: string[];
  onSelectComponents: (arg: string[]) => void;
  concentrationPercentages: ConcentrationPercentages;
  onChangeConcentrationPercentages: (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => void;
  requiredComponentIds: string[];
  onChangeColorantsRequired: (componentId: string, required: boolean) => void;
  disabled?: boolean;
};

const splitComponents = (
  selectedIds: string[],
  selectedComponentIds: string[],
  rest?: FormulationComponent[],
  selected?: FormulationComponent[],
) => {
  const restFiltered = rest?.filter((component) => {
    return selectedComponentIds.includes(component.id);
  }).map((component) => component.id) ?? [];

  const selectedFiltered = selected?.filter((component) => {
    return selectedIds.includes(component.id);
  }).map((component) => component.id) ?? [];

  return [restFiltered, selectedFiltered];
};

const TechnicalVarnish = ({
  isFetching,
  technicalVarnishes,
  components,
  selectedComponentIds,
  onSelectComponents,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  requiredComponentIds,
  onChangeColorantsRequired,
  disabled = false,
}: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const selectedVarnishes = technicalVarnishes?.filter((component) => {
    return selectedComponentIds.includes(component.id);
  });

  const selectedVarnishesIds = selectedVarnishes?.map((varnish) => varnish.id) ?? [];

  return (
    <Grid item className={classes.growingSection}>
      <Caption className={classes.componentsHeader}>{t('labels.technicalVarnish')}</Caption>
      <TransferList
        dataTestId="technical-varnish-transfer-list"
        isFetching={isFetching}
        components={technicalVarnishes}
        concentration="single"
        selectedComponentIds={selectedVarnishesIds}
        showRequired={false}
        onSelectComponents={(selectedIds) => {
          const [rest, selected] = splitComponents(
            selectedIds,
            selectedComponentIds,
            components,
            technicalVarnishes,
          );
          onSelectComponents([...rest, ...selected]);
        }}
        concentrationPercentages={concentrationPercentages}
        onChangeConcentrationPercentages={onChangeConcentrationPercentages}
        requiredComponentIds={requiredComponentIds}
        onChangeColorantsRequired={onChangeColorantsRequired}
        disabled={disabled}
      />
    </Grid>
  );
};

export default TechnicalVarnish;
