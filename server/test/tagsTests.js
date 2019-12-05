/* Contains all unit tests for our tag Express routes. All external method
calls made inside the logic of each route are stubbed to provide necessary
isolation to ensure consistent and expected behavior in our unit tests. */

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const chaiHttp = require('chai-http');

const app = require('../app');
const mysql = require('mysql');
const db = require('../lib/db');

const baseRouter = require('../routes/base');

chai.use(chaiHttp);
chai.should();

describe("Tag Router Tests: ", () => {
    describe("(post) /:name", () => {
        var testCount = 0;
        var dbQueryCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            switch(dbQueryCount){
                                case 0: resolve({insertId: 1});
                                    break;
                                default: resolve({});
                            }
                            dbQueryCount++;
                            break;
                        case 1:
                            switch(dbQueryCount){
                                case 0: resolve({insertId: 0});
                                    break;
                                case 1: resolve([{id: 1}]);
                                    break;
                                default: resolve({});
                            }
                            dbQueryCount++;
                            break;
                        case 2:
                            switch(dbQueryCount){
                                case 0: resolve({insertId: 0});
                                    break;
                                case 1: resolve([{id: 1}]);
                                    break;
                                default: resolve({});
                            }
                            dbQueryCount++;
                            break;
                        default:
                            resolve({});
                    }
                });
            });

            sinon.stub(baseRouter, "get_authorization_token").callsFake(() => {
                switch (testCount) {
                    case 0:
                        return "auth_token";
                    case 1:
                        return "auth_token";
                    case 2:
                        return "auth_token";
                    case 3:
                        return "";
                    case 4:
                        return "auth_token";
                    default:
                        return "auth_token";
                }
            });

            sinon.stub(baseRouter, "check_token_existence").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            resolve(1);
                            break;
                        case 1:
                            resolve(1);
                            break;
                        case 2:
                            resolve(1);
                            break;
                        case 3:
                            resolve(-1);
                            break;
                        case 4:
                            resolve(-1);
                            break;
                        default:
                            resolve(1);
                    }
                });
            });
        });

        beforeEach(() => {
            console.log("COUNT");
            console.log(dbQueryCount);
            dbQueryCount = 0;
        });

        it("insert tag and create interaction", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ButtonClick", value: "test"})
                .end((err, res) => {
                    res.should.have.status(201);
                    assert.equal(res.body.tag.name, "custom.tag");
                    assert.equal(res.body.tag.value, "test");
                    assert.equal(res.body.interaction, "ButtonClick");
                    done();
                });
        });

        it("Update existing tag w/ new interaction & NO value", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ButtonClick"})
                .end((err, res) => {
                    res.should.have.status(201);
                    assert.equal(res.body.tag.name, "custom.tag");
                    assert.equal(res.body.interaction, "ButtonClick");
                    done();
                });
        });

        it("Update existing tag w/ new interaction & value", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ImageSelected",  value: "test"})
                .end((err, res) => {
                    res.should.have.status(201);
                    assert.equal(res.body.tag.name, "custom.tag");
                    assert.equal(res.body.tag.value, "test");
                    assert.equal(res.body.interaction, "ImageSelected");
                    done();
                });
        });

        it("Attempt Tag Post w/out Providing Authentication", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ButtonClick", value: "test"})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it("Attempt Tag Post w/ Invalid Authentication", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ButtonClick", value: "test"})
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        afterEach(() => {
            testCount++;
        });

        after(() => {
            baseRouter.get_authorization_token.restore();
            baseRouter.check_token_existence.restore();
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });

    //testing a specific tag
    describe("(get) /:name", () => {
        let testCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            resolve([{token_id: 12, name: "Test", created: "SomeDate"}]);
                        case 1:
                            resolve([]);
                    }
                });
            });

            sinon.stub(baseRouter, "get_authorization_token").callsFake(() => {
                switch (testCount) {
                    case 0:
                        return "auth_token";
                    case 1:
                        return "auth_token";
                    case 2:
                        return "";
                    case 3:
                        return "auth_token";
                    default:
                        return "auth_token";
                }
            });

            sinon.stub(baseRouter, "check_token_existence").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            resolve(1);
                            break;
                        case 1:
                            resolve(1);
                            break;
                        case 2:
                            resolve(-1);
                            break;
                        case 3:
                            resolve(-1);
                            break;
                        default:
                            resolve(1);
                            break;
                    }
                });
            });
        });

        it("request info on tag with status 200", (done) => {
            chai.request(app)
                .get('/api/tags/Testing1234')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body[0].name, "Test");
                    assert.equal(res.body[0].token_id, 12);
                    assert.equal(res.body[0].created, "SomeDate");
                    done();
                });
        });

        it("request info on tag with status 404", done => {
            chai.request(app)
                .get('/api/tags/Testing1234')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it("Attempt to GET Tag w/out Providing Authentication", (done) => {
            chai.request(app)
                .get('/api/tags/Testing1234')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it("Attempt to GET Tag w/ Invalid Authentication", (done) => {
            chai.request(app)
                .get('/api/tags/Testing1234')
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        afterEach(() => {
            testCount++;
        });

        after(() => {
            baseRouter.get_authorization_token.restore();
            baseRouter.check_token_existence.restore();
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });

    //testing all tags
    describe("(get) /", () => {
        let testCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            resolve([{token_id: 12, name: "Test", created: "SomeDate"}]);
                        case 1:
                            resolve([]);
                    }
                });
            });

            sinon.stub(baseRouter, "get_authorization_token").callsFake(() => {
                switch (testCount) {
                    case 0:
                        return "auth_token";
                    case 1:
                        return "auth_token";
                    case 2:
                        return "";
                    case 3:
                        return "auth_token";
                    default:
                        return "auth_token";
                }
            });

            sinon.stub(baseRouter, "check_token_existence").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            resolve(1);
                            break;
                        case 1:
                            resolve(1);
                            break;
                        case 2:
                            resolve(-1);
                            break;
                        case 3:
                            resolve(-1);
                            break;
                        default:
                            resolve(1);
                            break;
                    }
                });
            });
        });

        it("returns a list of all tags", (done) => {
            chai.request(app)
                .get('/api/tags')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body[0].name, "Test");
                    assert.equal(res.body[0].token_id, 12);
                    assert.equal(res.body[0].created, "SomeDate");
                    done();
                });
        });

        it("no tags found", done => {
            chai.request(app)
                .get('/api/tags')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it("Attempt to GET Tags w/out Providing Authentication", (done) => {
            chai.request(app)
                .get('/api/tags')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it("Attempt to GET Tags w/ Invalid Authentication", (done) => {
            chai.request(app)
                .get('/api/tags')
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        afterEach(() => {
            testCount++;
        });

        after(() => {
            baseRouter.get_authorization_token.restore();
            baseRouter.check_token_existence.restore();
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });
});
