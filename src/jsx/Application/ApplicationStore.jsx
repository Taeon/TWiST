'use strict';

var Reflux = require('reflux'),
    State = require('./ApplicationState'),
    ApplicationActions = require('./ApplicationActions'),
    LocalStorageActions = require( '../LocalStorage/LocalStorageActions' ),
    LocalStorageStore = require( '../LocalStorage/LocalStorageStore' );

var LocalStorageMixin = require('react-localstorage');
    
var TeamworkAPI = require('../../../bower_components/teamwork-api/src/teamwork-api');

// Some constants for determining state; will be exported on store too
var
    STATE_UNINITIALIZED = 'uninitialized',
    STATE_LOADING = 'loading',
    STATE_LOADED = 'loaded',
    STATE_ERR = 'err'
;

// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [State/*,LocalStorageMixin*/],

    // Constants for marking state of store
    STATE_UNINITIALIZED: STATE_UNINITIALIZED,
    STATE_LOADING: STATE_LOADING,
    STATE_LOADED: STATE_LOADED,
    STATE_ERR: STATE_ERR,

    // Hook up the store to the actions in `actions.js`
    listenables: [ApplicationActions],

    getInitialState: function () {
        var base_state = this._getBaseState();
        if( LocalStorageStore.getData().api_key != null ){
            ApplicationActions.SetAPIKey( LocalStorageStore.getData().api_key );
            base_state.state = STATE_LOADING;
            base_state.api_key = LocalStorageStore.getData().api_key;
        }
        return base_state;
    },
    getData: function(){
        return this.state;
    },
    
    /**
     * Connection to Teamwork was successful
     */
    onSetAPIKeyCompleted:function( api_key, account ){
        // Store details
        this.setState(
            {
                state: STATE_LOADED,
                api_key: api_key,
                user_account: account
            }
        );
        // Store API key for next time
        LocalStorageActions.SetAPIKey( api_key );
        ApplicationActions.SetTeamworkURL( account.URL );
//        ApplicationActions.SetTeamworkDeskURL( account.URL + 'desk/' );
    },

    _getBaseState:function(){
        var base_state = {
            state: STATE_UNINITIALIZED,
            user_account: null,
            account: null,
            api_key: null,
            currently_showing: 'twist',
            current_teamwork_url: null,
            current_teamwork_desk_url: null
        };
        // Return a copy, not the original object
        return JSON.parse( JSON.stringify( base_state ) );
    },

    SwitchToTwist:function(){
        this.setState( {currently_showing:'twist'} );
    },
    SwitchToTeamwork:function( url ){
        this.setState( {currently_showing:'teamwork'} );
        if( typeof url != 'undefined' ){
            ApplicationActions.SetTeamworkURL( this.getData().user_account.URL + url );
        }
    },
    SetTeamworkURL:function( url ){
        this.setState( { current_teamwork_url: url } );
    },
    // SwitchToTeamworkDesk:function( url ){
    //     this.setState( {currently_showing:'teamwork-desk'} );
    //     if( typeof url != 'undefined' ){
    //         ApplicationActions.SetTeamworkDeskURL( this.getData().user_account.URL + url );
    //     }
    // },
    // SetTeamworkDeskURL:function( url ){
    //     this.setState( { current_teamwork_desk_url: url } );
    // },
    onLogout:function(){
        LocalStorageActions.ClearAPIKey();
        this.setState( this._getBaseState() );
    }
});
