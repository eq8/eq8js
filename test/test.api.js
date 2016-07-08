'use strict';

var test = require('tape');

var _ = require('lodash');
var async = require('async');
var bloomrun = require('bloomrun');

// api.act() -------------------------------------
test('api.act() with no callback', function(assert) {
	// EXPECTED
	var expectedPattern = {
		pattern: 1
	};
	var expectedContext = {
		anon: true
	};

	// MOCKS
	var mockActions = bloomrun();
	mockActions.add(expectedPattern, function(args, ctxt, done) {
		assert.deepEqual(args, expectedPattern);
		assert.deepEqual(ctxt, expectedContext);
		done();
	});

	var mockLodash = _.defaults({
		noop: function() {
			assert.pass();
		}
	}, _);

	// TEST
	var act = require('../lib/api/act.js')(mockLodash, async);
	var fixture = {
		actions: mockActions,
		act: act
	};

	// assert that api.act() would call our handler with:
	// - the expected pattern; and,
	// - the expected context
	// assert that api.act() would call _.noop if no callback was provided
	assert.plan(3);
	fixture.act(expectedPattern, expectedContext);
});

test('api.act() with callback', function(assert) {
	// EXPECTED
	var expectedPattern = {
		pattern: 1
	};
	var expectedContext = {
		anon: true
	};
	var expectedError = 'expected error';

	// MOCKS
	var mockActions = bloomrun();
	mockActions.add(expectedPattern, function(args, ctxt, done) {
		done(expectedError);
	});

	// TEST
	var act = require('../lib/api/act.js')(_, async);
	var fixture = {
		actions: mockActions,
		act: act
	};

	// assert that api.act() would call the provided callback
	assert.plan(1);
	fixture.act(expectedPattern, expectedContext, function(err) {
		assert.equal(err, expectedError);
	});
});

// api.view() -------------------------------------
test('api.view() with no callback', function(assert) {
	// EXPECTED
	var expectedPattern = {
		pattern: 1
	};
	var expectedContext = {
		anon: true
	};

	// MOCKS
	var mockViews = bloomrun();
	mockViews.add(expectedPattern, function(args, ctxt, done) {
		assert.deepEqual(args, expectedPattern);
		assert.deepEqual(ctxt, expectedContext);
		done();
	});

	var mockLodash = _.defaults({
		noop: function() {
			assert.pass();
		}
	}, _);

	// TEST
	var view = require('../lib/api/view.js')(mockLodash);
	var fixture = {
		views: mockViews,
		view: view
	};

	// assert that api.view() would call our handler with:
	// - the expected pattern; and,
	// - the expected context
	// assert that api.view() would call _.noop if no callback was provided
	assert.plan(3);
	fixture.view(expectedPattern, expectedContext);
});

test('api.view() with callback', function(assert) {
	// EXPECTED
	var expectedPattern = {
		pattern: 1
	};
	var expectedContext = {
		anon: true
	};
	var expectedError = 'expected error';

	// MOCKS
	var mockViews = bloomrun();
	mockViews.add(expectedPattern, function(args, ctxt, done) {
		done(expectedError);
	});

	// TEST
	var view = require('../lib/api/view.js')(_);
	var fixture = {
		views: mockViews,
		view: view
	};

	// assert that api.view() would call the provided callback
	assert.plan(1);
	fixture.view(expectedPattern, expectedContext, function(err) {
		assert.equal(err, expectedError);
	});
});

// api.listen() -------------------------------------
test('api.listen()', function(assert) {
	// EXPECTED
	var message = 'message';
	var user = 'user';
	var error = 'error';

	// MOCKS
	var mockExpress = {
		assertExpress: function() {
			assert.pass();
		}
	};
	var mockServer = {
		assertServer: function() {
			assert.pass();
		},
		listen: function() {
			assert.pass();
		},
		on: _.noop,
		close: _.noop
	};
	var mockCore = _.noop;
	mockCore.prototype.listen = function(port, callback) {
		callback(mockServer);
	};
	function mockWSS(options) {
		options.server.assertServer();
	}
	var mockWs = {
		assertWs: function() {
			assert.pass();
		},
		on: function(e, callback) {
			callback(message);
		}
	};
	mockWSS.prototype.on = function(e, callback) {
		callback(mockWs);
	};

	// TEST
	var listen = require('../lib/api/listen.js')(_, mockCore, mockWSS);
	var fixture = {
		express: mockExpress,
		emit: function() {
			var e = arguments[0];
			var ws = arguments[1];
			ws.assertWs();

			if (e === 'connection') {
				arguments[2](null, this, mockWs, user);
				arguments[2](error, this);
			} else if (e === 'message') {
				assert.equal(arguments[2], user);
				assert.equal(arguments[3], message);
			}
		},
		on: _.noop,
		logger: {
			error: function(err) {
				assert.equal(err, error);
			}
		},
		listen: listen
	};

	assert.plan(6);
	fixture.listen();
});
