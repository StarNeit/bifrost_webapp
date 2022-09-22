import { IlluminationGeometryType } from '@xrite/cloud-formulation-domain-model';
import { IlluminationLightType } from '@xrite/cloud-formulation-domain-model';
import { UVFilter } from '@xrite/cloud-formulation-domain-model';
import { PolarizationFilterType } from '@xrite/cloud-formulation-domain-model';
import { TransformType } from '@xrite/cloud-formulation-domain-model';
import { ColorSpaceType } from '@xrite/cloud-formulation-domain-model';
import { IlluminantType } from '@xrite/cloud-formulation-domain-model';
import { BackingType } from '@xrite/cloud-formulation-domain-model';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `AWSDateTime` scalar type provided by AWS AppSync, represents a valid ***extended*** [ISO 8601 DateTime](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations) string. In other words, this scalar type accepts datetime strings of the form `YYYY-MM-DDThh:mm:ss.SSSZ`.  The scalar can also accept "negative years" of the form `-YYYY` which correspond to years before `0000`. For example, "**-2017-01-01T00:00Z**" and "**-9999-01-01T00:00Z**" are both valid datetime strings.  The field after the two digit seconds field is a nanoseconds field. It can accept between 1 and 9 digits. So, for example, "**1970-01-01T12:00:00.2Z**", "**1970-01-01T12:00:00.277Z**" and "**1970-01-01T12:00:00.123456789Z**" are all valid datetime strings.  The seconds and nanoseconds fields are optional (the seconds field must be specified if the nanoseconds field is to be used).  The [time zone offset](https://en.wikipedia.org/wiki/ISO_8601#Time_zone_designators) is compulsory for this scalar. The time zone offset must either be `Z` (representing the UTC time zone) or be in the format `±hh:mm:ss`. The seconds field in the timezone offset will be considered valid even though it is not part of the ISO 8601 standard. */
  AWSDateTime: any;
  /** The `AWSJSON` scalar type provided by AWS AppSync, represents a JSON string that complies with [RFC 8259](https://tools.ietf.org/html/rfc8259).  Maps like "**{\\"upvotes\\": 10}**", lists like "**[1,2,3]**", and scalar values like "**\\"AWSJSON example string\\"**", "**1**", and "**true**" are accepted as valid JSON and will automatically be parsed and loaded in the resolver mapping templates as Maps, Lists, or Scalar values rather than as the literal input strings.  Invalid JSON strings like "**{a: 1}**", "**{'a': 1}**" and "**Unquoted string**" will throw GraphQL validation errors. */
  AWSJSON: any;
};












export type AccessControlList = {
  __typename?: 'AccessControlList';
  id: Scalars['ID'];
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  entries?: Maybe<Array<Maybe<AccessControlListEntry>>>;
};

export type AccessControlListEntry = {
  __typename?: 'AccessControlListEntry';
  userId?: Maybe<Scalars['ID']>;
  userGroupId?: Maybe<Scalars['ID']>;
  accessFlags?: Maybe<AccessFlags>;
};

export type AccessControlListEntryIn = {
  userId?: Maybe<Scalars['ID']>;
  userGroupId?: Maybe<Scalars['ID']>;
  accessFlags?: Maybe<AccessFlagsIn>;
};

export type AccessControlListIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  entries?: Maybe<Array<Maybe<AccessControlListEntryIn>>>;
};

export type AccessFlags = {
  __typename?: 'AccessFlags';
  flags?: Maybe<Scalars['String']>;
};

export type AccessFlagsIn = {
  flags?: Maybe<Scalars['String']>;
};

export type AppearanceSample = {
  __typename?: 'AppearanceSample';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  parentAppearanceSampleId?: Maybe<Scalars['ID']>;
  formula?: Maybe<Formula>;
  standardId?: Maybe<Scalars['ID']>;
  measurements?: Maybe<Array<Maybe<Measurement>>>;
  substrateId?: Maybe<Scalars['ID']>;
};

export type AppearanceSampleIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  parentAppearanceSampleId?: Maybe<Scalars['ID']>;
  formula?: Maybe<FormulaIn>;
  standardId?: Maybe<Scalars['ID']>;
  measurements?: Maybe<Array<Maybe<MeasurementIn>>>;
  substrateId?: Maybe<Scalars['ID']>;
};

export type Assortment = {
  __typename?: 'Assortment';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  industry?: Maybe<Industry>;
  subIndustry?: Maybe<SubIndustry>;
  name?: Maybe<Scalars['String']>;
  colorants?: Maybe<Array<Maybe<Colorant>>>;
  solvent?: Maybe<Solvent>;
  calibrationConditions?: Maybe<Array<Maybe<CalibrationCondition>>>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameter>>>;
  printApplications?: Maybe<Array<Maybe<PrintApplication>>>;
  defaultSubstrate?: Maybe<Substrate>;
  weightPerArea?: Maybe<Quantity>;
};

export type AssortmentIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  industry: Industry;
  subIndustry?: Maybe<SubIndustry>;
  name: Scalars['String'];
  colorants?: Maybe<Array<Maybe<ColorantIn>>>;
  solvent?: Maybe<SolventIn>;
  calibrationConditions?: Maybe<Array<Maybe<CalibrationConditionIn>>>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameterIn>>>;
  printApplications?: Maybe<Array<Maybe<PrintApplicationIn>>>;
  /**
   *  The assortment substrate can be passed either as a full substrate object or
   * (if already present in the database) just by id
   */
  defaultSubstrateId?: Maybe<Scalars['ID']>;
  defaultSubstrate?: Maybe<SubstrateIn>;
  weightPerArea?: Maybe<QuantityIn>;
};

export type AssortmentReference = {
  __typename?: 'AssortmentReference';
  id?: Maybe<Scalars['ID']>;
};

export type AssortmentReferenceIn = {
  id: Scalars['ID'];
};

export { BackingType };

export type BasicMaterial = {
  __typename?: 'BasicMaterial';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<BasicMaterialType>;
  price?: Maybe<Price>;
};

export type BasicMaterialIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  type: BasicMaterialType;
  price?: Maybe<PriceIn>;
};

export enum BasicMaterialType {
  Pigment = 'Pigment',
  Solvent = 'Solvent',
  Binder = 'Binder',
  Additive = 'Additive',
  TechnicalVarnish = 'TechnicalVarnish'
}

export type CalibrationCondition = {
  __typename?: 'CalibrationCondition';
  id?: Maybe<Scalars['ID']>;
  engineId?: Maybe<Scalars['String']>;
  measurementConditions?: Maybe<Array<Maybe<MeasurementCondition>>>;
};

export type CalibrationConditionIn = {
  id: Scalars['ID'];
  engineId: Scalars['String'];
  measurementConditions?: Maybe<Array<Maybe<MeasurementConditionIn>>>;
};

export type CalibrationData = Spectrum | NumberArray;

export type CalibrationParameter = {
  __typename?: 'CalibrationParameter';
  calibrationConditionId?: Maybe<Scalars['ID']>;
  type?: Maybe<Scalars['String']>;
  data?: Maybe<CalibrationData>;
};

export type CalibrationParameterIn = {
  calibrationConditionId?: Maybe<Scalars['ID']>;
  type: Scalars['String'];
  spectralData?: Maybe<SpectrumIn>;
  values?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ColorApplicationDevice = {
  __typename?: 'ColorApplicationDevice';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  industry?: Maybe<Industry>;
  subIndustry?: Maybe<SubIndustry>;
  weightPerArea?: Maybe<Quantity>;
};

export type ColorApplicationDeviceIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  industry: Industry;
  subIndustry?: Maybe<SubIndustry>;
  weightPerArea?: Maybe<QuantityIn>;
};

export type ColorApplicationDeviceReference = {
  __typename?: 'ColorApplicationDeviceReference';
  id?: Maybe<Scalars['ID']>;
};

export type ColorApplicationDeviceReferenceIn = {
  id: Scalars['ID'];
};

export type ColorApplicationDeviceThicknessCalibration = {
  __typename?: 'ColorApplicationDeviceThicknessCalibration';
  assortment?: Maybe<AssortmentReference>;
  device?: Maybe<ColorApplicationDeviceReference>;
  calibrationDateTime?: Maybe<Scalars['String']>;
  ratio?: Maybe<Scalars['Float']>;
};

export type ColorApplicationDeviceThicknessCalibrationIn = {
  assortment: AssortmentReferenceIn;
  device: ColorApplicationDeviceReferenceIn;
  calibrationDateTime: Scalars['String'];
  ratio: Scalars['Float'];
};

export type ColorApplicationDeviceThicknessRatio = {
  __typename?: 'ColorApplicationDeviceThicknessRatio';
  assortmentId: Scalars['ID'];
  deviceId: Scalars['ID'];
  deviceName?: Maybe<Scalars['String']>;
  ratio?: Maybe<Scalars['Float']>;
};

export type ColorFilterIn = {
  measurementSample: MeasurementSampleIn;
  lTolerance?: Maybe<Scalars['Float']>;
  aTolerance?: Maybe<Scalars['Float']>;
  bTolerance?: Maybe<Scalars['Float']>;
  cTolerance?: Maybe<Scalars['Float']>;
  hTolerance?: Maybe<Scalars['Float']>;
};

export { ColorSpaceType };

export type ColorSpecification = {
  __typename?: 'ColorSpecification';
  spectralSampling?: Maybe<SpectralSampling>;
  colorSpace?: Maybe<ColorSpaceType>;
  illuminant?: Maybe<IlluminantType>;
  observer?: Maybe<Scalars['String']>;
  rgbPrimaries?: Maybe<RgbPrimaries>;
};

export type ColorSpecificationIn = {
  spectralSampling?: Maybe<SpectralSamplingIn>;
  colorSpace?: Maybe<ColorSpaceType>;
  illuminant?: Maybe<IlluminantType>;
  observer?: Maybe<Scalars['String']>;
  /**   ObserverType */
  rgbPrimaries?: Maybe<RgbPrimariesIn>;
};

export type Colorant = {
  __typename?: 'Colorant';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  specificMass?: Maybe<Scalars['Float']>;
  type?: Maybe<ColorantType>;
  price?: Maybe<Price>;
  minConcentrationPercentage?: Maybe<Scalars['Float']>;
  maxConcentrationPercentage?: Maybe<Scalars['Float']>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameter>>>;
  components?: Maybe<Array<Maybe<ColorantComponent>>>;
  isLeftover?: Maybe<Scalars['Boolean']>;
};

export type ColorantComponent = {
  __typename?: 'ColorantComponent';
  basicMaterial?: Maybe<BasicMaterial>;
  concentrationPercentage?: Maybe<Scalars['Float']>;
};

export type ColorantComponentIn = {
  basicMaterial: BasicMaterialIn;
  concentrationPercentage: Scalars['Float'];
};

export type ColorantIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  specificMass: Scalars['Float'];
  type: ColorantType;
  price?: Maybe<PriceIn>;
  minConcentrationPercentage?: Maybe<Scalars['Float']>;
  maxConcentrationPercentage?: Maybe<Scalars['Float']>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameterIn>>>;
  components?: Maybe<Array<Maybe<ColorantComponentIn>>>;
  isLeftover?: Maybe<Scalars['Boolean']>;
};

export type ColorantReference = {
  id: Scalars['ID'];
};

export enum ColorantType {
  Clear = 'Clear',
  Colorant = 'Colorant',
  White = 'White',
  Black = 'Black',
  AdditionalClear = 'AdditionalClear',
  Disorienter = 'Disorienter',
  Metallic = 'Metallic',
  Pearl = 'Pearl',
  SpecialEffect = 'SpecialEffect',
  TechnicalVarnish = 'TechnicalVarnish'
}

export type DataCube = {
  __typename?: 'DataCube';
  extentPixels?: Maybe<ExtentPixels>;
  extentMM?: Maybe<Extent>;
  data?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DataCubeIn = {
  extentPixels?: Maybe<ExtentPixelsIn>;
  extentMM?: Maybe<ExtentIn>;
  data: Array<Maybe<Scalars['Float']>>;
};

export enum DetectorGeometryType {
  Diffuse = 'Diffuse',
  Directional = 'Directional'
}

export type Extent = {
  __typename?: 'Extent';
  width?: Maybe<Scalars['Float']>;
  height?: Maybe<Scalars['Float']>;
};

export type ExtentIn = {
  width: Scalars['Float'];
  height: Scalars['Float'];
};

export type ExtentPixels = {
  __typename?: 'ExtentPixels';
  width?: Maybe<Scalars['Int']>;
  height?: Maybe<Scalars['Int']>;
};

export type ExtentPixelsIn = {
  width: Scalars['Int'];
  height: Scalars['Int'];
};

export type Formula = {
  __typename?: 'Formula';
  id?: Maybe<Scalars['ID']>;
  assortmentId?: Maybe<Scalars['ID']>;
  predictionMeasurements?: Maybe<Array<Maybe<Measurement>>>;
  formulaLayers?: Maybe<Array<Maybe<FormulaLayer>>>;
  formulationSettings?: Maybe<Scalars['AWSJSON']>;
};

export type FormulaComponent = {
  __typename?: 'FormulaComponent';
  colorant?: Maybe<Colorant>;
  massAmount?: Maybe<Scalars['Float']>;
};

export type FormulaComponentIn = {
  colorant: ColorantReference;
  massAmount?: Maybe<Scalars['Float']>;
};

export type FormulaIn = {
  id: Scalars['ID'];
  assortmentId: Scalars['ID'];
  predictionMeasurements?: Maybe<Array<Maybe<MeasurementIn>>>;
  formulaLayers: Array<Maybe<FormulaLayerIn>>;
  formulationSettings?: Maybe<Scalars['AWSJSON']>;
};

export type FormulaLayer = {
  __typename?: 'FormulaLayer';
  relativeThickness?: Maybe<Scalars['Float']>;
  formulaComponents?: Maybe<Array<Maybe<FormulaComponent>>>;
  printApplication?: Maybe<PrintApplication>;
  viscosity?: Maybe<Scalars['Float']>;
  quantity?: Maybe<Quantity>;
};

export type FormulaLayerIn = {
  relativeThickness: Scalars['Float'];
  formulaComponents: Array<Maybe<FormulaComponentIn>>;
  printApplication?: Maybe<PrintApplicationIn>;
  viscosity?: Maybe<Scalars['Float']>;
  quantity?: Maybe<QuantityIn>;
};

export type Geometry = {
  __typename?: 'Geometry';
  description?: Maybe<Scalars['String']>;
  measurementType?: Maybe<MeasurementType>;
  illuminationGeometryType?: Maybe<IlluminationGeometryType>;
  detectorGeometryType?: Maybe<DetectorGeometryType>;
  illuminationParameter?: Maybe<Array<Maybe<Scalars['Float']>>>;
  detectorParameter?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type GeometryIn = {
  description?: Maybe<Scalars['String']>;
  measurementType: MeasurementType;
  illuminationGeometryType: IlluminationGeometryType;
  detectorGeometryType: DetectorGeometryType;
  illuminationParameter: Array<Maybe<Scalars['Float']>>;
  detectorParameter: Array<Maybe<Scalars['Float']>>;
};

export { IlluminantType };

export type Illumination = {
  __typename?: 'Illumination';
  illuminationLight?: Maybe<IlluminationLightType>;
  uvFilter?: Maybe<UVFilter>;
  polarizationFilter?: Maybe<PolarizationFilterType>;
};

export { IlluminationGeometryType };

export type IlluminationIn = {
  illuminationLight?: Maybe<IlluminationLightType>;
  uvFilter?: Maybe<UVFilter>;
  polarizationFilter?: Maybe<PolarizationFilterType>;
};

export { IlluminationLightType };

export enum Industry {
  Effect = 'Effect',
  Ink = 'Ink',
  Paint = 'Paint',
  Plastics = 'Plastics',
  Textile = 'Textile'
}

export type Instrument = {
  __typename?: 'Instrument';
  manufacturer?: Maybe<Scalars['String']>;
  model?: Maybe<Scalars['String']>;
  serialNumber?: Maybe<Scalars['String']>;
  firmwareVersion?: Maybe<Scalars['String']>;
};

export type InstrumentIn = {
  manufacturer: Scalars['String'];
  model: Scalars['String'];
  serialNumber: Scalars['String'];
  firmwareVersion?: Maybe<Scalars['String']>;
};

export type Measurement = {
  __typename?: 'Measurement';
  id: Scalars['ID'];
  dmsMeasurementId?: Maybe<Scalars['String']>;
  instrument?: Maybe<Instrument>;
  creationDateTime?: Maybe<Scalars['String']>;
  measurementSamples?: Maybe<Array<Maybe<MeasurementSample>>>;
  backing?: Maybe<BackingType>;
  surfaceType?: Maybe<SurfaceType>;
};

export type MeasurementCondition = {
  __typename?: 'MeasurementCondition';
  geometry?: Maybe<Geometry>;
  illumination?: Maybe<Illumination>;
  transformation?: Maybe<Transformation>;
  description?: Maybe<Scalars['String']>;
};

export type MeasurementConditionIn = {
  geometry: GeometryIn;
  illumination: IlluminationIn;
  transformation?: Maybe<TransformationIn>;
  description?: Maybe<Scalars['String']>;
};

export type MeasurementIn = {
  id: Scalars['ID'];
  dmsMeasurementId?: Maybe<Scalars['String']>;
  instrument?: Maybe<InstrumentIn>;
  creationDateTime: Scalars['String'];
  measurementSamples: Array<Maybe<MeasurementSampleIn>>;
  backing?: Maybe<BackingType>;
  surfaceType?: Maybe<SurfaceType>;
};

export type MeasurementSample = {
  __typename?: 'MeasurementSample';
  measurementCondition?: Maybe<MeasurementCondition>;
  colorSpecification?: Maybe<ColorSpecification>;
  data?: Maybe<DataCube>;
  measurementSpot?: Maybe<MeasurementSpot>;
};

export type MeasurementSampleIn = {
  measurementCondition: MeasurementConditionIn;
  colorSpecification: ColorSpecificationIn;
  data: DataCubeIn;
  measurementSpot?: Maybe<MeasurementSpotIn>;
};

export type MeasurementSpot = {
  __typename?: 'MeasurementSpot';
  backing?: Maybe<BackingType>;
  apertureDiameterMM?: Maybe<Scalars['Float']>;
  illuminationDiameter?: Maybe<Scalars['Float']>;
  areaOfInterestPixels?: Maybe<ExtentPixels>;
  areaOfInterestMM?: Maybe<Extent>;
  areaOfInterestMask?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type MeasurementSpotIn = {
  backing: BackingType;
  apertureDiameterMM?: Maybe<Scalars['Float']>;
  illuminationDiameter?: Maybe<Scalars['Float']>;
  areaOfInterestPixels?: Maybe<ExtentPixelsIn>;
  areaOfInterestMM?: Maybe<ExtentIn>;
  areaOfInterestMask?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export enum MeasurementType {
  Reflectance = 'Reflectance',
  DirectTransmission = 'DirectTransmission',
  TotalTransmission = 'TotalTransmission',
  Preview = 'Preview',
  Gloss = 'Gloss',
  Normal = 'Normal'
}

export type Metric = {
  __typename?: 'Metric';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  formattedName?: Maybe<Scalars['String']>;
  defaultParameters?: Maybe<Scalars['AWSJSON']>;
};

export type MetricIn = {
  id: Scalars['ID'];
};

/**   ========================================================= */
export type Mutation = {
  __typename?: 'Mutation';
  addACL?: Maybe<AccessControlList>;
  addACLEntry?: Maybe<AccessControlListEntry>;
  addAppearanceSample?: Maybe<AppearanceSample>;
  addAssortment?: Maybe<Assortment>;
  addBasicMaterial?: Maybe<BasicMaterial>;
  addColorApplicationDevice?: Maybe<ColorApplicationDevice>;
  addColorApplicationDeviceThicknessCalibration?: Maybe<ColorApplicationDeviceThicknessCalibration>;
  addColorant?: Maybe<Colorant>;
  addPrintApplication?: Maybe<PrintApplication>;
  addStandard?: Maybe<Standard>;
  addSubstrate?: Maybe<Substrate>;
  addTag?: Maybe<Tag>;
  addUser?: Maybe<User>;
  addUserGroup?: Maybe<UserGroup>;
  assignUserToUserGroup?: Maybe<Scalars['Int']>;
  deleteACL?: Maybe<Scalars['Int']>;
  deleteACLEntry?: Maybe<Scalars['Int']>;
  deleteAppearanceSample?: Maybe<Scalars['Int']>;
  deleteAssortment?: Maybe<Scalars['Int']>;
  deleteBasicMaterial?: Maybe<Scalars['Int']>;
  deleteColorApplicationDevice?: Maybe<Scalars['Int']>;
  deleteColorant?: Maybe<Scalars['Int']>;
  deletePrintApplication?: Maybe<Scalars['Int']>;
  deleteStandard?: Maybe<Scalars['Int']>;
  deleteSubstrate?: Maybe<Scalars['Int']>;
  deleteTag?: Maybe<Scalars['Int']>;
  deleteUser?: Maybe<Scalars['Int']>;
  deleteUserGroup?: Maybe<Scalars['Int']>;
  modifyACL?: Maybe<AccessControlList>;
  modifyAppearanceSample?: Maybe<AppearanceSample>;
  modifyAssortment?: Maybe<Assortment>;
  modifyBasicMaterial?: Maybe<BasicMaterial>;
  modifyColorApplicationDevice?: Maybe<ColorApplicationDevice>;
  modifyColorant?: Maybe<Colorant>;
  modifyPrintApplication?: Maybe<PrintApplication>;
  modifyStandard?: Maybe<Standard>;
  modifySubstrate?: Maybe<Substrate>;
  modifyTag?: Maybe<Tag>;
  modifyUser?: Maybe<User>;
  modifyUserGroup?: Maybe<UserGroup>;
  unassignUserFromUserGroup?: Maybe<Scalars['Int']>;
};


/**   ========================================================= */
export type MutationAddAclArgs = {
  accessControlList?: Maybe<AccessControlListIn>;
};


/**   ========================================================= */
export type MutationAddAclEntryArgs = {
  accessControlListEntry?: Maybe<AccessControlListEntryIn>;
  parentId?: Maybe<Scalars['ID']>;
};


/**   ========================================================= */
export type MutationAddAppearanceSampleArgs = {
  appearanceSample?: Maybe<AppearanceSampleIn>;
};


/**   ========================================================= */
export type MutationAddAssortmentArgs = {
  assortment?: Maybe<AssortmentIn>;
};


/**   ========================================================= */
export type MutationAddBasicMaterialArgs = {
  basicMaterial?: Maybe<BasicMaterialIn>;
};


/**   ========================================================= */
export type MutationAddColorApplicationDeviceArgs = {
  colorApplicationDevice?: Maybe<ColorApplicationDeviceIn>;
};


/**   ========================================================= */
export type MutationAddColorApplicationDeviceThicknessCalibrationArgs = {
  colorApplicationDeviceThicknessCalibration?: Maybe<ColorApplicationDeviceThicknessCalibrationIn>;
};


/**   ========================================================= */
export type MutationAddColorantArgs = {
  colorant?: Maybe<ColorantIn>;
  parentId?: Maybe<Scalars['ID']>;
};


/**   ========================================================= */
export type MutationAddPrintApplicationArgs = {
  printApplication?: Maybe<PrintApplicationIn>;
  parentId?: Maybe<Scalars['ID']>;
  parentType?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type MutationAddStandardArgs = {
  standard?: Maybe<StandardIn>;
};


/**   ========================================================= */
export type MutationAddSubstrateArgs = {
  substrate?: Maybe<SubstrateIn>;
};


/**   ========================================================= */
export type MutationAddTagArgs = {
  tag?: Maybe<TagIn>;
  parentId?: Maybe<Scalars['ID']>;
  parentType?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type MutationAddUserArgs = {
  user?: Maybe<UserIn>;
};


/**   ========================================================= */
export type MutationAddUserGroupArgs = {
  userGroup?: Maybe<UserGroupIn>;
};


/**   ========================================================= */
export type MutationAssignUserToUserGroupArgs = {
  childIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  parentId?: Maybe<Scalars['ID']>;
};


/**   ========================================================= */
export type MutationDeleteAclArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteAclEntryArgs = {
  parentId: Scalars['ID'];
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteAppearanceSampleArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteAssortmentArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteBasicMaterialArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteColorApplicationDeviceArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteColorantArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeletePrintApplicationArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteStandardArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteSubstrateArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteTagArgs = {
  parentId?: Maybe<Scalars['ID']>;
  values?: Maybe<Array<Maybe<Scalars['String']>>>;
};


/**   ========================================================= */
export type MutationDeleteUserArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationDeleteUserGroupArgs = {
  ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


/**   ========================================================= */
export type MutationModifyAclArgs = {
  accessControlList?: Maybe<AccessControlListIn>;
};


/**   ========================================================= */
export type MutationModifyAppearanceSampleArgs = {
  appearanceSample?: Maybe<AppearanceSampleIn>;
};


/**   ========================================================= */
export type MutationModifyAssortmentArgs = {
  assortment?: Maybe<AssortmentIn>;
};


/**   ========================================================= */
export type MutationModifyBasicMaterialArgs = {
  basicMaterial?: Maybe<BasicMaterialIn>;
};


/**   ========================================================= */
export type MutationModifyColorApplicationDeviceArgs = {
  colorApplicationDevice?: Maybe<ColorApplicationDeviceIn>;
};


/**   ========================================================= */
export type MutationModifyColorantArgs = {
  colorant?: Maybe<ColorantIn>;
};


/**   ========================================================= */
export type MutationModifyPrintApplicationArgs = {
  printApplication?: Maybe<PrintApplicationIn>;
};


/**   ========================================================= */
export type MutationModifyStandardArgs = {
  standard?: Maybe<StandardIn>;
};


/**   ========================================================= */
export type MutationModifySubstrateArgs = {
  substrate?: Maybe<SubstrateIn>;
};


/**   ========================================================= */
export type MutationModifyTagArgs = {
  tag?: Maybe<TagIn>;
};


/**   ========================================================= */
export type MutationModifyUserArgs = {
  user?: Maybe<UserIn>;
};


/**   ========================================================= */
export type MutationModifyUserGroupArgs = {
  userGroup?: Maybe<UserGroupIn>;
};


/**   ========================================================= */
export type MutationUnassignUserFromUserGroupArgs = {
  childIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  parentId?: Maybe<Scalars['ID']>;
};

export type NumberArray = {
  __typename?: 'NumberArray';
  values?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ObjectFilterIn = {
  name?: Maybe<Scalars['String']>;
  fromDate?: Maybe<Scalars['AWSDateTime']>;
  toDate?: Maybe<Scalars['AWSDateTime']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/**
 *  enum ObserverType {
 * ##	2,
 * ##	10
 * ##}
 */
export type PantoneLive = {
  __typename?: 'PantoneLIVE';
  libraryId?: Maybe<Scalars['ID']>;
  sampleId?: Maybe<Scalars['ID']>;
  illuminant?: Maybe<IlluminantType>;
  observer?: Maybe<Scalars['String']>;
};

export type PantoneLiveIn = {
  libraryId: Scalars['ID'];
  sampleId: Scalars['ID'];
  illuminant?: Maybe<IlluminantType>;
  observer?: Maybe<Scalars['String']>;
};

export { PolarizationFilterType };

export type Price = {
  __typename?: 'Price';
  amount?: Maybe<Scalars['Float']>;
  currencyCode?: Maybe<Scalars['String']>;
};

export type PriceIn = {
  amount: Scalars['Float'];
  currencyCode: Scalars['String'];
};

export type PrintApplication = {
  __typename?: 'PrintApplication';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  components?: Maybe<Array<Maybe<ColorantComponent>>>;
};

export type PrintApplicationIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  components?: Maybe<Array<Maybe<ColorantComponentIn>>>;
};

export type Quantity = {
  __typename?: 'Quantity';
  amount?: Maybe<Scalars['Float']>;
  unit?: Maybe<Scalars['String']>;
};

export type QuantityIn = {
  amount: Scalars['Float'];
  unit: Scalars['String'];
};

/**   ========================================================= */
export type Query = {
  __typename?: 'Query';
  getACL?: Maybe<Array<Maybe<AccessControlList>>>;
  getAppearanceSample?: Maybe<Array<Maybe<AppearanceSample>>>;
  getAppearanceSamplesByStandard?: Maybe<Array<Maybe<AppearanceSample>>>;
  getAssortment?: Maybe<Array<Maybe<Assortment>>>;
  getBasicMaterial?: Maybe<Array<Maybe<BasicMaterial>>>;
  getColorApplicationDevice?: Maybe<Array<Maybe<ColorApplicationDevice>>>;
  getColorApplicationDeviceThicknessCalibrationsByAssortment?: Maybe<Array<Maybe<ColorApplicationDeviceThicknessCalibration>>>;
  getColorApplicationDeviceThicknessCalibrationsByDevice?: Maybe<Array<Maybe<ColorApplicationDeviceThicknessCalibration>>>;
  getColorApplicationDeviceThicknessRatiosByAssortment?: Maybe<Array<Maybe<ColorApplicationDeviceThicknessRatio>>>;
  getMetric?: Maybe<Array<Maybe<Metric>>>;
  getStandard?: Maybe<Array<Maybe<Standard>>>;
  getSubstrate?: Maybe<Array<Maybe<Substrate>>>;
  getUser?: Maybe<Array<Maybe<User>>>;
  getUserGroup?: Maybe<Array<Maybe<UserGroup>>>;
  listACLs?: Maybe<Array<Maybe<AccessControlList>>>;
  listAssortments?: Maybe<Array<Maybe<Assortment>>>;
  listColorApplicationDeviceThicknessCalibrations?: Maybe<Array<Maybe<ColorApplicationDeviceThicknessCalibration>>>;
  listMetrics?: Maybe<Array<Maybe<Metric>>>;
  listStandards?: Maybe<Array<Maybe<Standard>>>;
  listSubstrates?: Maybe<Array<Maybe<Substrate>>>;
  listTags?: Maybe<Array<Maybe<Tag>>>;
  listUserGroups?: Maybe<Array<Maybe<UserGroup>>>;
  listUsers?: Maybe<Array<Maybe<User>>>;
};


/**   ========================================================= */
export type QueryGetAclArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetAppearanceSampleArgs = {
  id?: Maybe<Scalars['String']>;
  colorFilter?: Maybe<ColorFilterIn>;
};


/**   ========================================================= */
export type QueryGetAppearanceSamplesByStandardArgs = {
  parentId?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetAssortmentArgs = {
  id?: Maybe<Scalars['String']>;
  objectFilter?: Maybe<ObjectFilterIn>;
};


/**   ========================================================= */
export type QueryGetBasicMaterialArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetColorApplicationDeviceArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetColorApplicationDeviceThicknessCalibrationsByAssortmentArgs = {
  parentId: Scalars['ID'];
};


/**   ========================================================= */
export type QueryGetColorApplicationDeviceThicknessCalibrationsByDeviceArgs = {
  parentId: Scalars['ID'];
};


/**   ========================================================= */
export type QueryGetColorApplicationDeviceThicknessRatiosByAssortmentArgs = {
  parentId: Scalars['ID'];
};


/**   ========================================================= */
export type QueryGetMetricArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetStandardArgs = {
  id?: Maybe<Scalars['String']>;
  objectFilter?: Maybe<ObjectFilterIn>;
  colorFilter?: Maybe<ColorFilterIn>;
};


/**   ========================================================= */
export type QueryGetSubstrateArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetUserArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryGetUserGroupArgs = {
  id?: Maybe<Scalars['String']>;
};


/**   ========================================================= */
export type QueryListAssortmentsArgs = {
  objectFilter?: Maybe<ObjectFilterIn>;
};


/**   ========================================================= */
export type QueryListStandardsArgs = {
  objectFilter?: Maybe<ObjectFilterIn>;
};

export type RgbPrimaries = {
  __typename?: 'RGBPrimaries';
  xr?: Maybe<Scalars['Float']>;
  yr?: Maybe<Scalars['Float']>;
  xg?: Maybe<Scalars['Float']>;
  yg?: Maybe<Scalars['Float']>;
  xb?: Maybe<Scalars['Float']>;
  yb?: Maybe<Scalars['Float']>;
};

export type RgbPrimariesIn = {
  xr: Scalars['Float'];
  yr: Scalars['Float'];
  xg: Scalars['Float'];
  yg: Scalars['Float'];
  xb: Scalars['Float'];
  yb: Scalars['Float'];
};

export type Solvent = {
  __typename?: 'Solvent';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  viscosity?: Maybe<Scalars['Float']>;
  components?: Maybe<Array<Maybe<ColorantComponent>>>;
  price?: Maybe<Price>;
  specificMass?: Maybe<Scalars['Float']>;
};

export type SolventIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  viscosity: Scalars['Float'];
  components?: Maybe<Array<Maybe<ColorantComponentIn>>>;
  price?: Maybe<PriceIn>;
  specificMass: Scalars['Float'];
};

export type SpectralSampling = {
  __typename?: 'SpectralSampling';
  startWavelength?: Maybe<Scalars['Float']>;
  endWavelength?: Maybe<Scalars['Float']>;
  wavelengthInterval?: Maybe<Scalars['Float']>;
};

export type SpectralSamplingIn = {
  startWavelength: Scalars['Float'];
  endWavelength: Scalars['Float'];
  wavelengthInterval: Scalars['Float'];
};

export type Spectrum = {
  __typename?: 'Spectrum';
  id?: Maybe<Scalars['ID']>;
  spectralSampling?: Maybe<SpectralSampling>;
  values?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type SpectrumIn = {
  id: Scalars['ID'];
  spectralSampling: SpectralSamplingIn;
  values: Array<Maybe<Scalars['Float']>>;
};

export type Standard = {
  __typename?: 'Standard';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  measurements?: Maybe<Array<Maybe<Measurement>>>;
  tolerances?: Maybe<Array<Maybe<Tolerance>>>;
  derivedStandards?: Maybe<Array<Maybe<Standard>>>;
  pantoneLIVE?: Maybe<PantoneLive>;
};

export type StandardIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  measurements: Array<Maybe<MeasurementIn>>;
  tolerances?: Maybe<Array<Maybe<ToleranceIn>>>;
  parentStandard?: Maybe<Scalars['ID']>;
  pantoneLIVE?: Maybe<PantoneLiveIn>;
};

export enum SubIndustry {
  Offset = 'Offset',
  Flexo = 'Flexo',
  Screen = 'Screen'
}

export type Substrate = {
  __typename?: 'Substrate';
  id?: Maybe<Scalars['ID']>;
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  measurements?: Maybe<Array<Maybe<Measurement>>>;
  calibrationConditions?: Maybe<Array<Maybe<CalibrationCondition>>>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameter>>>;
};

export type SubstrateIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  measurements?: Maybe<Array<Maybe<MeasurementIn>>>;
  calibrationConditions?: Maybe<Array<Maybe<CalibrationConditionIn>>>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameterIn>>>;
};

export enum SurfaceType {
  Undefined = 'Undefined',
  Coated = 'Coated',
  Uncoated = 'Uncoated',
  Metallic = 'Metallic'
}

export type Tag = {
  __typename?: 'Tag';
  value?: Maybe<Scalars['String']>;
};

export type TagIn = {
  value?: Maybe<Scalars['String']>;
};

export type Tolerance = {
  __typename?: 'Tolerance';
  id?: Maybe<Scalars['ID']>;
  metric?: Maybe<Metric>;
  measurementCondition?: Maybe<MeasurementCondition>;
  parameters?: Maybe<Scalars['AWSJSON']>;
  lowerLimit?: Maybe<Scalars['Float']>;
  upperLimit?: Maybe<Scalars['Float']>;
};

export type ToleranceIn = {
  id: Scalars['ID'];
  metric: MetricIn;
  measurementCondition?: Maybe<MeasurementConditionIn>;
  parameters?: Maybe<Scalars['AWSJSON']>;
  lowerLimit?: Maybe<Scalars['Float']>;
  upperLimit?: Maybe<Scalars['Float']>;
};

export { TransformType };

export type Transformation = {
  __typename?: 'Transformation';
  transformType?: Maybe<TransformType>;
  netProfilerSignature?: Maybe<Scalars['String']>;
};

export type TransformationIn = {
  transformType?: Maybe<TransformType>;
  netProfilerSignature?: Maybe<Scalars['String']>;
};

export { UVFilter };

/**   -- Access control --------------------------------------- */
export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  fmsUserId?: Maybe<Scalars['String']>;
  xriteUserId?: Maybe<Scalars['String']>;
  defaultACLId?: Maybe<Scalars['ID']>;
  userRights?: Maybe<Array<Maybe<UserRight>>>;
};

export type UserGroup = {
  __typename?: 'UserGroup';
  id: Scalars['ID'];
  creationDateTime?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['ID']>;
  creatorName?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UserGroupIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UserIn = {
  id: Scalars['ID'];
  creationDateTime: Scalars['String'];
  creatorId?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  aclId?: Maybe<Scalars['ID']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  fmsUserId?: Maybe<Scalars['String']>;
  xriteUserId?: Maybe<Scalars['String']>;
  defaultACLId?: Maybe<Scalars['ID']>;
  userRights?: Maybe<Array<Maybe<UserRightIn>>>;
};

export type UserRight = {
  __typename?: 'UserRight';
  userRightType?: Maybe<UserRightType>;
  grantedAt?: Maybe<Scalars['String']>;
  grantedBy?: Maybe<Scalars['ID']>;
};

export type UserRightIn = {
  userRightType: UserRightType;
  grantedAt?: Maybe<Scalars['String']>;
  grantedBy?: Maybe<Scalars['ID']>;
};

export enum UserRightType {
  InsertStandard = 'InsertStandard',
  InsertSubstrate = 'InsertSubstrate',
  InsertAppearanceSample = 'InsertAppearanceSample',
  InsertAssortment = 'InsertAssortment',
  InsertBasicMaterial = 'InsertBasicMaterial',
  InsertUser = 'InsertUser',
  InsertUserGroup = 'InsertUserGroup',
  InsertAcl = 'InsertACL'
}

export type FullPriceFragment = (
  { __typename?: 'Price' }
  & Pick<Price, 'amount' | 'currencyCode'>
);

export type FullBasicMaterialFragment = (
  { __typename?: 'BasicMaterial' }
  & Pick<BasicMaterial, 'id' | 'name' | 'creationDateTime' | 'type' | 'creatorId' | 'creatorName' | 'aclId'>
  & { price?: Maybe<(
    { __typename?: 'Price' }
    & FullPriceFragment
  )> }
);

export type FullSpectralSamplingFragment = (
  { __typename?: 'SpectralSampling' }
  & Pick<SpectralSampling, 'startWavelength' | 'endWavelength' | 'wavelengthInterval'>
);

export type FullMeasurementConditionFragment = (
  { __typename?: 'MeasurementCondition' }
  & { geometry?: Maybe<(
    { __typename?: 'Geometry' }
    & Pick<Geometry, 'description' | 'measurementType' | 'illuminationGeometryType' | 'detectorGeometryType' | 'illuminationParameter' | 'detectorParameter'>
  )>, illumination?: Maybe<(
    { __typename?: 'Illumination' }
    & Pick<Illumination, 'illuminationLight' | 'uvFilter' | 'polarizationFilter'>
  )>, transformation?: Maybe<(
    { __typename?: 'Transformation' }
    & Pick<Transformation, 'transformType' | 'netProfilerSignature'>
  )> }
);

export type FullColorantComponentFragment = (
  { __typename?: 'ColorantComponent' }
  & Pick<ColorantComponent, 'concentrationPercentage'>
  & { basicMaterial?: Maybe<(
    { __typename?: 'BasicMaterial' }
    & FullBasicMaterialFragment
  )> }
);

export type FullCalibrationParameterFragment = (
  { __typename?: 'CalibrationParameter' }
  & Pick<CalibrationParameter, 'calibrationConditionId' | 'type'>
  & { data?: Maybe<(
    { __typename?: 'Spectrum' }
    & Pick<Spectrum, 'id' | 'values'>
    & { spectralSampling?: Maybe<(
      { __typename?: 'SpectralSampling' }
      & FullSpectralSamplingFragment
    )> }
  ) | (
    { __typename?: 'NumberArray' }
    & Pick<NumberArray, 'values'>
  )> }
);

export type FullCalibrationConditionsFragment = (
  { __typename?: 'CalibrationCondition' }
  & Pick<CalibrationCondition, 'id' | 'engineId'>
  & { measurementConditions?: Maybe<Array<Maybe<(
    { __typename?: 'MeasurementCondition' }
    & FullMeasurementConditionFragment
  )>>> }
);

export type FullSolventFragment = (
  { __typename?: 'Solvent' }
  & Pick<Solvent, 'id' | 'name' | 'creationDateTime' | 'specificMass' | 'viscosity'>
  & { components?: Maybe<Array<Maybe<(
    { __typename?: 'ColorantComponent' }
    & FullColorantComponentFragment
  )>>>, price?: Maybe<(
    { __typename?: 'Price' }
    & FullPriceFragment
  )> }
);

export type FullColorantFragment = (
  { __typename?: 'Colorant' }
  & Pick<Colorant, 'id' | 'name' | 'creationDateTime' | 'type' | 'specificMass' | 'minConcentrationPercentage' | 'maxConcentrationPercentage' | 'isLeftover' | 'tags'>
  & { calibrationParameters?: Maybe<Array<Maybe<(
    { __typename?: 'CalibrationParameter' }
    & FullCalibrationParameterFragment
  )>>>, components?: Maybe<Array<Maybe<(
    { __typename?: 'ColorantComponent' }
    & FullColorantComponentFragment
  )>>>, price?: Maybe<(
    { __typename?: 'Price' }
    & FullPriceFragment
  )> }
);

export type FullMeasurementSampleFragment = (
  { __typename?: 'MeasurementSample' }
  & { measurementCondition?: Maybe<(
    { __typename?: 'MeasurementCondition' }
    & FullMeasurementConditionFragment
  )>, colorSpecification?: Maybe<(
    { __typename?: 'ColorSpecification' }
    & Pick<ColorSpecification, 'colorSpace' | 'illuminant' | 'observer'>
    & { spectralSampling?: Maybe<(
      { __typename?: 'SpectralSampling' }
      & FullSpectralSamplingFragment
    )>, rgbPrimaries?: Maybe<(
      { __typename?: 'RGBPrimaries' }
      & Pick<RgbPrimaries, 'xr' | 'yr' | 'xg' | 'yg' | 'xb' | 'yb'>
    )> }
  )>, data?: Maybe<(
    { __typename?: 'DataCube' }
    & Pick<DataCube, 'data'>
    & { extentPixels?: Maybe<(
      { __typename?: 'ExtentPixels' }
      & Pick<ExtentPixels, 'width' | 'height'>
    )> }
  )> }
);

export type FullMeasurementFragment = (
  { __typename?: 'Measurement' }
  & Pick<Measurement, 'id' | 'creationDateTime' | 'dmsMeasurementId' | 'backing' | 'surfaceType'>
  & { measurementSamples?: Maybe<Array<Maybe<(
    { __typename?: 'MeasurementSample' }
    & FullMeasurementSampleFragment
  )>>> }
);

export type PrintApplicationFullFragment = (
  { __typename?: 'PrintApplication' }
  & Pick<PrintApplication, 'id' | 'name' | 'creationDateTime' | 'creatorId' | 'aclId' | 'tags'>
  & { components?: Maybe<Array<Maybe<(
    { __typename?: 'ColorantComponent' }
    & FullColorantComponentFragment
  )>>> }
);

export type WeightPerAreaFragment = (
  { __typename?: 'Quantity' }
  & Pick<Quantity, 'amount' | 'unit'>
);

export type FullAppearanceSampleFragment = (
  { __typename?: 'AppearanceSample' }
  & Pick<AppearanceSample, 'id' | 'creationDateTime' | 'name' | 'parentAppearanceSampleId' | 'substrateId' | 'standardId'>
  & { formula?: Maybe<(
    { __typename?: 'Formula' }
    & Pick<Formula, 'id' | 'assortmentId' | 'formulationSettings'>
    & { predictionMeasurements?: Maybe<Array<Maybe<(
      { __typename?: 'Measurement' }
      & FullMeasurementFragment
    )>>>, formulaLayers?: Maybe<Array<Maybe<(
      { __typename?: 'FormulaLayer' }
      & Pick<FormulaLayer, 'relativeThickness' | 'viscosity'>
      & { formulaComponents?: Maybe<Array<Maybe<(
        { __typename?: 'FormulaComponent' }
        & Pick<FormulaComponent, 'massAmount'>
        & { colorant?: Maybe<(
          { __typename?: 'Colorant' }
          & Pick<Colorant, 'id'>
        )> }
      )>>>, quantity?: Maybe<(
        { __typename?: 'Quantity' }
        & Pick<Quantity, 'unit' | 'amount'>
      )> }
    )>>> }
  )>, measurements?: Maybe<Array<Maybe<(
    { __typename?: 'Measurement' }
    & Pick<Measurement, 'id' | 'creationDateTime' | 'dmsMeasurementId'>
    & { measurementSamples?: Maybe<Array<Maybe<(
      { __typename?: 'MeasurementSample' }
      & FullMeasurementSampleFragment
    )>>> }
  )>>> }
);

export type FullSubstrateFragment = (
  { __typename?: 'Substrate' }
  & Pick<Substrate, 'id' | 'name' | 'creationDateTime' | 'creatorName' | 'creatorId' | 'aclId' | 'tags'>
  & { measurements?: Maybe<Array<Maybe<(
    { __typename?: 'Measurement' }
    & FullMeasurementFragment
  )>>>, calibrationParameters?: Maybe<Array<Maybe<(
    { __typename?: 'CalibrationParameter' }
    & FullCalibrationParameterFragment
  )>>>, calibrationConditions?: Maybe<Array<Maybe<(
    { __typename?: 'CalibrationCondition' }
    & FullCalibrationConditionsFragment
  )>>> }
);

export type FullAccessControlListFragment = (
  { __typename?: 'AccessControlList' }
  & Pick<AccessControlList, 'id' | 'creationDateTime' | 'creatorId' | 'creatorName' | 'aclId' | 'name' | 'tags'>
  & { entries?: Maybe<Array<Maybe<(
    { __typename?: 'AccessControlListEntry' }
    & Pick<AccessControlListEntry, 'userId' | 'userGroupId'>
    & { accessFlags?: Maybe<(
      { __typename?: 'AccessFlags' }
      & Pick<AccessFlags, 'flags'>
    )> }
  )>>> }
);

export type FullStandardFragment = (
  { __typename?: 'Standard' }
  & Pick<Standard, 'id' | 'name' | 'creationDateTime' | 'creatorName' | 'creatorId' | 'aclId' | 'tags'>
  & { derivedStandards?: Maybe<Array<Maybe<(
    { __typename?: 'Standard' }
    & Pick<Standard, 'id'>
  )>>>, tolerances?: Maybe<Array<Maybe<(
    { __typename?: 'Tolerance' }
    & Pick<Tolerance, 'id' | 'lowerLimit' | 'upperLimit' | 'parameters'>
    & { metric?: Maybe<(
      { __typename?: 'Metric' }
      & Pick<Metric, 'id' | 'name' | 'formattedName' | 'defaultParameters'>
    )> }
  )>>>, pantoneLIVE?: Maybe<(
    { __typename?: 'PantoneLIVE' }
    & Pick<PantoneLive, 'libraryId' | 'sampleId' | 'illuminant' | 'observer'>
  )>, measurements?: Maybe<Array<Maybe<(
    { __typename?: 'Measurement' }
    & FullMeasurementFragment
  )>>> }
);

export type FullUserFragment = (
  { __typename?: 'User' }
  & Pick<User, 'aclId' | 'creationDateTime' | 'creatorId' | 'creatorName' | 'defaultACLId' | 'fmsUserId' | 'id' | 'name' | 'tags' | 'xriteUserId'>
  & { userRights?: Maybe<Array<Maybe<(
    { __typename?: 'UserRight' }
    & Pick<UserRight, 'grantedAt' | 'grantedBy' | 'userRightType'>
  )>>> }
);

export type FullUserGroupFragment = (
  { __typename?: 'UserGroup' }
  & Pick<UserGroup, 'aclId' | 'creationDateTime' | 'creatorId' | 'creatorName' | 'email' | 'id' | 'name' | 'tags' | 'users'>
);

export type AddAccessControlListMutationVariables = Exact<{
  accessControlList?: Maybe<AccessControlListIn>;
}>;


export type AddAccessControlListMutation = (
  { __typename?: 'Mutation' }
  & { addACL?: Maybe<(
    { __typename?: 'AccessControlList' }
    & FullAccessControlListFragment
  )> }
);

export type DeleteAccessControlListsMutationVariables = Exact<{
  ids: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;


export type DeleteAccessControlListsMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteACL'>
);

export type AddAccessControlListEntryMutationVariables = Exact<{
  accessControlListEntry?: Maybe<AccessControlListEntryIn>;
  parentId?: Maybe<Scalars['ID']>;
}>;


export type AddAccessControlListEntryMutation = (
  { __typename?: 'Mutation' }
  & { addACLEntry?: Maybe<(
    { __typename?: 'AccessControlListEntry' }
    & Pick<AccessControlListEntry, 'userId' | 'userGroupId'>
    & { accessFlags?: Maybe<(
      { __typename?: 'AccessFlags' }
      & Pick<AccessFlags, 'flags'>
    )> }
  )> }
);

export type DeleteAccessControlListEntryMutationVariables = Exact<{
  parentId: Scalars['ID'];
  ids?: Maybe<Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>>;
}>;


export type DeleteAccessControlListEntryMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteACLEntry'>
);

export type UpdateAccessControlListMutationVariables = Exact<{
  accessControlListIn?: Maybe<AccessControlListIn>;
}>;


export type UpdateAccessControlListMutation = (
  { __typename?: 'Mutation' }
  & { modifyACL?: Maybe<(
    { __typename?: 'AccessControlList' }
    & FullAccessControlListFragment
  )> }
);

export type AddPrintApplicationMutationVariables = Exact<{
  printApplication?: Maybe<PrintApplicationIn>;
  parentId?: Maybe<Scalars['ID']>;
  parentType?: Maybe<Scalars['String']>;
}>;


export type AddPrintApplicationMutation = (
  { __typename?: 'Mutation' }
  & { addPrintApplication?: Maybe<(
    { __typename?: 'PrintApplication' }
    & PrintApplicationFullFragment
  )> }
);

export type AddColorantMutationVariables = Exact<{
  colorant?: Maybe<ColorantIn>;
  parentId: Scalars['ID'];
}>;


export type AddColorantMutation = (
  { __typename?: 'Mutation' }
  & { addColorant?: Maybe<(
    { __typename?: 'Colorant' }
    & FullColorantFragment
  )> }
);

export type AddAppearanceSampleMutationVariables = Exact<{
  id: Scalars['ID'];
  name: Scalars['String'];
  creationDateTime: Scalars['String'];
  standardId?: Maybe<Scalars['ID']>;
  substrateId?: Maybe<Scalars['ID']>;
  parentAppearanceSampleId?: Maybe<Scalars['ID']>;
  measurements?: Maybe<Array<Maybe<MeasurementIn>> | Maybe<MeasurementIn>>;
  formula?: Maybe<FormulaIn>;
}>;


export type AddAppearanceSampleMutation = (
  { __typename?: 'Mutation' }
  & { addAppearanceSample?: Maybe<(
    { __typename?: 'AppearanceSample' }
    & FullAppearanceSampleFragment
  )> }
);

export type DeleteAppearanceSampleMutationVariables = Exact<{
  samplesToDelete: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;


export type DeleteAppearanceSampleMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteAppearanceSample'>
);

export type UpdateAppearanceSampleMutationVariables = Exact<{
  appearanceSampleAppearanceSampleIn?: Maybe<AppearanceSampleIn>;
}>;


export type UpdateAppearanceSampleMutation = (
  { __typename?: 'Mutation' }
  & { modifyAppearanceSample?: Maybe<(
    { __typename?: 'AppearanceSample' }
    & FullAppearanceSampleFragment
  )> }
);

export type AddStandardMutationVariables = Exact<{
  id: Scalars['ID'];
  name: Scalars['String'];
  measurements: Array<Maybe<MeasurementIn>> | Maybe<MeasurementIn>;
  creationDateTime: Scalars['String'];
  aclId: Scalars['ID'];
  tolerances?: Maybe<Array<Maybe<ToleranceIn>> | Maybe<ToleranceIn>>;
}>;


export type AddStandardMutation = (
  { __typename?: 'Mutation' }
  & { addStandard?: Maybe<(
    { __typename?: 'Standard' }
    & FullStandardFragment
  )> }
);

export type DeleteStandardMutationVariables = Exact<{
  id?: Maybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;


export type DeleteStandardMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteStandard'>
);

export type UpdateStandardMutationVariables = Exact<{
  standardIn?: Maybe<StandardIn>;
}>;


export type UpdateStandardMutation = (
  { __typename?: 'Mutation' }
  & { modifyStandard?: Maybe<(
    { __typename?: 'Standard' }
    & FullStandardFragment
  )> }
);

export type AddSubstrateMutationVariables = Exact<{
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  measurements?: Maybe<Array<Maybe<MeasurementIn>> | Maybe<MeasurementIn>>;
  calibrationParameters?: Maybe<Array<Maybe<CalibrationParameterIn>> | Maybe<CalibrationParameterIn>>;
  creationDateTime: Scalars['String'];
  aclId?: Maybe<Scalars['ID']>;
  calibrationConditions?: Maybe<Array<Maybe<CalibrationConditionIn>> | Maybe<CalibrationConditionIn>>;
}>;


export type AddSubstrateMutation = (
  { __typename?: 'Mutation' }
  & { addSubstrate?: Maybe<(
    { __typename?: 'Substrate' }
    & FullSubstrateFragment
  )> }
);

export type DeleteSubstrateMutationVariables = Exact<{
  id: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;


export type DeleteSubstrateMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteSubstrate'>
);

export type UpdateSubstrateMutationVariables = Exact<{
  substrateIn?: Maybe<SubstrateIn>;
}>;


export type UpdateSubstrateMutation = (
  { __typename?: 'Mutation' }
  & { modifySubstrate?: Maybe<(
    { __typename?: 'Substrate' }
    & FullSubstrateFragment
  )> }
);

export type AddTagMutationVariables = Exact<{
  tag?: Maybe<TagIn>;
  parentId?: Maybe<Scalars['ID']>;
  parentType?: Maybe<Scalars['String']>;
}>;


export type AddTagMutation = (
  { __typename?: 'Mutation' }
  & { addTag?: Maybe<(
    { __typename?: 'Tag' }
    & Pick<Tag, 'value'>
  )> }
);

export type RemoveTagMutationVariables = Exact<{
  values?: Maybe<Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>>;
  parentId?: Maybe<Scalars['ID']>;
}>;


export type RemoveTagMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteTag'>
);

export type AddUserMutationVariables = Exact<{
  user?: Maybe<UserIn>;
}>;


export type AddUserMutation = (
  { __typename?: 'Mutation' }
  & { addUser?: Maybe<(
    { __typename?: 'User' }
    & FullUserFragment
  )> }
);

export type DeleteUsersMutationVariables = Exact<{
  usersToDelete: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;


export type DeleteUsersMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteUser'>
);

export type ModifyUserMutationVariables = Exact<{
  user?: Maybe<UserIn>;
}>;


export type ModifyUserMutation = (
  { __typename?: 'Mutation' }
  & { modifyUser?: Maybe<(
    { __typename?: 'User' }
    & FullUserFragment
  )> }
);

export type AddUserGroupMutationVariables = Exact<{
  userGroup?: Maybe<UserGroupIn>;
}>;


export type AddUserGroupMutation = (
  { __typename?: 'Mutation' }
  & { addUserGroup?: Maybe<(
    { __typename?: 'UserGroup' }
    & FullUserGroupFragment
  )> }
);

export type DeleteUserGroupsMutationVariables = Exact<{
  userGroupsToDelete: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;


export type DeleteUserGroupsMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteUserGroup'>
);

export type AssignUserToUserGroupMutationVariables = Exact<{
  childIds?: Maybe<Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>>;
  parentId?: Maybe<Scalars['ID']>;
}>;


export type AssignUserToUserGroupMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'assignUserToUserGroup'>
);

export type UnassignUserFromUserGroupMutationVariables = Exact<{
  childIds?: Maybe<Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>>;
  parentId?: Maybe<Scalars['ID']>;
}>;


export type UnassignUserFromUserGroupMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'unassignUserFromUserGroup'>
);

export type UpdateUserGroupMutationVariables = Exact<{
  userGroupIn?: Maybe<UserGroupIn>;
}>;


export type UpdateUserGroupMutation = (
  { __typename?: 'Mutation' }
  & { modifyUserGroup?: Maybe<(
    { __typename?: 'UserGroup' }
    & FullUserGroupFragment
  )> }
);

export type GetAccessControlListsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccessControlListsQuery = (
  { __typename?: 'Query' }
  & { getACL?: Maybe<Array<Maybe<(
    { __typename?: 'AccessControlList' }
    & FullAccessControlListFragment
  )>>> }
);

export type GetAccessControlListQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
}>;


export type GetAccessControlListQuery = (
  { __typename?: 'Query' }
  & { getACL?: Maybe<Array<Maybe<(
    { __typename?: 'AccessControlList' }
    & Pick<AccessControlList, 'id' | 'name'>
  )>>> }
);

export type AssortmentQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
}>;


export type AssortmentQuery = (
  { __typename?: 'Query' }
  & { getAssortment?: Maybe<Array<Maybe<(
    { __typename?: 'Assortment' }
    & Pick<Assortment, 'id' | 'name' | 'creationDateTime' | 'industry' | 'subIndustry'>
    & { defaultSubstrate?: Maybe<(
      { __typename?: 'Substrate' }
      & FullSubstrateFragment
    )>, calibrationConditions?: Maybe<Array<Maybe<(
      { __typename?: 'CalibrationCondition' }
      & FullCalibrationConditionsFragment
    )>>>, calibrationParameters?: Maybe<Array<Maybe<(
      { __typename?: 'CalibrationParameter' }
      & FullCalibrationParameterFragment
    )>>>, solvent?: Maybe<(
      { __typename?: 'Solvent' }
      & FullSolventFragment
    )>, printApplications?: Maybe<Array<Maybe<(
      { __typename?: 'PrintApplication' }
      & PrintApplicationFullFragment
    )>>>, weightPerArea?: Maybe<(
      { __typename?: 'Quantity' }
      & WeightPerAreaFragment
    )> }
  )>>> }
);

export type AssortmentColorantsQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
}>;


export type AssortmentColorantsQuery = (
  { __typename?: 'Query' }
  & { getAssortment?: Maybe<Array<Maybe<(
    { __typename?: 'Assortment' }
    & Pick<Assortment, 'id' | 'creationDateTime'>
    & { colorants?: Maybe<Array<Maybe<(
      { __typename?: 'Colorant' }
      & FullColorantFragment
    )>>> }
  )>>> }
);

export type ListAssortmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAssortmentsQuery = (
  { __typename?: 'Query' }
  & { getAssortment?: Maybe<Array<Maybe<(
    { __typename?: 'Assortment' }
    & Pick<Assortment, 'id' | 'name' | 'creationDateTime' | 'industry' | 'subIndustry'>
    & { defaultSubstrate?: Maybe<(
      { __typename?: 'Substrate' }
      & Pick<Substrate, 'id'>
    )>, calibrationConditions?: Maybe<Array<Maybe<(
      { __typename?: 'CalibrationCondition' }
      & FullCalibrationConditionsFragment
    )>>> }
  )>>> }
);

export type BasicMaterialQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
}>;


export type BasicMaterialQuery = (
  { __typename?: 'Query' }
  & { getBasicMaterial?: Maybe<Array<Maybe<(
    { __typename?: 'BasicMaterial' }
    & FullBasicMaterialFragment
  )>>> }
);

export type ListColorAdQueryVariables = Exact<{
  assortmentId: Scalars['ID'];
}>;


export type ListColorAdQuery = (
  { __typename?: 'Query' }
  & { getColorApplicationDeviceThicknessRatiosByAssortment?: Maybe<Array<Maybe<(
    { __typename?: 'ColorApplicationDeviceThicknessRatio' }
    & Pick<ColorApplicationDeviceThicknessRatio, 'assortmentId' | 'deviceId' | 'deviceName' | 'ratio'>
  )>>> }
);

export type GetAppearanceSamplesByStandardQueryVariables = Exact<{
  parentId?: Maybe<Scalars['String']>;
}>;


export type GetAppearanceSamplesByStandardQuery = (
  { __typename?: 'Query' }
  & { getAppearanceSamplesByStandard?: Maybe<Array<Maybe<(
    { __typename?: 'AppearanceSample' }
    & FullAppearanceSampleFragment
  )>>> }
);

export type GetAppearanceSampleQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
  colorFilter?: Maybe<ColorFilterIn>;
}>;


export type GetAppearanceSampleQuery = (
  { __typename?: 'Query' }
  & { getAppearanceSample?: Maybe<Array<Maybe<(
    { __typename?: 'AppearanceSample' }
    & FullAppearanceSampleFragment
  )>>> }
);

export type StandardQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
  colorFilter?: Maybe<ColorFilterIn>;
}>;


export type StandardQuery = (
  { __typename?: 'Query' }
  & { getStandard?: Maybe<Array<Maybe<(
    { __typename?: 'Standard' }
    & FullStandardFragment
  )>>> }
);

export type ListStandardsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListStandardsQuery = (
  { __typename?: 'Query' }
  & { listStandards?: Maybe<Array<Maybe<(
    { __typename?: 'Standard' }
    & Pick<Standard, 'id' | 'name'>
  )>>> }
);

export type GetSubstrateQueryVariables = Exact<{
  id?: Maybe<Scalars['String']>;
}>;


export type GetSubstrateQuery = (
  { __typename?: 'Query' }
  & { getSubstrate?: Maybe<Array<Maybe<(
    { __typename?: 'Substrate' }
    & FullSubstrateFragment
  )>>> }
);

export type ListSubstratesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListSubstratesQuery = (
  { __typename?: 'Query' }
  & { getSubstrate?: Maybe<Array<Maybe<(
    { __typename?: 'Substrate' }
    & Pick<Substrate, 'id' | 'name' | 'creationDateTime'>
    & { measurements?: Maybe<Array<Maybe<(
      { __typename?: 'Measurement' }
      & FullMeasurementFragment
    )>>>, calibrationConditions?: Maybe<Array<Maybe<(
      { __typename?: 'CalibrationCondition' }
      & FullCalibrationConditionsFragment
    )>>> }
  )>>> }
);

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = (
  { __typename?: 'Query' }
  & { getUser?: Maybe<Array<Maybe<(
    { __typename?: 'User' }
    & FullUserFragment
  )>>> }
);

export type ListUserGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListUserGroupsQuery = (
  { __typename?: 'Query' }
  & { listUserGroups?: Maybe<Array<Maybe<(
    { __typename?: 'UserGroup' }
    & FullUserGroupFragment
  )>>> }
);

export type GetUserGroupQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserGroupQuery = (
  { __typename?: 'Query' }
  & { getUserGroup?: Maybe<Array<Maybe<(
    { __typename?: 'UserGroup' }
    & FullUserGroupFragment
  )>>> }
);

export const FullPriceFragmentDoc = gql`
    fragment fullPrice on Price {
  amount
  currencyCode
}
    `;
export const FullBasicMaterialFragmentDoc = gql`
    fragment fullBasicMaterial on BasicMaterial {
  id
  name
  creationDateTime
  type
  creatorId
  creatorName
  aclId
  price {
    ...fullPrice
  }
}
    ${FullPriceFragmentDoc}`;
export const FullColorantComponentFragmentDoc = gql`
    fragment fullColorantComponent on ColorantComponent {
  basicMaterial {
    ...fullBasicMaterial
  }
  concentrationPercentage
}
    ${FullBasicMaterialFragmentDoc}`;
export const FullSolventFragmentDoc = gql`
    fragment fullSolvent on Solvent {
  id
  name
  creationDateTime
  specificMass
  viscosity
  creationDateTime
  components {
    ...fullColorantComponent
  }
  price {
    ...fullPrice
  }
}
    ${FullColorantComponentFragmentDoc}
${FullPriceFragmentDoc}`;
export const FullSpectralSamplingFragmentDoc = gql`
    fragment fullSpectralSampling on SpectralSampling {
  startWavelength
  endWavelength
  wavelengthInterval
}
    `;
export const FullCalibrationParameterFragmentDoc = gql`
    fragment fullCalibrationParameter on CalibrationParameter {
  calibrationConditionId
  type
  data {
    ... on NumberArray {
      values
    }
    ... on Spectrum {
      id
      spectralSampling {
        ...fullSpectralSampling
      }
      values
    }
  }
}
    ${FullSpectralSamplingFragmentDoc}`;
export const FullColorantFragmentDoc = gql`
    fragment fullColorant on Colorant {
  id
  name
  creationDateTime
  type
  specificMass
  minConcentrationPercentage
  maxConcentrationPercentage
  isLeftover
  creationDateTime
  calibrationParameters {
    ...fullCalibrationParameter
  }
  components {
    ...fullColorantComponent
  }
  price {
    ...fullPrice
  }
  tags
}
    ${FullCalibrationParameterFragmentDoc}
${FullColorantComponentFragmentDoc}
${FullPriceFragmentDoc}`;
export const PrintApplicationFullFragmentDoc = gql`
    fragment printApplicationFull on PrintApplication {
  id
  name
  creationDateTime
  creatorId
  aclId
  components {
    ...fullColorantComponent
  }
  tags
}
    ${FullColorantComponentFragmentDoc}`;
export const WeightPerAreaFragmentDoc = gql`
    fragment weightPerArea on Quantity {
  amount
  unit
}
    `;
export const FullMeasurementConditionFragmentDoc = gql`
    fragment fullMeasurementCondition on MeasurementCondition {
  geometry {
    description
    measurementType
    illuminationGeometryType
    detectorGeometryType
    illuminationParameter
    detectorParameter
  }
  illumination {
    illuminationLight
    uvFilter
    polarizationFilter
  }
  transformation {
    transformType
    netProfilerSignature
  }
}
    `;
export const FullMeasurementSampleFragmentDoc = gql`
    fragment fullMeasurementSample on MeasurementSample {
  measurementCondition {
    ...fullMeasurementCondition
  }
  colorSpecification {
    colorSpace
    spectralSampling {
      ...fullSpectralSampling
    }
    colorSpace
    illuminant
    observer
    rgbPrimaries {
      xr
      yr
      xg
      yg
      xb
      yb
    }
  }
  data {
    extentPixels {
      width
      height
    }
    data
  }
}
    ${FullMeasurementConditionFragmentDoc}
${FullSpectralSamplingFragmentDoc}`;
export const FullMeasurementFragmentDoc = gql`
    fragment fullMeasurement on Measurement {
  id
  creationDateTime
  dmsMeasurementId
  backing
  surfaceType
  measurementSamples {
    ...fullMeasurementSample
  }
}
    ${FullMeasurementSampleFragmentDoc}`;
export const FullAppearanceSampleFragmentDoc = gql`
    fragment fullAppearanceSample on AppearanceSample {
  id
  creationDateTime
  name
  parentAppearanceSampleId
  substrateId
  standardId
  formula {
    id
    assortmentId
    formulationSettings
    predictionMeasurements {
      ...fullMeasurement
    }
    formulaLayers {
      relativeThickness
      viscosity
      formulaComponents {
        colorant {
          id
        }
        massAmount
      }
      quantity {
        unit
        amount
      }
    }
  }
  measurements {
    id
    creationDateTime
    dmsMeasurementId
    measurementSamples {
      ...fullMeasurementSample
    }
  }
}
    ${FullMeasurementFragmentDoc}
${FullMeasurementSampleFragmentDoc}`;
export const FullCalibrationConditionsFragmentDoc = gql`
    fragment fullCalibrationConditions on CalibrationCondition {
  id
  engineId
  measurementConditions {
    ...fullMeasurementCondition
  }
}
    ${FullMeasurementConditionFragmentDoc}`;
export const FullSubstrateFragmentDoc = gql`
    fragment fullSubstrate on Substrate {
  id
  name
  creationDateTime
  creatorName
  creatorId
  aclId
  tags
  measurements {
    ...fullMeasurement
  }
  calibrationParameters {
    ...fullCalibrationParameter
  }
  calibrationConditions {
    ...fullCalibrationConditions
  }
}
    ${FullMeasurementFragmentDoc}
${FullCalibrationParameterFragmentDoc}
${FullCalibrationConditionsFragmentDoc}`;
export const FullAccessControlListFragmentDoc = gql`
    fragment fullAccessControlList on AccessControlList {
  id
  creationDateTime
  creatorId
  creatorName
  aclId
  name
  entries {
    userId
    userGroupId
    accessFlags {
      flags
    }
  }
  tags
}
    `;
export const FullStandardFragmentDoc = gql`
    fragment fullStandard on Standard {
  id
  name
  creationDateTime
  creatorName
  creatorId
  aclId
  derivedStandards {
    id
  }
  tags
  tolerances {
    id
    metric {
      id
      name
      formattedName
      defaultParameters
    }
    lowerLimit
    upperLimit
    parameters
  }
  pantoneLIVE {
    libraryId
    sampleId
    illuminant
    observer
  }
  measurements {
    ...fullMeasurement
  }
}
    ${FullMeasurementFragmentDoc}`;
export const FullUserFragmentDoc = gql`
    fragment fullUser on User {
  aclId
  creationDateTime
  creatorId
  creatorName
  defaultACLId
  fmsUserId
  id
  name
  tags
  userRights {
    grantedAt
    grantedBy
    userRightType
  }
  xriteUserId
}
    `;
export const FullUserGroupFragmentDoc = gql`
    fragment fullUserGroup on UserGroup {
  aclId
  creationDateTime
  creatorId
  creatorName
  email
  id
  name
  tags
  users
}
    `;
export const AddAccessControlListDocument = gql`
    mutation AddAccessControlList($accessControlList: AccessControlListIn) {
  addACL(accessControlList: $accessControlList) {
    ...fullAccessControlList
  }
}
    ${FullAccessControlListFragmentDoc}`;

export function useAddAccessControlListMutation() {
  return Urql.useMutation<AddAccessControlListMutation, AddAccessControlListMutationVariables>(AddAccessControlListDocument);
};
export const DeleteAccessControlListsDocument = gql`
    mutation DeleteAccessControlLists($ids: [ID]!) {
  deleteACL(ids: $ids)
}
    `;

export function useDeleteAccessControlListsMutation() {
  return Urql.useMutation<DeleteAccessControlListsMutation, DeleteAccessControlListsMutationVariables>(DeleteAccessControlListsDocument);
};
export const AddAccessControlListEntryDocument = gql`
    mutation AddAccessControlListEntry($accessControlListEntry: AccessControlListEntryIn, $parentId: ID) {
  addACLEntry(
    accessControlListEntry: $accessControlListEntry
    parentId: $parentId
  ) {
    userId
    userGroupId
    accessFlags {
      flags
    }
  }
}
    `;

export function useAddAccessControlListEntryMutation() {
  return Urql.useMutation<AddAccessControlListEntryMutation, AddAccessControlListEntryMutationVariables>(AddAccessControlListEntryDocument);
};
export const DeleteAccessControlListEntryDocument = gql`
    mutation DeleteAccessControlListEntry($parentId: ID!, $ids: [ID]) {
  deleteACLEntry(parentId: $parentId, ids: $ids)
}
    `;

export function useDeleteAccessControlListEntryMutation() {
  return Urql.useMutation<DeleteAccessControlListEntryMutation, DeleteAccessControlListEntryMutationVariables>(DeleteAccessControlListEntryDocument);
};
export const UpdateAccessControlListDocument = gql`
    mutation UpdateAccessControlList($accessControlListIn: AccessControlListIn) {
  modifyACL(accessControlList: $accessControlListIn) {
    ...fullAccessControlList
  }
}
    ${FullAccessControlListFragmentDoc}`;

export function useUpdateAccessControlListMutation() {
  return Urql.useMutation<UpdateAccessControlListMutation, UpdateAccessControlListMutationVariables>(UpdateAccessControlListDocument);
};
export const AddPrintApplicationDocument = gql`
    mutation AddPrintApplication($printApplication: PrintApplicationIn, $parentId: ID, $parentType: String) {
  addPrintApplication(
    printApplication: $printApplication
    parentId: $parentId
    parentType: $parentType
  ) {
    ...printApplicationFull
  }
}
    ${PrintApplicationFullFragmentDoc}`;

export function useAddPrintApplicationMutation() {
  return Urql.useMutation<AddPrintApplicationMutation, AddPrintApplicationMutationVariables>(AddPrintApplicationDocument);
};
export const AddColorantDocument = gql`
    mutation AddColorant($colorant: ColorantIn, $parentId: ID!) {
  addColorant(colorant: $colorant, parentId: $parentId) {
    ...fullColorant
  }
}
    ${FullColorantFragmentDoc}`;

export function useAddColorantMutation() {
  return Urql.useMutation<AddColorantMutation, AddColorantMutationVariables>(AddColorantDocument);
};
export const AddAppearanceSampleDocument = gql`
    mutation AddAppearanceSample($id: ID!, $name: String!, $creationDateTime: String!, $standardId: ID, $substrateId: ID, $parentAppearanceSampleId: ID, $measurements: [MeasurementIn], $formula: FormulaIn) {
  addAppearanceSample(
    appearanceSample: {id: $id, name: $name, creationDateTime: $creationDateTime, standardId: $standardId, substrateId: $substrateId, parentAppearanceSampleId: $parentAppearanceSampleId, measurements: $measurements, formula: $formula}
  ) {
    ...fullAppearanceSample
  }
}
    ${FullAppearanceSampleFragmentDoc}`;

export function useAddAppearanceSampleMutation() {
  return Urql.useMutation<AddAppearanceSampleMutation, AddAppearanceSampleMutationVariables>(AddAppearanceSampleDocument);
};
export const DeleteAppearanceSampleDocument = gql`
    mutation DeleteAppearanceSample($samplesToDelete: [ID]!) {
  deleteAppearanceSample(ids: $samplesToDelete)
}
    `;

export function useDeleteAppearanceSampleMutation() {
  return Urql.useMutation<DeleteAppearanceSampleMutation, DeleteAppearanceSampleMutationVariables>(DeleteAppearanceSampleDocument);
};
export const UpdateAppearanceSampleDocument = gql`
    mutation UpdateAppearanceSample($appearanceSampleAppearanceSampleIn: AppearanceSampleIn) {
  modifyAppearanceSample(appearanceSample: $appearanceSampleAppearanceSampleIn) {
    ...fullAppearanceSample
  }
}
    ${FullAppearanceSampleFragmentDoc}`;

export function useUpdateAppearanceSampleMutation() {
  return Urql.useMutation<UpdateAppearanceSampleMutation, UpdateAppearanceSampleMutationVariables>(UpdateAppearanceSampleDocument);
};
export const AddStandardDocument = gql`
    mutation AddStandard($id: ID!, $name: String!, $measurements: [MeasurementIn]!, $creationDateTime: String!, $aclId: ID!, $tolerances: [ToleranceIn]) {
  addStandard(
    standard: {id: $id, name: $name, measurements: $measurements, creationDateTime: $creationDateTime, aclId: $aclId, tolerances: $tolerances}
  ) {
    ...fullStandard
  }
}
    ${FullStandardFragmentDoc}`;

export function useAddStandardMutation() {
  return Urql.useMutation<AddStandardMutation, AddStandardMutationVariables>(AddStandardDocument);
};
export const DeleteStandardDocument = gql`
    mutation DeleteStandard($id: [ID!]) {
  deleteStandard(ids: $id)
}
    `;

export function useDeleteStandardMutation() {
  return Urql.useMutation<DeleteStandardMutation, DeleteStandardMutationVariables>(DeleteStandardDocument);
};
export const UpdateStandardDocument = gql`
    mutation UpdateStandard($standardIn: StandardIn) {
  modifyStandard(standard: $standardIn) {
    ...fullStandard
  }
}
    ${FullStandardFragmentDoc}`;

export function useUpdateStandardMutation() {
  return Urql.useMutation<UpdateStandardMutation, UpdateStandardMutationVariables>(UpdateStandardDocument);
};
export const AddSubstrateDocument = gql`
    mutation AddSubstrate($id: ID!, $name: String, $measurements: [MeasurementIn], $calibrationParameters: [CalibrationParameterIn], $creationDateTime: String!, $aclId: ID, $calibrationConditions: [CalibrationConditionIn]) {
  addSubstrate(
    substrate: {id: $id, name: $name, measurements: $measurements, creationDateTime: $creationDateTime, calibrationParameters: $calibrationParameters, calibrationConditions: $calibrationConditions, aclId: $aclId}
  ) {
    ...fullSubstrate
  }
}
    ${FullSubstrateFragmentDoc}`;

export function useAddSubstrateMutation() {
  return Urql.useMutation<AddSubstrateMutation, AddSubstrateMutationVariables>(AddSubstrateDocument);
};
export const DeleteSubstrateDocument = gql`
    mutation DeleteSubstrate($id: [ID]!) {
  deleteSubstrate(ids: $id)
}
    `;

export function useDeleteSubstrateMutation() {
  return Urql.useMutation<DeleteSubstrateMutation, DeleteSubstrateMutationVariables>(DeleteSubstrateDocument);
};
export const UpdateSubstrateDocument = gql`
    mutation UpdateSubstrate($substrateIn: SubstrateIn) {
  modifySubstrate(substrate: $substrateIn) {
    ...fullSubstrate
  }
}
    ${FullSubstrateFragmentDoc}`;

export function useUpdateSubstrateMutation() {
  return Urql.useMutation<UpdateSubstrateMutation, UpdateSubstrateMutationVariables>(UpdateSubstrateDocument);
};
export const AddTagDocument = gql`
    mutation AddTag($tag: TagIn, $parentId: ID, $parentType: String) {
  addTag(parentId: $parentId, parentType: $parentType, tag: $tag) {
    value
  }
}
    `;

export function useAddTagMutation() {
  return Urql.useMutation<AddTagMutation, AddTagMutationVariables>(AddTagDocument);
};
export const RemoveTagDocument = gql`
    mutation RemoveTag($values: [String], $parentId: ID) {
  deleteTag(parentId: $parentId, values: $values)
}
    `;

export function useRemoveTagMutation() {
  return Urql.useMutation<RemoveTagMutation, RemoveTagMutationVariables>(RemoveTagDocument);
};
export const AddUserDocument = gql`
    mutation AddUser($user: UserIn) {
  addUser(user: $user) {
    ...fullUser
  }
}
    ${FullUserFragmentDoc}`;

export function useAddUserMutation() {
  return Urql.useMutation<AddUserMutation, AddUserMutationVariables>(AddUserDocument);
};
export const DeleteUsersDocument = gql`
    mutation DeleteUsers($usersToDelete: [ID]!) {
  deleteUser(ids: $usersToDelete)
}
    `;

export function useDeleteUsersMutation() {
  return Urql.useMutation<DeleteUsersMutation, DeleteUsersMutationVariables>(DeleteUsersDocument);
};
export const ModifyUserDocument = gql`
    mutation ModifyUser($user: UserIn) {
  modifyUser(user: $user) {
    ...fullUser
  }
}
    ${FullUserFragmentDoc}`;

export function useModifyUserMutation() {
  return Urql.useMutation<ModifyUserMutation, ModifyUserMutationVariables>(ModifyUserDocument);
};
export const AddUserGroupDocument = gql`
    mutation AddUserGroup($userGroup: UserGroupIn) {
  addUserGroup(userGroup: $userGroup) {
    ...fullUserGroup
  }
}
    ${FullUserGroupFragmentDoc}`;

export function useAddUserGroupMutation() {
  return Urql.useMutation<AddUserGroupMutation, AddUserGroupMutationVariables>(AddUserGroupDocument);
};
export const DeleteUserGroupsDocument = gql`
    mutation DeleteUserGroups($userGroupsToDelete: [ID]!) {
  deleteUserGroup(ids: $userGroupsToDelete)
}
    `;

export function useDeleteUserGroupsMutation() {
  return Urql.useMutation<DeleteUserGroupsMutation, DeleteUserGroupsMutationVariables>(DeleteUserGroupsDocument);
};
export const AssignUserToUserGroupDocument = gql`
    mutation AssignUserToUserGroup($childIds: [ID], $parentId: ID) {
  assignUserToUserGroup(childIds: $childIds, parentId: $parentId)
}
    `;

export function useAssignUserToUserGroupMutation() {
  return Urql.useMutation<AssignUserToUserGroupMutation, AssignUserToUserGroupMutationVariables>(AssignUserToUserGroupDocument);
};
export const UnassignUserFromUserGroupDocument = gql`
    mutation UnassignUserFromUserGroup($childIds: [ID], $parentId: ID) {
  unassignUserFromUserGroup(childIds: $childIds, parentId: $parentId)
}
    `;

export function useUnassignUserFromUserGroupMutation() {
  return Urql.useMutation<UnassignUserFromUserGroupMutation, UnassignUserFromUserGroupMutationVariables>(UnassignUserFromUserGroupDocument);
};
export const UpdateUserGroupDocument = gql`
    mutation UpdateUserGroup($userGroupIn: UserGroupIn) {
  modifyUserGroup(userGroup: $userGroupIn) {
    ...fullUserGroup
  }
}
    ${FullUserGroupFragmentDoc}`;

export function useUpdateUserGroupMutation() {
  return Urql.useMutation<UpdateUserGroupMutation, UpdateUserGroupMutationVariables>(UpdateUserGroupDocument);
};
export const GetAccessControlListsDocument = gql`
    query GetAccessControlLists {
  getACL {
    ...fullAccessControlList
  }
}
    ${FullAccessControlListFragmentDoc}`;

export function useGetAccessControlListsQuery(options: Omit<Urql.UseQueryArgs<GetAccessControlListsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetAccessControlListsQuery>({ query: GetAccessControlListsDocument, ...options });
};
export const GetAccessControlListDocument = gql`
    query GetAccessControlList($id: String) {
  getACL(id: $id) {
    id
    name
  }
}
    `;

export function useGetAccessControlListQuery(options: Omit<Urql.UseQueryArgs<GetAccessControlListQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetAccessControlListQuery>({ query: GetAccessControlListDocument, ...options });
};
export const AssortmentDocument = gql`
    query Assortment($id: String) {
  getAssortment(id: $id) {
    id
    name
    creationDateTime
    industry
    subIndustry
    creationDateTime
    defaultSubstrate {
      ...fullSubstrate
    }
    calibrationConditions {
      ...fullCalibrationConditions
    }
    calibrationParameters {
      ...fullCalibrationParameter
    }
    solvent {
      ...fullSolvent
    }
    printApplications {
      ...printApplicationFull
    }
    weightPerArea {
      ...weightPerArea
    }
  }
}
    ${FullSubstrateFragmentDoc}
${FullCalibrationConditionsFragmentDoc}
${FullCalibrationParameterFragmentDoc}
${FullSolventFragmentDoc}
${PrintApplicationFullFragmentDoc}
${WeightPerAreaFragmentDoc}`;

export function useAssortmentQuery(options: Omit<Urql.UseQueryArgs<AssortmentQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<AssortmentQuery>({ query: AssortmentDocument, ...options });
};
export const AssortmentColorantsDocument = gql`
    query AssortmentColorants($id: String) {
  getAssortment(id: $id) {
    id
    creationDateTime
    colorants {
      ...fullColorant
    }
  }
}
    ${FullColorantFragmentDoc}`;

export function useAssortmentColorantsQuery(options: Omit<Urql.UseQueryArgs<AssortmentColorantsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<AssortmentColorantsQuery>({ query: AssortmentColorantsDocument, ...options });
};
export const ListAssortmentsDocument = gql`
    query ListAssortments {
  getAssortment {
    id
    name
    creationDateTime
    industry
    subIndustry
    defaultSubstrate {
      id
    }
    calibrationConditions {
      ...fullCalibrationConditions
    }
  }
}
    ${FullCalibrationConditionsFragmentDoc}`;

export function useListAssortmentsQuery(options: Omit<Urql.UseQueryArgs<ListAssortmentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ListAssortmentsQuery>({ query: ListAssortmentsDocument, ...options });
};
export const BasicMaterialDocument = gql`
    query BasicMaterial($id: String) {
  getBasicMaterial(id: $id) {
    ...fullBasicMaterial
  }
}
    ${FullBasicMaterialFragmentDoc}`;

export function useBasicMaterialQuery(options: Omit<Urql.UseQueryArgs<BasicMaterialQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<BasicMaterialQuery>({ query: BasicMaterialDocument, ...options });
};
export const ListColorAdDocument = gql`
    query listColorAD($assortmentId: ID!) {
  getColorApplicationDeviceThicknessRatiosByAssortment(parentId: $assortmentId) {
    assortmentId
    deviceId
    deviceName
    ratio
  }
}
    `;

export function useListColorAdQuery(options: Omit<Urql.UseQueryArgs<ListColorAdQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ListColorAdQuery>({ query: ListColorAdDocument, ...options });
};
export const GetAppearanceSamplesByStandardDocument = gql`
    query GetAppearanceSamplesByStandard($parentId: String) {
  getAppearanceSamplesByStandard(parentId: $parentId) {
    ...fullAppearanceSample
  }
}
    ${FullAppearanceSampleFragmentDoc}`;

export function useGetAppearanceSamplesByStandardQuery(options: Omit<Urql.UseQueryArgs<GetAppearanceSamplesByStandardQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetAppearanceSamplesByStandardQuery>({ query: GetAppearanceSamplesByStandardDocument, ...options });
};
export const GetAppearanceSampleDocument = gql`
    query GetAppearanceSample($id: String, $colorFilter: ColorFilterIn) {
  getAppearanceSample(id: $id, colorFilter: $colorFilter) {
    ...fullAppearanceSample
  }
}
    ${FullAppearanceSampleFragmentDoc}`;

export function useGetAppearanceSampleQuery(options: Omit<Urql.UseQueryArgs<GetAppearanceSampleQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetAppearanceSampleQuery>({ query: GetAppearanceSampleDocument, ...options });
};
export const StandardDocument = gql`
    query Standard($id: String, $colorFilter: ColorFilterIn) {
  getStandard(id: $id, colorFilter: $colorFilter) {
    ...fullStandard
  }
}
    ${FullStandardFragmentDoc}`;

export function useStandardQuery(options: Omit<Urql.UseQueryArgs<StandardQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<StandardQuery>({ query: StandardDocument, ...options });
};
export const ListStandardsDocument = gql`
    query ListStandards {
  listStandards {
    id
    name
  }
}
    `;

export function useListStandardsQuery(options: Omit<Urql.UseQueryArgs<ListStandardsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ListStandardsQuery>({ query: ListStandardsDocument, ...options });
};
export const GetSubstrateDocument = gql`
    query GetSubstrate($id: String) {
  getSubstrate(id: $id) {
    ...fullSubstrate
  }
}
    ${FullSubstrateFragmentDoc}`;

export function useGetSubstrateQuery(options: Omit<Urql.UseQueryArgs<GetSubstrateQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetSubstrateQuery>({ query: GetSubstrateDocument, ...options });
};
export const ListSubstratesDocument = gql`
    query ListSubstrates {
  getSubstrate {
    id
    name
    creationDateTime
    measurements {
      ...fullMeasurement
    }
    calibrationConditions {
      ...fullCalibrationConditions
    }
  }
}
    ${FullMeasurementFragmentDoc}
${FullCalibrationConditionsFragmentDoc}`;

export function useListSubstratesQuery(options: Omit<Urql.UseQueryArgs<ListSubstratesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ListSubstratesQuery>({ query: ListSubstratesDocument, ...options });
};
export const GetUsersDocument = gql`
    query GetUsers {
  getUser {
    ...fullUser
  }
}
    ${FullUserFragmentDoc}`;

export function useGetUsersQuery(options: Omit<Urql.UseQueryArgs<GetUsersQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetUsersQuery>({ query: GetUsersDocument, ...options });
};
export const ListUserGroupsDocument = gql`
    query ListUserGroups {
  listUserGroups {
    ...fullUserGroup
  }
}
    ${FullUserGroupFragmentDoc}`;

export function useListUserGroupsQuery(options: Omit<Urql.UseQueryArgs<ListUserGroupsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ListUserGroupsQuery>({ query: ListUserGroupsDocument, ...options });
};
export const GetUserGroupDocument = gql`
    query GetUserGroup {
  getUserGroup {
    ...fullUserGroup
  }
}
    ${FullUserGroupFragmentDoc}`;

export function useGetUserGroupQuery(options: Omit<Urql.UseQueryArgs<GetUserGroupQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetUserGroupQuery>({ query: GetUserGroupDocument, ...options });
};