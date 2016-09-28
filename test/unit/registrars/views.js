'use strict';

var _ = require('lodash');
var async = require('async');
var Rx = require('rx');

module.exports = function(test) {
	test('unit: lib/registrars/view.js', function(t) {
		var testUri = '/:id';
		var api = {
			router: {
				add: function(params) {
					t.ok(params);
					t.equal(params.path, testUri);
					t.deepEqual(params.handler({params: {id: 'test'}}), _.assign(
						{}, {uri: testUri}, {id: 'test'}
					));
				}
			}
		};
		var viewRegistrar = require('../../../lib/registrars/views.js')(_, async, Rx).bind(api);

		t.plan(5);

		viewRegistrar([{
			pattern: {
				uri: testUri
			}
		}, {
			pattern: {
				uri: testUri
			}
		}], function done() {
			t.pass();
		}, function prior(views, callback) {
			t.pass();
			callback(null, views);
		});
	});
};
