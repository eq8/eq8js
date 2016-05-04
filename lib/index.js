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
var http = require('http');
var express = require('express');
var jwt = require('jsonwebtoken');
var util = require('util');
var url = require('url');
var winston = require('winston');

var EventEmitter = require('events');
var WebSocketServer = require('ws').Server;
var Logger = winston.Logger;

function Api(options) {
	var api = this;
	EventEmitter.call(api);

	var observers = bloomrun();

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
		logger: {
			levels: {
				trace: 0,
				debug: 1,
				info: 2,
				warn: 3,
				error: 4
			},
			colors: {
				trace: 'magenta',
				debug: 'blue',
				info: 'green',
				warn: 'yellow',
				error: 'red'
			},
			transports: [
				new (winston.transports.Console)({
					level: process.env.LOG_LEVEL || 'info',
					colorize: true
				})
			]
		},
		on: {
			initialized: [],
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
		}
	});

	// INITIALIZATION
	_.assign(api, {
		_observers: observers,
		express: options.express || express(),
		listeners: {},
		jwt: options.jwt,
		logger: new Logger(options.logger),
		users: options.users
	});

	// DEFAULT LISTENERS
	var defaultRegistrars = {
		actions: require('./registrars/actions')(_, async)
	};

	var logIfError = _.cond([
		[_.isError, api.logger.error],
		[_.constant(true), _.noop]
	]);

	api.addRegistrar(defaultRegistrars, logIfError);

	var verifyToken = require('./verify-token')(
		url, jwt, options.jwt.secret, options.jwt.verify
	);

	api.setDefaultListener('connection', verifyToken);
	api.setDefaultListener('message', require('./add-message-context')(_));
	api.setDefaultListener('initialized', initialized);

	// CUSTOM LISTENERS
	api.addRegistrar(options.registrars || {});

	var addConnectionHooks = _.bind(api.setDefaultListener, api, 'connection');
	_.each(options.on.connection, addConnectionHooks);

	var addMessageHooks = _.bind(api.setDefaultListener, api, 'message');
	_.each(options.on.message, addMessageHooks);

	var addInitHooks = _.bind(api.setDefaultListener, api, 'initialized');
	_.each(options.on.initialized, addInitHooks);

	// GENERATE EVENTS
	api.emit('initialized', api);
}
util.inherits(Api, EventEmitter);

function initialized(api) {
	api.logger.info('initialized');
}

// API
Api.prototype.addRegistrar = require('./api/add-registrar')(_, async);

Api.prototype.setDefaultListener = require('./api/set-default-listener')(_);

Api.prototype.act = require('./api/act')(_, async);

Api.prototype.listen = require('./api/listen')(_, async, http, WebSocketServer);

Api.prototype.register = require('./api/register')(_, async);

module.exports = Api;
