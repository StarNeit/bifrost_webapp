/* eslint-disable max-len */
import { makeStyles } from '@material-ui/core';
import {
  ColorSpaceType,
  Measurement,
  Standard,
  Tolerance,
} from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import {
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../../components/Button';
import ConfirmationPopover from '../../../../components/ConfirmationPopover';
import FullScreenDialog from '../../../../components/FullScreenDialog';
import InputField from '../../../../components/InputField';
import Select from '../../../../components/Select';
import { Body } from '../../../../components/Typography';
import { IMPORT_SOURCE } from '../../../../constants/ui';
import { useAccessControlList, useAccessControlLists, useStandards } from '../../../../data/api';
import { useStandardModalWidgetConfiguration } from '../../../../data/configurations';
import { PartialACL } from '../../../../types/acl';
import { Component } from '../../../../types/component';
import { ModalProps } from '../../../../types/modal';
import ModalWidget from '../../../../widgets/ModalWidget';
import { WidgetType } from '../../../../widgets/WidgetLayout/types';
import DMSBrowser from '../../DMSBrowser';
import FileBrowserForStandard from '../../StandardSubstrateModal/FileBrowser/FileBrowserForStandard';
import Header from '../../StandardSubstrateModal/Header';
import ManualConfigForStandard from '../../StandardSubstrateModal/ManualConfigForStandard';

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
  saveButton: {
    fontSize: theme.spacing(1.5),
    letterSpacing: '1.5px',
    height: theme.spacing(5.25),
    width: `calc(100% - ${theme.spacing(12.5)}px)`,
    textTransform: 'capitalize',
    float: 'right',
  },
}));

type Props = ModalProps & {
  selectedStandard: Standard | undefined;
  updateStandard: (args: {
    id: string;
    name: string;
    measurements: Measurement[];
    aclId?: string;
    tolerances: Tolerance[];
  }) => Promise<void>;
};

const StandardEditModal: Component<Props> = ({
  isOpen,
  closeModal,
  selectedStandard,
  updateStandard,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { accessControlLists, fetching: fetchingACLs } = useAccessControlLists();

  const [selectedACl, setSelectedACL] = useState<PartialACL>();
  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();

  const initialStandardName = selectedStandard?.name;
  const [modifiedStandardName, setModifiedStandardName] = useState<string>();

  const initialMeasurement = selectedStandard?.measurements[0];
  const [modifiedMeasurement, setModifiedMeasurement] = useState<Measurement>();

  const {
    result: standards,
  } = useStandards();

  const { accessControlList, fetching: fetchingStandardACL } = useAccessControlList(selectedStandard?.aclId);

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useStandardModalWidgetConfiguration();

  // confirmation
  const standardNameExists = useMemo(() => standards.some(
    ({ id, name }) => (
      modifiedStandardName
      && name.toLowerCase() === modifiedStandardName.toLowerCase()
      && id !== selectedStandard?.id // is not the same standard itself
    ),
  ), [selectedStandard?.id, modifiedStandardName]);
  const [exitAnchorEl, setExitAnchorEl] = useState<HTMLElement>();
  const [updateAnchorEl, setUpdateAnchorEl] = useState<HTMLElement>();

  const [creatingStandard, setUpdatingStandard] = useState(false);

  // TODO: remove when modal is refactored to mount/unmount (EFXW-1903)
  useEffect(() => {
    setModifiedStandardName(undefined);
    setModifiedMeasurement(undefined);
    setSelectedACL(undefined);
  }, [isOpen]);

  const handleMeasurementChange = (newMeasurement: Measurement) => {
    setModifiedMeasurement(newMeasurement);
  };

  const handleManualUpdated = (newMeasurement: Measurement) => {
    setModifiedMeasurement(newMeasurement);
  };

  const handleStandardSelected = (newMeasurement: Measurement, name: string) => {
    handleMeasurementChange(newMeasurement);
    setModifiedStandardName(name);
  };

  const handleUpdate = async (e?: MouseEvent<HTMLButtonElement>) => {
    if (!selectedStandard?.id) return;

    const isConfirmed = !e?.currentTarget; // if event is not provided then it's confirmed from the confirmation popover
    if (standardNameExists && !isConfirmed) {
      setUpdateAnchorEl(e?.currentTarget);
      return;
    }

    setUpdatingStandard(true);

    await updateStandard({
      id: selectedStandard.id,
      name: modifiedStandardName ?? selectedStandard.name,
      measurements: modifiedMeasurement ? [modifiedMeasurement] : selectedStandard.measurements,
      aclId: selectedACl?.id ?? selectedStandard.aclId,
      tolerances: selectedStandard.tolerances,
    });

    setUpdatingStandard(false);

    setSelectedACL(undefined);
    setModifiedStandardName(undefined);
    setModifiedMeasurement(undefined);

    closeModal();
  };

  const isColorimetricStandard = initialMeasurement?.measurementSamples?.[0].colorSpecification.colorSpace === ColorSpaceType.CIELab;
  const fetchingFinished = !fetchingACLs && !fetchingStandardACL;
  const standardNameModified = modifiedStandardName !== '' && (modifiedStandardName && modifiedStandardName !== selectedStandard?.name);
  const aclModified = selectedACl?.id && selectedACl.id !== selectedStandard?.aclId;
  const canUpdate = fetchingFinished
    && (
      standardNameModified
      || aclModified
      || Boolean(modifiedMeasurement)
    );

  useEffect(() => {
    if (isColorimetricStandard) {
      setImportSource(IMPORT_SOURCE.MANUAL);
      if (widgetConfiguration?.type === WidgetType.SpectralGraph) {
        setConfiguration({ ...widgetConfiguration, type: WidgetType.ColorSwatch });
      }
    } else if (importSource === IMPORT_SOURCE.MANUAL) {
      setImportSource(undefined);
    }
  }, [selectedStandard?.id]);

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    if (canUpdate) {
      setExitAnchorEl(e.currentTarget);
      return;
    }

    closeModal();
  };

  return (
    <>
      <FullScreenDialog
        headerTitle={t('labels.editStandard')}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <Header
          importSource={importSource}
          onImportSourceChange={setImportSource}
          onMeasurementChange={handleMeasurementChange}
          bridgeImportEnabled={!isColorimetricStandard}
          pantoneImportEnabled={!isColorimetricStandard}
          dmsImportEnabled={!isColorimetricStandard}
          fileImportEnabled={!isColorimetricStandard}
          manualImportEnabled={isColorimetricStandard}
        />

        <div className={classes.content}>
          <div className={classes.section}>
            <div className={classes.row}>
              <Body className={classes.label}>{t('labels.standard')}</Body>
              <InputField
                dataTestId="edit-standard-name"
                className={classes.formInput}
                placeholder={t('labels.enterName')}
                value={modifiedStandardName ?? initialStandardName}
                onChange={setModifiedStandardName}
              />
            </div>
            <div className={classes.row}>
              <Body className={classes.label}>{t('labels.access')}</Body>
              <Select
                data={accessControlLists.map((acl) => ({ id: acl.id, name: acl.name }))}
                onChange={(acl) => setSelectedACL(acl)}
                value={selectedACl ? accessControlLists?.find((acl) => acl.id === selectedACl.id) : accessControlList}
                id="edit-acl-select"
                labelProp="name"
                idProp="id"
                isFullWidth
                isMulti={false}
                isLoading={fetchingACLs || fetchingStandardACL}
              />
            </div>

            <Button
              data-testid="save-edited-standard-button"
              color="primary"
              className={classes.saveButton}
              disabled={!canUpdate}
              onClick={handleUpdate}
              showSpinner={creatingStandard}
            >
              {t('labels.update')}
            </Button>
          </div>

          <div className={classes.section}>
            <div className={clsx(classes.row, classes.widget)}>
              {widgetConfiguration && (
                <ModalWidget
                  dataTestId="edit-standard"
                  configuration={widgetConfiguration}
                  setConfiguration={setConfiguration}
                  measurement={modifiedMeasurement ?? initialMeasurement}
                />
              )}
            </div>
          </div>

          <div className={classes.section}>
            {importSource === IMPORT_SOURCE.DMS && (
              <DMSBrowser onJobSelected={handleMeasurementChange} />
            )}
            {importSource === IMPORT_SOURCE.FILE && (
              <FileBrowserForStandard onFileSelected={handleStandardSelected} />
            )}
            {importSource === IMPORT_SOURCE.MANUAL && (
              <ManualConfigForStandard onManualUpdated={handleManualUpdated} initialMeasurement={initialMeasurement} />
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
        cancelText={t('labels.cancel')}
        confirmText={t('labels.dontSave')}
      />
      <ConfirmationPopover
        open={Boolean(updateAnchorEl)}
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
        anchorEl={updateAnchorEl}
        message={t('messages.nameExists')}
        cancelText={t('labels.update')}
        confirmText={t('labels.dontSave')}
      />
    </>
  );
};

export default StandardEditModal;
