/* eslint-disable no-use-before-define  */
import { hot } from 'react-hot-loader/root';
import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import Report from 'Report';

import store from '../store';
import { ChildrenProps, Component } from '../types/component';
import lightTheme from '../theme/light';
import { ReportPayload } from './types';

const ReduxProviders: Component<ChildrenProps> = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

const StyleProviders: Component<ChildrenProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={lightTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

type Props = ChildrenProps & { payload?: ReportPayload };

const ReportApp: Component<Props> = ({ payload }) => {
  return (
    <ReduxProviders>
      <StyleProviders>
        <Report payload={payload} />
      </StyleProviders>
    </ReduxProviders>
  );
};

export default hot(ReportApp);
