const axios = require('axios');

const CANCEL_MESSAGE = 'CANCELED';

let activeRequests = [];

let options = {};

module.exports.setAxiosOptions = (axiosOptions) => {
  options = axiosOptions;
};

module.exports.enhance = (apiActionIdentifier = 'API_CALL', axiosOptions) => {
  options = { ...options, ...axiosOptions };

  return ({ dispatch, getState }) => next => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    const callAPIAction = action[apiActionIdentifier];

    if (typeof callAPIAction === 'undefined' || !callAPIAction.promise) {
      return next(action);
    }

    const { promise, types, promiseOptions = {}, ...rest } = callAPIAction;
    const [REQUEST, SUCCESS, FAILURE] = types;

    next({ ...rest, type: REQUEST });

    const activeRequest = activeRequests.find(request => request.action === REQUEST && request.token === action.token);
    const getStillActiveRequests = () => activeRequests.filter(request => !(request.action === REQUEST && request.token === action.token));

    if (activeRequest) {
      activeRequest.source.cancel(CANCEL_MESSAGE);

      activeRequests = getStillActiveRequests();
    }

    const source = axios.CancelToken.source();

    activeRequests.push({
      action: REQUEST,
      token: action.token,
      source,
    });

    return promise(axios.create({ ...options, ...promiseOptions, cancelToken: source.token }), dispatch)
      .then(
        (result) => {
          activeRequests = getStillActiveRequests();

          return next({ ...rest, result, type: SUCCESS });
        },
        (error) => {
          if (error.message === CANCEL_MESSAGE) {
            return Promise.resolve(error);
          }

          activeRequests = getStillActiveRequests();

          next({ ...rest, error, type: FAILURE });
          return Promise.reject(error);
        },
      );
  };
};
