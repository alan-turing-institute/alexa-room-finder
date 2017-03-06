# Room Booker Alexa Skill

This is an in-development skill built for Amazon's Alexa service, that allows you to book a room for half-an-hour. Currently it handles simple phrases like:

> Alexa, ask Room Booker to book me a room

or:

> Alexa, open Room Booker

followed by:

> Book me a room

It also has help, repeat, start-over and cancel functions.

In this in-development version, instead of reading the meeting room calendars, and then creating an event in the correct one, it reads the personal calendar of whoever's account is linked to the Alexa Skill, checks if it's free for half-an-hour, then makes an event if it is free.

## Setting up the Alexa Skill

To set up the skill, go to the [Alexa skills kit development console](https://developer.amazon.com/edw/home.html) and add a new skill.

* In the skill information section, fill in the basic skill information as you wish (using English (UK) as the language, assuming you're based in Europe.)
* In the interaction model section: in the IntentSchema field, copy and paste the contents of the `interaction_model/intentSchema.json` file. Then in the Sample Utterances field, copy and paste the contents of
`interaction_model/sample_utterances_en_GB.txt`.
* In the configuration section, fill in your **Lambda ARN** as your endpoint. You'll get in the *Hosting the Skill* section.
* You'll also need to set up Account Linking, so change that checkbox to yes. We're using the Microsoft V2 endpoint and Auth Code Grant for authorizing. This is proving a little bit of a pain-point, so I'll update the documentation here later.

When these steps are done, the skill should appear in your Amazon Alexa app (provided you're logged in with the same account as you develop on), and will automatically load onto your Amazon Echo. In a local use case (like here at the Turing) there is no need to publish.

Once you've set up your skill, take note of the *App ID* at the top left. You'll need to copy this into index.js at `const APP_ID = undefined`.

## Hosting the Skill

The skill is built to be hosted on Amazon Web Services' [Lambda](https://aws.amazon.com/lambda/).. First, from the Lambda console, make sure your region is set to EU Ireland (eu-west-1) as this is the only supported region for Alexa Skill Kit. Then create a Lambda function (using any of the 'alexa-skills-kit- blueprints, or just a blank function) and choose Node.JS as the runtime. On triggers, make sure Alexa Skills Kit appears as the only trigger. After you've created your Lambda function, look at the top right of the page to get your **Lambda ARN** and put that in the Alexa Skill Information Endpoint field.

To deploy to Lambda, first make sure you have the right APP_ID in index.js, then follow the instructions [here](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html), using the 'lambda' folder.  Then you can upload it straight to the Lambda function. As this step is a bit complex, especially mid-development, I'm looking to automate it with an [AWS CodePipeline](http://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html) from this repo.

## Testing The Lambda Function Locally

In order to test, you'll first need a token to pass to the Lambda function. During development, I am using [Postman](https://www.getpostman.com/) to acquire tokens, and copying them in manually. You'll just need to edit file: `test/config.js`, replacing `{token}` with your actual token.

You can use [lambda-local](https://www.npmjs.com/package/lambda-local) to test the main Lambda function locally. `test/lambda-local-test.js` is an customisable Javascript file you can use for this. To test, simply use Node to run this file from the console: `node test/lambda-local-test.js`

If you install lambda-local globally, you can also test from the console using this command: `lambda-local -l lambda/index.js -h handler -e test/filename.js` where filename is the JSON request you want to test. I've created test JSONs for most of the available intents. The most important intent to test is the BookIntent in both the BLANK and \_CONFIRMMODE state, as that is the only intent that directly accesses the Office API.

## Testing the skill online

To test the skill online, go to the Test Section in the Alexa Skill Console for the Room Booker Skill. This should allow you to test without using the Amazon Echo device itself. This currently can't be done due to faulty account linking, so further information will be included when account linking works. 
