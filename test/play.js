spies = require('chai-spies');
var chai = require('chai');
chai.use(spies);
var expect = chai.expect;

describe('[PLAY]', () => {
  it('should play', done => {
    function foo(x) {}
    var spy = chai.spy(foo);
    spy(4)
    expect(spy).to.have.been.called.once.with(4)
    done()
  });
});
