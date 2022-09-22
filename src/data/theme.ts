import { useSelector } from 'react-redux';
import { ThemeMode } from '../types/theme';
import { RootState } from './reducers';
import darkTheme from '../theme/dark';
import lightTheme from '../theme/light';

const getThemeMode = (state: RootState): ThemeMode => state.theme.mode;

export const useTheme = () => {
  const themeMode = useSelector(getThemeMode);

  return themeMode === ThemeMode.Dark ? darkTheme : lightTheme;
};
