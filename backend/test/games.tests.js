'use strict';
process.env.NODE_ENV = 'test';

const server = require('../app');
const repo = require('../repository');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

describe('/games', () => {
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

        it('it should GET all active games', (done) => {
            let data = {'userName': 'Igor', 'size': '3'};
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                chai.request(server)
                .get('/games/list')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('OK');
                    res.body.should.have.property('code').eql(0);
                    res.body.should.have.property('games').to.have.length(1);
                    done();
            });
            })
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

        it('it should POST create new game with size value is more than 3', (done) => {
            let data = {'userName': 'Igor', 'size': 5};
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

    describe('/GET /games/state', () => {
        it('it should be GET current game state', (done) => {
            let data = {'userName': 'Igor', 'size': '3'}
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                chai.request(server)
                .get('/games/state')
                .set('accessToken', res.body.accessToken)
                .end((err, res) => {
                    res.should.be.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('OK');
                    res.body.should.have.property('code').eql(0);
                    res.body.should.have.property('yourTurn');
                    res.body.should.have.property('gameDuration');
                    res.body.should.have.property('field');
                    res.body.should.have.property('winner');
                    done();
                });
            });
        });

        it('it should not GET current game state cause by missing accessToken in headers', (done) => {
            let data = {'userName': 'Igor', 'size': '3'}
            chai.request(server)
            .post('/games/new')
            .send(data)
            .end((err, res) => {
                chai.request(server)
                .get('/games/state')
                .end((err, res) => {
                    res.should.be.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('error');
                    res.body.should.have.property('code').eql(3);
                    res.body.should.have.property('message').eql('Not found accessToken in headers');
                    done();
                });
            });
        });

        it('it should not GET current game state cause by no active game for this accesTtoken', (done) => {
            chai.request(server)
            .get('/games/state')
            .set('accessToken', 'b3f78f60-e87f-44e8-8bbf-9c3841b830e0')
            .end((err, res) => {
                res.should.be.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error');
                res.body.should.have.property('code').eql(2);
                res.body.should.have.property('message').eql('Not found active game');
                done();
            });
        });
    });

    // describe('/POST /games/join', () => {
    //     it('it should be POST join to active game as player', (done) => {
    //         let data = {'userName': 'Igor', 'size': '3'};
    //         chai.request(server)
    //         .post('/games/new')
    //         .send(data)
    //         .end((err, res) => {
    //             let player = {'gameToken': res.body.gameToken, 'userName': 'Ivan'};
    //             chai.request(server)
    //             .post('games/join')
    //             .send(player)
    //             .end((err, res) => {
    //                 chai.request(server)
    //             });
    //         })
    //     });
    // });
});