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
});
