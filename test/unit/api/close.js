'use strict';

var EventEmitter = require('events');

module.exports = function(test) {
	test('unit: lib/api/close.js', function(t) {
		var expected = 'some-arbitrary-value';
		var api = new EventEmitter();

		t.plan(2);

		api.on('close', function(done) {
			t.pass();

			done(expected);
		});
		api.close = require('../../../lib/api/close.js')();

		api.close(function(value) {
			t.equal(value, expected);
		});
	});
};
