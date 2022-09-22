/* eslint-disable @typescript-eslint/no-explicit-any */
import { IlluminantType, ObserverType } from '@xrite/cloud-formulation-domain-model';

import { ColorimetricConfiguration } from './types';
import { isEnumValue, isNumber, isString } from '../../../../types/utils';

export const isColorimetricConfiguration = (data: any): data is ColorimetricConfiguration => (
  data
  && data.illuminants
  && isEnumValue(data.illuminants.primary, IlluminantType)
  && isEnumValue(data.illuminants.secondary, IlluminantType)
  && isEnumValue(data.illuminants.tertiary, IlluminantType)
  && data.observers
  && isEnumValue(data.observers.primary, ObserverType)
  && isEnumValue(data.observers.secondary, ObserverType)
  && isEnumValue(data.observers.tertiary, ObserverType)
  && data.metric
  && isString(data.metric.deltaE)
  && isNumber(data.metric.lRatio)
  && isNumber(data.metric.cRatio)
  && isNumber(data.metric.hRatio)
  && (
    !data.tolerance
    || (
      isNumber(data.tolerance.lowerLimit)
      && isNumber(data.tolerance.upperLimit)
    )
  )
);
