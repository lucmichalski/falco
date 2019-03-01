import { all } from 'redux-saga/effects';

import { sagas as auditResultsSagas } from 'redux/auditResults';
import { sagas as loginSagas } from 'redux/Login';
import { sagas as projectsSagas } from 'redux/projects';

// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([loginSagas(), projectsSagas(), auditResultsSagas()]);
}
