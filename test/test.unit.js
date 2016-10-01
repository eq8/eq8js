'use strict';

var test = require('tape');

require('./unit/api/close.js')(test);
require('./unit/modules/asyncware.js')(test);
require('./unit/registrars/views.js')(test);
