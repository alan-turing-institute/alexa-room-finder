# Troubleshooting Documentation [Draft 1.0, WIP]

This is intended to help troubleshoot specific issues. Please use thoughtfully, as I am sure to have missed particular issues and fixes.

Before you read this, have a scan through the [README](../README.md), so you understand how set-up has been done.

## Some key take aways

- Before you do anything else, check that the accounts are linked. The accounts occasionally like to unlink on Amazon updates, so this is a very common error, and doesn't always cause the same bug. This is therefore the first step of every fix below.

- Fast testing and updating are key when testing this code. Use lambda-local or mocha obsessively when making changes. Use gulp for quick updates.

## It says "There was a problem with the requested skill's response" on opening the Skill!

This was my most common error. It means the AWS Lambda has either failed to return something, returned something bad, or just generally all gone wrong. There are thousands of reasons this might happen.

1. The most common cause of this will actually be an error with account linking, so the first thing to do is check that the accounts are still linked. Log into https://alexa.amazon.co.uk as the account Alexa uses, then go to the skills section. Check if the 'Room Finder' skill is linked.
	- If it isn't linked, link it to alexa(at)turing(dot)ac(dot)uk
	- If it is linked, try 'Disabling' it and relinking it.
	- If you get a failure on linking, refer to the 'Problems with Account Linking' section.  

	If the linking is successful, test the skill again, and see if you still get an error. If you do, it's probably a problem with the lambda code. Look at the steps below.

2. Still logged into https://alexa.amazon.co.uk (as the account Alexa uses), go to the home section. You should hopefully see a card with the actual error. If the error is 'Skill response was marked as a failure: The target Lambda application returned a failure response' or 'Null Speechlet Response', then that confirms it's a lambda problem, so move to the next step. If there's some other error, then I'd first suggest googling the error message, and seeing if you can resolve it without code changes - especially if it's 'Alexa Skill', not Lambda, related.

3. Open the [AWS console](https://eu-west-1.console.aws.amazon.com/console/home?region=eu-west-1#), log in as the account, then go to CloudWatch, then Logs. Open the logs for aws/lambda/RoomFinder. Review the most recent logs (the one marked with REPORT) to find the error. If it was a one-off error, you can find the specific RequestID that failed back at https://alexa.amazon.co.uk. It should provide a stack trace in the 'report' section. Find that, and google it, then refer to the 'Debugging code' section.

	NB: If you get timeouts that can often mean there's a problem with the requesters. Try testing those with the files in [test/requesters/](../test/requesters/).

4. In fixing this particular error, mocha will prove particularly helpful to check all the response are working. See the "Testing Lambda Locally" section for help with this.

#### Other things you might want to check

1. Check that the Alexa Skill is pointing to the right ARN/Region. It's possible (though there are very few ways this could happen) that the Skill is using the wrong endpoint/region for its requests. Open the [Alexa Skill Console](https://developer.amazon.com/edw/home.html#/skills/list), and check that the ARN and region match that of the Lambda function.  

2. Check that the lambda code has the right App ID. It's also possible that the App ID doesn't match the Lambda function. This should be specifically reported as the error in CloudWatch. This is a bit harder to change, as you'll need to create a whole new deployment package. Clone the repo, then change the App ID in [lambda/config.js](../lambda/config.js). Then follow the instructions in the [README](../README.md) to update with `gulp`.

## The skill is saying an 'An error occurred', after being told how long to book for, or after you confirm the booking.

This means that there was quite specifically an error with a request to the Graph API.

1. The most common cause will be an error with account linking, so the first thing to do is check that the accounts are still linked. Log into https://alexa.amazon.co.uk as the account Alexa uses, then go to the skills section. Check if the 'Room Finder' skill is linked.
	- If it isn't linked, link it to alexa(at)turing(dot)ac(dot)uk
	- If it is linked, try 'Disabling' it and relinking it.
	- If you get a failure on linking, refer to the 'Problems with Account Linking' section.  

	If the linking is successful, test the skill again, and see if you still get an error.

2. Once you've done this, go to the Home section of https://alexa.amazon.co.uk, and read the error message, which should be printed on a card there. This should give you an idea of what's going wrong. If it's something like an invalid or expired token, try relinking, then have a quick look at 'Problems with Account Linking'. It's not guaranteed to a a problem with account linking though, it could be an issue with how the lambda is parsing the token. So take a look at the lambda too - the 'Debugging Code' section may help a bit.

3. If you want to know exactly where the error occurred, go to the [AWS console](https://eu-west-1.console.aws.amazon.com/console/home?region=eu-west-1#), log in as the Amazon account, then go to CloudWatch, then Logs. Open the logs for aws/lambda/RoomFinder. Review the most recent logs to find the error reporting. You can find the specific RequestID that failed back at https://alexa.amazon.co.uk, in the Home section. Google the error, and see if there's an easy fix. If not, move onto the next step.

4. Now it's probably worth checking if the API requests/endpoints themselves are working. As usual, I'd suggest using [Postman](getpostman.com) to test each one. See 'Postman Help' for how to get Postman a token.

	Once you have the token through Postman or other methods, test the following requests in Postman:

    - GET to `https://graph.microsoft.com/beta/Users/Me/Calendars`. Check that the response lists calendars, including the meeting rooms, and that each calendar has an "owner" listed. This is the beta endpoint, so is the most likely to break. You can also use this one to grab a Calendar ID for the next step.
    - GET to `https://graph.microsoft.com/v1.0/Users/Me/Calendars/{CALENDAR-ID-GOES-HERE}/calendarView?startDateTime={ISO-START-TIME-GOES-HERE}&endDateTime={ISO-END-TIME-GOES-HERE}`. If the room is free, the value field of the response should be an empty array.
    - POST to `https://graph.microsoft.com/v1.0/me/events`, with an valid JSON [event](https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/event) in the body. You can find the one Alexa uses in [lambda/requesters.js](../lambda/requesters.js). You need to change the start and end time, add attendee details if wanted, and then stringify the object with `JSON.stringify()`.

	    ```javascript
	    {
		    Subject: 'Alexa\'s Meeting',
		    Start: {
		      DateTime: startTime,
		      TimeZone: 'GMT'
		    },
		    End: {
		      DateTime: endTime,
		      TimeZone: 'GMT'
		    },
		    Body: {
		      Content: 'This meeting was booked by Alexa.',
		      ContentType: 'Text'
		    },
		    Attendees : [ {
		      Status: {
		        Response: 'NotResponded',
		        Time: startTime
		      },
		      Type: 'Required',
		      EmailAddress: {
		        Address: ownerAddress,
		        Name: ownerName
		      }
		    } ]
	  	}
	    ```

		If one of these doesn't work, it very could mean that something has changed on Microsoft's end, or with the [request](https://github.com/request/request) package. Try to find what's changed - you may need to replace the endpoint, or to update the exact parameters.

4. If the APIs and endpoints are all functional, then there's a new problem in the code, or the way the code is doing it. First follow the steps under 'Testing Lambda Locally', as this can probably get you a better stack trace, and a specific point where the code is breaking. We're specifically interested in the tests for BookIntent_CONFIRMMODE and DurationIntent_TIMEMODE, as they make the API requests.

5. All the code for the API requests is stored in [lambda/requesters.js](../lambda/requesters.js). I have tests for these set up in [test/requesters/](../test/requesters). Run that code (making sure to set the token in [test/test-config.js](../test/test-config.js) first).

6. If they all work, but you still get an error with the requests, then I'm stuck; it means that the code is working locally but not on Lambda. Try updating the lambda code (you can use `gulp`) then stop. Contact Amazon.

## The skill says rooms are being booked, but they're not!

The way Alexa book rooms is she creates events on her calendar, and then invites the specified Meeting Room. The benefit of this is she doesn't need write access to the Room Calendars.

1. As usual, the first thing to check is that the accounts are linked. Log into https://alexa.amazon.co.uk as the amazon account Alexa uses, then go to the skills section. Check if the 'Room Finder' skill is linked.
	- If it isn't linked, link it to alexa(at)turing(dot)ac(dot)uk
	- If it is linked, try 'Disabling' it and relinking it.
	- If you get a failure on linking, refer to the 'Problems with Account Linking' section.  

	If the linking is successful, test the skill again, and see if you get the same problem.

2. Then, you'll want to check is that rooms are being booked on the Alexa calendar, by logging into 'alexa(at)turing(dot)ac(dot)uk' and looking at the calendar. If they aren't, this means that the requesters.postRoom function isn't working properly.

	- To debug this, first check that POST requests to the endpoints are working OK in something like Postman.

3. Check if the room calendars are being invited, by clicking on an event. The room should appear as an invitee. If they're not, something like the structure of the 'event' object might have changed, meaning that the current requesters.postRoom is no longer inviting the room. Check the [MS Graph Documentation](https://developer.microsoft.com/en-us/graph/docs/api-reference/beta/api/calendar_post_events) to see what a post should look like, and compare it to requesters.postRoom's post.

4. Then check if the room calendars are accepting the invites. Look at the 'alexa(at)turing(dot)ac(dot)uk' mailbox, and looking for either 'Accepted' or 'Declined' messages. If they are declined, it will usually state a reason. This could be permission-related, in which case speak to IT, or it could be that the rooms aren't free. If they aren't free, refer to 'The skill is detecting rooms as free when they aren't'. If it's something else entirely, I can sadly only suggest Google and StackOverflow.

5. If the rooms are accepting the invites, but the rooms still aren't being booked, then I'm extremely confused, and it's probably worth speaking with IT/events to see if there's some other error going on somewhere.

## The skill's not detecting rooms, even though rooms are free!

1. The simplest cause of this would be an error with account linking, so the first thing to do is check that the accounts are linked. Log into https://alexa.amazon.co.uk as the amazon account Alexa uses, then go to the skills section. Check if the 'Room Finder' skill is linked.
	- If it isn't linked, link it to alexa(at)turing(dot)ac(dot)uk
	- If it is linked, try 'Disabling' it and relinking it.
	- If you get a failure on linking, refer to the 'Problems with Account Linking' section.

	Once it's linked, try booking again, and see if the issue is fixed.

2. It's also possible that the calendar sharing has somehow broken. This system relies on explicit sharing of room calendars to alexa(at)turing(dot)ac(dot)uk so that calendars can be accessed without the 'shared' permissions. To check whether the calendars aren't there, I'd suggest using [Postman](getpostman.com) to make an GET request for calendars, when logged in as 'alexa(at)turing(dot)ac(dot)uk'.

	In Postman, the Authorisation type is OAuth 2.0, the Auth URL is `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`, the Token URL is `https://login.microsoftonline.com/common/oauth2/v2.0/token`, and the ID and Secret are the Client ID and Secret of the Microsoft Authentication App. The scope is `offline_access calendars.readwrite.shared` and the Grant Type is Authorization Code.

	To get a working token through Postman, you'll also need to temporarily change the redirect URL of the Microsoft App to the one specified by Postman. This means logging in as 'alexa(at)turing(dot)ac(dot)uk' at the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList) and changing the redirect URL of the Alexa Room Finder app to the Callback URL specified by Postman.

  When you have a token, just 'use' it in a request to 'https://graph.microsoft.com/beta/Users/me/calendars/' and check that the response body includes all the Meeting Room Calendars. If it doesn't, follow the instructions in the README under Calendar Sharing to reshare the calendars, then check again.

  Alternatively, you can use the `getCalendars` function in [lambda/requesters.js](../lambda/requesters.js), just making sure to use any working token as an argument.

3. Test what's going on by running `node test/test-findFreeRoom.js`. This should return the credentials of a free room. If it doesn't, then the problem is with that `findFreeRoom()` function, in [lambda/requesters.js](../lambda/requesters.js).

4. The **names of the room calendars** or **the way that Microsoft handles those names** may have changed. From any Turing Office 365 account, check the names of the Calendars, then check if they're the same as the ones in [lambda/config.js](../lambda/config.js). Then check the "name" section of the Calendars being returned by your API Request. Do they match the ones in [lambda/config.js](../lambda/config.js)?

5. There may be a **hidden event on the rooms**, or possibly a **change in the way Microsoft displays empty calendars**. The way the skill detects room is by checking that the 'value' field of the 'Calendar View' for the given time is empty. This means that if there's an unexplained event that appears in the Calendar View request but not on the actual calendar; or if empty calendars no longer appear as empty objects; then it'll fail to detect free rooms. If the names of calendars are right, the calendars are free, and they're appearing properly in any API requests you make, then one of these may be the issue. Use the token above to make a request to this endpoint:

	`https://graph.microsoft.com/v1.0/Users/Me/Calendars/{ID-OF-ANY-FREE-CALENDAR}/calendarView?startDateTime=/{ISO-START-TIME-GOES-HERE}&endDateTime={ISO-END-TIME-GOES-HERE}/`

	You can find the ID of a room by making a request to `https://graph.microsoft.com/beta/Users/me/calendars/` and picking the ID any free calendar from the list.

	If the room is free for the specified time, the response should look something like this:
	```json
	{
	  "@odata.context": "...",
		"@odata.nextlink": "...",
	  "value": []
	}
	```

	If there's a something in that "value" array but the room is free, then there's our issue. I believe I found (in hundreds of requests) one unexplained event, but I lazily didn't gather any information on it, and haven't run into any more since. If you run into this 'unexplained event' issue, I first suggest getting more access (ideally on a personal email, not on alexa(at)turing(dot)ac(dot)uk) so you can figure out who exactly booked the event, and why it's appearing in the 'Calendar View' but not on the Outlook Calendar Web app...

## The skill is detecting that rooms are free when they aren't

This ver likely means something is wrong with requesters.findFreeRoom(), or the parameters being sent to that function. I suggest testing that with `node test/test-findFreeRoom.js`. Check the specific times being passed to it.

Alternatively, there may be problems with timezones. See the 'Timezones' section for help with this.

## Timezones

By default, the skill uses UTC, for everything, always. To my knowledge, this means it will cope just fine with timezone changes. One happened shortly before I wrote this documentation.

However, if you notice a lag/skip of one hour in detecting free rooms or booking rooms, then this may be something worth checking -  especially if Daylight Savings just happened, or if moment.js/JavaScript have updated their date libraries. I'm also unsure of exactly how IT/events handle and change event bookings across Daylight Savings, so it's also possible that my events might be moved in a different way to others.

You can check what timezone an event is in by making a GET request to `https://graph.microsoft.com/v1.0/Users/Me/Calendars/{CALENDAR-ID-GOES-HERE}/events`, then looking at the various timezone fields available. If you want to change the timezone that is used by Alexa, then edit the way dates are made in `:durationHandler` in [lambda/index.js](../lambda/index.js), and the timezone used by `postRoom()` in [lambda/requesters.js](../lambda/requesters.js). Note that there's a difference between `Date()` and `new Date()`, because JavaScript.

## Testing Lambda Locally

[lambda-local](https://github.com/ashiina/lambda-local) is a very useful debug tool - especially if you're getting API errors is testing by lambda-local.

- First, you need to follow the steps in Postman Help, to get a token.
- Then clone the repo locally.
- When you have a token and a local repo to edit, follow the steps for testing locally in the README to start testing. If you're resolving an error with a particular intent, you can run `lambda-local -l lambda/index.js -h handler -e test/filename.js`. The first two commands in `bash run_tests.sh` are the ones that access the MS Graph API, so are likely the specific ones to test.

- If you want to rapidly check every intent, just make sure you have [mocha](https://mochajs.org/) installed locally and run `npm test`. Alternatively you can just run `mocha` if you have mocha installed globally.

## Problems with Account Linking

This section is designed to help if you're getting failures when you're pressing 'Link Accounts' in the [Alexa Skill App](https://alexa.amazon.co.uk). The way account linking works can be found here.

Before we move on, the most likely cause of this is that the web app, or its password, have expired. Go to the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList) and log in as alexa(at)turing(dot)ac(dot)uk. Then open the app, and see if the password has expired. Even if it hasn't, try generating a new password, and using that in Alexa. If it fixes the issue, delete the old password.

![Security Model](https://cloud.githubusercontent.com/assets/20475469/23951577/5b195b12-0986-11e7-88a6-736b1dc8c91f.png)

1. Try linking, and see if you get a specific error, listed at the bottom of the page, or in the URL. If you do, then google that error, and make the changes recommended. This should cover incorrect scopes, missing redirect URLs, or actually most other things.

2. Try account linking on multiple devices and browsers. If it works on one browser but not another, then you probably need to add some new domains to the 'Domain List' in Alexa. A few possibilities are listed in step 6. Popups aren't supported. If you try to link with a popup, it won't work.

3. If it fails on all devices, try it on a desktop browser with a debugger enabled and attached (such as Google Chrome’s Dev Tools, or Firebug). This will let you view the network requests going back and forth for account linking. You especially want to check to make sure the state parameter stays the same throughout the process. This is an unlikely error, as Microsoft is handling the process, but if a parameter changes that indicates an change on Microsoft's side, that you should research.

4. Ideally the next step would be to isolate the possibility that it's a problem with the token-issuing web app I set up, as I have had this issue once in the past. Ideally you'd have your own substitute token-issuing server that you can connect to the Alexa skill to check this, but I haven't yet had a need for that, so don't have a framework I can provide. While this doesn't prove much, you can always make a new web-app, using an account that's not 'alexa(at)turing(dot)ac(dot)uk', in the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList), and see whether you can get Alexa skill to get a token from that. If needs be though, skip this. The next stage is a reasonable substitute.

5. Check if you can get a functional token from your current web-app. You can do this a few ways, but probably the quickest is to follow the instructions in 'Postman Help', to see if you can get a valid and functional token from it.

- If you can, it's probably a problem with the configuration of the Account Linking, as it means the back-end of your web-app is working.
- If not, then I suggest researching the error that is returned when you make the POST request for the token.

6. If you can get a token from Postman, you need to start looking at the configuration of the skill and the web-app, to see if it's all correct. Check that the configuration of both the Alexa Skill and Microsoft App is identical to what's suggested in the README under 'Account Linking.' An easy one to miss is you must use 'Credentials in Request Body' instead of 'http basic'. It's also worth checking that the redirect URLs listed in Alexa haven't changed since implementation.

7. Try adding this list of URLS:

	- login.live.com
	- login.windows.net
	- login.microsoftonline.com
	- login-us.microsoftonline.com
	- login.chinacloudapi.cn
	- login.microsoftonline.de
	- msft.sts.microsoft.com

	to the 'Domain List' in the Alexa Skill.

8. Check that there have been no changes in the account linking implementation (on either side) since my creation of the skill in March 2017. You'll have to compensate for any changes yourself. If Microsoft has updated its https certificate this could temporarily cause errors, as a certificate from an Amazon approved CA authority is required.

9. If you've got this far, and still have the motivation to continue, you either want to set up a system like [AWS API Gateway](https://developer.amazon.com/blogs/post/TxQN2C04S97C0J/how-to-set-up-amazon-api-gateway-as-a-proxy-to-debug-account-linking) to more precisely debug account linking, or decode the https packets being sent using something like [Fiddler](http://www.telerik.com/fiddler).

10. I'm stuck. Contact Amazon?

## Postman Help

Once you've downloaded postman:

- Set the Authorisation type to OAuth 2.0
- Click 'Get a token'.
- The Auth URL is `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`.
- The Token URL is `https://login.microsoftonline.com/common/oauth2/v2.0/token`
- The ID and Secret are the Client ID and Secret of the 'Alexa Room Finder' App. This is registered under 'alexa(at)turing(dot)ac(dot)uk', in the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList).
- The scope is `offline_access calendars.readwrite`
- The Grant Type is Authorization Code.

To get a working token through Postman, you'll also need to temporarily change the redirect URL of the Microsoft App to the one specified by Postman. This means logging in as 'alexa(at)turing(dot)ac(dot)uk' at the [Microsoft App Dev Portal](https://apps.dev.microsoft.com/#/appList) and changing the redirect URL of the Alexa Room Finder app to the Callback URL specified in the Postman App. Make sure to change it back when you're done.

Once you have a functional token, use it to make any API Requests you want to test through Postman, or copy its 'access_token' field into [test/test-config.js](../test/test-config.js) to test by lambda-local. See the README for more info on this.

## Debugging Code [WIP]

See this section if you've worked out it's a problem with the code after checking the other sections. This obviously cannot explain how to solve bugs, but will give you my ideas of how to go about it.

- First of all, definitely have a look through the other documentation I've provided. This can help to explain how the set-up has been done, how alexa-sdk package actually works, the alexa-sdk API, and how Room Finder itself actually works.

- Use the mocha tests, use lambda-local, or invoke the actual lambda function, as regularly as possible. The local tests give fairly good error messages, and mean you don't have to zip and upload between tests, which massively speeds up the process. It also doesn't use up lambda requests, so is free. I suggest running `npm test` before every upload to lambda, just to check its all functional.

- Use commands or gulp to update. Running `gulp` (assuming you've installed gulp and configured AWS Lambda) will be far faster than manually compressing and uploading a zip file to Lambda.

- Errors are most likely to occur with the requesters. There are specific files to test/debug these in [test/requesters.js](../test/requester.js).

- Turing has a test room attached to it. It's called `alexaroom1` and has the email address `alexaroom1(at)turing(dot)ac(dot)uk`. Use this to test whether you can book rooms.

## Want to add rooms?

**BUG: You currently can't add more rooms due to some server-side paging that's going on. I didn't know this happened, and am trying to fix it.**

That's totally fine. Ideally on a mac, clone the [repo](https://github.com/alan-turing-institute/alexa-room-booker/) and then **add the names of the room calendars to the `testNames` array in lambda/config.js.**

Then make sure you share the room calendar with alexa(at)turing(dot)ac(dot)uk, by following the instructions in the README under 'Calendar Sharing'

Then follow the instructions in the [README](../README.md) to update with gulp.

## Want to change room names?

You can now change room names totally safely, and everything will keep working. All you have to do is change the name values in `testnames` in [lambda/config.js](./lambda/config.js).

(Weirdly, the names of the 'duplicate' calendars shared to the alexa(at)turing(dot)ac(dot)uk will stay what they were before, but it's checking the name of the `owner` of that calendar, so it's good... Microsoft is a bit weird.)

## Something Alexa says sounds dumb or unnatural?

This can happen as they update Alexa. You can edit everything that's said in [lambda/resources.js](../lambda/resources.js). You can also add a German translation. If you want.
