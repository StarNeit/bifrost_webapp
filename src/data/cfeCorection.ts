import { useMemo } from 'react';
import {
  Assortment,
  Substrate,
  Standard,
  Colorant,
  AppearanceSample,
  Formula,
} from '@xrite/cloud-formulation-domain-model';
import head from 'lodash/head';
import { Client } from 'urql';

import { isOpacityMode } from '../utils/utils';
import { AdditiveWithConcentration, CorrectionMode } from '../types/cfe';
import {
  MetricType,
  OpacityMode,
} from '../types/formulation';
import { RecipeOutputMode, TotalMode } from '../types/recipe';
import { isNumber } from '../types/utils';
import { defaultGravimetricUnit } from '../utils/utilsRecipe';
import { parseArray } from './api/cfdb';
import { useColorimetricConfiguration } from './configurations';
import {
  AssortmentColorantsDocument,
  AssortmentDocument,
  GetSubstrateDocument,
  StandardDocument,
} from './api/graphql/generated';
import { useCorrection } from './cfe';
import { getViewingConditions } from './common';

export async function getStandardById(id: UUID, client: Client) {
  const { data } = await client.query(
    StandardDocument, { id },
  ).toPromise();
  return Standard.parse(data?.getStandard?.[0]);
}

export async function getAssortmentById(id: UUID, client: Client) {
  const { data } = await client.query<{ getAssortment: Assortment[] }>(
    AssortmentDocument, { id },
  ).toPromise();
  return head(data?.getAssortment);
}

export async function getSubstrateById(id: UUID, client: Client) {
  const { data } = await client.query(
    GetSubstrateDocument, { id },
  ).toPromise();
  return Substrate.parse(data?.getSubstrate?.[0]);
}

export async function getColorantsByAssortmentId(id: UUID, client: Client) {
  const { data } = await client.query(
    AssortmentColorantsDocument, { id },
  ).toPromise();
  return parseArray(Colorant, data?.getAssortment?.[0]?.colorants);
}

type CorrectionData = {
  assortment?: Assortment;
  substrate?: Substrate;
  standard?: Standard;
  colorants: Colorant[];
  clear: Colorant;
  sample: AppearanceSample;
  formula?: Formula;
}

type CorrectionSettings = {
  relativeThicknessMin: number;
  relativeThicknessMax: number;
  recipeOutputMode: RecipeOutputMode;
  totalMode: TotalMode;
  targetViscosity: number;
  correctionMode: CorrectionMode;
  maxAddPercentage: number;
  allowRemoveColorantsForCorrection: boolean;
  opacityMode: OpacityMode;
  opacityMinPercent: number;
  opacityMaxPercent: number;
  fixedColorantIds: string[];
  additives: AdditiveWithConcentration[];
}

export const useSampleCorrection = () => {
  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );

  const {
    correct,
    fetching: correctionRunning,
    progress,
  } = useCorrection();

  async function correctSample(data: CorrectionData, settings: CorrectionSettings) {
    if (
      !data.sample
      || !data.formula
      || !data.assortment
      || !data.substrate
      || !data.standard
      || !viewingConditions
      || viewingConditions.length < 2
    ) return undefined;

    // recover formulation parameters from formula settings object
    const formulaThickness = data.formula.formulaLayers[0].relativeThickness || 1.0;
    const settingsThickMin = settings.relativeThicknessMin;
    const settingsThickMax = settings.relativeThicknessMax;
    const relativeThicknessMin = isNumber(settingsThickMin) ? settingsThickMin : formulaThickness;
    const relativeThicknessMax = isNumber(settingsThickMax) ? settingsThickMax : formulaThickness;

    const settingsOpacityMode = settings.opacityMode;
    const settingsOpacityMin = settings.opacityMinPercent;
    const settingsOpacityMax = settings.opacityMaxPercent;
    const opacityMode = isOpacityMode(settingsOpacityMode) ? settingsOpacityMode : OpacityMode.None;
    const opacityMinPercent = isNumber(settingsOpacityMin) ? settingsOpacityMin : 0;
    const opacityMaxPercent = isNumber(settingsOpacityMax) ? settingsOpacityMax : 100;

    const viscosity = isNumber(settings.targetViscosity)
      ? settings.targetViscosity
      : data.formula.formulaLayers[0].viscosity;

    const selectedColorantIds = data.colorants.map(({ id }) => id);

    const { observer, illuminant } = viewingConditions[0];
    const illuminant2 = viewingConditions[1].illuminant;

    const results = await correct({
      assortment: data.assortment,
      calibrationCondition: data.assortment?.calibrationConditions[0],
      substrate: data.substrate,
      standard: data.standard,
      colorants: data.colorants,
      selectedColorantIds,
      clearId: data.clear.id,
      fixedColorantIds: settings.fixedColorantIds,
      relativeThicknessMin,
      relativeThicknessMax,
      recipeOutputMode: settings.recipeOutputMode,
      totalMode: settings.totalMode,
      viscosity: viscosity || 0,
      correctionMode: settings.correctionMode,
      trialSample: data.sample,
      formula: data.formula,
      maxAddPercentage: settings.maxAddPercentage,
      allowRemoveColorantsForCorrection: true,
      metricType: MetricType.Colorimetric,
      colorimetricSettings: {
        illuminants: [
          { illuminant, weight: 1.0 },
          { illuminant: illuminant2, weight: 1.0 },
          { illuminant: illuminant2, weight: 0.0 },
        ],
        observer,
        deltaE2000Weights: {
          kl: colorimetricConfiguration?.metric.lRatio || 1,
          kc: colorimetricConfiguration?.metric.cRatio || 1,
          kh: colorimetricConfiguration?.metric.hRatio || 1,
        },
      },
      opacityMode,
      opacityMinPercent,
      opacityMaxPercent,
      canSize: 0,
      canUnit: defaultGravimetricUnit,
      additives: settings.additives,
    });

    const bestCorrectedResult = results?.[0];
    if (bestCorrectedResult) {
      bestCorrectedResult.sample.parentAppearanceSampleId = undefined;
      bestCorrectedResult.sample.name = `${data.sample.name}-C`;
    }

    return bestCorrectedResult;
  }

  return {
    correctSample,
    progress,
    fetching: correctionRunning,
  };
};
