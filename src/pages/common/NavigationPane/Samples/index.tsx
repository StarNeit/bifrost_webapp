import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppearanceSample, Standard, Substrate,
} from '@xrite/cloud-formulation-domain-model';
import {
  CircularProgress, Slider as MuiSlider, Chip,
} from '@material-ui/core';

import { ChevronRight, ExpandMore } from '@material-ui/icons/';
import { useTranslation } from 'react-i18next';
import {
  ComponentProps,
  useEffect,
  useMemo,
  useState,
} from 'react';
import orderBy from 'lodash/orderBy';

import { useClient } from 'urql';
import { Body, Subtitle } from '../../../../components/Typography';
import { Component } from '../../../../types/component';
import NavigationTree from '../../NavigationTree';
import SampleMenu from './SampleMenu';
import ToggleableSection from '../../../../components/ToggleableSection';
import { useAppearanceSample } from '../../../../data/api';
import { getViewingConditions, useSampleId } from '../../../../data/common';
import Slider from './Slider';
import { sampleHasMeasurements } from '../../../../utils/utilsSamples';
import { useDebouncedCallback } from '../../../../utils/utils';
import {
  FilePayload, FormatType,
} from '../../../../data/api/appearanceDataExportService';
import { GetSubstrateQuery, GetSubstrateQueryVariables, GetSubstrateDocument } from '../../../../data/api/graphql/generated';
import ExportPopover from '../../ExportPopover';
import { useFileExport } from '../../../../data/appearanceDataExportService.hooks';
import { useColorimetricConfiguration } from '../../../../data/configurations';
import { getPreviewMeasurement } from '../../../../utils/utilsMeasurement';
import { deltaE2000, deltaE76 } from '../../../../utils/colorimetry';

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
  },
  headerButton: {
    background: 'inherit',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    flex: 1,
    cursor: 'pointer',
    gap: theme.spacing(0.7),
    color: 'white',
  },
  title: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    userSelect: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  progressText: {
    color: theme.palette.text.disabled,
    userSelect: 'none',
    fontSize: theme.spacing(1.7),
  },
  spinnerContainer: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  pfIndicatorBase: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  passIndicator: {
    background: theme.palette.success.main,
  },
  failIndicator: {
    background: theme.palette.error.main,
  },
}));

type Props = {
  openNewSampleModal(): void,
  onSampleDelete(): void,
  onSampleEdit(): void,
  standard?: Standard;
  standardFetching?: boolean;
  actionIsLoading?: boolean;
  displayedSample: {
    id: string;
    position: number;
    isFirstTier?: boolean;
  };
  setDisplayedSample: React.Dispatch<React.SetStateAction<{
    id: string;
    isFirstTier: boolean;
    position: number;
  }>>;
}

export type SortSampleType = 'default' | 'chronologically' | 'alphabetically';
export type SortSampleOrder = 'asc' | 'desc' | 'default' | undefined;
export type SortSampleMode = {
  type: SortSampleType;
  order: SortSampleOrder;
};

const findFirstEntryAppearanceSample = (
  appearanceSamples: AppearanceSample[] | undefined,
  searchedSampleId: string,
): AppearanceSample | undefined => {
  const searchedSample = appearanceSamples?.find((sample) => sample.id === searchedSampleId);

  if (!searchedSample?.parentAppearanceSampleId) return searchedSample;

  return findFirstEntryAppearanceSample(appearanceSamples, searchedSample.parentAppearanceSampleId);
};

const Samples: Component<Props> = ({
  standard,
  standardFetching,
  actionIsLoading,
  onSampleDelete,
  onSampleEdit,
  openNewSampleModal,
  displayedSample,
  setDisplayedSample,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const client = useClient();

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const {
    fileFormats,
    selectedFileFormat,
    setSelectedFileFormat,
    exportData,
    isExporting,
  } = useFileExport(FormatType.File);

  const [isFolded, setIsFolded] = useState(false);
  const [sort, setSort] = useState<SortSampleMode>({
    type: 'default',
    order: 'default',
  });

  const {
    result: savedAppearanceSamples,
    fetching: appearanceSamplesFetching,
  } = useAppearanceSample({ query: { parentId: standard?.id } });
  const {
    selectedSampleId,
    setSampleId,
  } = useSampleId();
  const selectedSample = useMemo(() => savedAppearanceSamples?.find(
    (sample) => sample.id === selectedSampleId,
  ), [selectedSampleId, savedAppearanceSamples]);
  const isSampleSelected = Boolean(selectedSampleId && selectedSampleId !== standard?.id);
  const selectionExists = Boolean(standard || selectedSampleId);

  const { configuration } = useColorimetricConfiguration();
  const viewingConditions = getViewingConditions(configuration);

  const hasMeasurements = Boolean(selectedSample?.measurements.length);
  const sampleMeasurement = getPreviewMeasurement(
    hasMeasurements
      ? selectedSample?.measurements
      : selectedSample?.formula?.predictionMeasurements,
  );
  const standardMeasurement = getPreviewMeasurement(standard?.measurements);

  const dE = useMemo(() => {
    if (viewingConditions && standardMeasurement && sampleMeasurement) {
      if (configuration?.metric.deltaE === 'dE00') {
        return deltaE2000(
          standardMeasurement.measurementSamples[0],
          sampleMeasurement.measurementSamples[0],
          viewingConditions[0].illuminant,
          viewingConditions[0].observer,
          {
            kc: configuration?.metric.cRatio ?? 1,
            kl: configuration?.metric.lRatio ?? 1,
            kh: configuration?.metric.hRatio ?? 1,
          },
        );
      }
      return deltaE76(
        standardMeasurement.measurementSamples[0],
        sampleMeasurement.measurementSamples[0],
        viewingConditions[0].illuminant,
        viewingConditions[0].observer,
      );
    }

    return undefined;
  }, [viewingConditions, standardMeasurement, sampleMeasurement]);

  let selectedTolerance: number | undefined;

  if (standard && standard.tolerances && standard.tolerances.length > 0) {
    selectedTolerance = standard.tolerances[0].upperLimit;
  } else {
    selectedTolerance = configuration?.tolerance?.upperLimit;
  }

  const samplePasses = (dE !== undefined) && selectedTolerance && dE <= selectedTolerance;
  const showPassFail = Boolean(standard && displayedSample.id.length > 0 && selectedTolerance);

  const selectSampleWithDelay = useDebouncedCallback((id: string) => setSampleId(id), 300);

  const sortedAppearanceSamples = useMemo(() => {
    switch (sort.order) {
      case 'asc':
        if (sort.type === 'alphabetically') return orderBy(savedAppearanceSamples, ['name'], ['asc']);
        if (sort?.type === 'chronologically') {
          return orderBy(savedAppearanceSamples, [(appearanceSample) => {
            return new Date(appearanceSample.creationDateTime).getTime();
          }], ['asc']);
        }
        break;
      case 'desc':
        if (sort.type === 'alphabetically') return orderBy(savedAppearanceSamples, ['name'], ['desc']);
        if (sort?.type === 'chronologically') {
          return orderBy(savedAppearanceSamples, [(appearanceSample) => {
            return new Date(appearanceSample.creationDateTime).getTime();
          }], ['desc']);
        }
        break;
      default:
    }

    return savedAppearanceSamples;
  }, [savedAppearanceSamples, sort]);

  const firstTierTreeEntries = sortedAppearanceSamples?.filter(
    (sample) => !sample.parentAppearanceSampleId,
  );

  const onExport = async () => {
    if (
      !selectedSample
      || !standard
    ) return;

    setExportAnchorEl(null);

    const getSubstrate = async (substrateId?: string): Promise<Substrate | undefined> => {
      if (!substrateId) return undefined;
      const queryResult = await client.query<GetSubstrateQuery, GetSubstrateQueryVariables>(
        GetSubstrateDocument,
        { id: substrateId },
      ).toPromise();
      const substrateData = queryResult?.data?.getSubstrate?.[0];
      if (!substrateData) return undefined;
      return Substrate.parse(substrateData);
    };

    const parentAppSample = selectedSample.parentAppearanceSampleId
      ? savedAppearanceSamples?.find(({ id }) => id === selectedSample.parentAppearanceSampleId)
      : undefined;

    const selectedSubstrateId = selectedSample.substrateId ?? parentAppSample?.substrateId;
    const sampleSubstrate = await getSubstrate(selectedSubstrateId);

    const payload: FilePayload = {
      objects: [selectedSample, standard],
    };
    if (sampleSubstrate) {
      payload.objects.push(sampleSubstrate);
    }
    if (parentAppSample) {
      payload.objects.push(parentAppSample);
    }

    exportData({ type: FormatType.File, payload });
  };

  // effect for syncing the slider order with the new sort option
  useEffect(() => {
    const searchedSample = findFirstEntryAppearanceSample(
      sortedAppearanceSamples, selectedSampleId,
    );

    // find the position of the searchedSample inside the reorderedFirstTierTreeEntries
    const selectedAppearanceSampleIndex = firstTierTreeEntries?.findIndex(
      (sample) => sample.id === searchedSample?.id,
    );
    const selectedAppearanceSample = firstTierTreeEntries?.[
      selectedAppearanceSampleIndex ?? -1
    ];

    const position = selectedAppearanceSampleIndex !== undefined
      ? selectedAppearanceSampleIndex + 1 : 0;

    setDisplayedSample({
      id: selectedAppearanceSample?.id ?? '',
      isFirstTier: searchedSample?.id === selectedSampleId,
      position,
    });
  }, [sortedAppearanceSamples, selectedSampleId]);

  const handleSort = (type: SortSampleType, order: SortSampleOrder) => {
    setSort({
      order,
      type,
    });
  };

  // slider handlers
  const handleDraggingInProgress: ComponentProps<typeof MuiSlider>['onChange'] = (_, value) => {
    if (typeof value !== 'number') return;

    const index = value - 1;
    const selectedAppearanceSample = firstTierTreeEntries?.[index];

    setDisplayedSample({
      id: selectedAppearanceSample?.id ?? '',
      position: value,
      isFirstTier: true,
    });
  };

  const handleDraggingDone: ComponentProps<typeof MuiSlider>['onChangeCommitted'] = (_, value) => {
    if (typeof value !== 'number') return;

    const selectedAppearanceSample = firstTierTreeEntries?.[value - 1];

    const id = selectedAppearanceSample?.id ?? '';
    setDisplayedSample({
      ...displayedSample,
      id,
      isFirstTier: true,
    });

    setSampleId(id);
  };

  // arrows handler
  const handleSliderArrowChange = (position: number) => {
    const index = position - 1;

    const selectedAppearanceSample = firstTierTreeEntries?.[index];

    const id = selectedAppearanceSample?.id ?? '';
    setDisplayedSample(
      {
        id,
        position,
        isFirstTier: true,
      },
    );

    selectSampleWithDelay(id);
  };

  const numberOfSamples = firstTierTreeEntries?.length ?? 0;

  const actionInProgress = actionIsLoading || isExporting;
  return (
    <>
      <div className={clsx(classes.header, classes.row)}>
        <button
          data-testid="sample-collapsable-button"
          type="button"
          className={classes.headerButton}
          onClick={() => setIsFolded(!isFolded)}
        >
          <Subtitle data-testid="sample-header-title" className={classes.title}>{t('labels.data')}</Subtitle>
          {showPassFail && (
            <Chip
              label={samplePasses ? t('labels.pass') : t('labels.fail')}
              className={clsx(classes.pfIndicatorBase, {
                [classes.passIndicator]: samplePasses,
                [classes.failIndicator]: !samplePasses,
              })}
              size="small"
            />
          )}
          {isFolded ? <ChevronRight /> : <ExpandMore />}
          {appearanceSamplesFetching
            ? <CircularProgress size={20} />
            : isFolded && (
            <Body className={classes.progressText}>
              {t('labels.aSetOfNumber', { currentNumber: displayedSample.position, endNumber: numberOfSamples })}
            </Body>
            )}
        </button>

        {actionInProgress && (
          <div className={classes.spinnerContainer}><CircularProgress size={20} /></div>
        )}

        <SampleMenu
          // new menu option
          openNewSampleModal={openNewSampleModal}
          newDisabled={
            !selectionExists
            || Boolean(selectedSample && sampleHasMeasurements(selectedSample))
          }
          newOptionLabel={
            (isSampleSelected && t('labels.newTrial'))
            || (standard && t('labels.newSample'))
            || t('labels.new')
          }
          // delete menu option
          onSampleDelete={onSampleDelete}
          deleteDisabled={!isSampleSelected || actionInProgress}
          // sort menu option
          onSort={handleSort}
          sort={sort}
          sortDisabled={!standard || isFolded}
          // edit menu option
          onSampleEdit={onSampleEdit}
          editDisabled={!selectionExists}
          // export
          onExport={setExportAnchorEl}
          disableExport={!standard || !selectedSample}
        />
      </div>

      <ExportPopover
        open={!!exportAnchorEl}
        onClose={() => setExportAnchorEl(null)}
        anchorEl={exportAnchorEl}
        setFileFormat={(newFileFormat) => setSelectedFileFormat(newFileFormat)}
        selectedFileFormat={selectedFileFormat}
        availableFileFormats={fileFormats}
        onExport={onExport}
      />

      {/* expanded pane - sample tree */}
      <ToggleableSection show={!isFolded}>
        <NavigationTree
          dataTestId="standard-samples"
          standard={standard}
          standardFetching={standardFetching}
          appearanceSamples={sortedAppearanceSamples}
          appearanceSamplesFetching={appearanceSamplesFetching}
        />
      </ToggleableSection>

      {/* collapsed pane - slider */}
      <ToggleableSection show={isFolded}>
        <Slider
          disabled={
              appearanceSamplesFetching || !numberOfSamples
            }
          handleDraggingInProgress={handleDraggingInProgress}
          handleDraggingDone={handleDraggingDone}
          position={displayedSample.position}
          handleArrowChange={handleSliderArrowChange}
          numberOfSamples={numberOfSamples}
        />
      </ToggleableSection>

    </>
  );
};

export default Samples;
