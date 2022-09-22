import {
  Checkbox,
  makeStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import Select from '../../../components/Select';
import { Body, Caption, Tiny } from '../../../components/Typography';
import { ConcentrationPercentages, FormulationComponent } from '../../../types/formulation';
import TransferList from './TransferList';
import PercentageInput from '../../../components/PercentageInput';

const useStyles = makeStyles((theme) => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
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
  clearGroup: {
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(2),
  },
}));

type Props = {

  dataTestId?: string;
  isFetching?: boolean;

  technicalVarnishes: FormulationComponent[] | undefined;

  clearBases: FormulationComponent[] | undefined;
  selectedClear: FormulationComponent | undefined;
  onChangeClear: (arg?: string | undefined) => void;

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

  filter: string[];
  varnishModeSwitch: JSX.Element;
  colorantGroups: JSX.Element;
};

const Components = ({
  dataTestId,
  isFetching,
  technicalVarnishes,
  clearBases,
  selectedClear,
  onChangeClear,
  components,
  selectedComponentIds,
  onSelectComponents,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  requiredComponentIds,
  onChangeColorantsRequired,
  filter,
  varnishModeSwitch,
  colorantGroups,
}: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const splitComponents = (
    selectedIds: string[],
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

  const minValue = (selectedClear
    && (concentrationPercentages[selectedClear.id]?.minConcentrationPercentage
      || selectedClear.minConcentrationPercentage))
    ?? 0;

  const maxValue = (selectedClear
    && (concentrationPercentages[selectedClear.id]?.maxConcentrationPercentage
      || selectedClear.maxConcentrationPercentage))
    ?? 100;
  return (
    <div className={classes.section}>
      <Caption className={classes.componentsHeader}>{t('labels.components')}</Caption>
      {varnishModeSwitch}
      <div className={classes.inputRow}>
        <Body>{t('labels.clear')}</Body>
        <div className={classes.clearGroup}>
          <Select
            disabled={isFetching}
            id="clear-select"
            instanceId="clear-select"
            dataTestId="selectedClearCoat"
            value={selectedClear}
            data={clearBases}
            idProp="id"
            labelProp="name"
            isMulti={false}
            onChange={(clear?: FormulationComponent) => onChangeClear(clear?.id)}
          />
          <Tiny>
            {t('labels.min')}
            :
          </Tiny>
          <PercentageInput
            dataTestId="clear-coat-min-value"
            value={minValue}
            onChange={(value) => {
              onChangeConcentrationPercentages(
                `${selectedClear?.id}`,
                value,
              );
            }}
            alwaysShowControls
          />
          <Tiny>
            {t('labels.max')}
            :
          </Tiny>
          <PercentageInput
            dataTestId="clear-coat-max-value"
            value={maxValue}
            onChange={(value) => {
              onChangeConcentrationPercentages(
                `${selectedClear?.id}`,
                undefined,
                value,
              );
            }}
            alwaysShowControls
          />
          <Tiny>
            {t('labels.required')}
            :
          </Tiny>
          <Checkbox
            data-testid="clear-coat-required"
            checked={selectedClear && (requiredComponentIds.includes(selectedClear.id))}
            disabled={!selectedClear}
            color="primary"
            onChange={(_event, checked) => onChangeColorantsRequired(
              `${selectedClear?.id}`,
              checked,
            )}
          />
        </div>
      </div>
      <TransferList
        dataTestId={`${dataTestId}-transfer-list`}
        isFetching={isFetching}
        components={components}
        selectedComponentIds={selectedComponentIds}
        onSelectComponents={(selectedIds) => {
          const [rest, selected] = splitComponents(
            selectedIds,
            technicalVarnishes,
            components,
          );
          onSelectComponents([...rest, ...selected]);
        }}
        filter={filter}
        concentrationPercentages={concentrationPercentages}
        onChangeConcentrationPercentages={onChangeConcentrationPercentages}
        requiredComponentIds={requiredComponentIds}
        onChangeColorantsRequired={onChangeColorantsRequired}
        colorantGroups={colorantGroups}
      />
    </div>
  );
};

export default Components;
