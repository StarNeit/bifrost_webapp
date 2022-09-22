export const findColorantOfBasicMaterial = (
  colorantId: string,
  colorants: ColorantAssortment[],
): ColorantAssortment => {
  return colorants
    .find((colorant) => colorant.components
      .find((component) => component.basicMaterial.id === colorantId));
};

export const findBasicMaterial = (
  colorantId: string,
  colorants: ColorantAssortment[],
): BasicMaterial => {
  const parent = findColorantOfBasicMaterial(colorantId, colorants);

  return parent?.components
    .find((component) => component.basicMaterial.id === colorantId)
    .basicMaterial;
};

export const getColorantAssortment = (
  colorantId: string,
  colorants: ColorantAssortment[],
): ColorantAssortment => {
  const colorant = colorants.find((c) => c.id === colorantId);
  return colorant === undefined
    ? findColorantOfBasicMaterial(colorantId, colorants)
    : colorant;
};
