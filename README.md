# CptS 422: Software Engineering Principles II
## Team Name
BATS: Business Analytics Tagging Service

## Project Description
An api that lets businesses track analytics for their websites via logging tags within our database and then being able to simply query back to get information on total usage for different tags.

See [Deliverable 1](docs/Deliverable_1.pdf) for our Deliverable 1 document.

## Testing the api
### PREREQ:
-NodeJS (Recent version)
-Postman (Suggested/Optional)
Clone the current master branch
Run "npm install" to download all necessary dependencies within the package.json
Next, run "node app.js" to start up server

### Create a token
POST 0.0.0.0:3000/api/tokens/
body:
{
	"organization": "company name"
}

### Delete a token (and related tags and interactions)
DELETE 0.0.0.0:3000/api/tokens/(token)

### Create/Update tag/interaction
POST 0.0.0.0:3000/api/tags/(name)
body:
{
	"value": "metadata",
	"interaction": "interaction type"
}

### View all interactions by name
GET 0.0.0.0:3000/api/tags/(name)

### View all interactions
GET 0.0.0.0:3000/api/tags

### Testing with website
Open [frontend/index.html](frontend/index.html)
and go ahead and click the sample buttons
to check the database use View All Interactions route with the following header:
headers: {
                'Authorization': `Bearer 056f9979-b5bb-4741-898f-80b432461e21`,
            }

## Team Members
* Austin Marino
* Cole Bennett
* Joseph Cunningham
* Niko Kent
