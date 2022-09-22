/* eslint-disable @typescript-eslint/no-explicit-any */
// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare type FormulationParameters = {
  standardName: string;
  assortment: string;
  substrate: string;
  clear: string;
  recipeOutput: string;
  components: string[];
};

interface Price {
  amount: number,
  currencyCode: string
}

declare type SelectValueOptions = {
  searchable: boolean;
  exact: boolean;
  clearPreviousValue?: boolean;
};

interface AssortmentData {
  id: string;
  industry: string;
  name: string;
  subIndustry: string;
}

interface Assortment {
  value: AssortmentData;
  label: string;
}
interface SelectOption {
  value: string;
  label: string;
}

interface Data {
  [key: string]: any
}

interface ColorDataTable {
  data: Data;
  measurementModes: string[];
  viewingConditions: any[];
}

interface Colorant {
  id: string;
  color: number[];
  name: string;
  formulaPercentage: string;
  amount: string;
  cumulative: string;
  originalPercentage?: string;
  percentageChange?: string;
  correctedAmount?: string;
  addAmount?: string;
}

interface BasicMaterial {
  id: string,
  name: string,
  type: string,
  price?: Price
}

interface SpectralSampling {
  startWavelength: number,
  endWavelength: number,
  wavelengthInterval: number
}

interface CalibrationData {
  id?: string,
  spectralSampling?: SpectralSampling
  values: number[]
}

interface Calibration {
  calibrationConditionId: string,
  type: string,
  data: CalibrationData
}
interface ColorantComponent {
  basicMaterial: BasicMaterial,
  concentrationPercentage: number
}
interface ColorantAssortment {
  percentage?: number;
  amount?: number;
  massAmount?: number;
  cumulativeAmount?: number;
  cumulativePercentage?: number;
  originalPercentage?: number;
  originalAmount?: number;
  originalCumulativeAmount?: number;
  originalCumulativePercentage?: number;
  percentageChange?: number;
  addAmount?: number;
  id: string,
  minConcentrationPercentage: number,
  maxConcentrationPercentage: number,
  name: string,
  type: string,
  specificMass: number,
  price?: Price,
  isLeftover: boolean,
  components: ColorantComponent[],
  calibrationParameters: Calibration[]
}
interface Layer {
  components: ColorantAssortment[];
  colorants: Colorant[];
  averageDensity: number;
  canSizeInRecipeUnits: number;
  totalMassAmount: number;
  totalVolumeAmount: number;
  viscosity: number;
}

interface RecipeData {
  layers: Layer;
}

interface Column {
  id: string;
  name: string;
  notSelectable: boolean;
}

interface RecipeResultTable {
  data: RecipeData;
  columns: Column[];
}

interface RecipeResult {
  data: RecipeData;
  columns: Column[];
}

interface FormulationResultData {
  id: string;
  type: string;
  name: string;
  score: number;
  colors: number[][];
  deltaE2000: number;
  deltaE76: number;
  numberOfComponents?: number;
  price?: number | null;
}

interface MeasurementSample {
  name: string;
  L: number;
  a: number;
  b: number;
  C?: number;
  h?: number;
  dL?: number;
  dA?: number;
  dB?: number;
  dC?: number;
  dH?: number;
  dE?: number;
}

interface MeasurementRecord {
  ['D50-2']: MeasurementSample[];
  ['A-2']: MeasurementSample[];
  ['FL11/TL84-2']: MeasurementSample[];
}
interface ColorData {
  M0: MeasurementRecord;
  M2: MeasurementRecord;
  M3: MeasurementRecord;
}
interface ViewingCondition {
  illuminant: string;
  observer: string;
}
interface ColorDataTableEntry {
  colorData: ColorData;
  combinedColorData: ColorData;
  measurementConditions: string[];
  viewingConditions: ViewingCondition[];
}

interface PercentagesData {
  [key: string]: number;
}

interface ConcentrationPercentages {
  [key: string]: PercentagesData;
}

interface FormulationState {
  selectedComponentIds: string[];
  selectedAdditiveIds?: string[];
  requiredComponentIds: string[];
  concentrationPercentages: ConcentrationPercentages;
  targetViscosity: number;
  relativeThicknessPercent: number;
  combinatorialMode: string;
}

interface CommonState {
  selectedStandardId: string;
  selectedSampleId: string;
  workingAppearanceSamples: [];
}

interface State {
  router?: any;
  authentication?: any;
  theme?: any;
  common: CommonState;
  formulation: FormulationState;
  correction?: any;
  dataImport?: any;
}

interface ClearCoatValue {
  id: string;
  name: string;
  isLeftover: boolean;
  type: string;
  previewColor: number[];
  specificMass: number;
  maxConcentrationPercentage: number;
  minConcentrationPercentage: number;
}

interface MeasurementDevice {
  currentTimestamp?: number;
  firmwareVersion?: string;
  serialNumber: string;
  type: string;
  __typename?: string;
}

interface SpectralValueData {
  values: number[] | string;
  wavelengthInterval: number;
  wavelengthStart: number;
  __typename?: string;
}
interface ColorValueData {
  geometry: string;
  lab: string | null;
  spectral: SpectralValueData;
  illumination: string;
  filter: string;
  gloss: string;
  __typename?: string;
}

interface MeasurementColorValue {
  [key: string]: ColorValueData[] | string | null;
}

interface MeasurementData {
  colorValues: MeasurementColorValue;
  id?: string;
  imageValues: [];
  temperature: number;
  timestamp: number;
  __typename?: string;
}

interface MeasurementSet {
  averagingMode?: string;
  creationTimestamp: number;
  id: string;
  name?: string;
  measurements: MeasurementData[];
  __typename?: string;
}
interface BridgeAppMeasurement {
  jobId?: string;
  device: MeasurementDevice;
  measurementSet: MeasurementSet;
  name?: string;
  deviceType?: string;
  deviceSerialNumber?: string;
  __typename?: string;
}

interface StandardSampleTrial {
  id: string;
  name: string;
  hasChildren: boolean;
}
interface StandardSample {
  parentId: string;
  parentName: string;
  children: StandardSampleTrial[];
}

interface BifrostTestData {
  assortmentColorants: ColorantAssortment[];
  selectedAssortment: Assortment;
  selectedSubstrate: SelectOption;
  colorDataTable: ColorDataTable;
  formulationColorDataTableEntries: ColorDataTableEntry[];
  correctionColorDataTableEntries: ColorDataTableEntry[];
  selectedStandard: SelectOption;
  selectedComponents: SelectOption[];
  recipeResultTable: RecipeResultTable;
  formulationMeasurement?: BridgeAppMeasurement;
  correctionMeasurement?: BridgeAppMeasurement;
  formulationResultData?: FormulationResultData[];
  correctionResultData?: FormulationResultData[];
  formulationRecipeResults: RecipeResult[];
  correctionRecipeResults: RecipeResult[];
  selectedThickness?: number;
  selectedThicknessMin?: number;
  selectedThicknessMax?: number;
  selectedViscosity: number;
  selectedOpacityMode: SelectOption;
  selectedOpacityMin: number;
  selectedRecipeOutput: SelectOption;
  selectedClearCoat: ClearCoatValue;
  selectedTechnicalVarnishMode?: boolean;
  selectedSampleTrials: StandardSample[];
  selectedAdditiveIds?: SelectOption;
  selectedPrintApplication?: SelectOption;
  selectedSample?: string;
  correctionSelectedAssortment?: Assortment;
  state: State;
}

declare namespace Cypress {
  interface Chainable {
    pickSelectItem(
      selector: string,
      value: string,
      options?: SelectValueOptions,
    ): Chainable<Element>;

    pickSelectItems(
      selector: string,
      values: string[],
    ): Chainable<Element>;

    clearSelectItems(
      selector: string,
    ): Chainable<Element>

    formulate(data: BifrostTestData): Chainable<Element>;

    verifyRecipeResults(
      testData: BifrostTestData,
      testResultsData: FormulationResultData[],
      typeOfResults: string,
    ): Chainable<Element>;

    verifyColorDataTable(data: ColorDataTableEntry): Chainable<Element>;
    /**
     * Custom command to login to Bifrost.
     * @example cy.dataCy('greeting')
     */
    login(): Chainable<Element>;

    /**
     * Custom command to verify the default view of a dialog in Bifrost.
     * @example cy.verifyInitNewItemForm('input-field-id', 'save-item-button-id')
     */
    verifyInitNewItemForm(
      newItemNameFieldId: string,
      saveNewItemButtonId: string,
      idPrefix: string,
    ): Chainable<Element>;

    /**
     * Custom command to replace a number value in an input field in Bifrost
     * @example cy.replaceNumberValue('[data-testid="someId"] input', 30);
     */
    replaceNumberValue(
      selector: string,
      value: number,
    ): Chainable<Element>;

    /**
     * Custom command to populate the data in the Formulation Setup dialog in Bifrost
     * @example cy.populateSetupDialog(data: any);
     *
     * The input parameter data should have the following data in it:
     * const data = {
        @param isFormulation (Is the current test for a formulation): boolean
        @param recipeOutputMode (Selected Recipe Output Mode): string,
        @param colorants (All available colorants): ColorantAssortment[],
        @param clearCoat (Selected Clear Coat value): ClearCoatValue,
        @param technicalVarnishMode (): boolean,
        @param state: FormulationState,
        @param selectedPrintApplication?: string,
     }
    *
    */
    populateSetupDialog(data: any): Chainable<Element>;

    populateColorants(data: any): Chainable<Element>;

    populateTechnicalVarnish(data: any): Chainable<Element>;

    populateAdditives(data: any): Chainable<Element>;

    selectComponentsForTransferList(
      sectionName: string,
      data: any,
    ): Chainable<Element>;

    populateConcentrationPercentages(
      sectionName: string,
      data: any,
    ): Chainable<Element>;

    /*
    * Custom command for fetching the elements of the navigation bar in Bifrost
    */
    getNavBarElements(): Chainable<Element>;

    /*
    * Custom command for verifying the elements of the navigation bar in Bifrost
    */
    verifyNavBarItems(pageTitle: string): Chainable<Element>;

    /*
    * Custom command for fetching the elements of the navigation bar in Bifrost
    */
    getNavPaneElements(): Chainable<Element>;

    /*
    * Custom command for verifying the elements of the navigation pane in Bifrost
    */
    verifyNaviagationPaneElements(): Chainable<Element>;

    /*
    * Custom command for fetching the interactable elements
    * of the Correction Setup widget in Bifrost
    */
    getCorrectionSetupWidgetElements(): Chainable<Element>;

    /*
    * Custom command for populating the fields in the Correction Setup widget
    * with the provided test data
    */
    correctManually(data: BifrostTestData): Chainable<Element>;

    /*
    * Custom command for verifying the Recipe Display data
    */
    verifyRecipeDisplay(
      layersComponents: ColorantAssortment[],
      allComponents: ColorantAssortment[],
      recipeOutputMode: string,
      mismatchMessage: string,
      isFormulation: boolean,
      correctionModeAdd?: boolean,
    ): Chainable<Element>;

    /*
    * Custom command for opening a page through the hamburger menu
    */
    goToPage(page: string): Chainable<Element>;

    /*
    * Custom command for fetching the fields in the Search Standard dialog
    */
    getSearchStandardElements(): Chainable<Element>;

    /*
    * Custom command for verifying the Modal Widget data
    */
    verifyModalWidgets(idPrefix: string): Chainable<Element>;

    /*
    * Custom command for verifying the color search results
    */
    verifyColorSearchResults(deTolerance: number): Chainable<Element>;

    /*
    * Custom command for clicking away and removing the focus from the currently focused element
    */
    clickAway(): Chainable<Element>;

    /*
    * Custom command for sorting the table by one of the cells
    */
    sortRowBy(
      tableID: string,
      cellName: string,
      sortingOrder: string,
    ): Chainable<Element>;

    /*
    * Custom command for fetching the page elements for the Database Import page
    */
    getDatabaseImportElements(): Chainable<Element>;

    /*
    * Custom command for clearing the previously imported data from the Database Import page
    */
    clearPreviouslyImportedData(): Chainable<Element>;

    /**
     * Custom command for importing data in the Database Import page in Bifrost
     * and validating it in the Formulation page
     *
     * @param tableName is the name of the current table
     * @param nameCell is the value of the name cell
     */
    validateImportData(
      tableName: string,
      nameCell: string,
    ): Chainable<Element>;

    /**
     * Custom command that verifies if the Database Import table is empty
     * and has an appropriate label
     *
     * @param tableName is the current Database Import table
     * @param emptyTableID is the data-testid of the empty table
     */
    verifyNoAvailableDataForSection(
      tableName: string,
      emptyTableID: string,
    ): Chainable<Element>;

    /**
     * Custom command that waits for the Formulation page to load
     */
    waitForFormulationPageToLoad(): Chainable<Element>;

    /**
     * Custom command for selecting a standard and substrate based on the input
     * value of the substrate
     *
     * @param substrate is the value for which the command will try
     * to find a valid existing standard
     */
    selectStandardForSubstrate(substrate: string): Chainable<Element>;

    /**
    * Custom command for deleting an existing option from a dropdown list
    * in the Bifrost web app
    *
    * @param prefix could be: standard, substrate, ...
    */
    deleteExistingOption(
      prefix: string,
    ): Chainable<Element>;

    /**
     * Custom command for importing all of the available data from the Database Import page
     * in the Bifrost web app
     */
    importAvailableData(
      tableName: string,
    ): Chainable<Element>;

    /**
     * Custom command for verifying the imported data from the Database Import page
     * in the Formulation page of the Bifrost web app
     */
    verifyImportedData(
      file: string,
      tables: string[],
    ): Chainable<Element>;

    /**
     * Custom command for doing a formulation, measurement, correction and validation
     * of the correction results in the Bifrost web app
     */
    correctWithMeasurement(
      testData: BifrostTestData,
      trialPrefix: string,
      skipValidations: boolean,
    ): Chainable<Element>;

    /**
     * Custom command for doing a correction and validation
     * of the correction results in the Bifrost web app
     */
    correctWithExistingTrial(
      testData: BifrostTestData,
      trialPrefix: string,
      setupMode: string,
      skipValidations: boolean,
    ): Chainable<Element>;

    /**
     * Custom command opening the sample tree and select a recipe or trial
     */
    openSampleTreeAndSelect(
      isRecipe: boolean,
      trialPrefix: string,
      sampleData: any,
    ): Chainable<Element>;

    /**
    * Custom command checking the initial state of a popup dialog in Bifrost
    *
    * @param currentItemName is the name of the current item (Standard, Substrate,...)
    */
    verifyNewItemForm(currentItemName: string): Chainable<Element>;

    /**
    * Custom command checking the initial state of popup dialog in Bifrost
    * with the option "Import from DMS"
    *
    * @param currentItemName is the name of the current item (Standard, Substrate,...)
    */
    verifyNewDMSItemInitialState(currentItemName: string): Chainable<Element>;

    /**
    * Custom command checking the initial state of the File popup dialog in Bifrost
    * with the option "Import from File"
    *
    * @param currentItemName is the name of the current item (Standard, Substrate,...)
    */
    verifyNewFileItemInitialState(currentItemName: string): Chainable<Element>;

    /**
    * Custom command that verifies the additional fields in the popup dialog
    * regarding the Substrates
    */
    verifySubstrateOptions(): Chainable<Element>;

    /**
    * Custom command for creating a new item, by popuating the name and the ACl group
    * in the popup dialog in Bifrost
    *
    * @param nameOfItem is the name of the item we want to create
    * @param selector is the name of the current item (Standard, Substrate,...)
    * for which we are creating a new entry
    *   Example: cy.get(`[data-testid="new-${selector}-name"]`)
    *            where selector could be standard, substrate, ...
    */
    createNewItem(
      nameOfItem: string,
      selector: string,
    ): Chainable<Element>;

    /**
    * Custom command uploading a file in a popup dialog using the "Import from File" option
    *
    * @param fileName is the name of the file we want to upload
    * @param newItemName is the name of the current item (Standard, Substrate,...)
    */
    uploadFileForImportInDialogAndValidate(
      fileName: string,
      newItemName: string,
    ): Chainable<Element>;

    /**
    * Custom command for opening a popup dialog for an item (Standard, Substrate,...)
    *
    * @param name is the name of the item (Standard, Substrate,...)
    * @param option is the name of the option that we want to open (New, Edit, Delete,...)
    */
    openDialogFor(
      name: string,
      option: string,
    ): Chainable<Element>;

    /**
    * Custom command validating a previously created item using the "Edit" popup dialog
    *
    * @param selector is the name of the item (standard, substrate,...)
    * @param data is an object containing data for validation.
    *     The structure of the data object:
    *     {
    *        acl: nameOfAclGroup,
    *        type: selectedSubstrateTypeOption,
    *        quality: selectedSubstrateQualityOption,
    *        roughness: numberValueOfSubstrateRoughness,
    *      }
    */
    verifyCreatedData(
      selector: string,
      data: any,
    ): Chainable<Element>;

    /**
    * Custom command for checking an input field if it contains the correct value
    * and replaces it if it doesn't
    *
    * @param selector for the input field. Example: [data-testid="selector"]
    * @param name is the name of the field. Example: Thickness
    * @param expectedValue is the expected value
    */
    changeToDefaultInputValue(
      selector: string,
      name: string,
      expectedValue: number,
    ): Chainable<Element>;

    /**
    * Custom command populating a dialog, creating and validating the created item
    *
    * @param dialogItemName is the name of the current dialog item (Standard, Substrate,...)
    * @param importOptionSelector is the option from where we want to Import data from
    *   ('measurement-bridge', 'dms', 'file')
    * @param newItemName is the name we want to give the new item
    * @param data is an object containing the data we want to populate
    *    The structure of the data object:
    *     {
    *        numberOfIterations: number (The total number of file iterations)
    *        fileName: string (Name of the file we want to upload)
    *        acl: string (Name of ACL Group),
    *        type: string (Selected Substrate Type option),
    *        quality: string (Selected Substrate Quality option),
    *        roughness: number (For the Substrate Roughness),
    *      }
    */
    populateDialogAndValidate(
      dialogItemName: string,
      importOptionSelector: string,
      newItemName: string,
      data: any,
    ): Chainable<Element>;
  }
}
