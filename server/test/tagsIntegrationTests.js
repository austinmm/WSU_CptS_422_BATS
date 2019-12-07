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
        var tag_name = "custom.tag";
        var token = "a61c2fa0-e977-4982-9871-071514b2bc92";
        var value = "somevalue";
        var tags_count = 1;
        before(async() => {
            const resp = await db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('${token}', '${organization}', CURRENT_TIMESTAMP());`);
            await db.executeQuery(`INSERT INTO tags (token_id, name, value, created) VALUES (${resp.insertId}, '${tag_name}', '${value}', CURRENT_TIMESTAMP()) ON DUPLICATE KEY UPDATE value='${value}'`);
        });

        it("POST tags/", (done) => {
            chai.request(app)
                .post(`/api/tags/${tag_name}`)
                .set('authorization', `Bearer ${token}`)
                .send({name: tag_name})
                .end((err, res) => {
                    res.should.have.status(201);
                });
            chai.request(app)
                .get(`/api/tags`)
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body.length, tags_count);
                    done();
                });
        });

        after(async () =>{
            await db.executeQuery(`DELETE FROM tags`);
            await db.executeQuery(`DELETE FROM tokens`);
        });
    });
});
