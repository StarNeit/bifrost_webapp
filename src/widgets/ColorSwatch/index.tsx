import { useState } from 'react';
import { RGB } from '@xrite/colorimetry-js';

import { Component } from '../../types/component';
import ColorSetupModal from './ColorSetupModal';
import SwatchColors from './SwatchColors';

interface ColorSet {
  sample: boolean,
  standard: boolean,
  image: boolean,
}

type Props = {
  isMultiAngleStandard?: boolean,
  swatchColors?: (RGB[])[],
  sampleNames?: string[],
  sampleIds?: string[],
  sampleConditions?: string[],
  isColorSetupModalOpen: boolean,
  isMultiSample: boolean,
  onCloseModal(): void,
};

const ColorSwatch: Component<Props> = ({
  isMultiAngleStandard = false,
  swatchColors,
  sampleNames,
  sampleIds,
  sampleConditions,
  isMultiSample,
  isColorSetupModalOpen,
  onCloseModal,
}) => {
  const [display, setDisplay] = useState<ColorSet>({
    sample: true,
    standard: true,
    image: false,
  });
  const [backgroundColor, setBackgroundColor] = useState('unset');

  const handleChangeColors = (colors: ColorSet) => {
    setDisplay(colors);
  };

  const handleChangeBackground = (color: string) => {
    setBackgroundColor(color);
  };

  const transformedSwatchColors = display.standard
    ? swatchColors
    : swatchColors?.map((colors) => colors.slice(1)) ?? [];
  const transformedSampleNames = display.standard ? sampleNames : sampleNames?.slice(1);
  const transformedSampleIds = display.standard ? sampleIds : sampleIds?.slice(1);

  return (
    <>
      <SwatchColors
        swatchColors={transformedSwatchColors}
        sampleNames={transformedSampleNames}
        sampleConditions={sampleConditions}
        sampleIds={transformedSampleIds}
        isMultiAngleStandard={isMultiAngleStandard}
        isMultiSample={isMultiSample}
        background={backgroundColor}
      />
      <ColorSetupModal
        onChangeBackground={handleChangeBackground}
        onChangeColors={handleChangeColors}
        backgroundColorMode={backgroundColor}
        colors={display}
        isOpenModal={isColorSetupModalOpen}
        closeModal={onCloseModal}
      />
    </>
  );
};

export default ColorSwatch;
