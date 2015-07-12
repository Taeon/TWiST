'use strict';

var Reflux = require('reflux'),
    LocalStorageState = require('./LocalStorageState'),
    LocalStorageActions = require('./LocalStorageActions');

// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [LocalStorageState],

    listenables: [LocalStorageActions],
    
    getInitialState: function () {
        return LocalStorageState;
    },
    getData: function(){
        return this.state;
    },
    SetAPIKey:function( api_key ){
        this.setState(
            {
                api_key:api_key
            }
        );
    },
    ClearAPIKey:function( api_key ){
        this.setState(
            {
                api_key:null
            }
        );
    },
    Set:function( key, value ){
        var data = {};
        data[ key ] = value;
        this.setState( data );
    },
    Delete:function( key ){
        var data = {};
        data[ key ] = null;
        this.setState( data );
    }
    
});
