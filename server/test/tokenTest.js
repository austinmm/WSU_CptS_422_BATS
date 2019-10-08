var chai = require('chai');
var assert = require('chai').assert;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
var app = require('../app');
var db = require('../lib/db');
const mysql = require('mysql');
const tokensRouter = require('../routes/tokens');

chai.use(chaiHttp);
chai.should();

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

})