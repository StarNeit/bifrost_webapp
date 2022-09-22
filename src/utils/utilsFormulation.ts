/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IlluminantType, ObserverType, Price,
} from '@xrite/cloud-formulation-domain-model';
import { AdditiveWithConcentration, ColorantRestriction, ColorimetricSettings } from '../types/cfe';
import { FormulationSettings, MetricType } from '../types/formulation';
import { TotalMode } from '../types/recipe';
import {
  isArray, isEnumValue, isNumber, isString,
} from '../types/utils';
import { isOpacityMode, isRecipeOutputMode } from './utils';

export const isTotalMode = (value: any): value is TotalMode => ['BasicInkTotal', 'Total'].includes(value);

export const isColorantRestriction = (value: any): value is ColorantRestriction => Boolean(
  value
  && isString(value.id)
  && isNumber(value.minConcentrationPercentage)
  && isNumber(value.maxConcentrationPercentage),
);

export const isIlluminantSettings = (value: any): value is ColorimetricSettings['illuminants'][number] => Boolean(
  value
  && isEnumValue(value.illuminant, IlluminantType)
  && isNumber(value.weight),
);

export const isColorimetricSettings = (value: any): value is ColorimetricSettings => Boolean(
  value
  && isArray(value.illuminants, isIlluminantSettings)
  && isEnumValue(value.observer, ObserverType),
);

export const isPrice = (value: any): value is Price => Boolean(
  value
  && isNumber(value.amount)
  && isString(value.currencyCode),
);

export const isAdditives = (value: any): value is AdditiveWithConcentration => Boolean(
  value
  && (!value.id || isString(value.id))
  && (!value.creationDateTime || isString(value.creationDateTime))
  && (!value.creatorId || isString(value.creatorId))
  && (!value.aclId || isString(value.aclId))
  && (!value.name || isString(value.name))
  && (!value.type || isString(value.type))
  && isNumber(value.concentrationPercentage)
  && (!value.price || isPrice(value.price)),
);

export const isFormulationSettings = (
  data: any,
): data is FormulationSettings => Boolean(
  data
  && isRecipeOutputMode(data.recipeOutputMode)
  && isString(data.calibrationConditionId)
  && isString(data.engineId)
  && isNumber(data.targetViscosity)
  && isTotalMode(data.totalMode)
  && isEnumValue(data.metricType, MetricType)
  && isColorimetricSettings(data.colorimetricSettings)
  && isNumber(data.relativeThicknessMin)
  && isNumber(data.relativeThicknessMax)
  && isOpacityMode(data.opacityMode)
  && isNumber(data.opacityMinPercent)
  && isNumber(data.opacityMaxPercent)
  && (!data.clearId || isString(data.clearId))
  && (!data.selectedColorantIds || isArray(data.selectedColorantIds, isString))
  && (!data.colorantRestrictions || isArray(data.colorantRestrictions, isColorantRestriction))
  && (!data.requiredColorantIds || isArray(data.requiredColorantIds, isString))
  && (!data.additives || isArray(data.additives, isAdditives)),
);
