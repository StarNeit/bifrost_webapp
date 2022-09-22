import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import history from '../../history';
import authentication from './authentication';
import theme from './theme';
import common from './common';
import formulation from './formulation';
import correction from './correction';
import dataImport from './import';

const rootReducer = combineReducers({
  router: connectRouter(history),
  authentication,
  theme,
  common,
  formulation,
  correction,
  dataImport,
});

export type RootState = ReturnType<typeof rootReducer>;

declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends RootState { }
}

export default rootReducer;
