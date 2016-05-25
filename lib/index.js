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
var seneca = require('seneca');
var util = require('util');
var url = require('url');
var winston = require('winston');

var EventEmitter = require('events');
var WebSocketServer = require('ws').Server;
var Logger = winston.Logger;

function Api(options) {
	var api = this;
	EventEmitter.call(api);

	var actions = bloomrun();

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
				trace: 5,
				debug: 4,
				info: 3,
				warn: 2,
				error: 1,
				fatal: 0
			},
			colors: {
				trace: 'grey',
				debug: 'blue',
				info: 'green',
				warn: 'yellow',
				error: 'red',
				fatal: 'magenta'
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
			message: [],
			trigger: [],
			search: []
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
	var logger = new Logger(options.logger);
	var senecaLogLevel = (process.env.LOG_LEVEL === 'trace')
		? 'debug'
		: (process.env.LOG_LEVEL || 'info');

	_.assign(api, {
		actions: actions,
		express: options.express || express(),
		seneca: options.seneca || seneca({
			log: {
				map: [
					{
						level: senecaLogLevel,
						handler: function() {
							logger.log(arguments[2], Array.prototype.join.call(arguments, '\t'));
						}
					}
				]
			}
		}),
		listeners: {},
		jwt: options.jwt,
		logger: logger,
		users: options.users
	});

	// DEFAULT LISTENERS
	var defaultRegistrars = {
		events: require('./registrars/events')(_, async),
		actions: require('./registrars/actions')(_, async)
	};

	var resumeInit = _.partial(_resumeInit, api, options);

	api.addRegistrar(defaultRegistrars, resumeInit);
}
util.inherits(Api, EventEmitter);

function _resumeInit(api, options, error) {
	if (error) {
		return api.logger.error(error);
	}

	var verifyToken = require('./verify-token')(
		url, jwt, options.jwt.secret, options.jwt.verify
	);

	api.setDefaultListener('connection', verifyToken);
	api.setDefaultListener('message', require('./add-message-context')(_));
	api.setDefaultListener('trigger', require('./trigger-handler')());
	api.setDefaultListener('initialized', initialized);

	// CUSTOM LISTENERS
	api.addRegistrar(options.registrars || {});

	var addConnectionHooks = _.bind(api.setDefaultListener, api, 'connection');
	_.each(options.on.connection, addConnectionHooks);

	var addMessageHooks = _.bind(api.setDefaultListener, api, 'message');
	_.each(options.on.message, addMessageHooks);

	var addSearchHooks = _.bind(api.setDefaultListener, api, 'search');
	_.each(options.on.search, addSearchHooks);

	var addTriggerHooks = _.bind(api.setDefaultListener, api, 'trigger');
	_.each(options.on.trigger, addTriggerHooks);

	var addInitHooks = _.bind(api.setDefaultListener, api, 'initialized');
	_.each(options.on.initialized, addInitHooks);

	// GENERATE EVENTS
	return api.emit('initialized', api);
}

function initialized(api) {
	api.logger.info('initialized');
}

// API
Api.prototype.addRegistrar = require('./api/add-registrar')(_, async);

Api.prototype.setDefaultListener = require('./api/set-default-listener')(_);

Api.prototype.act = require('./api/act')(_, async);

Api.prototype.listen = require('./api/listen')(_, http, WebSocketServer);

Api.prototype.register = require('./api/register')(_, async);

Api.prototype.trigger = require('./api/trigger')();

Api.prototype.search = require('./api/search')();

module.exports = Api;
