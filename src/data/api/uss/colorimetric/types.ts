import { IlluminantType, ObserverType } from '@xrite/cloud-formulation-domain-model';

export type ColorimetricConfiguration = {
  illuminants: {
    primary: IlluminantType;
    secondary: IlluminantType;
    tertiary: IlluminantType;
  }
  observers: {
    primary: ObserverType;
    secondary: ObserverType;
    tertiary: ObserverType;
  },
  metric: {
    deltaE: string,
    lRatio: number,
    cRatio: number,
    hRatio: number,
  },
  tolerance?: {
    upperLimit: number,
    lowerLimit: number,
  }
};
