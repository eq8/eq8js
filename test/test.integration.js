'use strict';

var _ = require('lodash');
var async = require('async');
var test = require('tape');
var http = require('http');

var WebSocket = require('ws');

var api = require('../lib/index.js')({jwt: {secret: 'secret'}});
var state = 'unchanged';

test('integration', function(t) {
	api.register({
		actions: [
			{
				name: 'Integration Test Action w/ User',
				pattern: {ns: 'test', cmd: 'integration', param: 'action-with-user'},
				handler: function(ctxt, args) {
					t.deepEqual(args, {ns: 'test', cmd: 'integration', param: 'action-with-user'});
					t.ok(ctxt && ctxt.user && ctxt.user.roles);
					t.ok(_.difference(ctxt.user.roles, ['state', 'express']));

					ctxt.send('resume');
				}
			},
			{
				name: 'Integration Test Action w/ Invalid User',
				pattern: {ns: 'test', cmd: 'integration', param: 'action-with-invalid-user'},
				handler: function(ctxt, args) {
					t.deepEqual(args, {ns: 'test', cmd: 'integration', param: 'action-with-invalid-user'});
					t.ok(ctxt && ctxt.user && ctxt.user.roles);
					t.ok(_.difference(ctxt.user.roles, ['anon']));

					ctxt.send('resume-again');
				}
			},
			{
				name: 'Integration Test Action w/o User',
				pattern: {ns: 'test', cmd: 'integration', param: 'action-without-user'},
				handler: function(ctxt, args) {
					t.deepEqual(args, {ns: 'test', cmd: 'integration', param: 'action-without-user'});
					t.ok(ctxt && ctxt.user && ctxt.user.roles);
					t.ok(_.difference(ctxt.user.roles, ['anon']));

					state = 'changed';
					ctxt.send(state);
				}
			}
		],
		views: [
			{
				name: 'Integration Test View',
				pattern: {
					uri: '/test/:cmd/:param',
					cmd: 'integration'
				},
				handler: function(ctxt, args, done) {
					t.ok(args);
					t.equal(args.cmd, 'integration');
					t.equal(args.param, 'view');
					t.ok(ctxt && ctxt.user && ctxt.user.roles);
					t.ok(_.difference(ctxt.user.roles, ['anon']));
					done(null, state);
				}
			},
			{
				name: 'Integration Test View User',
				pattern: {
					uri: '/test/user',
				},
				handler: function(ctxt, args, done) {
					t.ok(args);
					t.ok(ctxt && ctxt.user && ctxt.user.roles);
					t.ok(_.difference(ctxt.user.roles, ['state', 'express']));
					done(null, '');
				}
			},
			{
				name: 'Integration Test View w/ error',
				pattern: {
					uri: '/test/error',
				},
				handler: function(ctxt, args, done) {
					done('500');
				}
			}
		]
	});

	api.listen(3000);

	t.plan(20);
	async.series([
		function(done) {
			var url = 'http://localhost:3000/?token=' +
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
				'eyJyb2xlcyI6WyJzdGF0ZSIsImV4cHJlc3MiXX0.' +
				'2jDwsYX-VnQmNB67dq8MX4Y0kebG7mhyGnX0HpZbDT8';
			var ws = new WebSocket(url);

			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action-with-user"}');
			});

			ws.on('message', function(msg) {
				if (msg === 'resume') {
					ws.close();

					done();
				}
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000/?token=invalid-token');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action-with-invalid-user"}');
			});

			ws.on('message', function(msg) {
				if (msg === 'resume-again') {
					ws.close();

					done();
				}
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000/test/integration/view');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action-without-user"}');
			});

			ws.on('message', function(msg) {
				if (msg === 'changed') {
					ws.close();

					done();
				}
			});
		},
		function(done) {
			var ws = new WebSocket('http://localhost:3000/test/integration/view');
			ws.on('open', function() {
				ws.send('invalid-json-object');
			});

			ws.on('message', function(msg) {
				t.equal(msg, '{"error":{"status":"400","title":"bad-request"}}');
				ws.close();

				done();
			});
		},
		function(done) {
			var req = http.request({
				hostname: 'localhost',
				port: 3000,
				path: '/test/integration/view',
				method: 'GET'
			}, function(res) {
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					t.equal(body, 'changed');
					done();
				});
			});

			req.end();
		},
		function(done) {
			var req = http.request({
				hostname: 'localhost',
				port: 3000,
				path: '/test/user',
				method: 'GET',
				headers: {
					'Authorization': 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
						'eyJyb2xlcyI6WyJzdGF0ZSIsImV4cHJlc3MiXX0.' +
						'2jDwsYX-VnQmNB67dq8MX4Y0kebG7mhyGnX0HpZbDT8'
				}
			}, function(res) {
				res.on('data', function() {
					_.noop();
				});
				res.on('end', function() {
					done();
				});
			});

			req.end();
		},
		function(done) {
			var req = http.request({
				hostname: 'localhost',
				port: 3000,
				path: '/test/error',
				method: 'GET'
			}, function(res) {
				res.on('data', function() {
					_.noop();
				});
				res.on('end', function() {
					done();
				});
			});

			req.end();
		}
	], function() {
		t.pass();
		api.close();
	});
});
