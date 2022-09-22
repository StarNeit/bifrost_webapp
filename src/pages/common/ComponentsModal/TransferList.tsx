import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { IconButton, makeStyles } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';

import { ConcentrationPercentages, FormulationComponent } from '../../../types/formulation';
import TransferListBlock from './TransferListBlock';
import { makeShortName } from '../../../../cypress/support/util/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    overflow: 'hidden',
    flex: 1,
  },
  transferList: {
    width: '100%',
  },
  selectedTransferlist: {
    minWidth: theme.spacing(44),
  },
  transferButtons: {
    paddingTop: theme.spacing(4),
    flexShrink: 0,
    width: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallPanel: {
    maxWidth: theme.spacing(36),
  },
  transferButton: {
    color: theme.palette.common.white,
  },
}));

type Props = {
  dataTestId?: string;
  isFetching?: boolean;
  components: FormulationComponent[] | undefined;
  selectedComponentIds: string[];
  onSelectComponents: (arg: string[]) => void;
  filter?: string[];
  concentration?: 'single' | 'minMax';
  showRequired?: boolean;
  concentrationPercentages: ConcentrationPercentages;
  onChangeConcentrationPercentages: (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => void;
  requiredComponentIds?: string[];
  onChangeColorantsRequired?: (componentId: string, required: boolean) => void;
  disabled?: boolean;
  colorantGroups?: JSX.Element;
  availableBlockLabel?: string;
  selectedBlockLabel?: string;
};

const TransferList = ({
  dataTestId,
  isFetching,
  components,
  selectedComponentIds,
  onSelectComponents,
  filter = [],
  concentration = 'minMax',
  showRequired = true,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  requiredComponentIds,
  onChangeColorantsRequired,
  disabled = false,
  colorantGroups,
  availableBlockLabel,
  selectedBlockLabel,
}: Props) => {
  const classes = useStyles();
  const [tempAvailable, setTempAvailable] = useState<FormulationComponent[]>([]);
  const [tempSelected, setTempSelected] = useState<FormulationComponent[]>([]);

  const availableComponents = useMemo(() => {
    let available: FormulationComponent[];
    if (filter.length > 0) {
      const filterLeftovers = filter.includes('Leftovers');
      available = components?.filter((c) => !selectedComponentIds.includes(c.id)) ?? [];
      available = available.filter((a) => {
        const { isLeftover } = a;
        return isLeftover ? filterLeftovers : filter.includes(a.type);
      });
    } else {
      available = components?.filter((c) => !selectedComponentIds.includes(c.id)) ?? [];
    }
    return available;
  }, [components, filter, selectedComponentIds]);

  const selectedComponents = useMemo(() => {
    return components?.filter((c) => selectedComponentIds.includes(c.id));
  }, [components, selectedComponentIds]);

  const addAvailable = () => {
    const newSelectionIds = tempAvailable?.map((ns) => ns.id) ?? [];
    onSelectComponents([...newSelectionIds, ...selectedComponentIds]);
    setTempAvailable([]);
  };

  const addAllAvailable = () => {
    const allAvailableIds = availableComponents.map((ac) => ac.id);
    onSelectComponents([...allAvailableIds, ...selectedComponentIds]);
    setTempAvailable([]);
  };

  const removeSelected = () => {
    const removingItemsIds = tempSelected?.map((ns) => ns.id) ?? [];
    const newSelection = selectedComponents?.filter((sc) => !removingItemsIds.includes(sc.id));
    const newSelectionIds = newSelection?.map((ns) => ns.id) ?? [];
    onSelectComponents(newSelectionIds);
    setTempSelected([]);
  };

  const removeAllSelected = () => {
    onSelectComponents([]);
    setTempAvailable([]);
  };

  return (
    <div data-testid={dataTestId} className={classes.container}>
      <div className={clsx(classes.transferList, classes.smallPanel)}>
        <TransferListBlock
          dataTestId={`${dataTestId}-unselected`}
          isFetching={isFetching}
          type="unselected"
          availableBlockLabel={availableBlockLabel}
          concentration={concentration}
          components={availableComponents}
          onComponentsSelected={(selected) => {
            setTempAvailable(selected);
          }}
          immediatelyAdd={(selected) => {
            const newSelectionIds = selected.map((component) => component.id);
            onSelectComponents([...newSelectionIds, ...selectedComponentIds]);
            setTempAvailable([]);
          }}
          disabled={disabled}
        />
      </div>
      <div className={classes.transferButtons}>
        <IconButton
          data-testid={`${makeShortName(dataTestId)}-select-all`}
          onClick={addAllAvailable}
          className={classes.transferButton}
          disabled={disabled}
        >
          <LastPageIcon />
        </IconButton>
        <IconButton
          data-testid={`${makeShortName(dataTestId)}-select`}
          onClick={addAvailable}
          className={classes.transferButton}
          disabled={disabled}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
        <IconButton
          data-testid={`${makeShortName(dataTestId)}-unselect`}
          onClick={removeSelected}
          className={classes.transferButton}
          disabled={disabled}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <IconButton
          data-testid={`${makeShortName(dataTestId)}-unselect-all`}
          onClick={removeAllSelected}
          className={classes.transferButton}
          disabled={disabled}
        >
          <FirstPageIcon />
        </IconButton>
      </div>
      <div className={classes.transferList}>
        <TransferListBlock
          colorantGroups={colorantGroups}
          className={classes.selectedTransferlist}
          dataTestId={`${dataTestId}-selected`}
          isFetching={isFetching}
          type="selected"
          concentration={concentration}
          components={selectedComponents}
          showRequired={showRequired}
          selectedBlockLabel={selectedBlockLabel}
          concentrationPercentages={concentrationPercentages}
          onChangeConcentrationPercentages={onChangeConcentrationPercentages}
          requiredComponentIds={requiredComponentIds}
          onChangeColorantsRequired={onChangeColorantsRequired}
          onComponentsSelected={(selected) => {
            setTempSelected(selected);
          }}
          immediatelyAdd={(selected) => {
            const removingItemsIds = selected?.map((ns) => ns.id) ?? [];
            // eslint-disable-next-line max-len
            const newSelection = selectedComponents?.filter((sc) => !removingItemsIds.includes(sc.id));
            const newSelectionIds = newSelection?.map((ns) => ns.id) ?? [];
            onSelectComponents(newSelectionIds);
            setTempSelected([]);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default TransferList;
