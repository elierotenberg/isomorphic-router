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
  // - a string representing an path-like pattern, ie. /users/:userId/perform/:action/*splat
  // - a regexp
  // - a function that returns null if no match, an array of parameters to apply the handler with else
  constructor(routes = []) {
    if(__DEV__) {
      routes.should.be.an.Array;
      _.each(routes, ([pattern, handler]) => {
        (_.isString(pattern) || _.isRegExp(pattern) || _.isFunction(pattern)).should.be.true;
        handler.should.be.a.Function;
      });
    }
    _.bindAll(this);
    this._routes = [];
    _.each(routes, this.register);
  }

  register(pattern, handler) {
    if(__DEV__) {
      (_.isString(pattern) || _.isRegExp(pattern) || _.isFunction(pattern)).should.be.true;
      handler.should.be.a.Function;
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

    this._routes.push((fragment) => {
      const args = pattern(fragment);
      if(args !== null) {
        handler.apply(null, args);
        return 1;
      }
      return 0;
    });

    return this;
  }

  route(fragment) {
    return _.reduce(_.map(this._routes, (route) => route(fragment)), (a, b) => a + b);
  }
}
