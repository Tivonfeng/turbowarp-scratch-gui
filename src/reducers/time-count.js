const UPDATE_TIME = 'scratch-gui/time-count/UPDATE_TIME';

const initialState = 0;

const reducer = function (state = initialState, action) {
    switch (action.type) {
    case UPDATE_TIME:
        return action.time;
    default:
        return state;
    }
};

const updateTime = function (time) {
    return {
        type: UPDATE_TIME,
        time: time
    };
};

export {
    reducer as default,
    initialState as timeCountInitialState,
    updateTime
};
