import { parse } from 'url';
import Lifespan from 'lifespan';
if(__BROWSER__) {
  import 'html5-history-api';
}

const optionalParam = /\((.*?)\)/g;
const namedParam = /(\(\?)?:\w+/g;
const splatParam = /\*\w+/g;
const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

function routeToRegExp(pattern) {
  pattern = pattern.replace(escapeRegExp, '\\$&')
  .replace(optionalParam, '(?:$1)?')
  .replace(namedParam, function(match, optional) {
    return optional ? match : '([^/?]+)';
  })
  .replace(splatParam, '([^?]*?)');
  return new RegExp('^' + pattern + '(?:\\?([\\s\\S]*))?$');
}

function extractFragmentParameters(regexp, fragment) {
  return regexp.exec(fragment).slice(1).map((i) => {
    const param = params[i];
    if(i === params.length - 1) {
      return param || null;
    }
    return param ? decodeURIComponent(param) : null;
  });
}

function regExpToFunction(regexp) {
  return (fragment) => regexp.exec(fragment) !== null ? extractFragmentParameters(fragment) : null;
}

class Router {
  // A pattern can be either:
  // - a string representing path slugs, ie. /users/:userId/perform/:action/*splat
  // - a regexp
  // - a function that returns null if no match, an array of parameters to apply the route with else
  constructor(routes = []) {
    if(__DEV__) {
      routes.should.be.an.Array;
      _.each(routes, ([pattern, route]) => {
        (_.isString(pattern) || _.isRegExp(pattern) || _.isFunction(pattern)).should.be.true;
        route.should.be.a.String;
      });
    }
    _.bindAll(this);
    this._routes = [];
    _.each(routes, ([pattern, route]) => this.register(pattern, route));
  }

  register(pattern, route) {
    if(__DEV__) {
      (_.isString(pattern) || _.isRegExp(pattern) || _.isFunction(pattern)).should.be.true;
      route.should.be.a.String;
    }

    if(_.isString(pattern)) {
      pattern = routeToRegExp(pattern);
    }
    if(_.isRegExp(pattern)) {
      pattern = regExpToFunction(pattern);
    }

    if(__DEV__) {
      pattern.should.be.a.Function;
    }

    this._routes.push((url) => {
      const { pathname, query, hash } = parse(url, true);
      const args = pattern(pathname);
      if(args !== null) {
        return { route, query, hash, args };
      }
      return null;
    });

    return this;
  }

  route(url, storeProducer) {
    if(__DEV__) {
      url.should.be.a.String;
      storeProducer.should.be.an.Object.which.has.properties('working', 'unset', 'set');
      storeProducer.working.should.be.an.Object.which.has.property('forEach').which.is.a.Function;
    }
    const results = [];
    _.each(this._routes, (route) => {
      const res = route(url);
      if(res !== null) {
        results.push(res);
      }
    });
    const routes = this.route(req.url);
    storeProducer.working.forEach((value, key) => storeProducer.unset(key));
    _.each(routes, (route, key) => storeProducer.set(key, route));
    return storeProducer; // can now be committed
  }

  routeRequest(req, storeProducer) {
    if(__DEV__) {
      req.should.be.an.Object.which.has.property('url').which.is.a.String;
      __NODE__.should.be.true;
      storeProducer.should.be.an.Object.which.has.properties('working', 'unset', 'set');
      storeProducer.working.should.be.an.Object.which.has.property('forEach').which.is.a.Function;
    }
    return this.route(req.url, storeProducer);
  }

  routeWindow(window, storeProducer) {
    if(__DEV__) {
      window.should.be.an.Object;
      __BROWSER__.should.be.true;
      storeProducer.should.be.an.Object.which.has.properties('working', 'unset', 'set');
      storeProducer.working.should.be.an.Object.which.has.property('forEach').which.is.a.Function;
    }
    const { href } = window.location || window.history.location;
    return this.route(href, storeProducer);
  }

  bindServer(server, lifespan, path='/route') {
    if(__DEV__) {
      lifespan.should.be.an.instanceOf(Lifespan);
    }
    const storeProducer = server.Store(path);
    server.Action(path, lifespan)
    .onDispatch((url) => this.route(url, storeProducer));
    return this;
  }

  bindClient(window, client, lifespan, path='/route') {
    if(__DEV__) {
      __BROWSER__.should.be.true;
      window.should.be.an.Object;
      lifespan.should.be.an.instanceOf(Lifespan);
      path.should.be.a.String;
    }
    const actionProducer = client.Action(path, lifespan);
    const ln = () => actionProducer.dispatch((window.location || window.history.location).href);
    window.addEventListener('popstate', ln);
    lifespan.onRelease(() => window.removeEventListener('popstate', ln));
    return this;
  }

  navigate(window, url) {
    if(__DEV__) {
      __BROWSER__.should.be.true;
      window.should.be.an.Object;
      url.should.be.a.String;
    }
    window.history.pushState(null, null, url);
    return this;
  }
}

export default Router;
