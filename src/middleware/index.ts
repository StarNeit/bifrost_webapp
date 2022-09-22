/* eslint-disable @typescript-eslint/ban-types */
import { Middleware } from '@reduxjs/toolkit';

import { RootState } from '../data/reducers';
import { selectSampleId, setSelectedStandardId } from '../data/reducers/common';
import { setCorrectionResults } from '../data/reducers/correction';
import { setFormulationResult } from '../data/reducers/formulation';

export { sessionMiddleware } from './session';
export { navigationMiddleware } from './navigation';
export { analyticsMiddleware } from './analytics';

export const standardSelectionMiddleware: Middleware<{}, RootState> = (
  store,
) => (next) => (action) => {
  if (setSelectedStandardId.match(action)) {
    store.dispatch(setFormulationResult(undefined));
    store.dispatch(setCorrectionResults(undefined));
    store.dispatch(selectSampleId(''));
  }

  return next(action);
};

export const sampleSelectionMiddleware: Middleware<{}, RootState> = (
  store,
) => (next) => (action) => {
  if (selectSampleId.match(action)) {
    const sampleId = action.payload;
    const state = store.getState();
    const correctionResults = state.correction.results;
    const isCorrectionSample = correctionResults?.some(
      ({ sample: { id, parentAppearanceSampleId } }) => sampleId === id
        || parentAppearanceSampleId === sampleId,
    );
    if (!isCorrectionSample) store.dispatch(setCorrectionResults(undefined));
  }

  return next(action);
};
