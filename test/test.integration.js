'use strict';

var _ = require('lodash');
var async = require('async');
var test = require('tape');
var request = require('request');

var WebSocket = require('ws');

var api = require('../lib/index.js')({jwt: {secret: 'secret'}});
var state = 'unchanged';
var server = {
	hostname: 'localhost',
	port: 3000
};
var baseUrl = 'http://' + server.hostname + ':' + server.port;

api.listen(server.port);

test('integration: handling', function(t) {
	api.register({
		actions: [
			{
				name: 'Test Action Fixture',
				pattern: {ns: 'test', cmd: 'integration', param: 'action'},
				handler: function(ctxt, args) {
					t.ok(args);
					t.equal(args.cmd, 'integration');
					t.equal(args.param, 'action');
					t.ok(args.cond);

					switch (args.cond) {
					case 'state-change':
						state = 'changed';
						break;
					case 'with-invalid-view':
						console.log('ctxt.route:', ctxt.route);
						break;
					case 'with-valid-view':
						t.deepEqual(ctxt.route, {
							uri: '/test/:cmd/:param/:cond',
							cmd: 'integration',
							param: 'view',
							cond: 'default'
						});
						break;
					case 'with-user':
						t.ok(ctxt && ctxt.user && ctxt.user.roles);
						t.deepEqual(ctxt.user.roles, ['role']);
						break;
					default:
						t.equal(args.cond, 'default');
						t.ok(ctxt && ctxt.user && ctxt.user.roles);
						t.ok(_.difference(ctxt.user.roles, ['anon']));
						break;
					}

					ctxt.close();
				}
			}
		],
		views: [
			{
				name: 'Test View Fixture',
				pattern: {
					uri: '/test/:cmd/:param/:cond',
					cmd: 'integration',
					param: 'view'
				},
				handler: function(ctxt, args, done) {
					var error;

					t.ok(args);
					t.equal(args.cmd, 'integration');
					t.equal(args.param, 'view');
					t.ok(args.cond);

					switch (args.cond) {
					case 'state-change':
						t.equal(state, 'changed');
						break;
					case 'error':
						error = '500';
						break;
					case 'with-user':
						t.ok(ctxt && ctxt.user && ctxt.user.roles);
						t.deepEqual(ctxt.user.roles, ['role']);
						break;
					default:
						t.ok(ctxt && ctxt.user && ctxt.user.roles);
						t.ok(_.difference(ctxt.user.roles, ['anon']));
						break;
					}

					if (args.cond === 'state-change') {
						return done(error, state);
					}

					return done(error);
				}
			},
		]
	});

	async.parallel([
		// --------------- ACTIONS ---------------
		function(done) {
			var url = 'http://localhost:3000/?token=' +
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
				'eyJyb2xlcyI6WyJyb2xlIl19.' +
				'86MHotEkGyt5NgBD_LcTBLOmOHodlzKk6ukpKyd8gBI';
			var ws = new WebSocket(url);

			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action", "cond": "with-user"}');
			});

			ws.on('close', function() {
				done();
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000/?token=invalid-token');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action", "cond": "default"}');
			});

			ws.on('close', function() {
				done();
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action", "cond": "default"}');
			});

			ws.on('close', function() {
				done();
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000/test/integration/view/default');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action", "cond": "with-valid-view"}');
			});

			ws.on('close', function() {
				done();
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000/invalid-view');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action", "cond": "with-invalid-view"}');
			});

			ws.on('close', function() {
				done();
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000');
			ws.on('open', function() {
				ws.send('invalid-json-object');
			});

			ws.on('message', function(msg) {
				t.equal(msg, '{"error":{"status":"400","title":"bad-request"}}');
				ws.close();
				done();
			});
		},
		// --------------- VIEWS ---------------
		function(done) {
			request(baseUrl + '/test/integration/view/default', function(error) {
				t.ok(!error);
				done();
			});
		},
		function(done) {
			request(baseUrl + '/test/integration/view/error', function(error, res) {
				t.equal(res.statusCode, 500);
				done();
			});
		},
		function(done) {
			request(baseUrl + '/invalid-view', function(error) {
				t.ok(!error);
				done();
			});
		},
		function(done) {
			request({
				url: baseUrl + '/test/integration/view/with-user',
				headers: {
					'Authorization': 'JWT ' +
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
						'eyJyb2xlcyI6WyJyb2xlIl19.' +
						'86MHotEkGyt5NgBD_LcTBLOmOHodlzKk6ukpKyd8gBI'
				}
			}, function(error) {
				t.ok(!error);
				done();
			});
		},
		function(done) {
			async.series([
				function(resume) {
					var ws = new WebSocket('http://localhost:3000/?token=invalid-token');
					ws.on('open', function() {
						ws.send('{"ns": "test", "cmd": "integration", "param": "action", "cond": "state-change"}');
					});

					ws.on('close', function() {
						resume();
					});
				},
				function(resume) {
					request(baseUrl + '/test/integration/view/state-change', function(error, res, body) {
						t.ok(!error);
						t.equal(body, 'changed');
						resume();
					});
				}
			], done);
		}
	], function() {
		api.close();
		t.end();
	});
});
