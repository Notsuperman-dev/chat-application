// test/auth.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Authentication', () => {
  it('should register a user', (done) => {
    chai.request(server)
      .post('/api/register')
      .send({ username: 'testuser', password: 'testpassword' })
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });

  it('should login a user', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('token');
        done();
      });
  });
});
