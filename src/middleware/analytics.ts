/* eslint-disable @typescript-eslint/ban-types */
import { Middleware } from '@reduxjs/toolkit';
import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router';

import { routePathnameMap } from '../constants/route';
import { trackPageLoadTiming, trackScreen, trackStateChange } from '../data/analytics';
import { RootState } from '../data/reducers';
import { Unvalidated } from '../types/utils';

const isLocationChangeAction = (
  action: Unvalidated<LocationChangeAction>,
): action is LocationChangeAction => Boolean(action && action.type === LOCATION_CHANGE);

let isFirstScreen = true;
export const analyticsMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  if (isLocationChangeAction(action)) {
    const storeState = store.getState();
    const currentPathname = storeState.router.location.pathname;
    if ((currentPathname !== action.payload.location.pathname || isFirstScreen)
      && storeState.authentication.session?.userId) {
      if (isFirstScreen) {
        isFirstScreen = false;
        trackPageLoadTiming();
      }
      trackScreen({
        page_title: routePathnameMap[action.payload.location.pathname],
        page_path: action.payload.location.pathname,
      });
      trackStateChange(action.payload.location.pathname);
    }
  }
  return next(action);
};
