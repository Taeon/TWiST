'use strict';

var Reflux = require('reflux');

// Create a Reflux actions object with basic actions for reloading posts
// and deleting a post
var actions = Reflux.createActions({
    'SetTickets':{},
    'ClaimTicket':{children:["completed","failed"],asyncResult:true},    	
    'GetTicket':{children:["completed","failed"],asyncResult:true},    	
    'SetCurrentlyShowing':{}
});

// Export the actions
module.exports = actions;