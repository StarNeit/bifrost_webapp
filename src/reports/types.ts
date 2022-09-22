import { RecipeDisplayTableProps } from '../widgets/RecipeDisplay/RecipeDisplayTable';

export type RecipeTableReportProps = {
  formulaName?: string;
  projectName?: string;
  standardName?: string;
  sampleName?: string;
  standardVersion?: string;
  recipeDisplayTableData?: RecipeDisplayTableProps & {
    controls: {
      canUnit: string;
      recipeUnit: string;
      canAmount: number;
    },
    assortmentName?: string;
    substrateName?: string;
    viscosity?: number;
  },
}

export type FormulationReportProps = {
  formulaName: string;
  formulation: Record<string, unknown>;
};

export type ReportPayload = RecipeTableReportProps | FormulationReportProps;
