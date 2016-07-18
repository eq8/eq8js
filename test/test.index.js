'use strict';

var _ = require('lodash');
var test = require('tape');
var path = require('path');
var proxyquire = require('proxyquire');
var Api = require('../index.js');

function _mockExpress(t, initArgs) {
	initArgs = initArgs || 'default';
	return {
		assert: function(assertArgs) {
			t.equal(initArgs, assertArgs);
		},
		use: _.noop
	};
}

test('api.express returns express provided from init options', function(t) {
	var mockExpress = _.partial(
		_mockExpress,
		t
	);

	var indexPath = path.resolve(__dirname, '../lib/index.js');
	var LocalApi = proxyquire(indexPath, {
		express: mockExpress
	});
	var apiDefault = new LocalApi();
	var apiCustom = new LocalApi({
		express: mockExpress('custom')
	});

	t.plan(2);
	apiDefault.express.assert('default');
	apiCustom.express.assert('custom');
});

test('register() an action and act() on it', function(t) {
	var api = new Api();
	var testPattern = {
		ns: 'test',
		cmd: 'test',
		v: '0.1'
	};
	var testContext = 'some arbitrary context object';

	t.plan(3);
	api.register({actions: [
		{
			name: 'test action',
			pattern: testPattern,
			handler: function(args, context, done) {
				t.equal(args, testPattern);
				t.equal(context, testContext);
				done();
			}
		}
	]}, function() {
		api.act(testPattern, testContext, function() {
			t.pass('passed handler callback');
		});
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
