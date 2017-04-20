# Room Finder Alexa Skill

A skill built for Amazon's Alexa service, that allows you to book a meeting room at the Turing (or your own business with just a little bit of configuration) for up to 2 hours. To run it, use simple phrases like:

> Alexa, ask Room Finder to find me a room

or:

> Alexa, open Room Finder

followed by:

> Book a meeting room

It will then ask you how long you want the room for, find you a room that is free (from a given list), and confirm whether you want to book it. It also has plenty of help, repeat, start-over, and cancel functions.

## Brief intro to Alexa skills

An Alexa skill is, in a nutshell, an 'app' for the Amazon Echo. Once you've opened your skill on the Echo, it recognizes particular phrases, then sends an Intent (indicating what the user wants to do) to a web-service of your choice. For us, that's [AWS Lambda](https://aws.amazon.com/lambda/). Lambda then does whatever function you want it to do, and sends a response back to the skill. In our case, Lambda will be checking and booking room calendars, using the [Microsoft Graph API](https://graph.microsoft.io/).

## Setting up the Alexa skill

To set up the actual skill itself, go to the [Alexa skills kit development console](https://developer.amazon.com/edw/home.html#/skills/list) and add a new skill. This cannot be found in AWS, and can't be done from the command line - sorry.

* In the skill information section, fill in the basic skill information as you wish. It's important to use English (UK) as the language if you're in the UK, or English (US) if you're in the US. It will always work if you add support for both!
* In the interaction model section:
  * In the IntentSchema field, copy and paste the contents of  `interaction_model/intentSchema.json`.
  * Then in the Sample Utterances field, copy and paste the contents of `interaction_model/sample_utterances_en_GB.txt`.
* In the configuration section, select AWS Lambda ARN, then tick Europe, then fill in your **Lambda ARN** as your endpoint. If you don't know this value yet, don't worry, you'll get in the *Hosting the Skill* section.
* You'll also need to set up Account Linking, so change that checkbox to yes.

### Account Linking

Here is our goal security model:

![Security Model](https://cloud.githubusercontent.com/assets/20475469/23951577/5b195b12-0986-11e7-88a6-736b1dc8c91f.png)

We'll be using the [Authorisation Code Grant](https://tools.ietf.org/html/rfc6749#section-4.1) flow to authenticate, but if you're not experienced with OAuth2, don't worry, Amazon will mostly handle this in the background.

In order to set up the account linking part of this model, I'd suggest opening the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList) (where we register the app to give us a token) and the Alexa Skill Configuration Page at the same time; it requires quite a lot of copy-pasting between the two.

* In the Microsoft Portal, click 'Add an app', and name it anything you like.
* In the Microsoft Portal, click 'Add platforms', then 'Web'.
    * Under platforms, click 'Allow Implicit Flow'.
    * Under platforms, add 3 redirect URIS: 'https://amazon.com', 'https://layla.amazon.com/api/skill/link/{SKILL-ID-GOES-HERE}', 'https://pitangui.amazon.com/api/skill/link/{SKILL-ID-GOES-HERE}'. You can find the latter two URLs back in Alexa, under Redirect URLs.
* Copy over the Application ID from Microsoft to 'Client ID' in Alexa.
* In Alexa, put 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?msafed=0' as the Authorisation URL. (The query-string here is not necessary, but prevents people from using their personal Outlook/Hotmail accounts. This is a good idea as Active Directory currently has an unsolvable bug on these accounts that prevents this kind of linking.)
* In Alexa, it's OK to leave 'Domain List' unchanged.
* In Alexa, add the following two scopes: `offline_access`, and `calendars.readwrite`. `offline_access` is required for any Alexa skill, as it provides a refresh token.
* Then click "Auth Code Grant" in Alexa.
* In Alexa, put 'https://login.microsoftonline.com/common/oauth2/v2.0/token?msafed=0' as the Access Token URI.
* In the Microsoft Portal, click 'generate new password'. Save the secret it gives you somewhere secure as you won't be able to see it again. Then copy it over to the 'Client Secret' section of Alexa.
* In the Microsoft Portal, add one 'Delegated Permission': `Calendars.ReadWrite`.
* In Alexa, change the Client Authentication Scheme to 'Credentials in request body'. It won't work with http basic, so this is crucial.
* Lastly, in both Alexa and Microsoft, add a privacy policy URL. I might or might not keep 'http://tomknowl.es/privacypolicy.html' updated as a place-holder, but you should make your own.

### A (skippable) note on endpoints

If you know a lot about Azure, you might be wondering why our app registration isn't being made in Azure Active Directory, or in the Azure Portal. Microsoft is currently in the process of migrating from its V1 Authentication/Token Endpoints to V2. The Azure Portal can currently only make apps that use the V1 Endpoints. We want to use V2. Therefore, we have to use the 'Microsoft Application Registration Portal'. From here you can also see any 'Azure AD only' (V1) applications, but you can only make so-called 'converged' (V2) applications. The Application Registration Portal actually registers the application in Active Directory, so it has the same fundamental backend.

On a similar but unrelated note, you also have two available APIs for accessing Office 365: Microsoft Graph, and the Outlook REST V2 API. We're using Graph, but it's fairly easy to migrate this over to Outlook if you want; I have tested this. Just make sure you modify all scopes/permissions, and update `lambda/requesters.js` to GET/POST to the right place.

## Calendar sharing

The `Calendars.ReadWrite.Shared` scope, although currently provided as part of the Graph API, is broken. [This StackOverflow question](http://stackoverflow.com/questions/42761308/errors-accessing-shared-room-calendars-through-microsoft-graph-api) roughly explains and confirms the issue, as of 14/02/17. In order to bypass the use of this scope, we therefore require some fairly specific calendar sharing, so we only require our authenticated account's list of calendars. To do this, open any account **that is a delegate to and has full access to** the Room Calendars you want to use; if you're doing this for a company, you might have to get an Office 365 Admin to set this up for you. On this account, click open another mailbox under your profile picture, then type in the email address of the Room Calendar you want to use.

<img src="https://cloud.githubusercontent.com/assets/20475469/23951361/c46710e2-0985-11e7-91f6-69d83fadd127.png" width="300" alt="Calendar Sharing">

Then, on the page that opens, navigate to the calendar page, click 'Share' and share the default calendar to the Office365 account you're going to use to authenticate the Alexa Skill. You only need 'view when busy' access for the skill to work.

Sorry, you'll then have to repeat these steps for every other calendar you intend to use...

## Hosting the Skill Handling

The skill handling is built to be hosted on Amazon Web Services' [Lambda](https://aws.amazon.com/lambda/).

**This section shows how to upload the function by the web app, a GUI. If you want to do it from the command line, see "Gulp for Creating the Lambda Function."**

In order to make a function in Lambda:
* Open the Lambda console. If you're in Europe make sure your region is set to EU Ireland (eu-west-1) as this is the only supported European region for Alexa Skills Kit.
* Click 'Create a Lambda function'
* On the 'Select Blueprint' page, first choose 'Node.JS 4.3' as your runtime, then pick a blueprint. I recommend using any of the 'alexa-skills-kit- blueprints, or just a blank function.
* Then, on the 'Configure Triggers' page, make sure Alexa Skills Kit appears as the only trigger.
* On 'Configure Function', pick any name for your function, then select 'Upload a .zip file' for code-entry type.

### Deploying the code to Lambda

* In order to deploy our code to Lambda we need to [create a 'deployment package' - basically a .zip file with all the necessary bits and bobs to run](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html).
* First, you need to make some small edits to `lambda/config.js`. Change `const APP_ID = '{app-id}'` to the APP_ID found in the top left-hand corner of the Alexa console. Then change `const testNames = [...];` to an array of the names of rooms you'd like to find. These are just the names of the room calendars on your Office 365 instance, but **it's important that these names are exact as they're used to identify the right calendars.**
* Then open a terminal, and in it navigate to the `lambda` directory. Run `npm install`, and it will install all the necessary modules for you within the lambda folder. (If this doesn't work, the required packages are request, q, moment, and alexa-sdk.)
* Then within the lambda folder, select `index.js`, `requesters.js`, `resources.js`, `config.js` and `node_modules`; right-click to compress them to a .zip file. **Do not compress the whole lambda folder from the root folder; that won't work.** It's fine if you accidentally compress `package.json` with the others though!
* Upload your .zip file (or 'deployment package') to Lambda.

* Lastly, back on Lambda, leave your handler as index.handler, and use a lambda_basic_execution role. You may have to create this role if this is your first Lambda function.

* After you've created your Lambda function, look at the top right of the page to get your **Lambda ARN** and put that in the Alexa Skill Information Endpoint field.

## Gulp for Creating the Lambda Function

One of the goals of this project is to put as much of the set-up as possible in the command-line. While it's impossible to do this for the Alexa skill itself, there are ways to upload the lambda function in AWS. For consistency I've used Gulp throughout for this, rather than (say) a makefile. Here's how set up works:

1. Install [gulp](gulpjs.com) with `npm install -g gulp`

2. Install the dev-dependencies for the overall skill with `npm install`. *(Note that these are different to the dependencies required for just the lambda function.)*

3. In the `lambda` folder, also run `npm install` to install the necessary modules for just the lambda function.

4. Set the values in `lambda/config.js`. Change `const APP_ID = '{app-id}'` to the APP_ID found in the top left-hand corner of the Alexa console. Then change `const testNames = [...];` to an array of the names of rooms you'd like to find. These are just the names of the room calendars on your Office 365 instance, but **it's important that these names are exact as they're used to identify the right calendars.**

5. **Now you need to install AWS CLI.** This relies on you having either pip or homebrew. Just run `brew install awscli` or `pip install awscli`. It's up to you which.

6. **Then you need to configure AWS CLI.** You do this by running `gulp configure`, and then copying in the correct AWS IAM Key and ID when prompted. You can get these two values by looking [here](http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#iam-user-name-and-password), but I won't explain that in too much detail.

7. **Then you may have to create a 'lambda_basic_execution'-type role for the lambda function.** Just run `gulp createRole`. *Note down the ARN of the created role as you'll need it in the next stage. I'm trying to remove this step, but it's proving tough.*

8. **Create the lambda function itself**. *Right now, you have to copy the ARN from the last step into `params` of the `gulpfile.js`, where it says `Role: '{ARN OF ROOM_FINDER_BASIC_EXECUTION ROLE}',`*. When you've done this, you can just run `gulp create`. This will create minify, lint, zip, and upload it all for you.

9. **Then you'll want to test the function created properly** (Commands below are listed in `automation/test_lambda.sh`.)

    1. Run `aws lambda list-functions --max-items 10 --profile default` to check that your lambda function is there. It should be called RoomFinder.
    2. Get more information on your lambda function by running the below code.
        ```
        aws lambda get-function \
        --function-name RoomFinder \
        --region eu-west-1 \
        --profile default
        ```
    3. Test invocation of the function by running the below code, replacing {} with the file path of a JSON to test. You'll need to make your own JSON for now. (You can steal one out of the `test/requests` files used to test with lambda-local, though you will have to edit its values a bit. It's the thing after `module.exports = ...`)
        ```
        aws lambda invoke \
        --invocation-type RequestResponse \
        --function-name RoomFinder \
        --region eu-west-1 \
        --log-type Tail \
        --payload file://{FILE PATH OF JSON TO TEST} \
        --profile default \
        outputfile.txt
        ```

## Gulp for updating the Lambda function

If you want to make changes or update the function as you go, you can also use gulp. This will also lint and minify the code, and create build and package folders. To do this, first install [gulp](gulpjs.com), and the dev-dependencies for the overall skill. Then, with your updates made, just run `gulp` (or `gulp update`) from the root directory, and it will fully update for you.

## ESLint

I generally use [ESLint](http://eslint.org/), and specifically use the [airbnb](https://github.com/airbnb/javascript) style guide. This is how the project is set up, and most of my code follows this style guide, with the exception of a few rules. You can see my lint config and change it in `package.json` and `eslintrc.json` if you want.

## Doing the account link

Before you test properly on the Echo, you'll need to actually perform the link between your accounts. To do this just open the Alexa [web](https://alexa.amazon.co.uk) or mobile app, and navigate to your fresh new skill. Then click Link Accounts, log in, allow the requested permissions, and hopefully have a successful link.

# Testing

In order to test locally, you'll first need a token to pass to the Lambda function. During development, I am using [Postman](https://www.getpostman.com/) to acquire tokens, and copying them in manually.

When you have a token, edit file: `test/test-config.js`, most importantly replacing `{token}` with your actual token, and `{app-id}` with the same App ID being used in `index.js`. You'll also want to change the various other variables. For example:

```javascript
module.exports = {
  appId: "amzn1.ask.skill.00000000-0000-0000-0000-000000000000",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJEb24ndCBkZWNvZGUgZXhhbXBsZSB0b2tlbnMuIiwiZXhwIjoxLCJuYW1lIjoia25vd2xzaWUiLCJhZG1pbiI6ZmFsc2V9.QhndPM-IJk1XcgntgXqXlI-9mmEesoRLKE1uLhrK5tg",
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  duration: durationInMinutes,
  ownerAddress: "alexaroom1@business.com",
  //Usually the two below have the same value.
  ownerName: "alexaroom1",
  roomName: "alexaroom1"
}
```

## Testing with lambda-local

[lambda-local](https://www.npmjs.com/package/lambda-local) is extremely useful for testing the main Lambda function locally.

Provided you install lambda-local globally (`(sudo) npm install -g lambda-local`), you can test intents from the console using this command: `lambda-local -l lambda/index.js -h handler -e test/requests/filename.js` where filename is the JSON request you want to test. I've created test JSONs for all of the available intents. The most important intent to test is the BookIntent from CONFIRMMODE, and the DurationIntent from TIMEMODE - they make requests to the Graph API.

## Testing with Mocha

I've combined [mocha](https://mochajs.org/) and [lambda-local](https://www.npmjs.com/package/lambda-local) to create a practical testing package. In order to use it, first make sure you have the dev-dependencies of the overall repo installed - particularly `mocha` and `lambda-local`. Then just run `npm test` from the root. You can just use `mocha` if you have mocha installed globally. By default, Mocha checks that the **exact** right response is returned. However, it doesn't perfectly integrate with lambda-local, so it may not always report the error correctly; specifically in cases where Graph API requests are made, it returns timeouts, rather than detailing the wrong response.

If you want to use my other mocha tests, you can change how testing is done by editing which tests are skipped. I only recommend using one of these files at a time.

- `response-test.js` will test that every request returns the *correct* response.

- `simple-test.js` will test just that every request returns *some* response.

- `requesters-test.js` will test that the requesters work.

If you don't want to use mocha, I've also included a shell script, so if you do install lambda-local globally, you can just run that using `bash run_tests.sh`; this will just run every possible intent and log responses.

## Testing just the requesters

One can simply test the requesters using lambda-local, but sometimes that will return timeouts instead of actual errors. Mocha will work, but I also made files in `test/requesters/` so you can quickly test one requesters. Simply run each file in node to see if the requesters are working.

## Testing the skill online

To test the skill online, go to the Test Section in the Alexa Skill Console, use the fantastic [echosim.io](https://echosim.io), or just use an Amazon Echo. If you've done all the bits above properly, the skill will automatically have appeared on any Echoes connected to your account.
