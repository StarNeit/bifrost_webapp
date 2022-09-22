import {
  Redirect,
  Route,
  Router,
  Switch,
} from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import RoutePath from './constants/route';
import { Component } from './types/component';
import Formulation from './pages/Formulation';
import Correction from './pages/Correction';
import Import from './pages/Import';
import Login from './pages/Login';
import Configuration from './pages/Configuration';
import { useValidatedSession } from './data/authentication';
import history from './history';
import QC from './pages/QC';
import LoadingContainer from './components/LoadingContainer';

const Routes: Component = () => {
  const { session, isValidating } = useValidatedSession();

  return (
    <ConnectedRouter history={history}>
      <Router history={history}>
        <Switch>
          {isValidating && (
            <Route>
              <LoadingContainer fetching delayed />
            </Route>
          )}

          {!session && (
            <Route>
              <Login />
            </Route>
          )}

          <Route path={RoutePath.QC}>
            <QC />
          </Route>

          <Route path={RoutePath.Formulation}>
            <Formulation />
          </Route>

          <Route path={RoutePath.Correction}>
            <Correction />
          </Route>

          <Route path={RoutePath.Import}>
            <Import />
          </Route>

          <Route path={RoutePath.Configuration}>
            <Configuration />
          </Route>

          <Redirect to={RoutePath.Formulation} />
        </Switch>
      </Router>
    </ConnectedRouter>
  );
};

export default Routes;
