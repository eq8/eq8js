'use strict';

var Api = require('../index.js');

var api = new Api();

var express = require('express');

var app = api.express;
app.use(express.static('public'));
api.register({
	actions: [{
		name: 'hello world',
		description: 'should echo back inside data',
		pattern: {hello: 'world'},
		handler: function(args, ctxt) {
			console.log('args:', args);
			console.log('ctxt:', JSON.stringify(ctxt, null, '\t'));
			ctxt.res.write(args);
		}
	}, {
		pattern: {error: true},
		name: 'error true',
		description: 'should echo back inside error',
		handler: function(args, ctxt) {
			console.log('args:', args);
			console.log('ctxt:', JSON.stringify(ctxt, null, '\t'));
			ctxt.res.error(args);
		}
	}]
});

api.listen(8080);
