'use strict';

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
				name: 'Integration Test Action',
				pattern: {ns: 'test', cmd: 'integration'},
				handler: function(ctxt, args) {
					t.deepEqual(args, {ns: 'test', cmd: 'integration', param: 'action'});
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
					done(null, state);
				}
			}
		]
	});

	api.listen(3000);

	t.plan(7);
	async.series([
		function(done) {
			var ws = new WebSocket('http://localhost:3000/test/integration/view');
			ws.on('open', function() {
				ws.send('{"ns": "test", "cmd": "integration", "param": "action"}');
			});

			ws.on('message', function(msg) {
				t.equal(msg, 'changed');
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
		}
	], function() {
		t.pass();
		api.close();
	});
});
