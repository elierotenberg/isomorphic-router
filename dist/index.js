"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

require("6to5/polyfill");
var _ = require("lodash");
var should = require("should");
var Promise = (global || window).Promise = require("bluebird");
var __DEV__ = process.env.NODE_ENV !== "production";
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === "object";
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}
var parse = require("url").parse;
var pathToRegExp = _interopRequire(require("path-to-regexp"));

function decodeParam(val) {
  if (typeof val !== "string") {
    return val;
  }
  return decodeURIComponent(val);
}

var Router = (function () {
  // A pattern is an express-like path pattern.
  // It typically is like /users/:user/* or the like.
  function Router() {
    _.bindAll(this);
    this._routes = [];
  }

  _prototypeProperties(Router, null, {
    clear: {
      value: function clear() {
        this._routes = [];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    on: {
      value: function on(pattern, fn) {
        if (__DEV__) {
          pattern.should.be.a.String;
          fn.should.be.a.Function;
        }

        var keys = [];
        var re = pathToRegExp(pattern, keys);
        var len = keys.length;

        this._routes.push(function (url) {
          var u = parse(url, true);
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    route: {
      value: function route(url) {
        var storeResults = arguments[1] === undefined ? false : arguments[1];
        if (__DEV__) {
          url.should.be.a.String;
        }
        var results = storeResults ? [] : null;
        _.each(this._routes, function (route) {
          var res = route(url);
          if (res !== null && storeResults) {
            results.push(res);
          }
        });
        return storeResults ? results : null;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    routeRequest: {
      value: function routeRequest(req) {
        var storeResults = arguments[1] === undefined ? false : arguments[1];
        if (__DEV__) {
          req.should.be.an.Object.which.has.property("url").which.is.a.String;
          __NODE__.should.be["true"];
        }
        return this.route(req.url, storeResults);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    routeWindow: {
      value: function routeWindow(window) {
        var storeResults = arguments[1] === undefined ? false : arguments[1];
        if (__DEV__) {
          window.should.be.an.Object;
          __BROWSER__.should.be["true"];
        }
        return this.route(window.location.href, storeResults);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Router;
})();

module.exports = Router;