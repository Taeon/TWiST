'use strict';

var update = require('react/addons').addons.update;

var State = {
    init: function () {
        if( typeof localStorage.LocalStorage == 'undefined' ){
			localStorage.LocalStorage = JSON.stringify({api_key:null});
        }
        this.state = JSON.parse(localStorage.LocalStorage);
    },

    setState: function (state) {
        this.state = update(this.state, {$merge: state});
		localStorage.LocalStorage = JSON.stringify(this.state);

        this.trigger(this.state);
    }
};


module.exports = State;