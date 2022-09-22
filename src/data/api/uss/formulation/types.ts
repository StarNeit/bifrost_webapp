export enum SortingCriterionColumn {
  Score = 'score',
  ComponentCount = 'componentCount',
  Price = 'price',
  DeltaE2000 = 'deltaE2000',
  DeltaE76 = 'deltaE76',
}

export type SortingCriterion = {
  column: SortingCriterionColumn,
  weight: number,
}

export type FormulationConfiguration = {
  // maxColorantCount: number,
  // defaultCanSize: number,
  sortingCriteria: SortingCriterion[],
};
