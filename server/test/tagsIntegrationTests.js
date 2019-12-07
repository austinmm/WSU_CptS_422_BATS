/* Contains all integration tests related to tag endpoints. */

const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../app');
const db = require('../lib/db');

chai.use(chaiHttp);
chai.should();

describe("Tag Integration Tests: ", () => {
    describe("Get Tag - POST & GET", () => {
        const organization = "Test Org";
        var token_id = 0;
        var tag_name = "custom.tag";
        var token = "a61c2fa0-e977-4982-9871-071514b2bc92";
        var value = "somevalue";
        var tags_count = 0;
        before(async() => {
            await db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('${token}', '${organization}', CURRENT_TIMESTAMP());`);
            await db.executeQuery(`INSERT INTO tags (token_id, name, value, created) VALUES (${token_id}, '${tag_name}', '${value}', CURRENT_TIMESTAMP()) ON DUPLICATE KEY UPDATE value='${value}'`);
            tags_count++;
        });
        //DB List Count (create a token and delete a token, ensure the db is consistent)
        beforeEach(() => {

        });

        it("POST tags/", (done) => {
            chai.request(app)
                .post(`/api/tags/${tag_name}`)
                .send({name: tag_name})
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });

        it("GET tags/", (done) => {
            chai.request(app)
                .get(`/api/tags`)
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.length, tags_count - 1);
                    done();
                });
        });
        afterEach(() => {

        });

        after(() =>{
            db.executeQuery(`DELETE FROM tags`).then((results) => {});
            db.executeQuery(`DELETE FROM tokens`).then((results) => {});
        });
    });
});
