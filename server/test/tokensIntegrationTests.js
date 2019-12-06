/* Contains all integration tests related to token endpoints. */

const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const app = require('../app');
const db = require('../lib/db');

chai.use(chaiHttp);
chai.should();

describe("Tokens Integration Tests: ", () => {
    describe("Test Create Token with check_organizational_existence", () => {
        const organization = "Test Org";
        const token = "a61c2fa0-e977-4982-9871-071514b2bc92";

        before(async () => {
            await db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('${token}', '${organization}', CURRENT_TIMESTAMP());`);
        });

        it("Org Already Exists", (done) => {
            chai.request(app)
            .post('/api/tokens/')
            .send({organization})
            .end((err, res) => {
                res.should.have.status(409);
                done();
            });
        });

        it("Token Created", (done) => {
            chai.request(app)
            .post('/api/tokens/')
            .send({organization: 'New Org'})
            .end(async (err, res) => {
                res.should.have.status(201);

                const data = await db.executeQuery("SELECT organization FROM tokens WHERE organization = 'New Org';");
                assert.equal(data.length, 1);
                done();
            });
        });

        after(async () => {
            await db.executeQuery("DELETE FROM tokens;");
        });
    });

    describe("Create an Account - POST & GET", () => {
        var organization = "New Test Organization";
        var token = "";

        before(() => {

        });

        beforeEach(() => {

        });

        it("POST token/", (done) => {
            chai.request(app)
                .post('/api/tokens/')
                .send({organization: organization})
                .end((err, res) => {
                    res.should.have.status(201);
                    token = res.body.token;
                    done();
                });
        });

        it("GET token/:token", (done) => {
            chai.request(app)
                .get(`/api/tokens/${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.organization, organization);
                    done();
                });
        });

        afterEach(() => {

        });

        after(() =>{
            db.executeQuery(`DELETE FROM tokens`).then((results) => {});
        });
    });

    describe("Delete Account - DELETE & GET", () => {
        var token = "a61c2fa0-e977-4982-9871-071514b2bc92";
        var account_count = 0;

        before(() => {
            db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('${token}', 'Organization 1', CURRENT_TIMESTAMP());`).then((results) => {
                account_count++;
            });
            db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('a61c2fa0-e977-4982-9871-071514b26g1s', 'Organization 2', CURRENT_TIMESTAMP());`).then((results) => {
                account_count++;
            });
        });
        //DB List Count (create a token and delete a token, ensure the db is consistent)
        beforeEach(() => {

        });

        it("DELETE token/", (done) => {
            chai.request(app)
                .delete('/api/tokens/')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it("GET token/", (done) => {
            chai.request(app)
                .get(`/api/tokens/`)
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.length, account_count - 1);
                    done();
                });
        });

        it("GET token/:token", (done) => {
            chai.request(app)
                .get(`/api/tokens/${token}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        afterEach(() => {

        });

        after(() =>{
            db.executeQuery(`DELETE FROM tokens`).then((results) => {});
        });
    });
});
