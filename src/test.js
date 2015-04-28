import Router from '../';

let catchAll = 0;
let users = 0;
let user1 = 0;
let queryFooBar = 0;
let hashFoo = 0;

/* eslint-disable no-unused-vars */
const router = new Router()
.on('/(.*)', () => catchAll = catchAll + 1)
.on('/users', () => users = users + 1)
.on('/users/:user', (params) => user1 = user1 + (params.user === '1' ? 1 : 0))
.on('/query', (params, query) => queryFooBar = queryFooBar + (query.foo && query.foo === 'bar' ? 1 : 0))
.on('/hash', (params, query, hash) => hashFoo = hashFoo + (hash === '#foo' ? 1 : 0));
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
