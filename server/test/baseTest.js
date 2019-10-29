var chai = require('chai');
var assert = require('chai').assert;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
var db = require('../lib/db');
const baseRouter = require('../routes/base');
var httpMocks = require('node-mocks-http');

chai.use(chaiHttp);
chai.should();

//middle wear test: https://stackoverflow.com/questions/34516951/express-middleware-testing-mocha-chai
//First Describe is the outer wrapper that holds all tests
describe("Base Tests: ", () => {
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    //Each route should have a describe wrapper
    describe("(get) /", () => {
        var executeQueryCount = 0;

        before(() => {
            sinon
                .stub(baseRouter, "check_token_existence").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        switch(executeQueryCount){ 
                            case 0:
                                resolve(1);
                            case 1:
                                resolve(-1);
                            case 2:
                                resolve(-1);
                        }
                    });
                })
        })

        it('Authorized Token and Valid Token Id', done => {
            var req = httpMocks.createRequest({headers: {authorization: 'Bearer authorized_token'}});
            var res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, function(){
                // There is a async function call in the middleware so we must wait for that to finish
                sleep(500).then(() => {
                    assert.equal(res.locals.token, 'authorized_token');
                    assert.equal(res.locals.token_id, 1);
                    done();
                });
            })
        })

        it('Unauthorized Token and Invalid Token Id', done => {
            var req = httpMocks.createRequest({headers: {authorization: 'Bearer unauthorized_token'}});
            var res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, function(){
               // There is a async function call in the middleware so we must wait for that to finish
               sleep(500).then(() => {
                assert.equal(res.locals.token, 'unauthorized_token');
                assert.equal(res.locals.token_id, -1);
                done();
                });
            });
        })

        it('No Token and Invalid Token Id', done => {
            var req = httpMocks.createRequest({headers: {authorization: ''}});
            var res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, function(){
                // There is a async function call in the middleware so we must wait for that to finish
                sleep(500).then(() => {
                    assert.equal(res.locals.token, undefined);
                    assert.equal(res.locals.token_id, -1);
                    done();
                });
            });
        })

        after(()=>{
            baseRouter.check_token_existence.restore();
        })

        afterEach(() => {
            executeQueryCount++;
        })
    })

    describe("check_token_existence", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (executeQueryCount) {
                        case 0:
                            resolve(undefined);
                            break;
                        case 1:
                            resolve([undefined]);
                            break;
                        case 2:
                            resolve([{}]);
                            break;
                        case 3:
                            resolve([{id: 1}]);
                            break;
                    }
                });
            });
        });

        it("no db results", (done) => {
            baseRouter.check_token_existence('').then((res) => {
                assert.equal(res, -1);
                done();
            });
        });

        it("empty db results", (done) => {
            baseRouter.check_token_existence('7edfa62b-0024-4f68-a2d4-d3319dfd6d2f').then((res) => {
                assert.equal(res, -1);
                done();
            });
        });

        it("no id value found", (done) => {
            baseRouter.check_token_existence('7edfa62b-0024-4f68-a2d4-d3319dfd6d2f').then((res) => {
                assert.equal(res, -1);
                done();
            });
        });

        it("id found for token", (done) => {
            baseRouter.check_token_existence('7edfa62b-0024-4f68-a2d4-d3319dfd6d2f').then((res) => {
                assert.equal(res, 1);
                done();
            });
        });

        afterEach(() => {
            executeQueryCount++;
        });

        after(() => {
            db.executeQuery.restore();
        });
    });
});
