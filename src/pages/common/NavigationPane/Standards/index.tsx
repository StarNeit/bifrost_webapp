import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { RGB } from '@xrite/colorimetry-js';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { AppearanceSample } from '@xrite/cloud-formulation-domain-model';
import orderBy from 'lodash/orderBy';
import { useDispatch } from 'react-redux';

import Panel from '../../../../components/Panel';
import StandardActions, { StandardMenuOption } from './StandardActions';
import StandardColors from './StandardColors';
import { Subtitle, Body } from '../../../../components/Typography';
import { Component } from '../../../../types/component';
import LoadingContainer from '../../../../components/LoadingContainer';
import Select from '../../../../components/Select';
import { useFormulationSetup } from '../../../Formulation/utils';
import { useSamplesDataForSwatch } from '../../../../widgets/utils';
import { getDateDisplayString } from '../../../../utils/utils';
import { useAppearanceSample, useStandard } from '../../../../data/api';
import { useSampleId } from '../../../../data/common';
import { setExpandedSampleTreeIds } from '../../../../data/reducers/common';

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(1),
  },
  title: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: theme.palette.surface[2],
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: theme.palette.text.secondary,
  },
  medium: {
    flexBasis: '48%',
  },
  select: {
    marginBottom: theme.spacing(2),
  },
  values: {
    marginBottom: theme.spacing(1.25),
  },
  wrapperOfColors: {
    display: 'flex',
  },
}));

const returnAppearanceSamplePath = (
  searchedSampleId: string,
  appearanceSamples?: AppearanceSample[],
  path: string[] = [],
): string[] => {
  const searchedSample = appearanceSamples?.find((sample) => sample.id === searchedSampleId);
  if (!searchedSample) return path;

  const newPath = [searchedSample.id].concat(path);

  if (!searchedSample.parentAppearanceSampleId) return newPath;

  return returnAppearanceSamplePath(
    searchedSample.parentAppearanceSampleId,
    appearanceSamples,
    newPath,
  );
};

interface StandardData {
  id: string;
  name: string;
}

type Props = {
  standards?: StandardData[],
  selectedStandardFetching: boolean,
  selectedStandardId?: string,
  onChangeStandard(value: string): void,
  onOptionSelect(option: StandardMenuOption): void,
  selectedSampleId: string,
}

const Standards: Component<Props> = ({
  standards,
  selectedStandardFetching,
  selectedStandardId,
  onChangeStandard,
  onOptionSelect,
  selectedSampleId,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();

  const { result: selectedStandard } = useStandard(
    selectedStandardId ? { id: selectedStandardId } : undefined,
  );

  const {
    result: appearanceSamples,
    fetching: fetchingSamples,
  } = useAppearanceSample({ query: { parentId: selectedStandard?.id } });

  const selectedSample = appearanceSamples?.find((({ id }) => id === selectedSampleId));
  const { substrates } = useFormulationSetup();
  const substrateOfSelectedSample = substrates?.find(
    (substrate) => substrate?.id === selectedSample?.substrateId,
  );

  // colors for standard and recipe
  const { swatchColors } = useSamplesDataForSwatch(false);
  const colorStopsOfStandard = swatchColors.map(({ colorOfStandard }) => colorOfStandard);
  const colorStopsOfRecipe: RGB[] = [];
  swatchColors.forEach(
    ({ colorOfRecipe }) => colorOfRecipe && colorStopsOfRecipe.push(colorOfRecipe),
  );

  // standard details
  const standardDate = selectedStandard?.creationTimestamp();
  const standardCreator = selectedStandard?.creatorName;

  // sample details for selected one
  const sampleName = selectedSample?.name || '';
  const substrateName = substrateOfSelectedSample?.name || '';
  const sampleDate = selectedSample?.creationTimestamp();
  const sampleCreator = selectedSample?.creatorName;

  const { setSampleId } = useSampleId();

  const orderedStandards = useMemo(() => {
    const allOrderedStandards = orderBy(standards, ['name'], ['asc']);

    // index that indicates where alphabetically named standards start
    const index = allOrderedStandards.findIndex((standard) => standard.name.match(/^[a-zA-Z]/));

    // standards that start with number/symbol
    const numericallyOrderedStandards = allOrderedStandards.slice(0, index);
    // standards that start with alphabetic character
    const alphabeticallyOrderedStandards = allOrderedStandards.slice(index);

    return alphabeticallyOrderedStandards.concat(numericallyOrderedStandards);
  }, [standards]);

  const handleSampleChange = (sample: AppearanceSample) => {
    setSampleId(sample.id);

    if (!sample.parentAppearanceSampleId) return;

    // make sure that the expanded state of navigation tree is always up to date
    const extendedSampleTreeIds = returnAppearanceSamplePath(
      sample.parentAppearanceSampleId,
      appearanceSamples,
    );

    dispatch(setExpandedSampleTreeIds({ ids: ['root'].concat(extendedSampleTreeIds), persist: true }));
  };

  return (
    <>
      <div className={clsx(classes.header, classes.row)}>
        <Subtitle data-testid="standards-title" className={classes.title}>{t('labels.standard')}</Subtitle>
        <StandardActions
          onOptionSelect={onOptionSelect}
          disableEdit={!selectedStandard}
        />
      </div>
      <Panel className={classes.panel}>
        <Select
          id="standard-select"
          instanceId="standard-select"
          dataTestId="selectedStandard"
          isMulti={false}
          data={orderedStandards}
          value={selectedStandard}
          labelProp="name"
          idProp="id"
          className={classes.select}
          onChange={(value) => onChangeStandard(value.id)}
        />

        {(standardCreator || standardDate) && (
          <>
            <div className={clsx(classes.row, classes.values)}>
              <Body className={classes.label}>{t('labels.dateCreated')}</Body>
              <Body>{getDateDisplayString(standardDate, true)}</Body>
            </div>

            {/* <div className={clsx(classes.row, classes.values)}>
              <Body className={classes.label}>{t('labels.creator')}</Body>
              <Body>{standardCreator}</Body>
            </div> */}
          </>
        )}

        <LoadingContainer fetching={selectedStandardFetching}>
          <div className={classes.wrapperOfColors}>
            <StandardColors data-testid="standard-colors" colors={colorStopsOfStandard} isStandard />
            <StandardColors data-testid="standard-colors" colors={colorStopsOfRecipe} />
          </div>
        </LoadingContainer>

        {/* sample select input */}
        {selectedStandard
        && (
        <div className={clsx(classes.row, classes.values)}>
          <Body className={classes.label}>{t('labels.name')}</Body>
          <Select
            id="sample-select"
            instanceId="sample-select"
            placeholder={t('labels.selectSample')}
            isMulti={false}
            data={appearanceSamples}
            // id is set to none when slider is 0
            value={!selectedSampleId ? undefined : selectedSample}
            labelProp="name"
            idProp="id"
            onChange={handleSampleChange}
            disabled={fetchingSamples}
          />
        </div>
        )}

        {(sampleName || sampleDate || substrateName || sampleCreator) && (
          <>

            <div className={clsx(classes.row, classes.values)}>
              <Body className={classes.label}>{t('labels.dateCreated')}</Body>
              <Body>{getDateDisplayString(sampleDate, true)}</Body>
            </div>

            {/* <div className={clsx(classes.row, classes.values)}>
              <Body className={classes.label}>{t('labels.creator')}</Body>
              <Body>{sampleCreator}</Body>
            </div> */}

            {/* <div className={classes.row}>
              <Body className={classes.label}>{t('labels.substrate')}</Body>
              <Body>{substrateName}</Body>
            </div> */}
          </>
        )}
      </Panel>
    </>
  );
};

export default Standards;
