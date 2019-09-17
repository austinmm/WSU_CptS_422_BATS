const uuid = require('uuidv4').default;
//const uuid = require('uuid/v4');
const { executeQuery } = require('./db');

async function generateMockTokens(amount) {
    const recordIds = [];
    const exampleOrganization = 'BATS';
    for (var i = 0; i < amount; i++) {
        const token = uuid();
        const results = await executeQuery(
            `INSERT INTO tokens (token, organization, issued) VALUES ('${token}', '${exampleOrganization}', CURRENT_TIMESTAMP);`);
        recordIds.push(results.insertId);
        console.log(`generate : mock tokens : ${i + 1} / ${amount} (generatedId=${results.insertId}, generatedToken=${token})`);
    }
    return recordIds;
}

async function generateMockTags(tokenRecordId, amount) {
    const tagIds = [];
    for (var i = 0; i < amount; i++) {
        const name = `groups.custom.${i}`;
        const value = 'Example Tag Value';
        const results = await executeQuery(
            `INSERT INTO tags (token_id, name, value, created) VALUES ('${tokenRecordId}', '${name}', '${value}', CURRENT_TIMESTAMP);`);
        tagIds.push(results.insertId);
        console.log(`generate : mock tags : ${i + 1} / ${amount} (tokenRecordId=${tokenRecordId}) (generatedId=${results.insertId})`);
    }
    return tagIds;
}

async function generateMockInteractions(tagId, amount) {
    const exampleActions = ['ButtonClick', 'PageView'];
    const interactionIds = [];
    for (var i = 0; i < amount; i++) {
        const action = exampleActions[Math.floor(Math.random() * exampleActions.length)];
        const results = await executeQuery(
            `INSERT INTO interactions (tag_id, action, time) VALUES ('${tagId})', '${action}', CURRENT_TIMESTAMP);`);
        interactionIds.push(results.insertId);
        console.log(`generate : mock interactions : ${i + 1} / ${amount} (tagId=${tagId}, action=${action})`);
    }
    return interactionIds;
}

/* Generate 1000 mock tokens. Each token will have 10 associated tags, and
   each such tag will have 100 interactions. (1,000,000 total records across
   the three tables. */
async function generateMockData() {
    console.log('Generating mock data...');

    /* Delete all data. */
    await executeQuery('DELETE FROM tokens;');

    const tokens = await generateMockTokens(1000);
    tokens.forEach(async (tokenRecordId) => {
        const tags = await generateMockTags(tokenRecordId, 10);
        tags.forEach((tagId) => {
            generateMockInteractions(tagId, 100);
        });
    });
}

module.exports = { generateMockData };