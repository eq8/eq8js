/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

// externals
var _ = require('lodash');
var async = require('async');
var bloomrun = require('bloomrun');
var bodyParser = require('body-parser');
var express = require('express');
var jwt = require('jsonwebtoken');
var util = require('util');
var url = require('url');

var Core = require('eq8-core');
var WebSocketServer = require('ws').Server;

function Api(options) {
	var api = this;

	var actions = bloomrun();
	var views = bloomrun();

	options = _.defaultsDeep(options, {
		jwt: {
			secret: 'secret',
			sign: {
				algorithm: 'HS256'
			},
			verify: {
				algorithms: ['HS256']
			}
		},
		on: {
			connection: [],
			message: [],
			request: []
		},
		users: {
			anon: {
				roles: ['anon']
			},
			root: {
				roles: ['root']
			}
		},
		registrars: {
			actions: require('./registrars/actions')(_, async),
			views: require('./registrars/views')(_, async)
		}
	});

	// INITIALIZATION
	_.assign(api, {
		actions: actions,
		views: views,
		express: options.express || express(),
		options: {
			jwt: options.jwt,
			users: options.users
		}
	});

	api.express.use(bodyParser.json(options['body-parser']));

	// DEFAULT LISTENERS
	api.chainListener('connection', require('./verify-token')(url, jwt));
	api.chainListener('message', require('./add-message-context')(_));
	api.chainListener('request', require('./add-request-context')());

	// CUSTOM LISTENERS
	var addConnectionHooks = _.bind(api.chainListener, api, 'connection');
	_.each(options.on.connection, addConnectionHooks);

	var addMessageHooks = _.bind(api.chainListener, api, 'message');
	_.each(options.on.message, addMessageHooks);

	var addRequestHooks = _.bind(api.chainListener, api, 'request');
	_.each(options.on.request, addRequestHooks);

	Core.call(api, options);
}
util.inherits(Api, Core);

// API

Api.prototype.act = require('./api/act')(_, async);

Api.prototype.setDefaultListener = Core.prototype.chainListener;

Api.prototype.listen = require('./api/listen')(_, Core, WebSocketServer);

Api.prototype.view = require('./api/view')(_, async);

module.exports = Api;
