var chai = require('chai');
var assert = require('chai').assert;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
var app = require('../app');
var db = require('../lib/db');
const mysql = require('mysql');
const tokensRouter = require('../routes/tokens');
const baseRouter = require('../routes/base');

chai.use(chaiHttp);
chai.should();
//middle wear test: https://stackoverflow.com/questions/34516951/express-middleware-testing-mocha-chai
//First Describe is the outer wrapper that holds all tests
describe("Token Tests: ", () => {

    //Each route should have a describe wrapper
    describe("(post) /", () => {
        let executeQueryCount = 0;

        before(() => {
            sinon
                .stub(mysql, "createConnection").callsFake( function() {
                    return {}
                })
            
            //When we need execute query to return different values we will use a count
            //and a switch statement to ensure the proper resolve occurs.
            sinon
                .stub(db, "executeQuery").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        let count = executeQueryCount;
                        executeQueryCount++;
                        switch(count){ 
                            case 0:
                                resolve([{organization: "TestOrg1", issued: "SomeDate"},
                                         {organization: "TestOrg2", issued: "SomeDate"},
                                         {organization: "TestOrg3", issued: "SomeDate"}
                                        ]);
                            case 1:
                                resolve([]);
                        }
                    });
                })
                
            sinon  
                .stub(tokensRouter, "check_organizational_existance").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        switch(executeQueryCount){ 
                            case 0:
                                resolve(false);
                                break;
                            case 1:
                                resolve(true);
                                break;
                        }
                    });
                })
        })

        //Each unit test is wrapped with it()
        it("returns all tokens with status 201", done => {
            chai.request(app)
                .post('/api/tokens/')
                .send({organization: "TestOrg"})
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                })
        })

        it("organization does not exist display status 409", done => {
            chai.request(app)
                .post('/api/tokens/')
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                })
        })
    })
    
    describe("(get)  /:token", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.restore();
            //When we need execute query to return different values we will use a count
            //and a switch statement to ensure the proper resolve occurs.
            sinon
                .stub(db, "executeQuery").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        let count = executeQueryCount;
                        executeQueryCount++;
                        switch(count){ 
                            case 0:
                                resolve([{organization: "TestOrg", issued: "SomeDate"}]);
                            case 1:
                                resolve([]);
                        }
                    });
                })
        })

        it("request info on token with status 200", done => {
            chai.request(app)
                .get('/api/tokens/123456789')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.organization, "TestOrg");
                    assert.equal(res.body.issued, "SomeDate");
                    done();
                })
        })

        it("request info on token with status 404 from missing token", done => {
            chai.request(app)
                .get('/api/tokens/')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                })
        })
    })

    describe("(delete) /", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.restore();
            
            sinon
                .stub(mysql, "createConnection").callsFake( function() {
                    return {}
                })
            
            sinon
                .stub(baseRouter, "use").callsFake( function() {
                    next();
                })
            
            sinon
                .stub(baseRouter, "get_authorization_token").callsFake( function() {
                        //Note: Promise objects do not work with strings
                        switch(executeQueryCount){ 
                            case 0:
                                return "authorized_token";
                            case 1:
                                return "authorized_token";
                            case 2:
                                return "unauthorized_token";
                            case 3:
                                return "";
                        }
                })
            
            sinon
                .stub(baseRouter, "check_token_existance").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        switch(executeQueryCount){ 
                            case 0:
                                resolve(1);
                            case 1:
                                resolve(1);
                            case 2:
                                resolve(-1);
                            case 3:
                                resolve(-1);
                        }
                    });
                })
                
            sinon
                .stub(db, "executeQuery").callsFake( function() {
                    return new Promise((resolve, reject) => {
                        switch(executeQueryCount){ 
                            case 0:
                                resolve(true);
                            case 1:
                                resolve(false);
                            case 2:
                                resolve(false);
                            case 3:
                                resolve(false);
                        }
                    });
                })
        })

        it("delete a token with status 204", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer authorized_token')
                .end((err, res) => {
                    res.should.have.status(204);
                    //assert.deepEqual(res.locals.token, 'authorized_token');
                    //assert.deepEqual(res.locals.token_id, -1);
                    done();
                })
        })

        it("delete a token with status 500 from internal error", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer authorized_token')
                .end((err, res) => {
                    res.should.have.status(500);
                    //assert.deepEqual(res.locals.token, 'authorized_token');
                    //assert.deepEqual(res.locals.token_id, -1);
                    done();
                })
        })

        it("delete a token with status 403 from improper token provided", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer unauthorized_token')
                .end((err, res) => {
                    res.should.have.status(403);
                    //assert.deepEqual(res.locals.token, 'unauthorized_token');
                    //assert.deepEqual(res.locals.token_id, -1);
                    done();
                })
        })

        it("delete a token with status 401 from no token provided", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer ')
                .end((err, res) => {
                    res.should.have.status(401);
                    //assert.deepEqual(res.locals.token, undefined);
                    //assert.deepEqual(res.locals.token_id, undefined);
                    done();
                })
        })

        afterEach(() => {
            executeQueryCount++;
        })
    })

})