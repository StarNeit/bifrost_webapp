/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { ThemeMode } from '../../types/theme';

const initialState: {
  mode: ThemeMode;
} = {
  mode: ThemeMode.Dark,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: { payload: ThemeMode }) {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;

export default themeSlice.reducer;
