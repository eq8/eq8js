'use strict';

var _ = require('lodash');
var async = require('async');

module.exports = function(test) {
	test('unit: lib/modules/asyncware.js', function(t) {
		var expected = 'some-arbitrary-ws';
		var handler = function(ws, done) { // eslint-disable-line func-style
			t.equal(ws, expected);
			t.pass();
			done();
		};

		var asyncware = require('../../../lib/modules/asyncware/index.js')(_, async);

		t.plan(4);
		asyncware.use(handler);
		asyncware.use(handler);
		asyncware(expected);
	});
};
