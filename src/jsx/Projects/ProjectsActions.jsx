'use strict';

var Reflux = require('reflux');

// Create a Reflux actions object with basic actions for reloading posts
// and deleting a post
var Actions = Reflux.createActions({
    'GetProjects':{children:["completed","failed"],asyncResult:true},
});

// Export the actions
module.exports = Actions;