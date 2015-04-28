'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _parse = require('url');

var _pathToRegExp = require('path-to-regexp');

var _pathToRegExp2 = _interopRequireDefault(_pathToRegExp);

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

function decodeParam(val) {
  if (typeof val !== 'string') {
    return val;
  }
  return decodeURIComponent(val);
}

var Router = (function () {
  // A pattern is an express-like path pattern.
  // It typically is like /users/:user/* or the like.

  function Router() {
    _classCallCheck(this, Router);

    _.bindAll(this);
    this._routes = [];
  }

  _createClass(Router, [{
    key: 'clear',
    value: function clear() {
      this._routes = [];
    }
  }, {
    key: 'on',
    value: function on(pattern, fn) {
      if (__DEV__) {
        pattern.should.be.a.String;
        fn.should.be.a.Function;
      }

      var keys = [];
      var re = _pathToRegExp2['default'](pattern, keys);
      var len = keys.length;

      this._routes.push(function (url) {
        var u = _parse.parse(url, true);
        var pathname = u.pathname;
        var hash = u.hash;

        var query = u.query ? u.query : {};
        var match = re.exec(pathname);
        if (match === null) {
          return null;
        }
        match.shift();
        var params = {};
        for (var k = 0; k < len; k = k + 1) {
          params[keys[k].name] = decodeParam(match[k]);
        }
        return fn(params, query, hash);
      });

      return this;
    }
  }, {
    key: 'route',
    value: function route(url) {
      if (__DEV__) {
        url.should.be.a.String;
      }
      var results = [];
      _.each(this._routes, function (route) {
        var res = route(url);
        if (res !== null) {
          results.push(res);
        }
      });
      return results;
    }
  }, {
    key: 'routeRequest',
    value: function routeRequest(req) {
      if (__DEV__) {
        req.should.be.an.Object.which.has.property('url').which.is.a.String;
        __NODE__.should.be['true'];
      }
      return this.route(req.url);
    }
  }, {
    key: 'routeWindow',
    value: function routeWindow(window) {
      if (__DEV__) {
        window.should.be.an.Object;
        __BROWSER__.should.be['true'];
      }
      return this.route((window.location || window.history.location).href);
    }
  }]);

  return Router;
})();

exports['default'] = Router;
module.exports = exports['default'];