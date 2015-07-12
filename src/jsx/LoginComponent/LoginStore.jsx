'use strict';

var Reflux = require('reflux'),
    State = require('./LoginState');
    
// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [State],

    getInitialState: function () {
        return {};
    },

    // Add some getters
    getData: function(){
        return store;
    }
});