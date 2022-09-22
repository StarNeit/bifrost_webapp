import clsx from 'clsx';
import {
  Grid,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import {
  Assortment,
  CalibrationCondition,
  Colorant,
  Substrate,
} from '@xrite/cloud-formulation-domain-model';

import FullScreenDialog from '../../../components/FullScreenDialog';
import { Body } from '../../../components/Typography';
import Switch from '../../../components/Switch';
import { ConcentrationPercentages, FormulationComponent } from '../../../types/formulation';
import { ModalProps } from '../../../types/modal';
import ComponentFilterType from './ComponentFilterType';
import { RecipeOutputMode, TotalMode } from '../../../types/recipe';
import TechnicalVarnish from './TechnicalVarnish';
import Components from './Components';
import Additives from './Additives';
import { storeTestData } from '../../../utils/test-utils';
import LeftoversModal from '../LeftoversModal';
import ColorantGroupSelect from './ColorantGroupSelect';

const useStyles = makeStyles((theme) => ({
  content: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  halfSection: {
    display: 'flex',
    overflow: 'hidden',
    gap: theme.spacing(8),
  },
  componentTransferSection: {
    flexDirection: 'row',
    flex: 1,
    columnGap: theme.spacing(3),
    marginBottom: theme.spacing(2),

    '&>div': {
      flex: 1,
    },
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
  iconButton: {
    background: theme.palette.action.active,
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1),

    '& svg': {
      color: theme.palette.text.primary,
      fontSize: theme.spacing(2),
    },
    '&:disabled': {
      opacity: 0.3,
    },
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  select: {
    width: '500px',
  },
  groupSelectContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  deleteButtonIcon: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

type Props = ModalProps & {
  headerTitle: string;

  dataTestId?: string;
  isFetching?: boolean;

  assortment: Assortment | undefined;
  substrate: Substrate | undefined;
  calibrationCondition?: CalibrationCondition;

  technicalVarnishes: FormulationComponent[] | undefined;
  technicalVarnishMode: TotalMode,
  onChangeTechnicalVarnishMode: (arg: TotalMode) => void;

  clearBases: FormulationComponent[] | undefined;
  selectedClear: FormulationComponent | undefined;
  onChangeClear: (arg?: string | undefined) => void;

  components: FormulationComponent[] | undefined;
  colorants: Colorant[] | undefined;
  selectedComponentIds: string[];
  onSelectComponents: (arg: string[]) => void;
  selectedAdditiveIds?: string[];
  onSelectAdditives?: (arg: string[]) => void;

  concentrationPercentages: ConcentrationPercentages;
  onChangeConcentrationPercentages: (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => void;

  requiredComponentIds: string[];
  onChangeColorantsRequired: (componentId: string, required: boolean) => void;

  selectedAssortmentId?: string;
  recipeOutputMode?: RecipeOutputMode;
  disableTechnicalVarnishes?: boolean;
};

const ComponentsModal = ({
  headerTitle,
  dataTestId,
  isFetching,
  isOpen,
  assortment,
  substrate,
  calibrationCondition,
  closeModal,
  technicalVarnishes,
  technicalVarnishMode,
  onChangeTechnicalVarnishMode,
  clearBases,
  selectedClear,
  onChangeClear,
  colorants,
  components,
  selectedComponentIds,
  onSelectComponents,
  selectedAdditiveIds,
  onSelectAdditives,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  requiredComponentIds,
  onChangeColorantsRequired,
  selectedAssortmentId,
  recipeOutputMode,
  disableTechnicalVarnishes = false,
}: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [showLeftoversModal, setShowLeftoversModal] = useState(false);
  const [filter, setFilter] = useState<string[]>([]);

  const componentTypes: string[] = useMemo(() => {
    return [...new Set(components?.map((c) => c.type)), 'Leftovers'];
  }, [components]);

  const handleClose = () => {
    closeModal();
  };

  if (selectedClear) {
    storeTestData('selectedClearCoat', selectedClear);
  }

  const varnishModeSwitch = (
    <div className={classes.inputRow}>
      <Body>{t('labels.totalMode')}</Body>
      <Switch
        dataTestId="selectedTechnicalVarnishMode"
        isChecked={technicalVarnishMode === 'Total'}
        checkedElement={t('labels.totalInk')}
        uncheckedElement={t('labels.totalBasicInk')}
        width={16}
        disabled={disableTechnicalVarnishes}
        onChange={(checked: boolean) => {
          onChangeTechnicalVarnishMode(
            checked ? 'Total' : 'BasicInkTotal',
          );
        }}
      />
    </div>
  );

  return (
    <FullScreenDialog
      headerTitle={headerTitle}
      isOpen={isOpen}
      handleClose={handleClose}
      exitLabel={t('labels.close')}
    >
      <div data-testid={dataTestId} className={classes.content}>
        <div className={clsx(classes.section, classes.componentTransferSection)}>
          <Components
            dataTestId={dataTestId}
            isFetching={isFetching}
            technicalVarnishes={technicalVarnishes}
            clearBases={clearBases}
            selectedClear={selectedClear}
            onChangeClear={onChangeClear}
            components={components}
            selectedComponentIds={selectedComponentIds}
            onSelectComponents={onSelectComponents}
            concentrationPercentages={concentrationPercentages}
            onChangeConcentrationPercentages={onChangeConcentrationPercentages}
            requiredComponentIds={requiredComponentIds}
            onChangeColorantsRequired={onChangeColorantsRequired}
            filter={filter}
            varnishModeSwitch={varnishModeSwitch}
            colorantGroups={(
              <ColorantGroupSelect
                components={components}
                colorants={colorants}
                selectedComponentIds={selectedComponentIds}
                onSelectComponents={onSelectComponents}
                showCreate
                showDelete
                showSelectAll={false}
              />
              )}
          />
          <Grid container className={classes.section} spacing={3}>
            {technicalVarnishes && technicalVarnishes?.length > 0 && (
              <TechnicalVarnish
                isFetching={isFetching}
                technicalVarnishes={technicalVarnishes}
                components={components}
                selectedComponentIds={selectedComponentIds}
                onSelectComponents={onSelectComponents}
                concentrationPercentages={concentrationPercentages}
                onChangeConcentrationPercentages={onChangeConcentrationPercentages}
                requiredComponentIds={requiredComponentIds}
                onChangeColorantsRequired={onChangeColorantsRequired}
                disabled={disableTechnicalVarnishes}
              />
            )}
            {
              (recipeOutputMode === RecipeOutputMode.BasicMaterial)
              && selectedAdditiveIds && onSelectAdditives && (
                <Additives
                  isFetching={isFetching}
                  selectedAdditiveIds={selectedAdditiveIds}
                  onSelectAdditives={onSelectAdditives}
                  concentrationPercentages={concentrationPercentages}
                  onChangeConcentrationPercentages={onChangeConcentrationPercentages}
                  selectedAssortmentId={selectedAssortmentId}
                />
              )
            }
          </Grid>
        </div>
        <div className={classes.section}>
          <div className={classes.halfSection}>
            <div className={classes.inputRow}>
              <Body>{t('labels.filterBy')}</Body>
              <ComponentFilterType
                types={componentTypes}
                filter={filter}
                onChange={setFilter}
              />
            </div>
            <div className={classes.inputRow}>
              <Body>{t('labels.addLeftovers')}</Body>
              <IconButton
                disabled={!(assortment && substrate && calibrationCondition)}
                className={classes.iconButton}
                onClick={() => setShowLeftoversModal(true)}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
              {assortment && substrate && calibrationCondition && (
                <LeftoversModal
                  embedded
                  isOpen={showLeftoversModal}
                  assortment={assortment}
                  calibrationCondition={calibrationCondition}
                  substrate={substrate}
                  handleClose={() => setShowLeftoversModal(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </FullScreenDialog>
  );
};

export default ComponentsModal;
