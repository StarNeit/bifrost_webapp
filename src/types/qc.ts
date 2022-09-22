export enum ColorSpaceOption {
  BasicMaterial = 'basicMaterial',
  ReactBootStrap = 'reactBootstrap',
}

export const ColorSpaceLabel = {
  [ColorSpaceOption.BasicMaterial]: 'Basic Material',
  [ColorSpaceOption.ReactBootStrap]: 'React BootStrap',
};

export enum DETypeOption {
  DE = 'de',
  DE2000 = 'de2000',
}

export const DETypeLabel = {
  [DETypeOption.DE]: 'DE*',
  [DETypeOption.DE2000]: 'DE20000',
};

export const LCRatio: Record<string, number | undefined> = {
  L: undefined,
  C: undefined,
};

// Illuminant - Primary
export enum IlluminantPrimaryOption {
  D55 = 'd55',
  D65 = 'd65',
}

export const IlluminantPrimaryLabel = {
  [IlluminantPrimaryOption.D55]: 'D55',
  [IlluminantPrimaryOption.D65]: 'D65',
};

// Illuminant - Secondary
export enum IlluminantSecondaryOption {
  F02CWF = 'f02cwf',
  F20XRT = 'f20xrt',
}

export const IlluminantSecondaryLabel = {
  [IlluminantSecondaryOption.F02CWF]: 'F02 (CWF)',
  [IlluminantSecondaryOption.F20XRT]: 'F20 (XRT)',
};

// Illuminant - Tertiary
export enum IlluminantTertiaryOption {
  A10 = 'a10',
  B20 = 'b20',
}

export const IlluminantTertiaryLabel = {
  [IlluminantTertiaryOption.A10]: 'A-10',
  [IlluminantTertiaryOption.B20]: 'B-20',
};

export interface SetupDataType {
  displayFromTolerances?: boolean;
  colorSpace?: ColorSpaceOption;
  deType?: DETypeOption;
  lcRatio?: typeof LCRatio;
  illuminantObserver?: {
    primary?: IlluminantPrimaryOption,
    secondary?: IlluminantSecondaryOption,
    tertiary?: IlluminantTertiaryOption,
  },
}
