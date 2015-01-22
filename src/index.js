import { parse } from 'url';
import pathToRegExp from 'path-to-regexp';

function decodeParam(val) {
  if(typeof val !== 'string') {
    return val;
  }
  return decodeURIComponent(val);
}

class Router {
  // A pattern is an express-like path pattern.
  // It typically is like /users/:user/* or the like.
  constructor() {
    _.bindAll(this);
    this._routes = [];
  }

  clear() {
    this._routes = [];
  }

  on(pattern, fn) {
    if(__DEV__) {
      pattern.should.be.a.String;
      fn.should.be.a.Function;
    }

    const keys = [];
    const re = pathToRegExp(pattern, keys);
    const len = keys.length;

    this._routes.push((url) => {
      const u = parse(url, true);
      const { pathname, hash } = u;
      const query = u.query ? u.query : {};
      const match = re.exec(pathname);
      if(match === null) {
        return null;
      }
      match.shift();
      const params = {};
      for(let k = 0; k < len; k = k +1) {
        params[keys[k].name] = decodeParam(match[k]);
      }
      return fn(params, query, hash);
    });

    return this;
  }

  route(url, storeResults = false) {
    if(__DEV__) {
      url.should.be.a.String;
    }
    const results = storeResults ? [] : null;
    _.each(this._routes, (route) => {
      const res = route(url);
      if(res !== null && storeResults) {
        results.push(res);
      }
    });
    return storeResults ? results : null;
  }

  routeRequest(req, storeResults = false) {
    if(__DEV__) {
      req.should.be.an.Object.which.has.property('url').which.is.a.String;
      __NODE__.should.be.true;
    }
    return this.route(req.url, storeResults);
  }

  routeWindow(window, storeResults = false) {
    if(__DEV__) {
      window.should.be.an.Object;
      __BROWSER__.should.be.true;
    }
    return this.route(window.location.href, storeResults);
  }
}

export default Router;
