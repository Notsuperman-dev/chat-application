// test/chat.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Chat Messages', () => {
  it('should fetch messages from a room', (done) => {
    chai.request(server)
      .get('/api/rooms')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });
});
