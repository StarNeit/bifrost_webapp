import { hot } from 'react-hot-loader/root';
import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import { SWRConfig } from 'swr';

import Routes from './Routes';
import { useCFDBClient, Provider as GQLProvider } from './data/graphql.client';
import store from './store';
import { ChildrenProps, Component } from './types/component';
import { useTheme } from './data/theme';
import { useColorimetry } from './utils/colorimetry';
import ErrorBoundary from './components/ErrorBoundary';
import SnackProvider from './components/SnackProvider';
import SessionExpirationPrompt from './components/SessionExpirationPrompt';

const swrConfig = { revalidateOnFocus: false };

const ReduxProviders: Component<ChildrenProps> = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

const ApiProviders: Component<ChildrenProps> = ({ children }) => {
  const client = useCFDBClient();
  if (!client) {
    return <>{children}</>;
  }
  return (
    <GQLProvider value={client}>
      <SWRConfig value={swrConfig}>
        {children}
      </SWRConfig>
    </GQLProvider>
  );
};

const StyleProviders: Component<ChildrenProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

const ColorimetryLoader: Component<ChildrenProps> = ({ children }) => {
  const { isLoaded } = useColorimetry();
  return isLoaded ? <>{children}</> : null;
};

const App: Component = () => {
  return (
    <ColorimetryLoader>
      <ReduxProviders>
        <ApiProviders>
          <StyleProviders>
            <SnackProvider>
              <ErrorBoundary>
                <Routes />
                <SessionExpirationPrompt />
              </ErrorBoundary>
            </SnackProvider>
          </StyleProviders>
        </ApiProviders>
      </ReduxProviders>
    </ColorimetryLoader>
  );
};

export default hot(App);
