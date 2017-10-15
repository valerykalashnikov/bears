//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();


chai.use(chaiHttp);

//Our parent block
describe('Bears', () => {

  describe('/GET bears', () => {
      it('should GET all the bears', (done) => {
        chai.request(server)
            .get('/api/bears')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
              done();
            });
      });
  });

  describe('/POST bear', ()=>{
    it('it should not create bear without name field',(done) => {
      var bear = {}
      chai.request(server)
        .post('/api/bears')
        .send(bear)
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('errors');
          done();
        });
    });
    it('it should not create bear without name field',(done) => {
      var bear = {
        name: "test bear"
      }

      chai.request(server)
        .post('/api/bears')
        .send(bear)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Bear successfully added');
            res.body.bear.should.have.property('name');
          done();
        });
    });
  });

});
