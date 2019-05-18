import { Intl } from 'redux-intl';
import createHistory from 'history/createBrowserHistory';

import '../src/initializer/intlPolyfill';
import '../src/initializer';
import { configureStore } from '../src/state/createStore';

// @replace-import-on-dev-start-begin
// @replace-import-on-dev-start-end

const history = createHistory();

const store = configureStore(undefined, history);
Intl.setStore(store);

export default [
  // @replace-registered-on-dev-start-begin
  // @replace-registered-on-dev-start-end
];
