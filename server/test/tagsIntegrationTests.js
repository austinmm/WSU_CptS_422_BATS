const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../app');
const db = require('../lib/db');

chai.use(chaiHttp);
chai.should();

describe("Tag Integration Tests: ", () => {
    describe("<integration test 1>", () => {
        before(() => {

        });

        beforeEach(() => {

        });

        it("<test case 1>", (done) => {
            db.executeQuery("SELECT * FROM tags;").then((results) => {
                console.log(results);
                done();
            });
        });

        afterEach(() => {

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
            .send({name: tag_name})
            .end((err, res) => {
                res.should.have.status(201);
                tags = res.body.tags.name;
                done();
            });

        });
        
        it("GET tag/", (done) => {
            chai.request(app)
            .get(`/api/tags/`)
            .end((err, res) => {
                res.should.have.status(200);
                assert.equal(res.body.tag.name, "test");
                done();
            });
        });

        after(() => {
            db.executeQuery(`DELETE FROM tags`).then((results) => {});
        });
    });
});



