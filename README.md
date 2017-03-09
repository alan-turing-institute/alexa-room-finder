# Room Booker Alexa Skill

This is an in-development skill built for Amazon's Alexa service, that allows you to book a room for half-an-hour. Currently it handles simple phrases like:

> Alexa, ask Room Booker to book me a room

or:

> Alexa, open Room Booker

followed by:

> Book me a room

It also has help, repeat, start-over and cancel functions.

In its current version, instead of reading the meeting room calendars, and then creating an event in the correct one, it reads the personal calendar of whoever's account is linked to the Alexa Skill, checks if it's free for half-an-hour, then makes an event if it is free.

## Setting up the Alexa Skill

To set up the actual skill itself, go to the [Alexa skills kit development console](https://developer.amazon.com/edw/home.html) and add a new skill.

* In the skill information section, fill in the basic skill information as you wish. It's important to use English (UK) as the language if you're in the UK.
* In the interaction model section: in the IntentSchema field, copy and paste the contents of the `interaction_model/intentSchema.json` file. Then in the Sample Utterances field, copy and paste the contents of
`interaction_model/sample_utterances_en_GB.txt`.
* In the configuration section, select, AWS Lambda ARN, then tick Europe, then fill in your **Lambda ARN** as your endpoint. If you don't know this yet, don't worry, you'll get in the *Hosting the Skill* section.
* You'll also need to set up Account Linking, so change that checkbox to yes. I recommend using the Microsoft V2 endpoint, a 'converged' Active Directory App Registration and Auth Code Grant for authorizing.

### Account Linking

Here is the goal security model:

![Security Model](https://cloud.githubusercontent.com/assets/20475469/23750447/f24f1e98-04c4-11e7-8201-58352c29ddb9.png)

In order to set up the account linking part of this, I'd suggest opening the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList) and the Alexa Skill Configuration Page at the same time, as it requires some copy-pasting between the two.

* In the Microsoft Portal, click 'add an app', and name it as you will, and click 'web'.
* Copy over the Application ID from Microsoft to 'Client ID' in Alexa.
* In Alexa, put 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?msafed=0' as the Authorisation URL. (The query-string here is not necessary, but prevents people from using their personal outlook/hotmail accounts. This is a good idea as Active Directory currently has an unsolvable bug on these accounts that prevents this kind of linking...)
* In Alexa, leave 'Domain List' unchanged.
* In Alexa, add the following scopes: `offline_access`, `calendars.readwrite.shared`, and `user.read`.
* Then click "Auth Code Grant" in Alexa as we're using that flow.
* In Alexa, put 'https://login.microsoftonline.com/common/oauth2/v2.0/token?msafed=0' as the Access Token URI.
* In the Microsoft Portal, click 'generate new password'. Save that somewhere secure as you won't be able to see it again. Then copy that over to the 'Client Secret' section of Alexa.
* In Alexa, change the Client Authentication Scheme to 'Credentials in request body'.
* In Alexa, add a privacy policy URL. I'll try to keep 'http://tomknowl.es/privacypolicy.html' updated as a place-holder, but if you plan to change anything whatsoever make your own.
* In the Microsoft Portal, click 'Allow Implicit Flow'.
* In the Microsoft Portal, add 3 redirect URIS: 'https://amazon.com', 'https://layla.amazon.com/api/skill/link/{SKILL-ID-GOES-HERE}', 'https://pitangui.amazon.com/api/skill/link/{SKILL-ID-GOES-HERE}'. You can find the latter two URLs back in Alexa, under Redirect URLs.
* In the Microsoft Portal, add two 'Delegated Permissions': `Calendars.Readwrite.Shared` and `User.Read`.

### A note on endpoints

If you know a lot about Azure, you might be wondering why our app registration isn't being made in Azure Active Directory or the Azure Portal. Microsoft is currently in the process of migrating from its V1 Authentication/Token Endpoints, to V2. The Azure Portal can currently only make apps that use the V1 Endpoints, whereas we want to use V2, as it's more likely to stay updated and it works for both personal and work accounts. Therefore, we instead have to use the Microsoft Application Registration Portal. From here you can also see any 'Azure AD only' (V1) applications, but you can only make so-called 'converged' (V2) applications. The Application Registration Portal also actually registers the application in Active Directory, so it has the same fundamental backend.

Unrelated to this, you also have two possible APIs for accessing Office 365: Microsoft Graph, and the Outlook REST V2 API. We're using Graph, but it's fairly easy to migrate this over to Outlook if you want; I have tested this. Just make sure you modify all scopes/permissions, and update `lambda/requesters.js` to GET/POST to the right place.

## Hosting the Skill

The skill is built to be hosted on Amazon Web Services' [Lambda](https://aws.amazon.com/lambda/).

In order to make a function in Lambda:
* Open the Lambda console, and make sure your region is set to EU Ireland (eu-west-1) as this is the only supported European region for Alexa Skill Kit.
* Click 'Create a Lambda function'
* On the 'Select Blueprint' page, first choose 'Node.JS 4.3' as your runtime, then pick a blueprint. I recommend using any of the 'alexa-skills-kit- blueprints, or just a blank function.
* Then, on the 'Configure Triggers' page, make sure Alexa Skills Kit appears as the only trigger.
* On 'Configure Function', pick any name for your function, then select 'Upload a .zip file' for code-entry type.

### Deploying the code to Lambda
* In order to deploy our code to Lambda we need to create a .zip file with all the necessary bits and bobs.
* First, you need to make a small edit to `index.js`. Change `APP_ID = undefined` to the APP_ID found in the top left-hand corner of the Alexa console.
* Then open a terminal, and in it navigate to the `lambda` directory. Then run `npm install`, and it will install the necessary modules for you.
* Then within the lambda folder, select `index.js`, `requesters.js`, and `node_modules`, and right-click to compress them to a .zip file. Do not select zip the lambda folder from the root folder, as htat won't work.
* Then upload your .zip file to Lambda!

* Lastly, back on Lambda, leave your handler as index.handler, and use a lambda_basic_execution role. You may have to create this if this is your first Lambda function.

* After you've created your Lambda function, look at the top right of the page to get your **Lambda ARN** and put that in the Alexa Skill Information Endpoint field.

## Testing The Lambda Function Locally

In order to test locally, you'll first need a token to pass to the Lambda function. During development, I am using [Postman](https://www.getpostman.com/) to acquire tokens, and copying them in manually. You'll just need to edit file: `test/config.js`, replacing `{token}` with your actual token.

[lambda-local](https://www.npmjs.com/package/lambda-local) to extremely useful for testing the main Lambda function locally. `test/lambda-local-test.js` is an customisable Javascript file you can use for this. To test, simply use Node to run this file from the console: `node test/lambda-local-test.js`

If you install lambda-local globally, you can also test from the console using this command: `lambda-local -l lambda/index.js -h handler -e test/filename.js` where filename is the JSON request you want to test. I've created test JSONs for pretty much of the available intents. The most important intent to test is the BookIntent in both the BLANK and \_CONFIRMMODE state, as that is the only intent that directly accesses the Office API.

## Performing the account link

Before you test properly on the Echo, you'll need to actually perform the link between your accounts. To do this just open the Alexa [web](https://alexa.amazon.co.uk) or mobile app, and navigate to your fresh new skill. Then click Link Accounts, log in, allow permissions and hopefully have a successful link.

## Testing the skill online

To test the skill online, go to the Test Section in the Alexa Skill Console, use echosim.io, or just use an Amazon Echo. Nothing like the real thing.
