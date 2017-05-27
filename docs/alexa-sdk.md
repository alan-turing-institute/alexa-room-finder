# Alexa Skills Kit SDK for Node.js - Under the Hood [Draft 2.0]

This is what I wrote to explain to myself how the [Alexa Skills Kit SDK for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) actually works, and what the current bugs are. You **definitely do not** need to read this to fix or update Room Finder, but I'm hoping this will help other people to develop Alexa skills, and possibly help maintain my skill. There are a few big issues with their code that merit explanation, so I was kinda forced to go into code-level detail. So, sorry if this is out of date by the time you read it.

If you're reading this, you should first have read the [alexa-sdk docs](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs). I'd also go take a look at [alexa-cookbook](https://github.com/alexa/alexa-cookbook). which was released after I wrote this skill, and explains some useful tools.

As a framework for explaining the SDK, let's look top-down at how the SDK is used from your main `index.js` file.

```javascript
exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = appId;
  alexa.resources = languageStrings;
  alexa.registerHandlers(sessionHandlers)  
  alexa.execute();
};
```

*Note: `exports.handler = (event, context, callback) => {}` is just for AWS lambda support. By default AWS Lambda (with Node) will call the exported `index.handler` function, with `event, context, callback` as parameters. The callback isn't being used right now (it's unmentioned in their docs) but you should include it for future-proofing. Overall, you can just imagine the contents of that arrow function as the 'main' code being run.*

The SDK docs tell you to use this code, but none of the under-the-hood stuff is explained by the Amazon documentation, so that's the point of this exercise: to explain what these actually do. Let's take it line-by-line.

---

## Line 1: Creating the handler object

The vast bulk of the code is actually run  by the first line: `const alexa = Alexa.handler(event, context);`. `Alexa.handler` is a function (defined in `lib/alexa.js`) that returns an object of type `AlexaRequestEmitter`. This object extends the [EventEmitter class from the Node events module](https://nodejs.org/api/events.html). If you don't know already, EventEmitters are very simple, and totally standard in Node. Here's (at a very basic level) how you use one:

```javascript
myEmitter.on('event', () => {
  console.log('An event occurred!');
});
myEmitter.emit('event');
```

`.on()` sets up a listener, which will just perform its particular function when the right 'eventName' is passed to the emitter via `.emit()`.

We're going to set up a big EventEmitter can detect any of our 'Intents', then do a function based off that intent. Simple.

---

*Before we move on, here are a few notes on this specific EventEmitter:*

- If you've read the SDK docs, you know that you can register several different intent handler objects, but they will all be registered in this same big EventEmitter, in pretty much the same way. They are in no way separate, so events can be emitted from one 'handler' or 'state handler' to another.
- You may read there's a default maximum number of listeners per EventEmitter. The SDK overrides this to 'Infinity'. This isn't great, but there's no good way to  make an emitter of arbitrary size.
- You may read in the EventEmitter documentation that the `this` keyword in a listener-attached function refers to the EventEmitter object. The SDK chooses to override this, so that is not the case here. We'll get back to this later.

---

After the AlexaRequestEmitter (which is named `handler`) is declared, the function gives it a bunch of extra properties, which for the most part will be actually set later. The simple ones are:

- \_event: event -- *(the request object: documented [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#request-format).)*
- \_context: context -- *(the context object of the **Lambda function**: documented [here](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html))*
- \_callback: callback -- *(the callback specified by the Lambda function: not used by the SDK at present.)*
- state: null
- appId: null
- response: {}
- dynamoDBTableName: null
- saveBeforeResponse: false
- i18n: i18n -- *(the [i18next](https://github.com/i18next/i18next) module variable: it will be used for translation, and the SDK will set up the backend of this later.)*
- locale: undefined
- resources: undefined

The `handler` function also gives its EventEmitter 2 more complex properties:

- `registerHandlers`
- `execute`

These are functions that call two global functions (`RegisterHandlers` and `HandleLambdaEvent`), but bind the `this` keyword to the AlexaRequestEmitter object. This means that whenever these functions use `this`, they refer to the AlexaRequestEmitter, not the function's global `this`.

We'll cover what `HandleLambdaEvent()` does when it's called later; it only makes sense to cover `RegisterHandlers()` now.

### What does this RegisterHandlers/registerHandlers function do?

This function takes as arguments any number of objects. these are the handlers you set up when using the SDK.

It goes through the properties of these handlers, and for each one, sets up a listener in EventEmitter. It uses the property key as the event name, and the value as the callback. However, registerHandlers does have a couple quirks.

- Firstly, it can handle 'State Handlers'. These are just normal handlers, but they've been given a `\_StateString` property when you called the 'CreateStateHandler' function. In order to differentiate the same intents when in different states, on registering the SDK simply appends the value of the `\_StateString` property to all the event names in the handler. This means that `BookIntent` listener in the `_CONFIRMMODE` state will be set up as `this.on('BookIntent_CONFIRMMODE', [...]);`. This is how listeners for the same 'intents' but in different 'states' can all be set up in the same EventEmitter object.

- Secondly, **it binds each function to a new variable named handlerContext.** This means that when you use `this` in your listener callback, it refers to 'this' object right here:

  ```javascript
  var handlerContext =
  {
      on: this.on.bind(this),
      emit: this.emit.bind(this),
      emitWithState: EmitWithState.bind(this),
      state: this.state,
      handler: this,
      i18n: this.i18n,
      locale: this.locale,
      t : localize,
      event: this._event,
      attributes: this._event.session.attributes,
      context: this._context,
      name: eventName,
      isOverridden:  IsOverridden.bind(this, eventName),
      response: ResponseBuilder(this)
  };
  ```

  So, what do the `this` keywords within the handlerContext variable refer to? You might immediately think they refer to handlerContext itself; however, they've also been overridden, as you'll remember our `RegisterHandlers` function is bound to the `handler` object we created earlier. Therefore they all refers to the `this` of the AlexaRequestEmitter-type `handler` object created earlier.

  Here's an example. If you request `this.attributes` in your listener callback, it's bound to `{handlerContext}.attributes`. This was initially taken from `{handler}._event.session.attributes`, so what is stored is part of the `_event` property. You'll remember that `_event` was set to be the request body itself when we set up that handler, so `this.attributes` (until you change it) gives the session attributes of the request.

  ---

  **Summary of Handler Context: When you use `this` in your function, it actually refers to a `handlerContext` variable, which has the properties of the handler, and a few extra functions.**

  ---

#### What are those extra functions?

- `emitWithState: EmitWithState.bind(this)` is a function that will append the current state to its first argument (whatever Intent you want to emit), then call `{handler}.emit.apply({handler}, arguments)`. This means it will just emit an intent to our EventEmitter with a state appended to it. This is used for movement 'between state handlers'. It's not *ever* used for emitting back to the Alexa Skill.
- `t: localize` leads to some more complex 'this' binding. To cut a long story short, using `this.t()` in your handler functions will call `{handler}.i18n.t.apply({handler}.i18n, arguments)`. What this means is that it will call the 'translate' function of the handler's i18n property, and use the `i18next` object itself as the `this` keyword. We still have to set up the backend for the i18next, but this simply makes translatation usable from the listener callbacks via `this.t()`.
- `isOverridden: IsOverridden.bind(this, eventName)` is a function used by the SDK to detect whether you've overridden any of the default listeners that are going to be registered. I wouldn't recommend ever using it yourself, as it can't detect the 'overriding' listener from the 'overridden'; it simply returns true if the number of listeners for the given 'event name' is greater than 1. This is fine for the SDK's purposes.
- `response: ResponseBuilder(this)` is an odd one, as it's totally unused for the most part, but it's now in the main README, so go read that.

    - **this.response has one major use, which is audio player support.** If you wish to use the audio player, I would strongly suggest looking at [the AudioPlayer's specific documentation](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference).

---

**Summary of Register Handlers: When passed objects as parameters, this registers all the properties of all those objects as listeners in the handler object (which extends EventEmitter.) Those listeners are bound to a `handlerContext` variable.**

---

### Sorry, back to the `handler` object

The neat part of the SDK, is that after it makes this new AlexaRequestEmitter that extends EventEmitter, it then registers its own default set of listeners in the same way as you register yours - using the `registerHandlers()` function we just covered. This default set of listeners can be found in `response.js`. They are the default API you interact with when you want to send something to the Alexa Skill (using `this.emit('eventName', ...parameters)`). Notably, any of these handlers can be safely overridden, so feel free to write your own ':ask' or ':tell' if you want to. Their event names are:

##### Usual listeners

- ':tell'
- ':ask'
- ':askWithCard'
- ':tellWithCard'
- ':tellWithLinkAccountCard'
- ':askWithLinkAccountCard'
- ':responseReady'

##### Dialog-model-only listeners (covered in 'Dialog Models and the Alexa Skill Builder')

- ':delegate'
- ':elicitSlot'
- ':elicitSlotWithCard'
- ':confirmSlot'
- ':confirmSlotWithCard'
- ':confirmIntent'
- ':confirmIntentWithCard'

##### DynamoDB listeners (covered in 'DynamoDB Support and :saveState')

- ':saveState'
- ':saveStateError'

For now let's just talk about the **Usual Listeners**. Here's how they work:

1. Build a well-structured response object from the parameters you give it.
2. Set `this.handler.response` to this response.
3. Emit `':responseReady'`.

Let's take a look at those steps in more detail:

1. In order to build a [response object](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#response-format) from the parameters, they all call the `buildSpeechletResponse()` function with the various parameters stored in an object. `this.attributes` is always used as one of these parameters, and is used to set the session attributes of the response.

    `buildSpeechletResponse()` itself very simply parses the parameters, and builds a properly formatted JSON response, as documented [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#response-format).

    **NB: `buildSpeechletResponse()` automatically wraps speech in SSML tags, without checking for broken characters within. Therefore you must escape characters like `&` with a backslash.**

2. The response is stored in `this.handler.response`. This should not be confused with `this.response` (which you should ignore). Notably, `this.handler.response` also contains `this.handler.response.response`, which is basically the subset of the response that will actually be spoken by Alexa.

3. The `'':responseReady'` listener doesn't do much except set the state in the session attributes of the response, emits `':saveState'` if you want to save the session attributes in DynamoDB, then calls `this.context.succeed(this.handler.response)`, which - assuming your Lambda function is using RequestResponse - sends off your event to the Alexa Skill.

    ---

    **NB: While simple, the `:responseReady` listener has two big issues:**

    1. Because of `':responseReady'`, you can't reset the state to an empty string, the default state. Here's why:

        To detect if you've changed the state, meaning it should change the 'STATE' session attribute, the `':responseReady'` listener uses `if(this.handler.state)`. The problem is that empty strings are falsey, so if you set `this.handler.state = ""`, then it won't actually reset the state.  I'm actually unsure whether this 'bug' is deliberate - some people have suggested it is, as DynamoDB can't store empty strings.

        Anyway, this can be easily bypassed without editing the SDK if one simply sets the session attribute directly. You must also change `this.handler.state` at the same time, or it will just reset to what it was before.

        ```javascript
        this.handler.state = "";
        this.handler.response.sessionAttributes.STATE = "";
        ```

    2. This isn't a bug, but technically `this.context.succeed` should no longer be used, as it's no longer even documented in the Lambda docs, so has pretty much been deprecated. It would be better to use `callback`. A pull request has been submitted to fix this, but it's not been accepted yet...

    ---

Now that the SDK has registered its default listeners, the first line is finally done. It returns the `handler` object.

**Summary of Line 1: Line 1 returns an EventEmitter, with a few extra properties attached. Crucially, this includes a `registerHandlers` function so you can easily add more listeners to it.**

---

## Lines 2 and 3: Some config

`alexa.appId = appId;` and `alexa.resources = languageStrings;` just set the resource and appId properties of the `handler` to the necessary configuration values. We'll cover these when they are used in Line 5: `execute`.

---

## Line 4: Registering Handlers

This registers your skill-specific listeners, in the `handler` object, following the method described above. A useful thing to note, is that not all of these listeners have to be events. If you're like me and you want to use them for abstraction, non-intent handlers can be useful. For example, I like to register a `':askHandler'` listener that automatically sets speech attributes (for repeating) and then emits ask:

```javascript
':askHandler': function(speechOutput, repromptSpeech) {
  this.attributes.speechOutput = speechOutput;
  this.attributes.repromptSpeech = repromptSpeech;
  this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
},
```

Then you just call `this.emit(':askHandler', speechOutput, repromptSpeech)` and the attributes are handled for you. This sort of abstraction keeps the `emit` there, so it's clear that content is being emitted, requires no nasty binding like a function might (as `this` points to the right place already), doesn't use promises, and can improve error messages by pointing you to a more specific handler, rather than a single handler with loads of different processes in it.

---

## Line 5: Execution

This line calls the `execute` property of the `handler` object we made earlier. You'll remember we deliberately skipped the `HandleLambdaEvent()` function earlier. It's first used now. Here's what it does:

*If you're starting here, or need a reminder, remember the `handler` object is of type `AlexaRequestEmitter` which extends `EventEmitter`. It has a bunch of extra properties, including the registerHandlers function, and this execute function we're using now. We also just made a bunch of listeners in it from our intent handlers.*

1. It calls `HandleLambdaEvent()` bound to the `handler` object. This function sets the locale to whatever Alexa sent over, and sets up the back-end for translation, using the `this.resources` property we defined earlier.
2. This then calls `ValidateRequest()`, again bound to the `handler` object. This function checks that the App IDs match. If it's a new session and a table name is set, it will also pull any saved session attributes from DynamoDB. See below for more details.
3. This then calls `EmitEvent`, again bound to the `handler` object - there's a lot of nested binding here. This function then checks which 'type' of event it is (from the possible types of `NewSession`, `LaunchRequest`, `SessionEndedRequest`, `IntentRequest` `AudioPlayer[...]` and `PlaybackController[...]`, and sets the variable `eventString`, to either the type, or the intent name if it's an `IntentRequest`. This is what allows you to use `NewSession` and `LaunchRequest` as 'intents' in your main handler code, even though they're actually types in the request body.

  It then appends the state to the eventString, checks there's a listener with this name, and calls `this.emit(eventString)`, activating whichever intent has been sent through.

  This intent in turn emits one of the pre-registered events (say `this.emit(':tell')`), which in turn emits `this.emit(':responseReady')`. Finally, this builds a response, and then calls `context.succeed(this.handler.response)`, a prebuilt Lambda function that sends our skill off to Alexa.

---

# DynamoDB Support and `:saveState`

The SDK includes support for DynamoDB: an AWS NoSQL database service. To use DynamoDB:

- Add `alexa.dynamoDBTableName = "{Table Name}"` to your main code
- Add full Dynamo DB permissions to the AWS IAM role that your Lambda function is using.

So how is DynamoDB integrated into the SDK? First, the SDK is only designed **to retrieve and save attributes**. If you want to do more than that, you'll need to do it yourself. To get a very basic intro to some DynamoDB terms, see [here](http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/quick-intro.html).

### Getting attributes

Attributes are retrieved during `ValidateRequest()` (which is called by `alexa.execute()` before it emits the event to our handler), our program pulls any saved session attributes from DynamoDB. It only does this if you've set a predetermined table name via `alexa.dynamoDBTableName = ""`. It pulls the values using `attributesHelper.get`, which can be found in the `DynamoAttributesHelper.js` file. Here's how that 'get' function works.

---

#### attributesHelper.get(table, userId, callback)

This uses the [aws-sdk](https://aws.amazon.com/sdk-for-node-js/) module to facilitate requests to DynamoDB.

It first does a `get` query on the named table using the UserID as a parameter.

- If *a table with the right table name doesn't exist*, it will make you a new table, and `callback` with an empty object.
- If *a table with the right table name does exist*, it will then query the table by the userId of the request.
  - If *the user ID doesn't exist in the table* (i.e. it's the first time they've used that skill) it will `callback` with an empty object.
  - If *the user ID does exist in the table*, it will `callback` with the `mapAttr` attribute stored at that userId, which is an object storing 'session attributes'.

---

In this case, the `callback` is to very simply assign the attributes to the `this._event.session.attributes` property. Note that the attributes are user-specific, but it all works on one big DynamoDB table, which stores all the attributes of every user. *This table is structured as follows. Each item in the table has one 'userId' and one 'mapAttr' attribute. The 'partition key' (by which the table is partitioned, and by which items are identified) is the 'userId' attribute. The 'Alexa Skill session attributes' of each user are stored under the 'mapAttr' attribute.*

### Setting attributes

Attributes are saved during `this.emit(':responseReady')`, or if you emit `this.emit(':saveState')` yourself. Even then, they are only saved in these scenarios:

1. The session is about to end.
2. In theory, if you've manually set the `handler.saveBeforeResponse` value to true. In practice... **There's another SDK bug here. They check this.saveBeforeResponse rather than this.handler.saveBeforeResponse. They've now fixed this on Github, but not in the actual npm package...**
3. You included a true `forceSave` parameter when emitting saveState. By default, `':responseReady'` doesn't do this when it emits saveState.


It then uses `attributesHelper.set`, which can be found in `DynamoAttributesHelper.js` to store your attributes in `this.attributes`. (This obviously means you should always set your attributes through `this.attributes`, rather than say `this.handler.response.attributes` or even `this.handler.event.session.attributes`).  *Don't worry about `this.handler.state`, it will move that to `this.attributes.STATE` before it saves.*

---

#### attributesHelper.set(table, userId, data, callback)

This uses the `aws-sdk` module to facilitate requests to DynamoDB.

Skipping a bit of error handling, this fairly simply does a `put` query on the table, using these parameters.

```javascript
{
    Item: {
        userId: userId,
        mapAttr: data
    },
    TableName: table
};
```

This means it puts a new item into the table with the `userId` and `mapAttr` attributes. It then calls `callback(err, data)`.

---

In the case of `':saveState'`, the `callback` used very simply does some error logging by emitting `':saveStateError'`.

`':saveState'` also effectively overrides `this.emit(':responseReady')` and does the `this.context.succeed()`. **I believe this to be a bug, as it says it specifically shouldn't do this in their documentation. I'm looking to submit a pull to fix this.** Therefore, if you emit `':saveState'` yourself, make sure your `this.handler.response` is already set up, and ready to send off to Alexa.

### DynamoDB Summary

With the exception of the bugs, the SDK provides decent DynamoDB support. As they promise, pretty much the only condition to implement automatic attribute saving is to set `alexa.dynamoDBTableName`. However, `':saveState'` and the functions in `DynamoAttributesHelper.js` are pretty much only good for saving current attributes. If you want to do anything more complex, rewrite versions of these functions yourself using [aws-sdk](https://aws.amazon.com/sdk-for-node-js/).

---

# Dialog Models and the Alexa Skill Builder

Well after I finished developing Room Finder, Amazon released a new 'dialog model' system. This system supposedly lets you fill an intent which has multiple slots "more easily and accurately".

Here's an example:  my estate agent skill wants to find out where a customer wants to buy, what type of house they want, and what their budget is. Before dialog models, I'd probably have needed three separate intents for this. The dialog model allows me to put all these slots in one 'BuyHouse' intent, but still retrieve them one by one from the user. I can then confirm each slot with the user (to check it's what they wanted to say) as I go. When every slot is filled, I can then confirm the overall intent.

See [this neat blog post](https://developer.amazon.com/blogs/alexa/post/02d828b6-3144-46ea-9b4c-5ed2cbfadb9c/announcing-new-alexa-skill-builder-beta-a-tool-for-creating-skills) and the [Alexa Skill Dialog docs](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/dialog-interface-reference) for some more details.

I'm not a huge fan of the dialog model system, but I've made a very simple demo of using a dialog model and DynamoDB within the alexa-sdk, which you can find at [knowlsie/favourite-places-alexa-skill](https://github.com/knowlsie/favourite-places-alexa-skill).

Beyond that, I'm not going to explain dialog models in any detail here; it's more of a change to the Alexa Skill request interface than to the SDK. The only change this makes SDK-wise is to add a bunch more 'default listeners'. These are used to either 'elicit' an value for a particular slot, to 'confirm' a slot's value, or to 'delegate' this process to the Alexa Skill itself. 

**Room Finder is not at all compatible with dialog models or skill builder, as it uses AMAZON.YesIntent and AMAZON.NoIntent.**
