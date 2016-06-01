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
var express = require('express');
var jwt = require('jsonwebtoken');
var util = require('util');
var url = require('url');

var Core = require('eq8-core');
var RouteRecognizer = require('route-recognizer');
var WebSocketServer = require('ws').Server;

function Api(options) {
	var api = this;

	var actions = bloomrun();
	var views = new RouteRecognizer();

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
			message: []
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
		jwt: options.jwt,
		users: options.users
	});

	var verifyToken = require('./verify-token')(
		url, jwt, options.jwt.secret, options.jwt.verify
	);

	api.chainListener('connection', verifyToken);
	api.chainListener('message', require('./add-message-context')(_));

	// CUSTOM LISTENERS
	var addConnectionHooks = _.bind(api.chainListener, api, 'connection');
	_.each(options.on.connection, addConnectionHooks);

	var addMessageHooks = _.bind(api.chainListener, api, 'message');
	_.each(options.on.message, addMessageHooks);

	Core.call(api, options);
}
util.inherits(Api, Core);

// API

Api.prototype.act = require('./api/act')(_, async);

Api.prototype.listen = require('./api/listen')(_, Core, WebSocketServer);

Api.prototype.view = require('./api/view')(_, async);

module.exports = Api;
