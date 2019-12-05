/* Contains all tests related to base.js, which includes testing helper functions and middleware. */

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const httpMocks = require('node-mocks-http');

const mysql = require('mysql');
/* baseTest.js is ran first, so mock out the initial mysql connect() function
   before importing the db to prevent connection attempts to a MySQL database.
*/
sinon.stub(mysql, "createConnection").callsFake(() => {
    return {connect: () => {}};
});
const db = require('../lib/db');

const baseRouter = require('../routes/base');

chai.use(chaiHttp);
chai.should();

//middle wear test: https://stackoverflow.com/questions/34516951/express-middleware-testing-mocha-chai
//First Describe is the outer wrapper that holds all tests
describe("Base Tests: ", () => {
    //Each route should have a describe wrapper
    describe("(get) /", () => {
        let executeQueryCount = 0;

        before(() => {
            sinon.stub(baseRouter, "check_token_existence").callsFake(() => {
                return new Promise((resolve) => {
                    switch (executeQueryCount) {
                        case 0:
                            resolve(1);
                            break;
                        case 1:
                            resolve(-1);
                            break;
                        case 2:
                            resolve(-1);
                            break;
                    }
                });
            });
        });

        it('Authorized Token and Valid Token Id', done => {
            const req = httpMocks.createRequest({headers: {authorization: 'Bearer authorized_token'}});
            const res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, () => {
                assert.equal(res.locals.token, 'authorized_token');
                assert.equal(res.locals.token_id, 1);
                done();
            })
        });

        it('Unauthorized Token and Invalid Token Id', done => {
            const req = httpMocks.createRequest({headers: {authorization: 'Bearer unauthorized_token'}});
            const res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, () => {
                assert.equal(res.locals.token, 'unauthorized_token');
                assert.equal(res.locals.token_id, -1);
                done();
            });
        });

        it('No Token and Invalid Token Id', done => {
            const req = httpMocks.createRequest({headers: {authorization: ''}});
            const res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, () => {
                assert.equal(res.locals.token, undefined);
                assert.equal(res.locals.token_id, -1);
                done();
            });
        });

        afterEach(() => {
            executeQueryCount++;
        });

        after(() => {
            baseRouter.check_token_existence.restore();
            mysql.createConnection.restore();
        });
    });

    describe("check_token_existence", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

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
            mysql.createConnection.restore();
        });
    });

    describe("get_authorization_token", () => {
        it("Valid Bearer Token", (done) => {
            let bearer_token = "Bearer 7edfa62b-0024-4f68-a2d4-d3319dfd6d2f";
            let token = baseRouter.get_authorization_token(bearer_token);
            assert.equal(token, '7edfa62b-0024-4f68-a2d4-d3319dfd6d2f');
            done();
        });

        it("Token w/out Bearer Auth", (done) => {
            let bearer_token = "7edfa62b-0024-4f68-a2d4-d3319dfd6d2f";
            let token = baseRouter.get_authorization_token(bearer_token);
            assert.equal(token, '');
            done();
        });

        it("No Authorization in any form", (done) => {
            let bearer_token = "";
            let token = baseRouter.get_authorization_token(bearer_token);
            assert.equal(token, '');
            done();
        });

        it("Undefined Authorization", (done) => {
            let bearer_token = undefined;
            let token = baseRouter.get_authorization_token(bearer_token);
            assert.equal(token, '');
            done();
        });

        it("Invalid Authorization Type", (done) => {
            let bearer_token = {"User": "username", "Password": "pasword123"};
            let token = baseRouter.get_authorization_token(bearer_token);
            assert.equal(token, '');
            done();
        });
    });
});
