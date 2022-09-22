/* eslint-disable @typescript-eslint/no-explicit-any */
import { Industry } from '@xrite/cloud-formulation-domain-model';
import { OpacityMode } from '../../types/formulation';
import { RecipeOutputMode } from '../../types/recipe';

export const getRecipeOutputModeLabel = (
  outputMode: RecipeOutputMode,
  industryType: Industry,
): string => {
  switch (outputMode) {
    case RecipeOutputMode.ProductionReady:
      return (industryType === Industry.Ink) ? 'labels.printReadyInks' : 'labels.productionReady';
    case RecipeOutputMode.BasicInksAndSolvent: return 'labels.basicInksAndSolvent';
    case RecipeOutputMode.BasicMaterial: return 'labels.basicMaterials';
    default: return '';
  }
};

export const getOpacityModeLabel = (
  opacityMode: OpacityMode,
): string => {
  switch (opacityMode) {
    case OpacityMode.None: return 'labels.none';
    case OpacityMode.OpacityFixed: return 'labels.opacityFixed';
    case OpacityMode.OpacityMinimum: return 'labels.opacityMinimum';
    case OpacityMode.Transparent: return 'labels.transparent';
    case OpacityMode.Opaque: return 'labels.opaque';
    case OpacityMode.TargetOnWhiteAndBlack: return 'labels.targetOnWhiteAndBlack';
    case OpacityMode.ContrastRatioFixed: return 'labels.constrastRatioFixed';
    case OpacityMode.ContrastRatioMinimum: return 'labels.contrastRatioMinimum';
    default: return '';
  }
};
