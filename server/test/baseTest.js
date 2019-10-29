var chai = require('chai');
var assert = require('chai').assert;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
const httpMocks = require('node-mocks-http');

const db = require('../lib/db');
const mysql = require('mysql');
const baseRouter = require('../routes/base');

chai.use(chaiHttp);

//middle wear test: https://stackoverflow.com/questions/34516951/express-middleware-testing-mocha-chai
//First Describe is the outer wrapper that holds all tests
describe("Base Tests: ", () => {
    //Each route should have a describe wrapper
    describe("(get) /", () => {
        var executeQueryCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });
            sinon
                .stub(baseRouter, "check_token_existance").callsFake( function() {
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
                assert.equal(res.locals.token, 'authorized_token');
                assert.equal(res.locals.token_id, 1);
                done();
            })
        })

        it('Unauthorized Token and Invalid Token Id', done => {
            var req = httpMocks.createRequest({headers: {authorization: 'Bearer unauthorized_token'}});
            var res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, function(){
                assert.equal(res.locals.token, 'unauthorized_token');
                assert.equal(res.locals.token_id, -1);
                done();
            });
        })

        it('No Token and Invalid Token Id', done => {
            var req = httpMocks.createRequest({headers: {authorization: ''}});
            var res = httpMocks.createResponse();
            baseRouter.middelware_authorization(req, res, function(){
                assert.equal(res.locals.token, undefined);
                assert.equal(res.locals.token_id, -1);
                done();
            });
        })

        after(()=>{
            baseRouter.check_token_existance.restore();
            mysql.createConnection.restore();
        })

        afterEach(() => {
            executeQueryCount++;
        })
    })

});