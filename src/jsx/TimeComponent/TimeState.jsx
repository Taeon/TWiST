'use strict';

var update = require('react/addons').addons.update;

// Some constants for determining state; will be exported on store too
var 
    STATE_UNINITIALIZED = 'uninitialized',
    STATE_LOADING = 'loading',
    STATE_OK = 'ok',
    STATE_ERR = 'err';

var State = {
    // Constants for marking state of store
    STATE_UNINITIALIZED: STATE_UNINITIALIZED,
    STATE_LOADING: STATE_LOADING,
    STATE_OK: STATE_OK,
    STATE_ERR: STATE_ERR,

    /**
     * Set up the initial data structures
     */
    init: function () {
        this.state = {
            status: STATE_UNINITIALIZED,
            times: [],
            current_timed_task: null,
            current_timer_start_time: null,
            show_add_form: false
        };
    },

    /**
     * Update the state -- merge values
     */
    setState: function (state) {
        this.state = update(this.state, {$merge: state});
        this.trigger(this.state);
    }
};


module.exports = State;