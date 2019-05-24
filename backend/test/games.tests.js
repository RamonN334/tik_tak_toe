'use strict';
process.env.NODE_ENV = 'test';

const server = require('../app');
const repo = require('../repository');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

describe('Database', () => {
    beforeEach((done) => {
        repo.clearDB();
        done();
    });

    describe('/GET /games/list', () => {
        it('it should GET empty array cause by no active games available', (done) => {
            chai.request(server)
            .get('/games/list')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('OK');
                res.body.should.have.property('code').eql(0);
                res.body.should.have.property('games').eql([]);
                done();
            });
        });
    });

    describe('/POST /games/new', () => {
        it('it should POST create new game', (done) => {
            let data = {'userName': 'Igor', 'size': 3};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('OK');
                res.body.should.have.property('code').eql(0);
                res.body.should.have.property('accessToken').not.eql('');
                res.body.should.have.property('gameToken').not.eql('');
                done();
            });
        });

        it('it should not create new game cause by missing userName in request', (done) => {
            let data = {'size': 3};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(1);
                res.body.should.have.property('message').eql('Invalid request');
                done();
            });
        });

        it('it should not create new game cause by missing size in request', (done) => {
            let data = {'userName': 'Igor'};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(1);
                res.body.should.have.property('message').eql('Invalid request');
                done();
            });
        });

        it('it should not create new game cause by userName value is empty', (done) => {
            let data = {'userName': '', 'size': ''};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(5);
                res.body.should.have.property('message').eql('UserName field is empty');
                done();
            });
        });

        it('it should not create new game cause by size value is empty', (done) => {
            let data = {'userName': 'Igor', 'size': ''};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(5);
                res.body.should.have.property('message').eql('Size field is not valid');
                done();
            });
        });

        it('it should not create new game cause by size value is not a number', (done) => {
            let data = {'userName': 'Igor', 'size': '3test'};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(5);
                res.body.should.have.property('message').eql('Size field is not valid');
                done();
            });
        });

        it('it should not create new game cause by size value is less than 3', (done) => {
            let data = {'userName': 'Igor', 'size': '2'};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(5);
                res.body.should.have.property('message').eql('Size value is less than 3');
                done();
            });
        });
    });
});