import { makeStyles } from '@material-ui/core';
import { Measurement, MeasurementSample, Standard } from '@xrite/cloud-formulation-domain-model';
import { compareAsc } from 'date-fns';
import {
  useEffect, useState, useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Button from '../../../../../components/Button';
import FullScreenDialog from '../../../../../components/FullScreenDialog';
import InputField from '../../../../../components/InputField';
import { useBridgeApp } from '../../../../../data/api/bridgeApp/bridgeAppHook';
import { useColorimetricConfiguration, useColorSearchModalWidgetConfiguration } from '../../../../../data/configurations';
import { MeasurementSampleIn, StandardQueryVariables } from '../../../../../data/api/graphql/generated';
import { setSelectedStandardId as setSelectedStandardIdAction } from '../../../../../data/reducers/common';
import { scrollbars } from '../../../../../theme/components';
import { Component } from '../../../../../types/component';
import { Job } from '../../../../../types/dms';
import { calculatePreviewRGB, isMeasurementSampleSupported } from '../../../../../utils/colorimetry';
import {
  isMeasurementMultiAngle,
  useDefaultPrecision,
  useStateObject,
} from '../../../../../utils/utils';
import {
  getStandardDataSearchStandard,
  toColorDataTableTransform,
  SampleInfo,
} from '../../../../../widgets/utils';
import ColorSearch from './ColorSearch';
import Filters from './Filters';
import SearchResultsTable from './SearchResultsTable';
import { getViewingConditions } from '../../../../../data/common';
import { useStandardsWithNewAPI } from '../../../../../data/api';
import { Caption } from '../../../../../components/Typography';
import { deriveDefaultSampleFromSamples } from '../../../../../utils/utilsMeasurement';
import { DescribedMeasurementCondition } from '../../../../../types/measurement';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    overflowY: 'auto',
    height: '100%',
    gap: theme.spacing(4),
    ...scrollbars(theme),
  },
  leftPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    width: theme.spacing(77.75),
  },
  rightPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    width: theme.spacing(90),
  },
  field: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    textTransform: 'uppercase',
  },
  input: {
    '&$input': {
      flex: 1,
      marginLeft: theme.spacing(4),
    },
  },
  button: {
    width: '100%',
    textTransform: 'capitalize',
  },
  searchButton: {
    textTransform: 'capitalize',
    marginLeft: theme.spacing(1),
    height: theme.spacing(4.25),
    fontSize: theme.spacing(1.25),
  },
}));

const filterStandardsByName = (standards: Standard[], searchedStandardName: string) => {
  return standards.filter((standard) => standard?.name.toLowerCase().includes(
    searchedStandardName.trim().toLowerCase(),
  ));
};

const filterStandardsByDate = (
  standards: Standard[],
  { from, to }: { from: null | Date, to: null | Date },
) => {
  // utilities functions
  const isInMinRange = (value: number) => [0, 1].includes(value);
  const isInMaxRange = (value: number) => [-1, 0].includes(value);

  if (from && to) {
    return standards.filter(
      (standard) => {
        // compareAsc returns 1 if the first value is bigger and 0 if they are equal
        const creationDateIsInMinRange = compareAsc(standard.creationTimestamp(), from);

        // compareAsc returns -1 if the first value is smaller and 0 if they are equal
        const creationDateIsInMaxRange = compareAsc(standard.creationTimestamp(), to);

        return isInMinRange(creationDateIsInMinRange) && isInMaxRange(creationDateIsInMaxRange);
      },
    );
  }

  if (from) {
    return standards.filter(
      (standard) => {
        // compareAsc returns 1 if the first value is bigger and 0 if they are equal
        const creationDateIsInMinRange = compareAsc(standard.creationTimestamp(), from);

        return isInMinRange(creationDateIsInMinRange);
      },
    );
  }

  if (to) {
    return standards.filter(
      (standard) => {
        // compareAsc returns -1 if the first value is smaller and 0 if they are equal
        const creationDateIsInMaxRange = compareAsc(standard.creationTimestamp(), to);

        return isInMaxRange(creationDateIsInMaxRange);
      },
    );
  }

  return standards;
};

type Props = {
  isOpen: boolean;
  closeModal(): void;
}

const SearchStandardModal: Component<Props> = ({
  isOpen,
  closeModal,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { round, toNumber } = useDefaultPrecision();

  // widget config state

  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );
  const primaryViewingCondition = viewingConditions?.[0];

  const [measurement, setMeasurement] = useState<Measurement>();
  const [deTolerance, setDeTolerance] = useState(2.0);

  // standards state,
  const { standards, fetching: fetchingStandards, getStandards } = useStandardsWithNewAPI({});
  const [filteredStandards, setFilteredStandards] = useState(standards);
  const [selectedStandardId, setSelectedStandardId] = useState('');

  // filter inputs state
  const [searchedStandardName, setSearchedStandardName] = useState('');
  const [timePeriod, setTimePeriod] = useStateObject<
    { from: Date | null, to: Date | null }>({
      from: null,
      to: new Date(),
    });

  const {
    requestMeasurements,
    isRequestInProgress: measurementInProgress,
    measurement: measurementFromBridgeApp,
  } = useBridgeApp();

  useEffect(() => {
    setMeasurement(measurementFromBridgeApp);
  }, [measurementFromBridgeApp]);

  useEffect(() => {
    if (!searchedStandardName && !timePeriod.from && !timePeriod.to) {
      setFilteredStandards(standards);
      return;
    }

    let newStandards: Standard[] = standards;
    if (searchedStandardName) {
      newStandards = filterStandardsByName(newStandards, searchedStandardName);
    }

    if (timePeriod.from || timePeriod.to) {
      newStandards = filterStandardsByDate(newStandards, timePeriod);
    }

    setFilteredStandards(newStandards);
  }, [standards]);

  const handleMeasure = () => {
    // reset state of all fields
    setFilteredStandards([]);
    setSearchedStandardName('');
    setTimePeriod({ from: null, to: null });

    requestMeasurements();
  };

  const handleSearch = () => {
    // search by color
    if (measurement) {
      const defaultMeasurement = deriveDefaultSampleFromSamples(
        measurement.measurementSamples,
      ) as unknown as MeasurementSampleIn;

      const {
        colorSpecification,
        data,
        measurementCondition,
        measurementSpot,
      } = defaultMeasurement;

      const boxTolerance = deTolerance * 1.1;
      const newVariables: StandardQueryVariables = {
        colorFilter: {
          measurementSample: {
            colorSpecification,
            data,
            measurementCondition,
            measurementSpot,
          },
          lTolerance: boxTolerance,
          aTolerance: boxTolerance,
          bTolerance: boxTolerance,
          cTolerance: boxTolerance,
          hTolerance: boxTolerance,
        },
      };

      // this will cause the graphql query
      getStandards(newVariables);

      return;
    }

    let newFilteredStandards = standards;
    if (searchedStandardName) {
      // search by standardName
      newFilteredStandards = filterStandardsByName(
        newFilteredStandards,
        searchedStandardName,
      );

      // todo: send graphql request to query by name
      // getStandards({name: searchedStandardName})
    }

    if (timePeriod.from || timePeriod.to) {
      // search by date
      newFilteredStandards = filterStandardsByDate(newFilteredStandards, timePeriod);

      // todo: send graphql request to query by date
      // getStandards({date: timePeriodState})
    }

    setFilteredStandards(newFilteredStandards);

    // gets the standard with initial variables
    getStandards();
  };
  useEffect(handleSearch, [timePeriod]);

  const handleSelect = () => {
    closeModal();
    dispatch(setSelectedStandardIdAction(selectedStandardId));
  };

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setWidgetConfiguration,
  } = useColorSearchModalWidgetConfiguration();

  const formattedStandards = useMemo(() => {
    const standardsWithPreview = filteredStandards.map((standard) => {
      // todo: this needs refactoring to use all measurements
      const rgbs: Job['simulation'] = standard.measurements[0].measurementSamples.filter(
        isMeasurementSampleSupported,
      ).map(calculatePreviewRGB).map((rgb) => ({
        rgb: {
          r: +rgb['0'],
          g: +rgb['1'],
          b: +rgb['2'],
        },
      }));
      return {
        ...standard,
        creationTimestamp: standard.creationTimestamp,
        preview: {
          simulation: rgbs,
          isMultiAngle: isMeasurementMultiAngle(standard.measurements[0]),
        },
      };
    });

    if (!measurement || !primaryViewingCondition) return standardsWithPreview;

    const transformFunc = (
      condition: DescribedMeasurementCondition,
      standardName?: string,
      standardSample?: MeasurementSample,
      sampleInfo?: SampleInfo,
      sampleSample?: MeasurementSample,
    ) => toColorDataTableTransform(
      condition,
      [primaryViewingCondition],
      standardName,
      standardSample,
      sampleInfo,
      sampleSample,
    );

    return standardsWithPreview.map((standard) => {
      const colorData = getStandardDataSearchStandard(
        Standard.parse(standard),
        measurement.measurementSamples,
        transformFunc,
      );

      // get single sample data
      const colorDataTransformed = colorData ? Object.values(colorData)[0] : {};
      // fix all numbers to default precision
      Object.keys(colorDataTransformed).forEach((key) => {
        const colorDataTransformedRef: Record<string, number | string> = colorDataTransformed;
        const value = colorDataTransformedRef[key];

        colorDataTransformedRef[key] = typeof value === 'number' ? round(value, toNumber) : value;
      });

      return {
        ...colorDataTransformed,
        ...standard,
      };
    }).filter((standardWithInfo) => {
      const dE = colorimetricConfiguration?.metric.deltaE === 'dE76' ? standardWithInfo.dE76 : standardWithInfo.dE00;
      return (dE ?? 1000) <= deTolerance;
    });
  }, [filteredStandards, widgetConfiguration, colorimetricConfiguration]);

  // available columns
  const activeColumns = useMemo(() => {
    const activeTempColumns = ['preview', 'name', 'creationDateTime'];
    if (!measurement) return activeTempColumns;
    return activeTempColumns.concat('dL', 'dA', 'dB');
  }, [measurement]);

  const clearFilters = () => {
    setTimePeriod({ from: null, to: null });
  };

  return (
    <FullScreenDialog isOpen={isOpen} headerTitle={t('labels.standardSearch')} handleClose={closeModal}>
      <div className={classes.container}>
        <div className={classes.leftPane}>
          <div className={classes.field}>
            <Caption className={classes.title}>
              {`${t('labels.name')} ${t('labels.search')}`}
            </Caption>
            <form
              className={classes.input}
              onSubmit={(e) => {
                e.stopPropagation();
                setMeasurement(undefined);
                handleSearch();
              }}
            >
              <InputField
                dataTestId="search-standard-name-input"
                placeholder={t('labels.standardNamePlaceholder')}
                onChange={setSearchedStandardName}
                value={searchedStandardName}
              />
            </form>
            <Button
              data-testid="search-standard-button"
              variant="primary"
              className={classes.searchButton}
              onClick={handleSearch}
            >
              {t('labels.search')}
            </Button>
          </div>

          {/* color search section */}
          <ColorSearch
            dataTestId="search-standards-color-search"
            handleMeasure={handleMeasure}
            handleClearMeasure={() => setMeasurement(undefined)}
            setWidgetConfiguration={setWidgetConfiguration}
            widgetConfiguration={widgetConfiguration}
            measurement={measurement}
            disabled={fetchingStandards}
            loading={measurementInProgress}
            deTolerance={deTolerance}
            setDeTolerance={setDeTolerance}
          />

          {/* filters form */}
          <Filters
            dataTestId="search-standards-filters"
            handleDateChangeFrom={(date?: Date | null) => setTimePeriod({ from: date })}
            handleDateChangeTo={(date?: Date | null) => setTimePeriod({ to: date })}
            from={timePeriod.from}
            to={timePeriod.to}
            clearFilters={clearFilters}
          />
        </div>

        {/* search standards table */}
        <div className={classes.rightPane}>
          <SearchResultsTable
            key={measurement?.id}
            dataTestId="search-standards-result-table"
            activeColumns={activeColumns}
            loading={fetchingStandards}
            selectedStandardId={selectedStandardId}
            setSelectedStandardId={setSelectedStandardId}
            standards={formattedStandards}
          />

          <Button
            data-testid="select-standard-button"
            className={classes.button}
            disabled={!selectedStandardId}
            onClick={handleSelect}
          >
            {t('labels.Select')}
          </Button>
        </div>
      </div>
    </FullScreenDialog>
  );
};

export default SearchStandardModal;
