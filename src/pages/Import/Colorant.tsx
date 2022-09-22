import { Colorant as TColorant } from '@xrite/cloud-formulation-domain-model';
import { useTheme } from '@material-ui/core';
import { RGB } from '@xrite/colorimetry-js';

import {
  Component,
  ClassNameProps,
} from '../../types/component';
import ColorSquare from '../../components/ColorSquare';
import { getPreviewRGBForColorant } from '../../utils/colorimetry';

type Props = ClassNameProps & {
  colorant: TColorant;
  calibrationConditionId: string;
};

const convertRGB = ([r, g, b]: RGB) => ({
  rgb: { r, g, b },
});

const Colorant: Component<Props> = ({
  colorant,
  calibrationConditionId,
}) => {
  const theme = useTheme();

  return (
    <ColorSquare
      small
      colors={[convertRGB(getPreviewRGBForColorant(colorant, calibrationConditionId))]}
      style={{ marginRight: theme.spacing(1) }}
    />
  );
};

export default Colorant;
