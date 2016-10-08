'use strict';

var _ = require('lodash');

var test = require('tape');
var proxyquire = require('proxyquire');

require('./unit/api/close.js')(test);
require('./unit/modules/asyncware.js')(test);
require('./unit/registrars/views.js')(test);

test('unit: lib/index.js - check api.options object is as expected', function(t) {
	var secret = 'secret';
	var api = require('../lib/index.js')({jwt: {secret: secret}});

	t.plan(6);

	t.ok(api.options);

	t.ok(api.options.jwt);
	t.ok(_.isFunction(api.options.jwt.jwtFromRequest));

	var actualJwtOptions = _.omit(api.options.jwt, ['jwtFromRequest']);
	t.deepEqual(actualJwtOptions, {
		secret: secret,
		sign: {
			algorithm: 'HS256'
		},
		verify: {
			algorithms: ['HS256']
		}
	});

	t.ok(api.options.users);
	t.deepEqual(api.options.users, {
		anon: {
			roles: ['anon']
		},
		root: {
			roles: ['root']
		}
	});
});

test('unit: lib/index.js - check if dependencies are still in use', function(t) {
	var asyncware = function() { // eslint-disable-line func-style
		t.equal(arguments.length, 2);

		return {
			use: function() {
				t.pass();
			}
		};
	};

	t.plan(6);

	proxyquire('../lib/index.js', {
		'./modules/asyncware': asyncware,
		'./registrars/views.js': function() {
			t.equal(arguments.length, 3);
		},
		'./api/close.js': function() {
			t.pass();
		}
	})({jwt: {secret: 'secret'}});
});
