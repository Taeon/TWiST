'use strict';

var Reflux = require('reflux'),
    TasksState = require('./TasksState'),
    TasksActions = require('./TasksActions');

var ApplicationActions = require( '../Application/ApplicationActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [TasksState,Reflux.ListenerMixin],

    listenables: TasksActions,

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
                    this.UpdateTasks();
                }
            }.bind(this)
        );
    },
    UpdateTasks:function() {
        ApplicationActions.GetTasks(
            {
                 "responsible-party-ids":ApplicationStore.getData().user_account.userId,
                 'sort': 'dateadded'
            }
        ).then(
            function( data ){
                this.setState( 
                    {
                        status: this.STATE_OK,
                        tasks: data[ 'todo-items' ],
                        tasks_checked: []
                    } 
                );
            }.bind(this)
        )
    },

    getState: function(){
        return this.state;
    }
});