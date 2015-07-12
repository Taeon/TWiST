'use strict';

var Reflux = require('reflux');

// Create a Reflux actions object with basic actions for reloading posts
// and deleting a post
var actions = Reflux.createActions([
    'FormSubmit'
]);

// Export the actions
module.exports = actions;