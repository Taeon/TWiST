'use strict';

var Reflux = require('reflux'),
    State = require('./ProjectsState'),
    ApplicationStore = require('../Application/ApplicationStore'),
    ProjectsActions = require('./ProjectsActions');

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
    mixins: [State],

    // Constants for marking state of store
    STATE_UNINITIALIZED: STATE_UNINITIALIZED,
    STATE_LOADING: STATE_LOADING,
    STATE_LOADED: STATE_LOADED,
    STATE_ERR: STATE_ERR,

    // Hook up the store to the actions in `actions.js`
    listenables: [ProjectsActions],

    init:function(){
        ApplicationStore.listen(
            function( data ){
                // If we haven't loaded times list yet...
                if(
                    this.getState().status == this.STATE_UNINITIALIZED 
                    &&
                    ApplicationStore.getData().state == ApplicationStore.STATE_LOADED
                ){
                    this.setState( {status:this.STATE_LOADING} );
                    this.teamwork_api = new TeamworkAPI(
                        data.api_key,
                        {
                            base_url:data.user_account.URL
                        }
                    );

                    ProjectsActions.GetProjects();
                }
            }.bind(this)
        );
    },

    getInitialState: function () {
        return {
            status: STATE_UNINITIALIZED,
            projects: []
        };
    },
    getState: function(){
        return this.state;
    },
    GetProject:function( id ){
        for( var i = 0 ; i< this.getState().projects.length; i++ ){
            if( this.getState().projects[ i ].id == id ){
                return this.getState().projects[ i ];
            }
        }
    },

    GetProjects:function(){
        this.teamwork_api.GetProjects().then( this.onGetProjectsCompleted );
    },
    
    /**
     * Connection to Teamwork was successful
     */
    onGetProjectsCompleted:function( data ){
        // Store details
        this.setState(
            {
                status: STATE_LOADED,
                projects: data.projects
            }
        );
    }
});
