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
    
    describe("Create tag - POST and GET", () => {

        var tag_name = "test";
        const organization = "Test Org";
        const token = "a61c2fa0-e977-4982-9871-071514b2bc92";

        
        before(async () => {
            await db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('${token}', '${organization}', CURRENT_TIMESTAMP());`);
        });

        beforeEach(() => {

        });

        it("POST tag/", (done) => {
            chai.request(app)
            .post('/api/tags/')
            .set('authorization', `Bearer ${token}`)
            .send({name: tag_name})
            .end((err, res) => {
                res.should.have.status(404);
                tags = res.body.tags.name;
                done();
            });

        });
        
        it("GET tag/", (done) => {
            chai.request(app)
            .get(`/api/tags/`)
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                assert.equal(res.body.tag.name, "test");
                done();
            });
        });

        after(async () =>{
            await db.executeQuery(`DELETE FROM tags`);
            await db.executeQuery(`DELETE FROM tokens`);
        });
    });
    
    describe("Update/Insert tag - POST and GET", () => {

        var tag_name = "test";
        const organization = "Test Org";
        const token = "a61c2fa0-e977-4982-9871-071514b2bc92";

        
        before(async () => {
            await db.executeQuery(`INSERT INTO tokens (token, organization, issued) VALUES ('${token}', '${organization}', CURRENT_TIMESTAMP());`);
        });

        beforeEach(() => {

        });
     
        it("No tags currently exist", done => {
            chai.request(app)
            .get('/api/tags')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
        
        it("Insert tag with interaction and value", (done) => {
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
        
        it("GET existing tag and verify information", (done) => {
            chai.request(app)
            .get(`/api/tags/custom.tag`)
            .end((err, res) => {
                res.should.have.status(200);
                assert.equal(res.body[0].name, "custom.tag");
                assert.equal(res.body[0].interaction, "ButtonClick");
                assert.equal(res.body[0].value, "test");
                done();
            });
        });
        
        it("Update existing tag w/ new interaction & value", (done) => {
            chai.request(app)
            .post('/api/tags/custom.tag')
            .send({interaction: "ImageSelected",  value: "testing"})
            .end((err, res) => {
                res.should.have.status(201);
                assert.equal(res.body.tag.name, "custom.tag");
                assert.equal(res.body.tag.value, "testing");
                assert.equal(res.body.interaction, "ImageSelected");
                done();
            });
        });

        it("GET updated tag and verify information", (done) => {
            chai.request(app)
            .get(`/api/tags/custom.tag`)
            .end((err, res) => {
                res.should.have.status(200);
                assert.equal(res.body[0].name, "custom.tag");
                assert.equal(res.body[0].interaction, "ImageSelected");
                assert.equal(res.body[0].value, "testing");
                done();
            });
        });

        after(() => {
            db.executeQuery(`DELETE FROM tags`).then((results) => {});
            db.executeQuery(`DELETE FROM tokens`).then((results) => {});
        });
    });
});



