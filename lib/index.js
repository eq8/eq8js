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
var connect = require('connect');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var util = require('util');
var url = require('url');

var Core = require('eq8-core');
var AnonymousStrategy = require('passport-anonymous').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var WebSocketServer = require('ws').Server;
var Joi = require('joi');

function Api(options) {
	var api = this;

	var actions = bloomrun();
	var views = bloomrun({indexing: 'depth'});

	options = _.defaultsDeep(options, {
		jwt: {
			secret: 'secret',
			sign: {
				algorithm: 'HS256'
			},
			verify: {
				algorithms: ['HS256']
			},
			jwtFromRequest: ExtractJwt.fromAuthHeader()
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
		// passed to eq8-core
		registrars: {
			actions: require('./registrars/actions')(_, async, Joi),
			views: require('./registrars/views')(_, async, passport, Joi)
		}
	});

	// TODO: validate options

	// INITIALIZATION
	_.assign(api, {
		actions: actions,
		views: views,
		middleware: options.middleware || connect(),
		options: {
			jwt: options.jwt,
			users: options.users,
			views: options.views
		}
	});

	// MIDDLEWARES
	var initPassport = require('./middlewares/init-passport.js');
	var initAnonymousUser = require('./middlewares/init-anonymous-user.js');

	api.middleware.use(initPassport(api, passport, AnonymousStrategy, JwtStrategy));
	api.middleware.use(initAnonymousUser(api));
	api.middleware.use(bodyParser.json(options['body-parser']));

	// DEFAULT LISTENERS
	var verifyToken = require('./listeners/verify-token');
	var addMessageContext = require('./listeners/add-message-context');
	var addRequestContext = require('./listeners/add-request-context');

	api.chainListener('connection', verifyToken(url, jwt));
	api.chainListener('message', addMessageContext());
	api.chainListener('request', addRequestContext());

	// CUSTOM LISTENERS
	var addConnectionHooks = api.chainListener.bind(api, 'connection');
	_.each(options.on.connection, addConnectionHooks);

	var addMessageHooks = api.chainListener.bind(api, 'message');
	_.each(options.on.message, addMessageHooks);

	var addRequestHooks = api.chainListener.bind(api, 'request');
	_.each(options.on.request, addRequestHooks);

	Core.call(api, options);
}
util.inherits(Api, Core);

// API

Api.prototype.act = require('./api/act')(_, async);
Api.prototype.view = require('./api/view')(_);

Api.prototype.listen = require('./api/listen')(_, Core, WebSocketServer);
Api.prototype.close = require('./api/close')();

function newApi(options) {
	return new Api(options);
}

module.exports = newApi;
