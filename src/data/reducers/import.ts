/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { ReplaceOperation, JsonPatch } from 'json8-patch';
import { WorkspaceObject } from '../../types/cdis';

const initialState: {
  changes: {
    assortments: { [key: string]: JsonPatch | undefined }
    recipes: { [key: string]: JsonPatch | undefined }
    standards: { [key: string]: JsonPatch | undefined }
    substrates: { [key: string]: JsonPatch | undefined }
    thicknessobjects: { [key: string]: JsonPatch | undefined }
    trials: { [key: string]: JsonPatch | undefined }
  }
} = {
  changes: {
    assortments: {},
    recipes: {},
    standards: {},
    substrates: {},
    thicknessobjects: {},
    trials: {},
  },
};

interface AddChange {
  operation: ReplaceOperation;
  objectId: UUID;
  objectType: WorkspaceObject;
}

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    addChange(state, { payload } : { payload: AddChange }) {
      if (state.changes[payload.objectType][payload.objectId]) {
        state.changes[payload.objectType][payload.objectId]?.push(payload.operation);
      } else {
        state.changes[payload.objectType][payload.objectId] = [payload.operation];
      }
    },
  },
});

export const { addChange } = importSlice.actions;

export default importSlice.reducer;
