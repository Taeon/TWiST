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
    /**
     * Used when creating a new task for a ticket, to get 
     *
     * @param       string      email
     * @param       int         project_id
     */
    SetEmailToProjectLookup:function( email, project_id ){
        var lookup = this.Get( 'email_project_id_lookup' );
        if( typeof lookup == 'undefined' ){
            lookup = {};
        }
        lookup[email] = project_id;
        this.Set( 'email_project_id_lookup', lookup );
    },
    GetEmailToProjectLookup:function( email ){
        var lookup = this.Get( 'email_project_id_lookup' );
        if( typeof lookup != 'undefined' ){
            if( typeof lookup[ email ] != 'undefined' ){
                return lookup[ email ];
            }
        }
        return null;
    },
    Get:function( key ){
        return this.getData()[ key ];
    },
    /**
     * Set an arbitrary value
     *
     * @param       string      key
     * @param       mixed       value
     */
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
