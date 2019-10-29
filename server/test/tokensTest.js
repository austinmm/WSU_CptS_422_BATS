const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const app = require('../app');
const db = require('../lib/db');

const mysql = require('mysql');
const tokensRouter = require('../routes/tokens');
const baseRouter = require('../routes/base');

chai.use(chaiHttp);
chai.should();

//First Describe is the outer wrapper that holds all tests
describe("Token Router Tests: ", () => {

    //Each route should have a describe wrapper
    describe("(get)  /", () => {
        let executeQueryCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });
            //When we need execute query to return different values we will use a count
            //and a switch statement to ensure the proper resolve occurs.
            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (executeQueryCount) {
                        case 0:
                            resolve([{token: '7edfa62b-0024-4f68-a2d4-d3319dfd6d2f', organization: "TestOrg", issued: "SomeDate"}]);
                        case 1:
                            resolve([]);
                    }
                });
            });
        });

        it("request a list of all tokens", done => {
            chai.request(app)
                .get('/api/tokens')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].token, "7edfa62b-0024-4f68-a2d4-d3319dfd6d2f");
                    assert.equal(res.body[0].organization, "TestOrg");
                    assert.equal(res.body[0].issued, "SomeDate");
                    done();
                });
        });

        it("no tokens found", done => {
            chai.request(app)
                .get('/api/tokens')
                .end((err, res) => {
                    res.should.have.status(404);
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

    describe("(post) /", () => {
        let executeQueryCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

            //When we need execute query to return different values we will use a count
            //and a switch statement to ensure the proper resolve occurs.
            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    let count = executeQueryCount;
                    executeQueryCount++;
                    switch (count) {
                        case 0:
                            resolve([{organization: "TestOrg1", issued: "SomeDate"},
                                        {organization: "TestOrg2", issued: "SomeDate"},
                                        {organization: "TestOrg3", issued: "SomeDate"}
                                    ]);
                        case 1:
                            resolve([]);
                    }
                });
            });

            sinon.stub(tokensRouter, "check_organizational_existance").callsFake(() => {
                return new Promise((resolve) => {
                    switch (executeQueryCount) {
                        case 0:
                            resolve(false);
                            break;
                        case 1:
                            resolve(true);
                            break;
                    }
                });
            });
        });

        //Each unit test is wrapped with it()
        it("returns all tokens with status 201", done => {
            chai.request(app)
                .post('/api/tokens/')
                .send({organization: "TestOrg"})
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });

        it("organization does not exist display status 409", done => {
            chai.request(app)
                .post('/api/tokens/')
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });

        after(() => {
            tokensRouter.check_organizational_existance.restore();
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });

    describe("(get)  /:token", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });
            //When we need execute query to return different values we will use a count
            //and a switch statement to ensure the proper resolve occurs.
            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    let count = executeQueryCount;
                    executeQueryCount++;
                    switch (count) {
                        case 0:
                            resolve([{organization: "TestOrg", issued: "SomeDate"}]);
                        case 1:
                            resolve([]);
                    }
                });
            });
        });

        it("request info on token with status 200", done => {
            chai.request(app)
                .get('/api/tokens/123456789')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.organization, "TestOrg");
                    assert.equal(res.body.issued, "SomeDate");
                    done();
                });
        });

        it("request info on token with status 404 from missing token", done => {
            chai.request(app)
                .get('/api/tokens/')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        after(() => {
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });

    describe("(delete) /", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });
            sinon.stub(baseRouter, "get_authorization_token").callsFake(() => {
                //Note: Promise objects do not work with strings
                switch (executeQueryCount) {
                    case 0:
                        return "authorized_token";
                    case 1:
                        return "authorized_token";
                    case 2:
                        return "unauthorized_token";
                    case 3:
                        return "";
                }
            });

            sinon.stub(baseRouter, "check_token_existance").callsFake(() => {
                return new Promise((resolve) => {
                    switch (executeQueryCount) {
                        case 0:
                            resolve(1);
                        case 1:
                            resolve(1);
                        case 2:
                            resolve(-1);
                        case 3:
                            resolve(-1);
                    };
                });
            });

            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (executeQueryCount) {
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
            });
        });

        it("delete a token with status 204", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer authorized_token')
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it("delete a token with status 500 from internal error", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer authorized_token')
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });

        it("delete a token with status 403 from improper token provided", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer unauthorized_token')
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it("delete a token with status 401 from no token provided", done => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('Authorization', 'Bearer ')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        afterEach(() => {
            executeQueryCount++;
        });

        after(() => {
            db.executeQuery.restore();
            baseRouter.check_token_existance.restore();
            baseRouter.get_authorization_token.restore();
            mysql.createConnection.restore();
        });
    });

    describe("(get)  /:token", () => {
        let executeQueryCount = 0;
        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });
            //When we need execute query to return different values we will use a count
            //and a switch statement to ensure the proper resolve occurs.
            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    let count = executeQueryCount;
                    executeQueryCount++;
                    switch (count) {
                        case 0:
                            resolve([{organization: "TestOrg", issued: "SomeDate"}]);
                        case 1:
                            resolve([]);
                    }
                });
            });
        });

        it("request info on token with status 200", done => {
            chai.request(app)
                .get('/api/tokens/123456789')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.organization, "TestOrg");
                    assert.equal(res.body.issued, "SomeDate");
                    done();
                });
        });

        it("request info on token with status 404 from missing token", done => {
            chai.request(app)
                .get('/api/tokens/')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        after(() => {
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });

    describe("check_organizational_existence", () => {
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
                        case 1:
                            resolve([undefined]);
                        case 2:
                            resolve([{token: '7edfa62b-0024-4f68-a2d4-d3319dfd6d2f'}]);
                    }
                });
            });
        });

        it("no db results", (done) => {
            tokensRouter.check_organizational_existance('org name').then((res) => {
                assert.equal(res, undefined);
                done();
            });
        });

        it("empty db results", (done) => {
            tokensRouter.check_organizational_existance('org name').then((res) => {
                assert.equal(res, undefined);
                done();
            });
        });

        it("token found", (done) => {
            tokensRouter.check_organizational_existance('org name').then((res) => {
                assert.equal(res, '7edfa62b-0024-4f68-a2d4-d3319dfd6d2f');
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
});
