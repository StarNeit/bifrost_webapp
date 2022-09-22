import { Substrate } from '@xrite/cloud-formulation-domain-model';
import { SubstrateTypeMode, SubstrateQualityMode } from '../../../types/formulation';
import { CalibrationParameterIn } from '../../../data/api/graphql/generated';
import { getCalibrationParameterScalarValue } from '../../../utils/utils';

export const getSubstrateTypeModeLabel = (
  outputMode: SubstrateTypeMode,
): string => {
  switch (outputMode) {
    case SubstrateTypeMode.Transparent: return 'labels.transparentType';
    case SubstrateTypeMode.Metallic: return 'labels.metallicType';
    case SubstrateTypeMode.Opaque: return 'labels.opaqueType';
    default: return '';
  }
};

export const getSubstrateQualityModeLabel = (
  outputMode: SubstrateQualityMode,
): string => {
  switch (outputMode) {
    case SubstrateQualityMode.Glossy: return 'labels.glossy';
    case SubstrateQualityMode.Matt: return 'labels.matt';
    case SubstrateQualityMode.Coated: return 'labels.coated';
    case SubstrateQualityMode.Uncoated: return 'labels.uncoated';
    case SubstrateQualityMode.UserDefined: return 'labels.userDefined';
    default: return '';
  }
};

export const createTransparentFilmParameters = (): CalibrationParameterIn[] => ([{
  type: 'isTransparent',
  values: [1],
}]);

const hasTransparentFilmParameters = (substrate: Substrate) => (
  substrate.calibrationParameters[0]?.type === 'isTransparent'
  && substrate.calibrationParameters[0]?.data.values.length === 1
  && substrate.calibrationParameters[0]?.data.values[0] === 1
);

export const createMetalizedParameters = (substrateQualityMode: SubstrateQualityMode)
  : CalibrationParameterIn[] => ([
  {
    type: 'isTransparent',
    values: [0],
  },
  {
    type: 'metalizationFactor',
    values: [substrateQualityMode === SubstrateQualityMode.Glossy ? 1 : 0.5],
  },
]);

const hasMetalizedParameters = (substrate: Substrate) => (
  substrate.calibrationParameters.length === 2
    && substrate.calibrationParameters[0].type === 'isTransparent'
    && substrate.calibrationParameters[0].data.values[0] === 0
    && substrate.calibrationParameters[1].type === 'metalizationFactor'
);

export const createOpaqueParameters = (roughness: number): CalibrationParameterIn[] => ([
  {
    type: 'isTransparent',
    values: [0],
  },
  {
    type: 'metalizationFactor',
    values: [0],
  },
  {
    type: 'roughness',
    values: [roughness / 10.0],
  },
]);

const hasOpaqueParameters = (substrate: Substrate) => (
  substrate.calibrationParameters.length === 3
    && substrate.calibrationParameters[0].type === 'isTransparent'
    && substrate.calibrationParameters[0].data.values[0] === 0
    && substrate.calibrationParameters[1].type === 'metalizationFactor'
    && substrate.calibrationParameters[1].data.values[0] === 0
    && substrate.calibrationParameters[2].type === 'roughness'
);

export const getSubstrateCalibrationInformation = (substrate: Substrate): {
    typeMode?: SubstrateTypeMode,
    qualityMode?: SubstrateQualityMode,
    roughnessPercentage?: number,
} => {
  if (hasTransparentFilmParameters(substrate)) {
    return {
      typeMode: SubstrateTypeMode.Transparent,
    };
  }

  if (hasMetalizedParameters(substrate)) {
    const qualityMode = substrate.calibrationParameters[1].data.values[0] === 1
      ? SubstrateQualityMode.Glossy
      : SubstrateQualityMode.Matt;

    return {
      typeMode: SubstrateTypeMode.Metallic,
      qualityMode,
    };
  }

  if (hasOpaqueParameters(substrate)) {
    const roughness = substrate.calibrationParameters[2].data.values[0];
    const qualityMode = (roughness === 0 && SubstrateQualityMode.Coated)
    || (roughness === 2.5 && SubstrateQualityMode.Uncoated)
    || SubstrateQualityMode.UserDefined;

    return {
      typeMode: SubstrateTypeMode.Opaque,
      qualityMode,
      roughnessPercentage: roughness * 10,
    };
  }

  const roughness = getCalibrationParameterScalarValue(
    { calibrationParameters: substrate.calibrationParameters },
    substrate.calibrationConditions[0]?.id,
    'roughness',
  );
  return {
    typeMode: SubstrateTypeMode.Opaque,
    qualityMode: SubstrateQualityMode.UserDefined,
    roughnessPercentage: roughness ? roughness * 10 : 0,
  };
};
