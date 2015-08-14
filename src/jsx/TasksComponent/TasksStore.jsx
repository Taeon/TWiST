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
        ApplicationStore.getData().teamwork_api.GetTasks(
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
                for( var i = 0; i < this.state.tasks.length; i++ ){
                    var task = this.state.tasks[ i ];
                    ApplicationStore.getData().teamwork_api.GetTimeEntriesForTask( task.id ).then(
                        function( data ){
                            var returned_task = data.projects[ 0 ].tasklist.task;
                            var task = this.state.tasks.filter(function(task){if(task.id == returned_task.id){return task}})[0];
                            task.time_totals = returned_task[ 'time-totals' ];
                            this.setState({tasks:this.state.tasks});
                        }.bind(this)
                    );
                }
            }.bind(this)
        )
    },

    getState: function(){
        return this.state;
    }
});