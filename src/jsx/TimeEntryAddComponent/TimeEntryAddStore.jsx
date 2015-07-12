'use strict';

var Reflux = require('reflux'),
    TimeEntryAddState = require('./TimeEntryAddState'),
    TimeEntryAddActions = require('./TimeEntryAddActions'),
    ApplicationActions = require('../Application/ApplicationActions'),
    ApplicationStore = require('../Application/ApplicationStore');

var moment   = require('moment');

// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [TimeEntryAddState,Reflux.ListenerMixin],

    listenables: TimeEntryAddActions,

    getInitialState: function() {
        return {
            show: false
        };
    },
    getState:function(){
        return this.state;
    },
    ShowForm:function(){
        this.setState( {show:true} );
    },
    HideForm:function(){
        this.setState( {show:false} );
    }

});