/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

// externals
var _ = require('lodash');
var async = require('async');
var bodyParser = require('body-parser');
var connect = require('connect');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var url = require('url');

var api = require('eq8-api');
var AnonymousStrategy = require('passport-anonymous').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var WebSocketServer = require('ws').Server;
var RouteRecognizer = require('route-recognizer');
var Rx = require('rx');

function newApi(options) {

	options = _.defaultsDeep(options, {
		jwt: {
			secret: process.env.SECRET,
			sign: {
				algorithm: 'HS256'
			},
			verify: {
				algorithms: ['HS256']
			},
			jwtFromRequest: ExtractJwt.fromAuthHeader(),
			verifyCallback: function verifyCallback(payload, done) {
				return done(null, payload);
			}
		},
		users: {
			anon: {
				roles: ['anon']
			},
			root: {
				roles: ['root']
			}
		},
		handlers: {
			async: function asyncHandler(ws, next) {
				var self = this;

				ws.on('message', function messageHandler(message) {
					try {
						self.state(ws, JSON.parse(message));
					} catch (e) {
						self.logger.error('WebSocket message was not in JSON', message);
						ws.send(JSON.stringify({error: {status: '400', title: 'bad-request'}}));
					}
				});

				next();
			},
			sync: function syncHandler(req, res) {
				var self = this;

				self.logger.debug('syncHandler - req.route:', req.route);

				if (!req.route) {
					return res.end();
				}

				return self.express(req, req.route, function done(err, result) {
					if (err) {
						res.statusCode = 500;
						return res.end();
					}

					self.logger.debug('syncHandler - result:', result);

					if (_.isString(result)) {
						res.write(result);
					}

					return res.end();
				});
			}
		}
	});

	var instance = api(options);

	// INITIALIZATION
	var asyncware = require('./modules/asyncware')(_, async);
	var router = new RouteRecognizer();

	_.assign(instance, {
		asyncware: asyncware,
		syncware: options.syncware || connect(),
		router: router,
		options: {
			jwt: options.jwt,
			users: options.users
		}
	});

	// ASYNCWARES
	var initAsyncUser = require('./asyncwares/init-user.js');
	var initAsyncRoute = require('./asyncwares/init-route.js');
	var asyncHandler = options.handlers.async.bind(instance);

	instance.asyncware.use(initAsyncUser(instance, async, url, jwt));
	instance.asyncware.use(initAsyncRoute(instance));
	instance.asyncware.use(asyncHandler);

	// SYNCWARES
	var initPassport = require('./syncwares/init-passport.js');
	var initSyncUser = passport.authenticate(['jwt', 'anonymous'], {session: false});
	var initAnonymousUser = require('./syncwares/init-anonymous-user.js');
	var initBody = bodyParser.json(options['body-parser']);
	var initSyncRoute = require('./syncwares/init-route.js');
	var syncHandler = options.handlers.sync.bind(instance);

	instance.syncware.use(initPassport(instance, passport, AnonymousStrategy, JwtStrategy));
	instance.syncware.use(initSyncUser);
	instance.syncware.use(initAnonymousUser(instance));
	instance.syncware.use(initBody);
	instance.syncware.use(initSyncRoute(router));
	instance.syncware.use(syncHandler);

	// LISTENERS
	var useAsyncware = require('./listeners/use-asyncware.js');
	var useSyncware = require('./listeners/use-syncware.js');

	instance.chainListener('connection', useAsyncware());
	instance.chainListener('request', useSyncware());

	// REGISTRARS
	var viewRegistrar = require('./registrars/views.js');
	instance.addRegistrar({
		views: viewRegistrar(_, async, Rx)
	});

	// API
	var emitConnectionEvents = require('./listeners/emit-connection-events.js');
	instance.on('listening', emitConnectionEvents(_, WebSocketServer));

	var emitRequestEvents = require('./listeners/emit-request-events.js');
	instance.on('listening', emitRequestEvents());

	var addCloseEvent = require('./listeners/add-close-event.js')(instance);
	instance.on('listening', addCloseEvent);

	instance.close = require('./api/close.js')();

	return instance;
}

module.exports = newApi;
