/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { Session } from '../../types/authentication';

const initialState: {
  session?: Session;
  showExpirationWarning: boolean;
} = {
  session: undefined,
  showExpirationWarning: false,
};

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setSession(state, action: { payload: Session | undefined }) {
      state.session = action.payload;
      if (!action.payload) {
        state.showExpirationWarning = false;
      }
    },
    showSessionExpirationWarning(state) {
      state.showExpirationWarning = true;
    },
    refreshSessionExpiration(state) {
      state.showExpirationWarning = false;
    },
  },
});

export const {
  setSession,
  refreshSessionExpiration,
  showSessionExpirationWarning,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;
