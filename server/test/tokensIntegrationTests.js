const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const sinon = require('sinon');
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
                console.log(data);
                assert.equal(data.length, 1);
                done();
            });
        });

        after(async () => {
            await db.executeQuery("DELETE FROM tokens;");
        });
    });
});
