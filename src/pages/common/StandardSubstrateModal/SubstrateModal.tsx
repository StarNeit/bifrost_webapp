/* eslint-disable max-len */
import { Button, IconButton, makeStyles } from '@material-ui/core';
import { Measurement } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import {
  MouseEvent, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import { Component } from '../../../types/component';
import { createCalibrationCondition, useStateObject } from '../../../utils/utils';
import DMSBrowser from '../DMSBrowser';
import ConfirmationPopover from '../../../components/ConfirmationPopover';
import FullScreenDialog from '../../../components/FullScreenDialog';
import InputField from '../../../components/InputField';
import { Body } from '../../../components/Typography';
import Select from '../../../components/Select';
import PercentageInput from '../../../components/PercentageInput';
import Header from './Header';
import ModalWidget from '../../../widgets/ModalWidget';
import { FormData } from './types';
import { SubstrateQualityMode, SubstrateTypeMode } from '../../../types/formulation';
import {
  createMetalizedParameters,
  createOpaqueParameters,
  createTransparentFilmParameters,
  getSubstrateQualityModeLabel,
  getSubstrateTypeModeLabel,
} from './utils';
import {
  AddSubstrateMutationVariables,
  CalibrationConditionIn,
  MeasurementIn,
} from '../../../data/api/graphql/generated';
import FileBrowserForSubstrate from './FileBrowser/FileBrowserForSubstrate';
import { useAccessControlLists, useSubstrates } from '../../../data/api';
import { IMPORT_SOURCE } from '../../../constants/ui';
import { useStandardModalWidgetConfiguration } from '../../../data/configurations';

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    display: 'flex',
    marginTop: theme.spacing(4),
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
  rowSm: {
    display: 'flex',
    marginBottom: theme.spacing(3),
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
  saveButton: {
    fontSize: theme.spacing(1.5),
    letterSpacing: '1.5px',
    height: theme.spacing(5.25),
    width: `calc(100% - ${theme.spacing(12.5)}px)`,
    textTransform: 'capitalize',
    float: 'right',
  },
  small: {
    marginLeft: 'auto',
  },
  iconButton: {
    background: theme.palette.action.active,
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1),
    marginLeft: theme.spacing(2),
    '& svg': {
      color: theme.palette.text.primary,
      fontSize: theme.spacing(2),
    },

    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
}));

const emptyFormData: FormData = {
  name: '',
};

type Props = {
  isOpen: boolean;
  closeModal(): void;
  createSubstrate(substrate: AddSubstrateMutationVariables): Promise<void>;
};

const availableSubstrateTypeModes = [
  SubstrateTypeMode.Transparent,
  SubstrateTypeMode.Metallic,
  SubstrateTypeMode.Opaque,
];

const SubstrateModal: Component<Props> = ({
  isOpen,
  closeModal,
  createSubstrate,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { accessControlLists, fetching: fetchingACLs } = useAccessControlLists();
  const { result: substrates } = useSubstrates();

  const [aclId, setAclId] = useState<string>();
  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();
  const [formData, updateFormData] = useStateObject(emptyFormData);
  const [measurement, setMeasurement] = useState<Measurement>();

  const [selectedSubstrateTypeMode, setSelectedSubstrateTypeMode] = useState(SubstrateTypeMode.None);
  const [selectedSubstrateQualityMode, setSelectedSubstrateQualityMode] = useState(SubstrateQualityMode.None);
  const [availableSubstrateQualityModes, setAvailableSubstrateQualityModes] = useState<SubstrateQualityMode[]>([]);
  const [roughnessPercent, setRoughnessPercent] = useState(0);

  // confirmation
  const [isEdited, setIsEdited] = useState(false);
  const [isDuplicatedName, setIsDuplicatedName] = useState(false);
  const [exitAnchorEl, setExitAnchorEl] = useState<HTMLElement>();
  const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement>();

  // TODO: remove when modal is refactored to mount/unmount (EFXW-1903)
  useEffect(() => {
    updateFormData(emptyFormData);
    setMeasurement(undefined);
    setIsEdited(false);
    setAclId(undefined);
  }, [isOpen]);

  const handleSubstrateTypeChange = (substrateType: SubstrateTypeMode) => {
    setSelectedSubstrateTypeMode(substrateType);
    switch (substrateType) {
      case SubstrateTypeMode.Transparent:
        setAvailableSubstrateQualityModes([]);
        break;
      case SubstrateTypeMode.Metallic:
        setAvailableSubstrateQualityModes([
          SubstrateQualityMode.Glossy,
          SubstrateQualityMode.Matt,
        ]);
        break;
      case SubstrateTypeMode.Opaque:
        setAvailableSubstrateQualityModes([
          SubstrateQualityMode.Coated,
          SubstrateQualityMode.Uncoated,
          SubstrateQualityMode.UserDefined,
        ]);
        break;
      default: setAvailableSubstrateQualityModes([]);
    }
  };

  const handleSubstrateQualityChange = (substrateQuality: SubstrateQualityMode) => {
    setSelectedSubstrateQualityMode(substrateQuality);
    switch (substrateQuality) {
      case SubstrateQualityMode.Coated:
        setRoughnessPercent(0);
        break;
      case SubstrateQualityMode.Uncoated:
        setRoughnessPercent(25);
        break;
      default:
        break;
    }
  };

  const handleMeasurementChange = (newMeasurement: Measurement) => {
    setMeasurement(newMeasurement);
    setIsEdited(true);
  };

  const handleSubstrateSelected = (newMeasurement: Measurement, name: string) => {
    handleMeasurementChange(newMeasurement);
    updateFormData({ name });
  };

  const handleFormDataUpdate = (update: Partial<FormData>) => {
    updateFormData(update);
    setIsEdited(true);
  };

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    if (isEdited) {
      setExitAnchorEl(e.currentTarget);
    } else {
      closeModal();
    }
  };

  const getCalibrationParameter = () => {
    switch (selectedSubstrateTypeMode) {
      case SubstrateTypeMode.Transparent:
        return createTransparentFilmParameters();
      case SubstrateTypeMode.Metallic: {
        return createMetalizedParameters(selectedSubstrateQualityMode);
      }
      case SubstrateTypeMode.Opaque:
        return createOpaqueParameters(roughnessPercent);
      default:
        return createTransparentFilmParameters();
    }
  };

  const checkNames = (newName: string) => {
    return substrates?.some((substrate) => substrate.name.toLowerCase() === newName.toLowerCase());
  };

  const handleSave = (e?: MouseEvent<HTMLButtonElement>) => {
    const id = uuid();
    const creationDateTime = (new Date()).toISOString();
    const { name } = formData;
    if (!name || !measurement) return;

    const duplicateName = checkNames(name);
    if (duplicateName && !isDuplicatedName) {
      setIsDuplicatedName(true);
      setSaveAnchorEl(e?.currentTarget);
      return;
    }

    createSubstrate({
      id,
      creationDateTime,
      name,
      aclId,
      measurements: [Measurement.parse({
        ...measurement,
        id: uuid(),
      })] as unknown as MeasurementIn[],
      calibrationParameters: getCalibrationParameter(),
      calibrationConditions: createCalibrationCondition(measurement) as unknown as CalibrationConditionIn[],
    });

    setIsEdited(false);
    setIsDuplicatedName(false);
  };

  const canSave = useMemo(() => Boolean(measurement && formData.name && aclId), [measurement, formData, aclId]);

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useStandardModalWidgetConfiguration();

  return (
    <>
      <FullScreenDialog
        headerTitle={t('labels.newSubstrate')}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <Header
          importSource={importSource}
          onImportSourceChange={setImportSource}
          onMeasurementChange={handleMeasurementChange}
          pantoneImportEnabled={false}
        />

        <div className={classes.content}>
          <div className={classes.section}>
            <div className={classes.row}>
              <Body className={classes.label}>{t('labels.substrate')}</Body>
              <InputField
                dataTestId="new-substrate-name"
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

            <Button
              data-testid="save-new-substrate-button"
              color="primary"
              className={classes.saveButton}
              disabled={!canSave || isDuplicatedName}
              onClick={handleSave}
            >
              {t('labels.save')}
            </Button>
          </div>

          <div className={classes.section}>
            <div className={clsx(classes.rowSm, classes.widget)}>
              { widgetConfiguration && (
                <ModalWidget
                  dataTestId="new-substrate"
                  configuration={widgetConfiguration}
                  setConfiguration={setConfiguration}
                  measurement={measurement}
                />
              )}
            </div>

            <div className={classes.rowSm}>
              <Body className={classes.label}>{t('labels.substrateType')}</Body>
              <Select
                id="substrate-type-select"
                instanceId="substrate-type-select"
                disabled={false}
                isMulti={false}
                className={classes.small}
                value={selectedSubstrateTypeMode}
                data={availableSubstrateTypeModes}
                onChange={handleSubstrateTypeChange}
                labelProp={(key: SubstrateTypeMode) => t(getSubstrateTypeModeLabel(key))}
              />
            </div>
            {
              selectedSubstrateTypeMode !== SubstrateTypeMode.Transparent && (
                <>
                  <div className={classes.rowSm}>
                    <Body className={classes.label}>{t('labels.substrateQuality')}</Body>
                    <Select
                      id="substrate-quality-select"
                      instanceId="substrate-quality-select"
                      disabled={false}
                      isMulti={false}
                      className={classes.small}
                      value={selectedSubstrateQualityMode}
                      data={availableSubstrateQualityModes}
                      onChange={handleSubstrateQualityChange}
                      labelProp={(key: SubstrateQualityMode) => t(getSubstrateQualityModeLabel(key))}
                    />
                  </div>
                  {
                    selectedSubstrateTypeMode === SubstrateTypeMode.Opaque && (
                      <div className={classes.rowSm}>
                        <Body className={classes.label}>{t('labels.roughness')}</Body>
                        <PercentageInput
                          value={roughnessPercent}
                          onChange={setRoughnessPercent}
                          dataTestId="selectedRoughnessPercent"
                          className={classes.small}
                          disabled={selectedSubstrateQualityMode !== SubstrateQualityMode.UserDefined}
                          alwaysShowControls
                        />
                        <IconButton
                          disableRipple
                          className={classes.iconButton}
                          disabled={false}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )
                  }
                </>
              )
            }
          </div>

          <div className={classes.section}>
            {importSource === IMPORT_SOURCE.DMS && (
              <DMSBrowser onJobSelected={handleMeasurementChange} />
            )}
            {importSource === IMPORT_SOURCE.FILE && (
              <FileBrowserForSubstrate onFileSelected={handleSubstrateSelected} />
            )}
          </div>
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
        confirmText={t('labels.dontSave')}
        cancelText={t('labels.cancel')}
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

export default SubstrateModal;
