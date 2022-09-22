import {
  ColorSpaceType,
  ColorSpecification,
  IlluminantType,
  ObserverType,
  Standard,
} from '@xrite/cloud-formulation-domain-model';
import { isColorimetricMeasurement } from './utilsMeasurement';

export function isColorimetricStandard(
  standard: Standard,
): boolean {
  if (!standard.measurements.length) return false;
  const measurement = standard.measurements[0];
  return isColorimetricMeasurement(measurement);
}

export function getColorimetricStandardColorSpec(
  standard: Standard,
): ColorSpecification {
  return standard.measurements[0]?.measurementSamples[0]?.colorSpecification
    || new ColorSpecification({ // reply with default color spec if not present
      colorSpace: ColorSpaceType.CIELab,
      illuminant: IlluminantType.D50,
      observer: ObserverType.TwoDegree,
    });
}
