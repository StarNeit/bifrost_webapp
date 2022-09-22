export enum AccessOption {
  None,
  Group1,
  Group2,
  Group3,
}

export enum ProjectOption {
  None,
  Project1,
  Project2,
}

export enum TagOption {
  tag1,
  tag2,
  tag3
}

export enum ToleranceOption {
  tolerance1,
  tolerance2,
  tolerance3,
}

export interface MeasurementDataType {
  name: string,
  version: string,
  access: AccessOption,
  project: ProjectOption,
  userNotes: string,
  systemNotes: string,
  tags: TagOption[],
  tolerance: ToleranceOption[],
}

export type MeasurementValueType =
  string | AccessOption | ProjectOption | TagOption | ToleranceOption;
