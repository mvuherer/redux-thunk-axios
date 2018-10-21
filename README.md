# redux-thunk-axios

> Enhance your Thunk middleware with Axios controls over API requests.

[![Build Status](https://travis-ci.org/mvuherer/redux-thunk-axios.svg?branch=master)](https://travis-ci.org/mvuherer/redux-thunk-axios)

## What it is for?

Controls action/payload dispatching, API request cancelation and lowers the amount of code required for redux action definition.

## Install

```
$ npm install --save redux-thunk-axios
```


## Basic usage examples

```js
// Redux store definition
import thunk from 'redux-thunk';
import { enhance, setAxiosOptions } from 'redux-thunk-axios';
import { createStore, applyMiddleware } from 'redux';

import { actions } from './constants';
import { reducers } from './store';

setAxiosOptions({ headers: { 'X-Custom-Header': 'example' } });

const store = createStore(reducers, applyMiddleware(thunk, enhance(actions.API_CALL)));
```

```js
// Redux Thunk action definition
import { actions } from './constants';

export default {
    actionWithoutPromise: data => ({
        type: actions.EXAMPLE_ACTION_1,
        data
    }),

    basicActionWithPromise: data => ({
        [actions.API_CALL]: {
            types: [
                // Order: request, success, failure must be obayed
                actions.EXAMPLE_GET_REQUEST,
                actions.EXAMPLE_GET_SUCCESS,
                actions.EXAMPLE_GET_FAILURE,
            ],
            promise: client => client.get('/api/example', { params: data })),
        },
    }),

    actionWithPromiseAndAdditionData: data => ({
        [actions.API_CALL]: {
            types: [
                actions.EXAMPLE_GET_REQUEST,
                actions.EXAMPLE_GET_SUCCESS,
                actions.EXAMPLE_GET_FAILURE,
            ],
            promise: client => client.get('/api/example', { params: data })),
            example1: 'this is the additional data example',
            example2: data,
        },
    }),

    actionWithPromiseAndAxiosOptions: data => ({
        [actions.API_CALL]: {
            types: [
                actions.EXAMPLE_GET_REQUEST,
                actions.EXAMPLE_GET_SUCCESS,
                actions.EXAMPLE_GET_FAILURE,
            ],
            promise: client => client.get('/api/example', { params: data })),
            promiseOptions: {
                headers: {'X-Custom-Header': 'foobar'},
            },
        },
    }),

    actionWithPromiseAndUniqueRequestIdentifier: data => ({
        [actions.API_CALL]: {
            types: [
                actions.EXAMPLE_GET_REQUEST,
                actions.EXAMPLE_GET_SUCCESS,
                actions.EXAMPLE_GET_FAILURE,
            ],
            promise: client => client.get('/api/example', { params: data })),
            // When action is invoked multiple time each previous request gets cancelled
            // If we require to invoke the action multiple times without them canceling each other we pass a unique token identifier
            token: data.id,
        },
    }),
};
```

```js
// Actions constants definition
export default {
    API_CALL: 'API_CALL',

    EXAMPLE_ACTION_1: 'EXAMPLE_ACTION_1',

    EXAMPLE_GET_REQUEST: 'EXAMPLE_GET_REQUEST',
    EXAMPLE_GET_SUCCESS: 'EXAMPLE_GET_SUCCESS',
    EXAMPLE_GET_FAILURE: 'EXAMPLE_GET_FAILURE',
};
```


## API
**enhance(apiActionIdentifier [, axiosOptions])**

Initializes the middleware.

**setAxiosOptions(axiosOptions)**

Set persistent Axios options.