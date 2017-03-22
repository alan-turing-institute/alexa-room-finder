# Room Finder Alexa Skill

A skill built for Amazon's Alexa service, that allows you to book a meeting room at the Turing (or your own business with a little bit of configuration) for up to 2 hours. To get it working, uses simple phrases like:

> Alexa, ask Room Finder to find me a room

or:

> Alexa, open Room Finder

followed by:

> Book a meeting room

It will then ask you how long you want the room for, find you a room that is free (from a given list), and confirm whether you want to book it. It also has plenty of help, repeat, start-over, and cancel functions.

## Brief intro to Alexa skills

An Alexa skill is, in a nutshell, an 'app' for the Amazon Echo. Once you've opened your skill on the Echo, it recognizes particular phrases, then sends an Intent (indicating what the user wants to do) to a web-service of your choice. For us, that's [AWS Lambda](https://aws.amazon.com/lambda/). Lambda then does whatever function you want it to do, and sends a response back to the skill. In our case, Lambda will be checking and booking room calendars, using the [Microsoft Graph API](https://graph.microsoft.io/).

## Setting up the Alexa skill

To set up the actual skill itself, go to the [Alexa skills kit development console](https://developer.amazon.com/edw/home.html) and add a new skill.

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

* In the Microsoft Portal, click 'add an app', and name it anything you like.
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

![Calendar Sharing](https://cloud.githubusercontent.com/assets/20475469/23951361/c46710e2-0985-11e7-91f6-69d83fadd127.png)

Then, on the page that opens, navigate to the calendar page, click 'Share' and share the default calendar to the Office365 account you're going to use to authenticate the Alexa Skill. You only need 'view when busy' access for the skill to work.

Sorry, you'll then have to repeat these steps for every other calendar you intend to use...

## Hosting the Skill Handling

The skill handling is built to be hosted on Amazon Web Services' [Lambda](https://aws.amazon.com/lambda/).

**This section shows how to upload the function by the web app, a GUI. If you want to do it from the command line, see "Automating Lambda Function creation and configuration."**

In order to make a function in Lambda:
* Open the Lambda console. If you're in Europe make sure your region is set to EU Ireland (eu-west-1) as this is the only supported European region for Alexa Skills Kit.
* Click 'Create a Lambda function'
* On the 'Select Blueprint' page, first choose 'Node.JS 4.3' as your runtime, then pick a blueprint. I recommend using any of the 'alexa-skills-kit- blueprints, or just a blank function.
* Then, on the 'Configure Triggers' page, make sure Alexa Skills Kit appears as the only trigger.
* On 'Configure Function', pick any name for your function, then select 'Upload a .zip file' for code-entry type.

### Deploying the code to Lambda

* In order to deploy our code to Lambda we need to [create a 'deployment package' - basically a .zip file with all the necessary bits and bobs to run](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html).
* First, you need to make some small edits to `lambda/config.js`. Change `const APP_ID = '{app-id}'` to the APP_ID found in the top left-hand corner of the Alexa console. Then change `const testNames = [...];` to an array of the names of rooms you'd like to find. These are just the names of the room calendars on your Office 365 instance, but **it's important that these names are exact as they're used to identify the right calendars.**
* Then open a terminal, and in it navigate to the `lambda` directory. Run `npm install`, and it will install all the necessary modules for you. If this doesn't work, the required packages are request, q, moment, and alexa-sdk.
* Then within the lambda folder, select `index.js`, `requesters.js`, `resources.js`, `config.js` and `node_modules`; right-click to compress them to a .zip file. **Do not compress the whole lambda folder from the root folder; that won't work.** It's fine if you accidentally compress `package.json` with the others though!
* Upload your .zip file (or 'deployment package') to Lambda.

* Lastly, back on Lambda, leave your handler as index.handler, and use a lambda_basic_execution role. You may have to create this role if this is your first Lambda function.

* After you've created your Lambda function, look at the top right of the page to get your **Lambda ARN** and put that in the Alexa Skill Information Endpoint field.

## Testing The Lambda Function Locally

In order to test locally, you'll first need a token to pass to the Lambda function. During development, I am using [Postman](https://www.getpostman.com/) to acquire tokens, and copying them in manually.

Edit file: `test/config.js`, most importantly replacing `{token}` with your actual token, and `{app-id}` with the same App ID being used in index.js. You'll also want to change the various other variables. For example:

```
module.exports = {
  appId: "amzn1.ask.skill.00000000-0000-0000-0000-000000000000",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJEb24ndCBkZWNvZGUgZXhhbXBsZSB0b2tlbnMuIiwiZXhwIjoxLCJuYW1lIjoia25vd2xzaWUiLCJhZG1pbiI6ZmFsc2V9.QhndPM-IJk1XcgntgXqXlI-9mmEesoRLKE1uLhrK5tg",
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  ownerAddress: "alexaroom1@business.com",
  //Usually the two below have the same value.
  ownerName: "alexaroom1",
  roomName: "alexaroom1"
}
```

[lambda-local](https://www.npmjs.com/package/lambda-local) is extremely useful for testing the main Lambda function locally. `test/lambda-local-test.js` is one editable Javascript file you can use. To test it, simply use Node to run this file from the console: `node test/lambda-local-test.js`. There's a better way to test though:

If you install lambda-local globally (`sudo npm install -g lambda-local`), you can also test from the console using this command: `lambda-local -l lambda/index.js -h handler -e test/filename.js` where filename is the JSON request you want to test. I've created test JSONs for all of the available intents. The most important intent to test is the BookIntent from every state, as that is the only intent that directly accesses the Office API.

Lastly, I included a shell script, so if you do install lambda-local globally, you can just run that using `bash run_tests.sh`; this will test every possible intent, and is probably the quickest way to check that everything is running before deployment. If you get any errors, then you need to worry. Don't be surprised at a couple 'Unhandled' responses though - those are meant to happen if you ask the skill to 'Start Over' from the beginning!

## Automating Lambda Function Creation and Configuration

One of the goals of this project is to automate (or at least put in the command line) as much of the set-up as possible. While AWS CLI provides no support for Alexa Skills, you can use AWS CLI to create and update the Lambda function. The necessary bash commands to do this are found in the `automation` folder, and are detailed below. Once you've edited the shell files to have the correct configuration values, you can run any of the files from the `automation` folder, for the desired effect.

**First you need to install and configure AWS CLI** (Commands below are listed in `automation/configure_aws_cli.sh`.)

1. `brew install awscli` (`pip install awscli` will also work, but if you have brew, I suggest using that.)
2. Run the below commands replacing the {} with access keys. You can get keys by following [these instructions.](http://docs.aws.amazon.com/lambda/latest/dg/setting-up.html)
  ```
  aws configure set aws_access_key_id {AWS KEY}
  aws configure set aws_secret_access_key {AWS SECRET}
  aws configure set default.region eu-west-1
  ```

**Then you may have to create a 'lambda_basic_execution'-type role for the lambda function. You don't need to do this if you already have a lambda_basic_execution role.** (Commands below are listed in `automation/create_role.sh`)

1. From the automation folder, run `aws iam create-role --role-name room_finder_basic_execution --assume-role-policy-document file://role-policy-document.json`. This creates a role named 'room_finder_basic_execution'.
2. Run `aws iam put-role-policy --role-name room_finder_basic_execution --policy-name lambda_basic_execution --policy-document file://basic-execution-role.json`. This attaches a very basic policy to the role. This policy has very limited permissions, so you may want to add more if you want to complicate your skill.
3. Run `aws iam get-role --role-name room_finder_basic_execution` to check the role created. From the object this returns, note down the "Arn" field as you'll need it in the next step.

**Then you need to create the lambda function itself** (Commands below are listed in `automation/create_lambda.sh`.)

1. From the `automation` folder, run `cd ../lambda`.
2. Run `npm install` to install node_modules/, if you haven't already.
3. Run `zip -r -X lambda.zip index.js requesters.js resources.js config.js node_modules/` to recursively compress the deployment package to `lambda.zip`.
4. Run the below command to create the function, replacing {} with the ARN of the role. This can be found by running `aws iam get-role --role-name room_finder_basic_execution`, or in the Roles section of AWS IAM.
  ```
  aws lambda create-function \
  --region eu-west-1 \
  --function-name RoomFinder \
  --zip-file fileb://lambda.zip \
  --role {ARN OF ROOM_FINDER_BASIC_EXECUTION ROLE} \
  --handler index.handler \
  --runtime nodejs4.3 \
  --profile default
  ```
5. Run the below command to add the Alexa Skills Kit trigger/permission to the new RoomFinder lambda function. You may want to replace "1234" with a unique identifier of your own.
  ```
  aws lambda add-permission \
  --function-name RoomFinder \
  --statement-id "1234" \
  --action "lambda:InvokeFunction" \
  --principal "alexa-appkit.amazon.com"  \
  --region eu-west-1
  ```

**Then you'll want to test the function created properly** (Commands below are listed in `automation/test_lambda.sh`.)

1. Run `aws lambda list-functions --max-items 10 --profile default` to check that your lambda function is there. It should be called RoomFinder.
2. Get more information on your lambda function by running the below code.
  ```
  aws lambda get-function \
  --function-name RoomFinder \
  --region eu-west-1 \
  --profile default
  ```
3. Test invocation of the function by running the below code, replacing {} with the file path of a JSON to test. You'll need to make your own JSON for now. (You can steal one out of the 'test-[...].js' files used by lambda-local, though you'll have to edit its values a bit. It's the thing after `module.exports = ...`)
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

**Lastly, you may want to update the lambda function after you've made any changes** (Commands below are listed in `automation/update_lambda.sh`.)

1. From the `automation` folder, `cd ../lambda`.
2. Run `mv lambda.zip backup_lambda.zip` to backup the old lambda code, in case the updated code doesn't work. Don't run this file twice in a row with untested code, as you'll overwrite your older backup.
3. Run `zip -r -X lambda.zip index.js requesters.js resources.js config.js node_modules/` to compress our updated files to a new deployment package.
4. Run `aws lambda update-function-code --function-name 'RoomFinder' --zip-file 'fileb://lambda.zip'` to update the code.

## Doing the account link

Before you test properly on the Echo, you'll need to actually perform the link between your accounts. To do this just open the Alexa [web](https://alexa.amazon.co.uk) or mobile app, and navigate to your fresh new skill. Then click Link Accounts, log in, allow the requested permissions, and hopefully have a successful link.

## Testing the skill online

To test the skill online, go to the Test Section in the Alexa Skill Console, use the fantastic [echosim.io](https://echosim.io), or just use an Amazon Echo. If you've done all the bits above properly, the skill will automatically have appeared on any Echoes connected to your account.
