# Room Booker Alexa Skill

This is an in-progress skill built for Amazon's Alexa service that allows you to book rooms. Currently it handles very simple phrases like:

> Alexa, Open Room Booker

> Alexa, Book me a room

It currently lacks any interaction with the Microsoft Graph API, just using place-holder text, and assuming a room is free. This implementation uses the [Alexa Skills Kit SDK for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs).

## Setting up the Alexa Skill

To set up the skill, go to the [Alexa skills kit development console](https://developer.amazon.com/edw/home.html) and add a new skill.

* In the skill information section, fill in the basic skill information as you wish (using English (UK) as the language, assuming you're based in Europe.)
* In the interaction model section: in the IntentSchema field, copy and paste the contents of the `interaction_model/intentSchema.json` file. Then in the Sample Utterances field, copy and paste the contents of
`interaction_model/sample_utterances_en_GB.txt`.
* In the configuration section, fill in your **Lambda ARN** as your endpoint. You'll get in the *Hosting the Skill* section.

When these steps are done, the skill should appear in your Amazon Alexa app (provided you're logged in with the same account as you develop on), and will automatically load onto your Amazon Echo. In a local use case (like here at the Turing) there is no need to publish.

Once you've set up your skill, take note of the *App ID* at the top left. You'll need to copy this into index.js at `const APP_ID = `.

## Hosting the Skill

The skill is built to be hosted on Amazon Web Services' [Lambda](https://aws.amazon.com/lambda/).. First, from the Lambda console, make sure your region is set to EU Ireland (eu-west-1) as this is the only supported region for Alexa Skill Kit. Then create a Lambda function (using any of the 'alexa-skills-kit- blueprints) and choose Node.js as the runtime. On triggers, make sure Alexa Skills Kit appears as the only trigger. After you've created your Lambda function, look at the top right of the page to get your **Lambda ARN number** and put that in the Alexa Skill Information Endpoint field.

To deploy to Lambda, just upload or copy-paste index.js to your Lambda function, making sure you have the right APP_ID. This will eventually change as authorization (and thus several more files) are added, at which point all the files will be made into a Node package, and will be uploaded by a .zip file.

## Testing The Skill Locally

You can use [lambda-local](https://www.npmjs.com/package/lambda-local) to test the main Lambda function locally. `test/lambda-local-test.js` is an editable Javascript file you can use for this, which should be easily customizable to any intent. To test an intent, simply run this file from the console.

If you install lambda-local globally, you can also test from the console using this command: `lambda-local -l index.js -h handler -e filename` where filename is the JSON request you want to test. When the program is approaching a final state, I will compile all possible JSON requests in the `test` directory to facilitate this.

## Testing the skill online

To test the skill online, go to the Test Section in the Alexa Skill Console for the Room Booker Skill. This should allow you to test without using the Amazon Echo device itself.
