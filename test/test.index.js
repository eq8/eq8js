'use strict';

var _ = require('lodash');
var test = require('tape');
var path = require('path');
var proxyquire = require('proxyquire');
var Api = require('../index.js');

function _mockMiddleware(t, initArgs) {
	initArgs = initArgs || 'default';
	return {
		assert: function(assertArgs) {
			t.equal(initArgs, assertArgs);
		},
		use: _.noop
	};
}

test('api.middleware returns middleware provided from init options', function(t) {
	var mockMiddleware = _.partial(
		_mockMiddleware,
		t
	);

	var indexPath = path.resolve(__dirname, '../lib/index.js');
	var LocalApi = proxyquire(indexPath, {
		connect: mockMiddleware
	});
	var apiDefault = new LocalApi();
	var apiCustom = new LocalApi({
		middleware: mockMiddleware('custom')
	});

	t.plan(2);
	apiDefault.middleware.assert('default');
	apiCustom.middleware.assert('custom');
});

test('register() an action and act() on it', function(t) {
	var api = new Api();
	var testPattern = {
		ns: 'test',
		cmd: 'test',
		v: '0.1'
	};
	var testContext = 'some arbitrary context object';

	t.plan(2);
	api.register({actions: [
		{
			name: 'test action',
			pattern: testPattern,
			handler: function(context, args, done) {
				t.equal(context, testContext);
				t.equal(args, testPattern);
				done();
			}
		}
	]}, function() {
		api.act(testContext, testPattern);
	});
});

test('register() view and view() it', function(t) {
	var api = new Api();
	var testPattern = {
		uri: '/some/arbitrary/path'
	};
	var testContext = {
		req: 'someArbitraryRequest'
	};

	t.plan(3);
	api.register({views: [
		{
			name: 'test action',
			pattern: testPattern,
			handler: function(pattern, context, done) {
				t.equal(pattern, testPattern);
				t.equal(context, testContext);
				done();
			}
		}
	]}, function() {
		api.view(testPattern, testContext, function() {
			t.pass('passed handler callback');
		});
	});
});
