import { BasicMaterialType, ColorantType } from '@xrite/cloud-formulation-domain-model';
import { findBasicMaterial, getColorantAssortment } from '../../../util/find';

// Needed for future sorting validation task
export const setComponentData = (
  isBasicMaterial: boolean,
  componentId: string,
  components: ColorantAssortment[],
) => {
  const colorantAssortment: ColorantAssortment = getColorantAssortment(componentId, components);
  const component = isBasicMaterial && !colorantAssortment.isLeftover
    ? findBasicMaterial(componentId, components)
    : colorantAssortment;

  if (component !== undefined) {
    if (isBasicMaterial) {
      return {
        original: component,
        isLeftover: colorantAssortment.isLeftover,
        basicMaterialType: BasicMaterialType[component.type],
      };
    }
    return {
      original: component,
      isLeftover: colorantAssortment.isLeftover,
      colorantType: ColorantType[component.type],
    };
  }

  return null;
};
