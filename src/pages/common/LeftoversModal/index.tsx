import { MouseEvent, ReactElement, useState } from 'react';
import { OptionTypeBase, StylesConfig } from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Slide from '@material-ui/core/Slide';
import { useTranslation } from 'react-i18next';
import { IconButton, useTheme } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import {
  Assortment,
  CalibrationCondition,
  Colorant,
  ColorantType,
  Formula,
  FormulaComponent,
  FormulaLayer,
  Measurement,
  NumberArray,
  Substrate,
} from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import { v4 as uuid } from 'uuid';

import Button from '../../../components/Button';
import { Component } from '../../../types/component';
import { Body, Title } from '../../../components/Typography';
import ExitButton from '../../../components/ExitButton';
import Panel from '../../../components/Panel';
import Header from './Header';
import ModalWidget from '../../../widgets/ModalWidget';
import { getCalibrationEngineClass, useStateObject } from '../../../utils/utils';
import { IMPORT_SOURCE } from '../../../constants/ui';
import InputField from '../../../components/InputField';
import DMSBrowser from '../DMSBrowser';
import ValidationInput from '../../../components/ValidationInput';
import ViscosityInput from '../../Formulation/FormulationSetupPane/ViscosityInput';
import { useCalibration } from '../../../data/cfe';
import PercentageInput from '../../../components/PercentageInput';
import useToast from '../../../data/useToast';
import { useAddColorant } from '../../../data/api';
import Select from '../../../components/Select';
import { RecipeUnit } from '../../../types/recipe';
import { allRecipeUnits } from '../../../utils/utilsRecipe';
import { useLeftoversModalWidgetConfiguration } from '../../../data/configurations';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    marginTop: theme.spacing(4),
    overflow: 'hidden',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    rowGap: theme.spacing(3),
    '&+&': {
      marginLeft: theme.spacing(3),
    },
  },
  row: {
    display: 'flex',
    columnGap: theme.spacing(2),

    '&>p': {
      width: theme.spacing(16),
    },
  },
  inputsContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(1.5),
  },
  label: {
    minWidth: theme.spacing(12.5),
    paddingTop: theme.spacing(1),
  },
  formInput: {
    flex: 1,
  },
  numberInput: {
    width: theme.spacing(14),
  },
  quantityUnit: {
    width: theme.spacing(12),
  },
  specificWeightInput: {
    paddingRight: theme.spacing(7),
  },
  widget: {
    minHeight: theme.spacing(60),
  },
  wrapper: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: `calc(100% - ${theme.spacing(6)}px)`,
    height: `calc(100% - ${theme.spacing(6)}px)`,
    '&:focus': {
      outline: 'none',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  backIcon: {
    color: theme.palette.text.primary,
  },
  headerTitleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: theme.spacing(1.5),
  },
  headerTitle: {
    textTransform: 'uppercase',
  },
  select: {
    margin: theme.spacing(0, 2),
    width: theme.spacing(25),
    marginLeft: 0,
  },
  body: {
    padding: theme.spacing(4),
    background: theme.palette.surface[2],
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
}));

type LeftoverData = {
  name: string;
  quantity: number;
  quantityUnit: RecipeUnit;
  thicknessPercent: number;
  viscosityValue: number;
  specificWeight: number;
  measurement?: Measurement;
};

const initialLeftoverData: LeftoverData = {
  name: '',
  quantity: 0,
  quantityUnit: allRecipeUnits[0],
  thicknessPercent: 100,
  viscosityValue: 0,
  specificWeight: 1,
};

type Props = {
  isOpen: boolean;
  handleClose(event?: MouseEvent<HTMLButtonElement>): void,
  embedded?: boolean;
  assortment: Assortment;
  substrate: Substrate;
  calibrationCondition: CalibrationCondition;
};

const LeftoversModal: Component<Props> = ({
  isOpen,
  handleClose,
  embedded,
  assortment,
  substrate,
  calibrationCondition,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement>();
  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();
  const [leftoverData, updateLeftoverData] = useStateObject<LeftoverData>(initialLeftoverData);
  const { addColorant } = useAddColorant();
  const { calibrate } = useCalibration();
  const { showToast } = useToast();

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useLeftoversModalWidgetConfiguration();

  const handleSave = async () => {
    if (!measurement) return;

    try {
      setLoading(true);

      const colorant = new Colorant({
        id: uuid(),
        name: leftoverData.name,
        type: ColorantType.Colorant,
        isLeftover: true,
        specificMass: leftoverData.specificWeight ?? 1,
        minConcentrationPercentage: 0,
        maxConcentrationPercentage: 100,
        calibrationParameters: [],
      });

      const calibrationResults = await calibrate({
        assortment,
        substrate,
        calibrationCondition,
        measurements: [measurement],
        colorants: [colorant],
        formula: new Formula({
          assortmentId: assortment.id,
          id: uuid(),
          formulaLayers: [new FormulaLayer({
            viscosity: leftoverData.viscosityValue,
            formulaComponents: [new FormulaComponent({
              colorant,
              massAmount: 1,
            })],
            relativeThickness: leftoverData.thicknessPercent / 100,
          })],
          predictionMeasurements: [],
        }),
      });

      if (calibrationResults?.length !== 1) {
        showToast(t('messages.errorCalibratingLeftover'), 'error');
        setLoading(false);
        return;
      }

      colorant.creationDateTime = new Date().toISOString();
      colorant.calibrationParameters = calibrationResults[0].calibrationParameters;
      const engineClass = getCalibrationEngineClass(calibrationCondition);

      if (engineClass === 'IFS' && leftoverData.viscosityValue !== 0) {
        colorant.calibrationParameters.push({
          calibrationConditionId: calibrationCondition.id,
          type: 'viscosityParameters',
          data: new NumberArray({ values: [0, 0, leftoverData.viscosityValue] }),
        });
      }

      // TODO: add quantity into the colorant before creating
      // This should be done in a separate PR
      await addColorant(colorant, assortment.id);

      showToast(t('messages.leftoverCreatedSuccessfully'), 'success');
      setLoading(false);
      handleClose();
    } catch (e) {
      showToast(t('messages.leftoverCreationError'), 'error');
      setLoading(false);
    }
  };

  const renderData = (children: ReactElement) => (embedded ? children : (
    <Slide
      direction="up"
      in={isOpen}
      timeout={{ appear: 0, exit: 300 }}
    >
      {children}
    </Slide>
  ));

  return (
    <Modal
      data-testid="full-screen-modal"
      className={classes.modal}
      open={isOpen}
      closeAfterTransition
      hideBackdrop={embedded}
      onMouseDown={(e) => e.stopPropagation()}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 700,
      }}
    >
      {renderData((
        <div className={classes.wrapper}>
          <div className={classes.header}>
            <div className={classes.headerTitleWrapper}>
              {embedded && (
                <IconButton onClick={handleClose}>
                  <ArrowBack className={classes.backIcon} />
                </IconButton>
              )}
              <Title data-testid="slide-title" className={classes.headerTitle}>{t('labels.newLeftover')}</Title>
            </div>
            {!embedded && (
              <ExitButton data-testid="slide-exit-button" label={t('labels.close')} onClick={handleClose} />
            )}
          </div>
          <Panel className={classes.body}>
            <Header
              importSource={importSource}
              onMeasurementChange={setMeasurement}
              onImportSourceChange={setImportSource}
            />
            <div className={classes.content}>
              <div className={classes.section}>
                <div className={clsx(classes.row, classes.widget)}>
                  { widgetConfiguration && (
                    <ModalWidget
                      measurement={measurement}
                      configuration={widgetConfiguration}
                      setConfiguration={setConfiguration}
                    />
                  )}
                </div>
                <div className={classes.inputsContainer}>
                  <div className={classes.row}>
                    <Body className={classes.label}>{t('labels.name')}</Body>
                    <InputField
                      dataTestId=""
                      className={classes.formInput}
                      placeholder={t('labels.enterName')}
                      onChange={(name) => updateLeftoverData({ name })}
                    />
                  </div>
                  <div className={classes.row}>
                    <Body className={classes.label}>{t('labels.quantity')}</Body>
                    <ValidationInput
                      dataTestId=""
                      type="number"
                      min={0}
                      className={classes.numberInput}
                      placeholder="20"
                      value={leftoverData.quantity}
                      onChange={(quantity) => {
                        updateLeftoverData({ quantity: parseInt(quantity, 10) });
                      }}
                    />
                    <Select<RecipeUnit>
                      id="quantity-unit-select"
                      instanceId="quantity-unit-select"
                      className={classes.quantityUnit}
                      isMulti={false}
                      value={leftoverData.quantityUnit}
                      onChange={(quantityUnit) => updateLeftoverData({ quantityUnit })}
                      data={allRecipeUnits}
                      idProp="id"
                      labelProp="name"
                      isSmall
                      selectStyles={{
                        container: (provided) => ({
                          ...provided,
                        }),
                        control: (provided) => ({
                          ...provided,
                          borderStyle: 'none',
                          boxShadow: 'none',
                          background: theme.palette.surface[3],
                          borderRadius: theme.spacing(1),
                          minHeight: theme.spacing(4),
                          ...theme.typography.body1,
                          '@font-face': undefined,
                        }),
                      } as StylesConfig<OptionTypeBase, boolean>}
                      isSearchable={false}
                    />
                  </div>
                  <div className={classes.row}>
                    <Body className={classes.label}>{t('labels.thickness')}</Body>
                    <PercentageInput
                      dataTestId=""
                      min={20}
                      max={200}
                      className={classes.numberInput}
                      value={leftoverData.thicknessPercent}
                      onChange={(thickness) => {
                        updateLeftoverData({ thicknessPercent: thickness });
                      }}
                    />
                  </div>
                  <div className={classes.row}>
                    <Body className={classes.label}>{t('labels.viscosityValue')}</Body>
                    <ViscosityInput
                      dataTestId=""
                      min={0}
                      className={classes.numberInput}
                      value={leftoverData.viscosityValue}
                      onChange={(viscosityValue) => updateLeftoverData({ viscosityValue })}
                    />
                  </div>
                  <div className={classes.row}>
                    <Body className={classes.label}>{t('labels.specificWeight')}</Body>
                    <ValidationInput
                      dataTestId=""
                      min={0}
                      type="number"
                      unit="g/cm³"
                      inputClassName={classes.specificWeightInput}
                      className={classes.numberInput}
                      value={leftoverData.specificWeight}
                      onChange={(specificWeight) => {
                        updateLeftoverData({ specificWeight: parseInt(specificWeight, 10) });
                      }}
                    />
                  </div>
                </div>
                <div className={classes.row}>
                  <Button
                    showSpinner={loading}
                    disabled={!measurement || loading}
                    fullWidth
                    onClick={handleSave}
                  >
                    {t('labels.save')}
                  </Button>
                </div>
              </div>
              <div className={classes.section}>
                {importSource === IMPORT_SOURCE.DMS && (
                  <DMSBrowser onJobSelected={setMeasurement} />
                )}
              </div>
            </div>
          </Panel>
        </div>
      ))}
    </Modal>
  );
};

export default LeftoversModal;
