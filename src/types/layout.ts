import { IlluminantType, ObserverType } from '@xrite/cloud-formulation-domain-model';

export enum LayoutComponent {
  ColorPlot,
  ColorData,
  SpectralGraph,
}

export type ViewingCondition = {
  illuminant: IlluminantType,
  observer: ObserverType,
}

export enum ReflectanceCondition {
  R,
  DeltaR,
  KS,
}

export enum BackgroundColorsMode {
  Red,
  Blue,
  Green,
  Grey,
  Yellow,
  Pink,
}
