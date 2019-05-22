import { Intl } from 'redux-intl';

import '../src/initializer/intlPolyfill';
import '../src/initializer';
import { configureStore } from './intlStore';

// @replace-import-on-dev-start-begin
// @replace-import-on-dev-start-end

const store = configureStore();
Intl.setStore(store);

export default [
  // @replace-registered-on-dev-start-begin
  // @replace-registered-on-dev-start-end
];
