'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _Router = require('../');

var _Router2 = _interopRequireDefault(_Router);

require('babel/polyfill');
var _ = require('lodash');
var should = require('should');
var Promise = (global || window).Promise = require('bluebird');
var __DEV__ = process.env.NODE_ENV !== 'production';
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === 'object';
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}

var catchAll = 0;
var users = 0;
var user1 = 0;
var queryFooBar = 0;
var hashFoo = 0;

/* eslint-disable no-unused-vars */
var router = new _Router2['default']().on('/(.*)', function () {
  return catchAll = catchAll + 1;
}).on('/users', function () {
  return users = users + 1;
}).on('/users/:user', function (params) {
  return user1 = user1 + (params.user === '1' ? 1 : 0);
}).on('/query', function (params, query) {
  return queryFooBar = queryFooBar + (query.foo && query.foo === 'bar' ? 1 : 0);
}).on('/hash', function (params, query, hash) {
  return hashFoo = hashFoo + (hash === '#foo' ? 1 : 0);
});
/* eslint-enable no-unused-vars */

router.route('/hello');
catchAll.should.be.exactly(1);
router.route('/users');
catchAll.should.be.exactly(2);
users.should.be.exactly(1);
router.route('/users/2');
catchAll.should.be.exactly(3);
user1.should.be.exactly(0);
router.route('/users/1');
catchAll.should.be.exactly(4);
user1.should.be.exactly(1);
router.route('/query?bar=foo');
queryFooBar.should.be.exactly(0);
router.route('/query');
queryFooBar.should.be.exactly(0);
router.route('/query?foo=bar');
queryFooBar.should.be.exactly(1);
router.route('/hash?foo');
hashFoo.should.be.exactly(0);
router.route('/hash#bar');
hashFoo.should.be.exactly(0);
router.route('/hash#foo1');
hashFoo.should.be.exactly(0);
router.route('/hash#foo');
hashFoo.should.be.exactly(1);