import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { Switch, Route, Redirect } from 'react-router-dom';

import Page from '../../components/Page';
import Panel from '../../components/Panel';
import NavigationPane from './NavigationPane';
import BridgeApp from './BridgeApp';
import Groups from './Groups';
import Colorimetric from './Colorimetric';
import AssortmentColorants from './Assortment';

import RoutePathname from '../../constants/route';
import { ConfigRoutePath } from '../../types/configuration';
import { Component } from '../../types/component';
import UserManagement from './UserManagement';
import AccessControl from './AccessControl';
import Formulation from './Formulation';
import About from './About';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    height: '100%',
    marginLeft: theme.spacing(3),
    padding: 0,
    maxWidth: 'calc(100vw - 72px)',
    overflow: 'hidden',
  },
}));

const Configuration: Component = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Page title={t('labels.configuration')}>
      <div className={classes.root}>
        <NavigationPane />

        <Panel className={classes.content}>
          <Switch>
            <Route path={ConfigRoutePath.Colorimetric}>
              <Colorimetric />
            </Route>
            <Route path={ConfigRoutePath.Assortment}>
              <AssortmentColorants />
            </Route>
            <Route path={ConfigRoutePath.Users}>
              <UserManagement />
            </Route>
            <Route path={ConfigRoutePath.Groups}>
              <Groups />
            </Route>
            <Route path={ConfigRoutePath.AccessControl}>
              <AccessControl />
            </Route>
            <Route path={ConfigRoutePath.BridgeApp}>
              <BridgeApp />
            </Route>
            <Route path={ConfigRoutePath.Formulation}>
              <Formulation />
            </Route>
            <Route path={ConfigRoutePath.About}>
              <About />
            </Route>
            <Route path={RoutePathname.Configuration}>
              <Redirect to={ConfigRoutePath.Colorimetric} />
            </Route>
          </Switch>
        </Panel>
      </div>
    </Page>
  );
};

export default Configuration;
