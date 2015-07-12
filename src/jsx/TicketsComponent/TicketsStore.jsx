'use strict';

var Reflux = require('reflux'),
    TicketsState = require('./TicketsState'),
    TicketsActions = require('./TicketsActions'),
    ApplicationActions = require('../Application/ApplicationActions'),
    ApplicationStore = require('../Application/ApplicationStore');

// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [TicketsState,Reflux.ListenerMixin],

    listenables: TicketsActions,

    init:function(){
        ApplicationStore.listen(
            function( data ){
                if(
                    this.getState().status == this.STATE_UNINITIALIZED 
                    &&
                    ApplicationStore.getData().state == ApplicationStore.STATE_LOADED
                ){
                    this.setState( {status:this.STATE_LOADING} );
                    this.UpdateTickets();
                }
            }.bind(this)
        );
        setInterval( this.UpdateTickets.bind( this ), 30000 );
    },
    UpdateTickets:function() {
        ApplicationActions.GetTicketsMine(
            {
                 "assignedTo[]":ApplicationStore.getData().user_account.userId,
                 'statuses[]':'Active'
            }
        ).then(
            function( data ){
                this.setState(
                    {
                        status: this.STATE_OK,
                        tickets_mine: data[ 'tickets' ]
                    } 
                );
            }.bind(this)
        )
        ApplicationActions.GetTicketsUnassigned(
            {
                 "assignedTo[]":'-1',
                 'statuses[]':'Active'
            }
        ).then(
            function( data ){
                this.setState(
                    {
                        status: this.STATE_OK,
                        tickets_unassigned: data[ 'tickets' ]
                    } 
                );
            }.bind(this)
        )
    },
    SetCurrentlyShowing:function( type ){
        this.setState( { currently_showing: type } );
    },

    getState: function(){
        return this.state;
    }
});