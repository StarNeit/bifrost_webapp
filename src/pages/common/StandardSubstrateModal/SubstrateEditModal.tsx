/* eslint-disable max-len */
import { IconButton, makeStyles } from '@material-ui/core';
import {
  CalibrationCondition, Measurement, Substrate,
} from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import {
  MouseEvent, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import { Component } from '../../../types/component';
import { createCalibrationCondition } from '../../../utils/utils';
import DMSBrowser from '../DMSBrowser';
import ConfirmationPopover from '../../../components/ConfirmationPopover';
import FullScreenDialog from '../../../components/FullScreenDialog';
import InputField from '../../../components/InputField';
import { Body } from '../../../components/Typography';
import Select from '../../../components/Select';
import PercentageInput from '../../../components/PercentageInput';
import Header from './Header';
import ModalWidget from '../../../widgets/ModalWidget';
import { SubstrateQualityMode, SubstrateTypeMode } from '../../../types/formulation';
import {
  createMetalizedParameters,
  createOpaqueParameters,
  createTransparentFilmParameters,
  getSubstrateCalibrationInformation,
  getSubstrateQualityModeLabel,
  getSubstrateTypeModeLabel,
} from './utils';
import {
  CalibrationParameterIn,
} from '../../../data/api/graphql/generated';
import FileBrowserForSubstrate from './FileBrowser/FileBrowserForSubstrate';
import { useAccessControlLists, useSubstrates } from '../../../data/api';
import { IMPORT_SOURCE } from '../../../constants/ui';
import Button from '../../../components/Button';
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

type Props = {
  selectedSubstrate: Substrate | undefined;
  isOpen: boolean;
  closeModal(): void;
  updateSubstrate(args: {
      id: string;
      aclId?: string | undefined;
      name: string;
      measurements: Measurement[];
      calibrationConditions?: CalibrationCondition[];
      calibrationParameters?: CalibrationParameterIn[];
  }): Promise<void>;
};

const availableSubstrateTypeModes = [
  SubstrateTypeMode.Transparent,
  SubstrateTypeMode.Metallic,
  SubstrateTypeMode.Opaque,
];

const SubstrateEditModal: Component<Props> = ({
  isOpen,
  closeModal,
  updateSubstrate,
  selectedSubstrate,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { accessControlLists, fetching: fetchingACLs } = useAccessControlLists();
  const { result: substrates } = useSubstrates();

  const initialAclId = selectedSubstrate?.aclId;
  const [modifiedAclId, setModifiedAclId] = useState<string>();

  const initialSubstrateName = selectedSubstrate?.name;
  const [modifiedSubstrateName, setModifiedSubstrateName] = useState<string>();

  const initialMeasurement = selectedSubstrate?.measurements?.[0];
  const [modifiedMeasurement, setModifiedMeasurement] = useState<Measurement>();

  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();

  const {
    qualityMode: initialSubstrateQualityMode,
    roughnessPercentage: initialRoughnessPercentage,
    typeMode: initialSubstrateTypeMode,
  } = useMemo(
    () => (selectedSubstrate ? getSubstrateCalibrationInformation(selectedSubstrate) : {}),
    [selectedSubstrate?.calibrationParameters],
  );
  const [modifiedSubstrateTypeMode, setModifiedSubstrateTypeMode] = useState<SubstrateTypeMode>();
  const [modifiedSubstrateQualityMode, setModifiedSubstrateQualityMode] = useState<SubstrateQualityMode>();
  const [modifiedRoughnessPercent, setModifiedRoughnessPercent] = useState<number>();

  const selectedSubstrateTypeMode = modifiedSubstrateTypeMode ?? initialSubstrateTypeMode;
  const selectedSubstrateQualityMode = modifiedSubstrateQualityMode ?? initialSubstrateQualityMode ?? SubstrateQualityMode.None;
  const selectedRoughnessPercent = modifiedRoughnessPercent ?? initialRoughnessPercentage ?? 0;
  const selectedSubstrateName = modifiedSubstrateName ?? initialSubstrateName;
  const selectedMeasurement = modifiedMeasurement ?? initialMeasurement;
  const selectedAclId = modifiedAclId ?? initialAclId;

  const availableSubstrateQualityModes = useMemo(() => {
    switch (selectedSubstrateTypeMode) {
      case SubstrateTypeMode.Transparent:
        return [];
      case SubstrateTypeMode.Metallic:
        return [
          SubstrateQualityMode.Glossy,
          SubstrateQualityMode.Matt,
        ];
      case SubstrateTypeMode.Opaque:
        return [
          SubstrateQualityMode.Coated,
          SubstrateQualityMode.Uncoated,
          SubstrateQualityMode.UserDefined,
        ];
      default: return [];
    }
  }, [selectedSubstrateTypeMode]);

  const isDuplicatedName = useMemo(
    () => substrates?.some((substrate) => (
      substrate.name.toLowerCase() === modifiedSubstrateName?.toLowerCase()
      && substrate.name !== selectedSubstrate?.name // it's not the selectedSubstrate it self
    )),
    [selectedSubstrateName],
  );

  // confirmation
  const [exitAnchorEl, setExitAnchorEl] = useState<HTMLElement>();
  const [saveAnchorEl, setUpdateAnchorEl] = useState<HTMLElement>();

  const [isUpdating, setIsUpdating] = useState(false);

  // TODO: remove when modal is refactored to mount/unmount (EFXW-1903)
  useEffect(() => {
    setModifiedSubstrateName(undefined);
    setModifiedMeasurement(undefined);
    setModifiedAclId(undefined);
    setModifiedRoughnessPercent(undefined);
    setModifiedSubstrateQualityMode(undefined);
    setModifiedSubstrateTypeMode(undefined);
  }, [isOpen]);

  const handleSubstrateTypeChange = (substrateType: SubstrateTypeMode) => {
    setModifiedSubstrateTypeMode(substrateType);
  };

  const handleSubstrateQualityChange = (substrateQuality: SubstrateQualityMode) => {
    setModifiedSubstrateQualityMode(substrateQuality);
    switch (substrateQuality) {
      case SubstrateQualityMode.Coated:
        setModifiedRoughnessPercent(0);
        break;
      case SubstrateQualityMode.Uncoated:
        setModifiedRoughnessPercent(25);
        break;
      default:
        break;
    }
  };

  const handleMeasurementChange = (newMeasurement: Measurement) => {
    setModifiedMeasurement(newMeasurement);
  };

  const handleSubstrateSelected = (newMeasurement: Measurement, name: string) => {
    handleMeasurementChange(newMeasurement);
    setModifiedSubstrateName(name);
  };

  const handleSubstrateNameChange = (name: string) => {
    setModifiedSubstrateName(name);
  };

  const getCalibrationParameter = () => {
    switch (selectedSubstrateTypeMode) {
      case SubstrateTypeMode.Metallic: {
        return createMetalizedParameters(selectedSubstrateQualityMode);
      }
      case SubstrateTypeMode.Opaque:
        return createOpaqueParameters(selectedRoughnessPercent);
      default:
        // Transparent
        return createTransparentFilmParameters();
    }
  };

  const handleUpdate = async (e?: MouseEvent<HTMLButtonElement>) => {
    if (!selectedSubstrate) return;

    if (isDuplicatedName && e?.currentTarget) {
      setUpdateAnchorEl(e.currentTarget);
      return;
    }

    setIsUpdating(true);

    const { id } = selectedSubstrate;

    if (!selectedSubstrateName || !selectedMeasurement) return;

    await updateSubstrate({
      id,
      name: selectedSubstrateName,
      aclId: selectedAclId,
      measurements: modifiedMeasurement ? [modifiedMeasurement] : selectedSubstrate.measurements,
      calibrationParameters: getCalibrationParameter(),
      calibrationConditions: [createCalibrationCondition(selectedMeasurement)],
    });

    setModifiedSubstrateName(undefined);
    setModifiedMeasurement(undefined);
    setModifiedAclId(undefined);
    setModifiedRoughnessPercent(undefined);
    setModifiedSubstrateQualityMode(undefined);
    setModifiedSubstrateTypeMode(undefined);

    setIsUpdating(false);
    closeModal();
  };

  const canUpdate = !fetchingACLs
  && (
    Boolean(modifiedMeasurement)
    || Boolean(modifiedSubstrateTypeMode)
    || Boolean(modifiedSubstrateQualityMode)
    || Boolean(modifiedRoughnessPercent)
    || (Boolean(modifiedAclId) && modifiedAclId !== initialAclId)
    || (modifiedSubstrateName !== '' && (Boolean(modifiedSubstrateName) && modifiedSubstrateName?.trim() !== initialSubstrateName))
  );

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    if (canUpdate) {
      setExitAnchorEl(e.currentTarget);
    } else {
      closeModal();
    }
  };

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useStandardModalWidgetConfiguration();

  return (
    <>
      <FullScreenDialog
        headerTitle={t('labels.editSubstrate')}
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
                dataTestId="edit-substrate-name"
                className={classes.formInput}
                placeholder={t('labels.enterName')}
                value={selectedSubstrateName}
                onChange={handleSubstrateNameChange}
              />
            </div>
            <div className={classes.row}>
              <Body className={classes.label}>{t('labels.access')}</Body>
              <Select
                data={accessControlLists}
                onChange={(acl) => setModifiedAclId(acl.id)}
                value={accessControlLists?.find((acl) => (selectedAclId === acl.id))}
                id="edit-acl-select"
                labelProp="name"
                idProp="id"
                isFullWidth
                isMulti={false}
                isLoading={fetchingACLs}
              />
            </div>

            <Button
              data-testid="save-edited-substrate-button"
              className={classes.saveButton}
              disabled={!canUpdate}
              onClick={handleUpdate}
              showSpinner={isUpdating}
            >
              {t('labels.update')}
            </Button>
          </div>

          <div className={classes.section}>
            <div className={clsx(classes.rowSm, classes.widget)}>
              { widgetConfiguration && (
                <ModalWidget
                  dataTestId="edit-substrate"
                  configuration={widgetConfiguration}
                  setConfiguration={setConfiguration}
                  measurement={selectedMeasurement}
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
                          value={selectedRoughnessPercent}
                          onChange={setModifiedRoughnessPercent}
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
        confirmText={t('labels.dontUpdate')}
        cancelText={t('labels.cancel')}
      />
      <ConfirmationPopover
        open={Boolean(saveAnchorEl)}
        onBackdropClose={() => {
          setUpdateAnchorEl(undefined);
        }}
        onClose={() => {
          setUpdateAnchorEl(undefined);
          handleUpdate();
        }}
        onConfirm={() => {
          setUpdateAnchorEl(undefined);
        }}
        anchorEl={saveAnchorEl}
        message={t('messages.nameExists')}
        cancelText={t('labels.update')}
        confirmText={t('labels.dontUpdate')}
      />
    </>
  );
};

export default SubstrateEditModal;
