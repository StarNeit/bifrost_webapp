import {
  IlluminantType,
  ObserverType,
} from '@xrite/cloud-formulation-domain-model';
import { ColorimetricConfiguration } from './types';

const defaultColorimetricConfiguration: ColorimetricConfiguration = {
  illuminants: {
    primary: IlluminantType.D50,
    secondary: IlluminantType.A,
    tertiary: IlluminantType.FL12,
  },
  observers: {
    primary: ObserverType.TwoDegree,
    secondary: ObserverType.TwoDegree,
    tertiary: ObserverType.TwoDegree,
  },
  metric: {
    deltaE: 'dE76',
    lRatio: 1.0,
    cRatio: 1.0,
    hRatio: 1.0,
  },
  tolerance: undefined,
};

export default defaultColorimetricConfiguration;
