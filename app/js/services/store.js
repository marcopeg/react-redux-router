
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { devTools, persistState } from 'redux-devtools';

import { routerStateReducer } from 'redux-react-router';
import settingsReducer from 'reducers/settings';

var _store;

const appReducer = combineReducers({
    router: routerStateReducer,
    settings: settingsReducer,
});

export function initStore(initialState) {

    // dynamically generate store creator for debug panel support
    var finalCreateStore;
    if (initialState.settings.debugPanel) {
        finalCreateStore = compose(
            applyMiddleware(thunkMiddleware),
            devTools(),
            persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
            createStore
        );
    } else {
        finalCreateStore = compose(
            applyMiddleware(thunkMiddleware),
            createStore
        );
    }

    _store = finalCreateStore(appReducer, initialState);
    return _store;
}

export function getStore() {
    return _store;
}
