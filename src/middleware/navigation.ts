/* eslint-disable @typescript-eslint/ban-types */
import { Middleware } from '@reduxjs/toolkit';
import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router';

import RoutePathname from '../constants/route';
import { RootState } from '../data/reducers';
import { selectSampleId } from '../data/reducers/common';
import { Unvalidated } from '../types/utils';

const isLocationChangeAction = (
  action: Unvalidated<LocationChangeAction>,
): action is LocationChangeAction => Boolean(action && action.type === LOCATION_CHANGE);

/**
 * Reset the selected sample ID if we navigate away from formulation/correction
 * and the currently selected sample is an un-saved result.
 */
export const navigationMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  if (isLocationChangeAction(action)) {
    const storeState = store.getState();
    const { selectedSampleId } = storeState.common;
    const formulationResults = storeState.formulation.result?.formulationResults;
    const searchResults = storeState.formulation.result?.searchResults;
    const correctionResults = storeState.correction.results;
    const shouldClear = formulationResults?.some((result) => result.sample.id === selectedSampleId)
      || searchResults?.some((result) => result.sample.id === selectedSampleId)
      || correctionResults?.some((result) => result.sample.id === selectedSampleId);
    const currentPathname = storeState.router.location.pathname;
    const newPathname = action.payload.location.pathname;
    if (
      (
        currentPathname === RoutePathname.Formulation
        || currentPathname === RoutePathname.Correction
      )
      && newPathname !== currentPathname
      && shouldClear
    ) {
      store.dispatch(selectSampleId(''));
    }
  }
  return next(action);
};
