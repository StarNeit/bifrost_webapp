/* eslint-disable max-len */
import { makeStyles } from '@material-ui/core';
import { Measurement, Standard, Tolerance } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import {
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

import { Component } from '../../../types/component';
import { useStateObject } from '../../../utils/utils';
import DMSBrowser from '../DMSBrowser';
import ConfirmationPopover from '../../../components/ConfirmationPopover';
import FullScreenDialog from '../../../components/FullScreenDialog';
import InputField from '../../../components/InputField';
import { Body } from '../../../components/Typography';
import Header from './Header';
import ModalWidget from '../../../widgets/ModalWidget';
import { FormData } from './types';
import FileBrowserForStandard from './FileBrowser/FileBrowserForStandard';
import { ModalProps } from '../../../types/modal';
import { WidgetType } from '../../../widgets/WidgetLayout/types';
import Select from '../../../components/Select';
import { useAccessControlLists, useStandards } from '../../../data/api';
import Button from '../../../components/Button';
import { IMPORT_SOURCE } from '../../../constants/ui';
import ManualConfigForStandard from './ManualConfigForStandard';
import PantoneLiveLogin from './PantoneLive/PantoneLiveLogin';
import PantoneLibraryForStandard from './PantoneLive/PantoneLibraryForStandard';
import { usePantoneLiveConnection } from '../../../data/pantone';
import { useStandardModalWidgetConfiguration, useColorimetricConfiguration } from '../../../data/configurations';
import ValidationInput from '../../../components/ValidationInput';

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    display: 'flex',
    marginTop: theme.spacing(4),
    overflow: 'hidden',
  },
  section: {
    flex: 1,
    '&+&': {
      marginLeft: theme.spacing(3),
    },
  },
  row: {
    display: 'flex',
    marginBottom: theme.spacing(3.5),
  },
  widget: {
    minHeight: theme.spacing(60),
  },
  label: {
    minWidth: theme.spacing(12.5),
    paddingTop: theme.spacing(1),
  },
  formInput: {
    width: '100%',
  },
  deToleranceModeSelect: {
    flex: 1,
  },
  toleranceInput: {
    maxWidth: theme.spacing(10),
    marginLeft: theme.spacing(1.5),
  },
  saveButton: {
    fontSize: theme.spacing(1.5),
    letterSpacing: '1.5px',
    height: theme.spacing(5.25),
    width: `calc(100% - ${theme.spacing(12.5)}px)`,
    textTransform: 'capitalize',
    float: 'right',
  },
}));

const emptyFormData: Required<FormData> = {
  name: '',
  tolerance: 0,
};

type Props = ModalProps & {
  createStandard(standard: Pick<Standard, 'id' | 'name' | 'creationDateTime' | 'measurements' | 'aclId' | 'tolerances'>): Promise<void>;
};

enum DeToleranceMode {
  NotSet = 1,
  GlobalSettings = 2,
  CustomValue = 3,
}

const deToleranceLabels: Record<DeToleranceMode, string> = {
  [DeToleranceMode.NotSet]: 'notSet',
  [DeToleranceMode.GlobalSettings]: 'globalSettings',
  [DeToleranceMode.CustomValue]: 'customValue',
};

const StandardModal: Component<Props> = ({
  isOpen,
  closeModal,
  createStandard,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { accessControlLists, fetching: fetchingACLs } = useAccessControlLists();
  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();

  const globalOrUnsetTolerance = colorimetricConfiguration?.tolerance?.upperLimit !== undefined
    ? DeToleranceMode.GlobalSettings
    : DeToleranceMode.NotSet;

  const deToleranceOptions = useMemo(() => [
    globalOrUnsetTolerance,
    DeToleranceMode.CustomValue,
  ], [colorimetricConfiguration]);

  const [deToleranceMode, setDeToleranceMode] = useState<DeToleranceMode>(globalOrUnsetTolerance);

  const [aclId, setAclId] = useState<string>();
  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();
  const [formData, updateFormData] = useStateObject(emptyFormData);
  const [measurement, setMeasurement] = useState<Measurement>();
  const { status: pantoneStatus } = usePantoneLiveConnection();

  const {
    result: standards,
  } = useStandards();

  // confirmation
  const [isEdited, setIsEdited] = useState(false);
  const [isDuplicatedName, setIsDuplicatedName] = useState(false);
  const [exitAnchorEl, setExitAnchorEl] = useState<HTMLElement>();
  const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement>();

  const [creatingStandard, setCreatingStandard] = useState(false);

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useStandardModalWidgetConfiguration();

  // TODO: remove when modal is refactored to mount/unmount (EFXW-1903)
  useEffect(() => {
    updateFormData(emptyFormData);
    setMeasurement(undefined);
    setIsEdited(false);
    setAclId(undefined);
  }, [isOpen]);

  useEffect(() => {
    if (importSource === IMPORT_SOURCE.MANUAL && widgetConfiguration?.type === WidgetType.SpectralGraph) {
      setConfiguration({ ...widgetConfiguration, type: WidgetType.ColorSwatch });
    }
  }, [importSource]);

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    if (isEdited) {
      setExitAnchorEl(e.currentTarget);
    } else {
      closeModal();
    }
  };

  const handleMeasurementChange = (newMeasurement: Measurement) => {
    setMeasurement(newMeasurement);
    setIsEdited(true);
  };

  const handleStandardSelected = (newMeasurement: Measurement, name: string) => {
    handleMeasurementChange(newMeasurement);
    updateFormData({ name });
  };

  const handleManualUpdated = (newMeasurement: Measurement) => {
    setMeasurement(newMeasurement);
    setIsEdited(true);
  };

  const handleFormDataUpdate = (update: Partial<FormData>) => {
    updateFormData(update);
    setIsEdited(true);
  };

  const checkNames = (newName: string) => {
    return standards.some((standard) => standard.name.toLowerCase() === newName.toLowerCase());
  };

  const handleSave = async (e?: MouseEvent<HTMLButtonElement>) => {
    setCreatingStandard(true);

    const { name, tolerance } = formData;
    if (!name || !measurement) return;

    const duplicateName = checkNames(name);
    if (duplicateName && !isDuplicatedName) {
      setIsDuplicatedName(true);
      setSaveAnchorEl(e?.currentTarget);
      setCreatingStandard(false);
      return;
    }

    const id = uuid();
    const creationDateTime = (new Date()).toISOString();
    const dE = colorimetricConfiguration?.metric.deltaE === 'dE00' ? 'dE2000' : 'dE';

    const tolerances = deToleranceMode === DeToleranceMode.CustomValue && tolerance ? (
      [Tolerance.parse({
        id: uuid(),
        lowerLimit: 0,
        upperLimit: tolerance,
        metric: {
          id: dE,
        },
      })]
    ) : [];

    await createStandard({
      id,
      creationDateTime,
      name,
      aclId,
      tolerances,
      measurements: [Measurement.parse({
        ...measurement,
        id: uuid(),
      })],
    });

    setIsDuplicatedName(false);
    setCreatingStandard(false);
  };

  const canSave = useMemo(() => Boolean(
    measurement
    && formData.name
    && aclId
    && formData.tolerance >= 0,
  ), [measurement, formData, formData.name, formData.tolerance, aclId]);

  return (
    <>
      <FullScreenDialog
        headerTitle={t('labels.newStandard')}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <Header
          importSource={importSource}
          onImportSourceChange={setImportSource}
          onMeasurementChange={handleMeasurementChange}
          manualImportEnabled
        />

        <div className={classes.content}>
          {importSource === IMPORT_SOURCE.PANTONE && pantoneStatus !== 'connected-authenticated' && pantoneStatus !== 'connected-public' ? (
            <PantoneLiveLogin />
          ) : (
            <>
              <div className={classes.section}>
                <div className={classes.row}>
                  <Body className={classes.label}>{t('labels.standard')}</Body>
                  <InputField
                    dataTestId="new-standard-name"
                    className={classes.formInput}
                    placeholder={t('labels.enterName')}
                    value={formData.name}
                    onChange={(name) => handleFormDataUpdate({ name })}
                  />
                </div>
                <div className={classes.row}>
                  <Body className={classes.label}>{t('labels.access')}</Body>
                  <Select
                    data={accessControlLists}
                    onChange={(acl) => setAclId(acl.id)}
                    value={accessControlLists?.find((acl) => acl.id === aclId)}
                    id="acl-select"
                    labelProp="name"
                    idProp="id"
                    isFullWidth
                    isMulti={false}
                    isLoading={fetchingACLs}
                  />
                </div>
                <div className={classes.row}>
                  <Body className={classes.label}>{t('labels.deTolerance')}</Body>
                  <Select
                    id="de-tolerance-mode-select"
                    data={deToleranceOptions}
                    className={classes.deToleranceModeSelect}
                    isMulti={false}
                    onChange={setDeToleranceMode}
                    value={deToleranceMode}
                    labelProp={(mode: DeToleranceMode) => t(`labels.${deToleranceLabels[mode]}`, {
                      globalValue: colorimetricConfiguration?.tolerance?.upperLimit,
                    })}
                  />
                  {deToleranceMode === DeToleranceMode.CustomValue && (
                    <ValidationInput
                      id="new-standard-tolerance"
                      dataTestId="new-standard-tolerance"
                      type="number"
                      className={clsx(classes.toleranceInput, classes.formInput)}
                      value={formData.tolerance}
                      min={0}
                      step={0.1}
                      onError={(id, message) => id === 'new-standard-tolerance' && message && handleFormDataUpdate({ tolerance: -1 })}
                      onChange={(tolerance) => handleFormDataUpdate({ tolerance: parseFloat(tolerance) })}
                    />
                  )}
                </div>

                <Button
                  data-testid="save-new-standard-button"
                  color="primary"
                  className={classes.saveButton}
                  disabled={!canSave || isDuplicatedName}
                  onClick={handleSave}
                  showSpinner={creatingStandard}
                >
                  {t('labels.save')}
                </Button>
              </div>

              <div className={classes.section}>
                <div className={clsx(classes.row, classes.widget)}>
                  { widgetConfiguration && (
                    <ModalWidget
                      dataTestId="new-standard"
                      configuration={widgetConfiguration}
                      setConfiguration={setConfiguration}
                      measurement={measurement}
                    />
                  )}
                </div>
              </div>

              <div className={classes.section}>
                {importSource === IMPORT_SOURCE.DMS && (
                  <DMSBrowser onJobSelected={handleMeasurementChange} />
                )}
                {importSource === IMPORT_SOURCE.PANTONE && (
                  <PantoneLibraryForStandard onStandardSelected={handleStandardSelected} />
                )}
                {importSource === IMPORT_SOURCE.FILE && (
                  <FileBrowserForStandard onFileSelected={handleStandardSelected} />
                )}
                {importSource === IMPORT_SOURCE.MANUAL && (
                  <ManualConfigForStandard onManualUpdated={handleManualUpdated} />
                )}
              </div>
            </>
          )}
        </div>
      </FullScreenDialog>
      <ConfirmationPopover
        open={Boolean(exitAnchorEl)}
        onClose={() => setExitAnchorEl(undefined)}
        onConfirm={() => {
          setExitAnchorEl(undefined);
          closeModal();
        }}
        anchorEl={exitAnchorEl}
        message={t('labels.doYouWantToSave')}
        cancelText={t('labels.cancel')}
        confirmText={t('labels.dontSave')}
      />
      <ConfirmationPopover
        open={Boolean(saveAnchorEl)}
        onClose={() => {
          setSaveAnchorEl(undefined);
          handleSave();
        }}
        onConfirm={() => {
          setSaveAnchorEl(undefined);
          setIsDuplicatedName(false);
        }}
        anchorEl={saveAnchorEl}
        message={t('messages.nameExists')}
        cancelText={t('labels.save')}
        confirmText={t('labels.dontSave')}
      />
    </>
  );
};

export default StandardModal;
