import { configureStore } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';
import reducer from './data/reducers';
import history from './history';
import {
  analyticsMiddleware,
  sessionMiddleware,
  standardSelectionMiddleware,
  sampleSelectionMiddleware,
  navigationMiddleware,
} from './middleware';
import './types/cypress';

/**
 * Redux Toolkit includes some default middleware (thunk).
 * https://redux-toolkit.js.org/api/getDefaultMiddleware#included-default-middleware
 */

const middleware = [
  routerMiddleware(history),
  analyticsMiddleware,
  navigationMiddleware,
  sessionMiddleware,
  standardSelectionMiddleware,
  sampleSelectionMiddleware,
];

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    // TODO: don't store non-serializable data in redux
    // this is a work-around, non-serializable data should eventually be stored either
    // in an API cache or in a memoized selector cache
    serializableCheck: {
      ignoredActions: [
        'formulation/setFormulationResult',
        'formulation/setFormulationResultData',
        'formulation/setFormulationResultFormula',
        'formulation/setFormulationSettings',
        'correction/setCorrectionResults',
        'correction/setCorrectionResultFormula',
        'common/setWorkingAppearanceSample',
        'common/setWorkingAppearanceSamples',
        'common/setWorkingAppearanceSampleFormula',
        'common/updateFormulaAmountOfWorkingAppearanceSample',
      ],
      ignoredPaths: [
        'formulation.result.formulationResults',
        'formulation.result.searchResults',
        'correction.results',
        'common.workingAppearanceSamples',
      ],
    },
  }).concat(middleware),
});

// Expose the Redux store if we're running in Cypress
if (window.Cypress) {
  window.store = store;
}

export default store;
