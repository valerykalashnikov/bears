//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();


chai.use(chaiHttp);

var Bear = require('../models/bear');

//Our parent block
describe('Bears', () => {

  //Before each test we empty the database
  beforeEach((done) => {
    var bear = new Bear();
    bear.collection.drop()
    done();
  });

  describe('/GET bears', () => {
    //Before each test populate database by 10 bears
    beforeEach((done) => {
      var bearTestObjects = [];
      for (var i = 0; i < 10; i++) {
        var bearTesObject = {name: "bear"+i};
        bearTestObjects.push(bearTesObject)
      }
      Bear.collection.insert(bearTestObjects, (err, docs) => {
        if (err) {
          console.log("Unexpected error when populating db " + err)
        }
        done();
      });
    });

    it('should GET all the bears', (done) => {
      chai.request(server)
          .get('/api/bears')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(10);
            done();
          });
    });

    it('should GET 5 bears', (done) => {
      chai.request(server)
          .get('/api/bears?per_page=5')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(5);
            done();
          });
    });

    it ('should GET 5 bears from second page', (done) => {
      chai.request(server)
          .get('/api/bears?page=2&per_page=5')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(5);
              res.body[0].name.should.be.eql("bear5")
            done();
          });
    });

    it ('should GET 1 bears with name "bear1"', (done) => {
      chai.request(server)
          .get('/api/bears?name=bear1')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(1);
              res.body[0].name.should.be.eql("bear1")
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
            res.body.errors.should.have.property('name');
            res.body.errors.name.should.have.property('type').eql('required');
          done();
        });
    });

    it('it should create bear',(done) => {
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
