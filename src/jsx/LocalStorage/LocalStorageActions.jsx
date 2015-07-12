'use strict';

var Reflux = require('reflux');

var Actions = Reflux.createActions([
    'SetAPIKey',
    'ClearAPIKey',
    'Set',
    'Delete'
]);

// Export the actions
module.exports = Actions;