import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RGB } from '@xrite/colorimetry-js';
import { Standard } from '@xrite/cloud-formulation-domain-model';

import { Component, ClassNameProps } from '../../types/component';
import AnimationContainer from '../../components/AnimationContainer';
import StandardModal from './StandardSubstrateModal/StandardModal';
import Standards from './NavigationPane/Standards';
import {
  useAppearanceSample,
  useStandard,
  useStandards,
} from '../../data/api';
import { useSampleId, useStandardId } from '../../data/common';
import { calculatePreviewRGB, isMeasurementSampleSupported } from '../../utils/colorimetry';
import LoadingContainer from '../../components/LoadingContainer';
import Samples from './NavigationPane/Samples';
import StandardColors from './NavigationPane/Standards/StandardColors';
import { scrollbars } from '../../theme/components';
import { StandardMenuOption } from './NavigationPane/Standards/StandardActions';
import SearchStandardModal from './NavigationPane/Standards/SearchStandardModal';
import SampleModal from './StandardSubstrateModal/SampleModal';
import SampleEditModal from './StandardSubstrateModal/SampleEditModal';
import StandardEditModal from './NavigationPane/Standards/StandardEditModal';
import { setIsNewSamplePopupVisible } from '../../data/reducers/common';

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(3),
  },
  rotate90: {
    transform: 'rotate(90deg)',
  },
  paneWrapper: {
    ...scrollbars(theme),
    marginRight: theme.spacing(-1.25),
    marginBottom: theme.spacing(-1.25),
    height: '100%',
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
}));

const NavigationPane: Component<ClassNameProps> = ({ className }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(true);
  const [isNewStandardPopupVisible, setIsNewStandardPopupVisible] = useState(false);
  const [isSearchStandardPopupVisible, setIsSearchStandardPopupVisible] = useState(false);
  const [isEditStandardPopupVisible, setIsEditStandardPopupVisible] = useState(false);
  const { isNewSamplePopupVisible } = useSelector((state) => state.common);
  const [isEditSamplePopupVisible, setIsEditSamplePopupVisible] = useState(false);

  const {
    result: standards,
    fetching: standardsFetching,
  } = useStandards();

  const { selectedStandardId, setStandardId } = useStandardId();
  const {
    result: selectedStandard,
    fetching: standardFetching,
    mutation: [createStandard],
    removal: [deleteStandard],
    update: [updateStandard],
  } = useStandard({ id: selectedStandardId });

  const [sampleActionLoading, setSampleActionLoading] = useState(false);
  const { selectedSampleId, setSampleId } = useSampleId();
  const { removal: [deleteSample] } = useAppearanceSample();

  const [displayedSample, setDisplayedSample] = useState({
    id: '',
    isFirstTier: false,
    position: 0,
  });

  const colors: RGB[] = [];
  selectedStandard?.measurements[0]
    ?.measurementSamples
    .filter((value) => isMeasurementSampleSupported(value))
    .forEach((value) => colors.push(calculatePreviewRGB(value)));

  const handleChangeStandard = (value: string) => {
    setStandardId(value);
  };

  const handleOptionSelect = (option: StandardMenuOption) => {
    switch (option) {
      case 'new':
        setIsNewStandardPopupVisible(!isNewStandardPopupVisible);
        break;

      case 'delete':
        if (!selectedStandardId) break;

        setStandardId('');
        deleteStandard({ id: [selectedStandardId] });
        break;

      case 'search':
        setIsSearchStandardPopupVisible(!isSearchStandardPopupVisible);
        break;

      case 'edit':
        setIsEditStandardPopupVisible(!isEditStandardPopupVisible);
        break;

      default:

        // case 'report':
        // todo: show report modal when created
        //   break;
        break;
    }
  };

  const handleDeleteSample = async () => {
    if (selectedSampleId) {
      setSampleActionLoading(true);

      const deleteId = selectedSampleId;
      setSampleId('');
      await deleteSample({ samplesToDelete: [deleteId] });

      setSampleActionLoading(false);
    }
  };

  const handleNewSamplePopup = () => {
    dispatch(setIsNewSamplePopupVisible(!isNewSamplePopupVisible));
  };

  const handleNewSample = () => {
    dispatch(setIsNewSamplePopupVisible(true));
  };

  const handleEditSample = () => {
    setIsEditSamplePopupVisible(!isEditSamplePopupVisible);
  };

  return (
    <AnimationContainer
      dataTestId="nav-pane"
      className={className}
      onChangeOpen={setIsOpen}
      headerIcon={selectedStandard && (
        <StandardColors
          className={classes.rotate90}
          colors={colors}
          small
        />
      )}
      header={!isOpen && selectedStandard ? selectedStandard.name : t('labels.project')}
      size="small"
    >
      <LoadingContainer data-testid="loading-nav-pane" fetching={standardsFetching}>
        <div data-testid="nav-pane-loading-container" className={classes.paneWrapper}>
          <div className={classes.container}>
            <Standards
              standards={standards}
              selectedStandardFetching={standardFetching}
              selectedStandardId={selectedStandardId}
              onChangeStandard={handleChangeStandard}
              onOptionSelect={handleOptionSelect}
              selectedSampleId={displayedSample.isFirstTier
                ? displayedSample.id : selectedSampleId}
            />
          </div>
          <StandardModal
            isOpen={isNewStandardPopupVisible}
            closeModal={() => handleOptionSelect('new')}
            createStandard={async (standard: Pick<Standard, 'id' | 'name' | 'creationDateTime' | 'measurements' | 'aclId' | 'tolerances'>) => {
              await createStandard(standard);
              setStandardId(standard.id);
              handleOptionSelect('new');
            }}
          />

          <SearchStandardModal
            isOpen={isSearchStandardPopupVisible}
            closeModal={() => handleOptionSelect('search')}
          />
          <StandardEditModal
            selectedStandard={selectedStandard}
            isOpen={isEditStandardPopupVisible}
            closeModal={() => setIsEditStandardPopupVisible(false)}
            updateStandard={updateStandard}
          />

          <div className={classes.container}>
            <Samples
              standardFetching={standardFetching}
              standard={selectedStandard}
              onSampleDelete={handleDeleteSample}
              onSampleEdit={handleEditSample}
              openNewSampleModal={handleNewSample}
              actionIsLoading={sampleActionLoading}
              displayedSample={displayedSample}
              setDisplayedSample={setDisplayedSample}
            />
          </div>
          <SampleModal
            isOpen={isNewSamplePopupVisible}
            closeModal={handleNewSamplePopup}
            isStandardSelected={
              selectedSampleId
                ? Boolean(selectedStandard && selectedSampleId === selectedStandard.id)
                : Boolean(selectedStandard)
            }
          />
          <SampleEditModal
            isOpen={isEditSamplePopupVisible}
            closeModal={handleEditSample}
          />
        </div>

      </LoadingContainer>
    </AnimationContainer>
  );
};

export default NavigationPane;
