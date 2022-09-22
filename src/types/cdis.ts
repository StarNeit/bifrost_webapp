export type WorkspaceObject = 'assortments' | 'recipes' | 'standards' | 'substrates' | 'thicknessobjects' | 'trials';
export type ParseFileRequest = {
  fileId: string,
};
export type ImportWorkspaceObjectRequest = {
  objectId: string,
  objectType: WorkspaceObject,
  applicationId: string,
};

export type PantoneAuthRequest = {
  credentials: {
    userId: string,
    passwordHash: string,
  }
};

export type SelectPaletteRequest = {
  applicationId: string,
  paletteId: string,
};

export type ParseFileResponse = unknown;
export type ImportResponse = never;
export type PantoneLivePalette = {
  id: string,
  name: string,
  simpleName: string,
};

export type WorkspaceEntry = {
  id: string,
  name: string,
  isModified: boolean,
  previewColors?: { [geometry: string]: string },
  creationDateTime?: string,
  info?: string,
  ERPId?: string,
  owner?: string,
  ownerGroup?: string,
  industry?: string,
  subIndustry?: string,
  type?: string,
  substrate?: string,
  assortment?: string,
}
