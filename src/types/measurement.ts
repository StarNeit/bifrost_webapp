import { MeasurementCondition, MeasurementSample } from '@xrite/cloud-formulation-domain-model';

export type DescribedMeasurementCondition = {
  condition: MeasurementCondition,
  description: string
};

export type SamplesDataForCondition = {
  condition: DescribedMeasurementCondition,
  standardMeasurementSample: MeasurementSample,
  samplesMeasurementSamples: MeasurementSample[],
};
