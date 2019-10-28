var chai = require('chai');
var assert = require('chai').assert;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
var db = require('../lib/db');
const mysql = require('mysql');
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
            /*
            sinon
                .stub(db, "executeQuery").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        switch(executeQueryCount){ 
                            case 0:
                                resolve([{id: 1}]);
                            case 1:
                                resolve([{id: -1}]);
                            case 2:
                                resolve([{id: -1}]);
                            case 3:
                                resolve([{id: -1}]);
                        }
                    });
                })
            */
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
            baseRouter.check_token_existance.restore();
            // db.executeQuery.restore();
        })

        afterEach(() => {
            executeQueryCount++;
        })
    })

});
/*
after(()=>{
    tokensRouter.check_organizational_existance.restore();
    baseRouter.middelware_authorization.restore();
    db.executeQuery.restore();
    mysql.createConnection.restore();
    baseRouter.check_token_existance.restore();
    baseRouter.get_authorization_token.restore();
})
*/