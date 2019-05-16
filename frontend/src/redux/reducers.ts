/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { LocationChangeAction, RouterState } from 'connected-react-router';
import { combineReducers, Reducer } from 'redux';

import { reducer as auditResults } from './auditResults';
import { reducer as lead } from './lead';
import { reducer as login } from './login';
import { reducer as projects } from './projects';
import { RootAction, RootState } from './types';
import { reducer as user } from './user';

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers: {
  router: Reducer<RouterState, LocationChangeAction>;
}) {
  return combineReducers<RootState, RootAction>({
    ...asyncReducers,
    lead,
    login,
    projects,
    auditResults,
    user,
  });
}
