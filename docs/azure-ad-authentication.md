# How to: Azure Active Directory Authentication [Draft 1.0, WIP]

Active Directory Authentication gives an application access to the Microsoft Graph API, effectively giving them access to the whole Office 365 tenant, and the Azure Active Directory tenant. This makes it fairly powerful for making simple log-in to an application, securing Web APIs, and for automating certain Office tasks. This quick how-to will explain basic set-up. I assume some familiarity with basic http and OAuth2.

There are several ways to set up Azure AD Authentication:

  - Through the Microsoft Application Registration Portal - this uses the 2.0 endpoint.
  - Through the Azure Portal - this uses the 1.0 endpoint.
  - Through Powershell - this uses the 1.0 endpoint.
  - Using B2C app registration in the Azure Portal

I will cover the first two of these. All of them involve 'registering' your application somewhere by making an 'Application Registration', and delegating it particular permissions. If you want your application registration to be able to call the APIs itself (as in making calls without being 'logged-in' through a particular user), you will need admin rights.

## A Note on Endpoints

There are currently 2 Azure AD Endpoints: 1.0 and 2.0. I now recommend using the 2.0 endpoint, which requires set-up in the Microsoft Application Registration Portal. The 2.0 endpoint is somewhat better supported than the 1.0 - most notably it will work for both personal and work accounts - but still has several restrictions that 1.0 doesn't have. If you're interested in these, see [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-limitations).

## Authorisation flow

Both endpoints have support for two of the main OAuth2 flows. They are [Authorisation Code Grant](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-oauth-code) and [Implicit Grant](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-dev-understanding-oauth2-implicit-grant). It is considered more secure to use Auth Code Grant, so that's what I'll cover.

## Using the 2.0 Endpoint

Before you can use the 2.0 endpoint, you need to set up an 'application registration' - basically you register that your app exists and is allowed to use this particular registration to authenticate.

- Go to [the Microsoft Developer Application Registration Portal](https://apps.dev.microsoft.com/#/appList) and log in with your Turing email. It should look something like this.

!(App List)[]

- Click 'Add an App', then name it as you wish. It will take you to a page like this.

!(App Page)[]

- Click 'Generate new password' to get a client secret. Make sure to store this somewhere secure.

- Then add a platform - usually this will be web, if you're authenticating with any sort of web service.

- Then under 'Web', input the Redirect URIs. These are the URLS to which that it will send the authorization code, then the token. Note that at present these *have* to be https, but you can use localhost (with a port) if you want to send them to a locally hosted service. NB: If you want to add multiple subdomains from one URL, you must also put the master domain as one of the Redirect URIs. There is also a limit of about 21 redirect URIs total.

- Add delegated permissions: these are any permissions you wish the application to have when logged-in as a user. These could include seeing their profile, or sending mail from their account. If in doubt, I'd recommend using Delegated Permissions for pretty much everything.

    - If you want to be able to access a .NET Web API in the same Active Directory, give it Directory.{...} permissions. The user must also be able to read this directory though.

- Add application permissions for any permissions you wish the application to have for itself - it can do these things without being logged-in as a user.

If you'd like, you can test that your apps working in something like [Postman](https://getpostman.com). If you want an quick way to set up a web-service, [Passport](http://passportjs.com) is at least easy, though you'll have to deal with Node.

If you want to facilitate authenticating against this endpoint, there are several libraries and tools to make this sort of thing easier. I won't use any of those in this How To, but they can help. If you're using Passport, try [passport-azure-ad](https://github.com/AzureAD/passport-azure-ad).

### I need access to the Graph API: Using the 2.0 Endpoint and OAuth2 Authorisation Code Grant

If you need access to the Graph API, you need to get an access token. You do this by following the full Authorisation Code Grant flow.

In your authorization service (say it's a web-service) you'll need to make requests to these endpoints.

- Authorization Endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`. You need to redirect the user to this endpoint. This will provide a code and state. In the query string, you should include all the following values.

    1. `client_id`: `{client_id_here}`
    2. `response_type`: `code`
    3. `redirect_uri`: `{redirect_uri_to_use_here}` - this must match one of the URIs you registered.
    4. `response_mode`: `query`
    5. `scope`: `{space_delimited_scopes_here}` - all of these must match the scopes you registered, though you don't have to request them all.
    6. `state`: `{csrf_token_value_here}` - this can be any number, but use a randomised token to protect from [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery).
    7. (Optional) `msafed`: `0` - this will stop personal accounts from being used entirely.

    Overall, this looks something like this:

    ```
    https://login.microsoftonline.com/common/oauth2/v2.0/authorize
    ?msafed=0
    &client_id={client_id_here}
    &response_type=code
    &redirect_uri={redirect_uri_to_use_here}
    &response_mode=query
    &scope={scope_here}%20offline_access
    &state={csrf_token_value_here}
    ```

    If you want it to return a refresh token as well, you have to request the `offline_access` scope. *Note that this scope doesn't need to be specified in the application registration.*

    Once the user has logged in, this will return a `code` and a `state` in the query string. Your service should make sure the `state` matches the one you sent off, then use the code in the next request.

- Token Endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/token`. You need to make a POST request here to get a token.

  - In the headers, include a `Content-type` value set to `application/x-www-form-urlencoded`.

  - Then in the body of your request include the following values:

    1. `client_id`: `{client_id_here}`
    2. `scope`: `{space_delimited_scopes_here}`
    3. `redirect_uri`: `{redirect_uri_to_use_here}`
    4. `grant_type`: `authorization_code`
    5. `client_secret`: `{client_secret_here}` - this is the 'password' you generated.
    6. `code`: `{code_from_authorise_request}`

  - The body of the response will look like this:

    ```
    {
        "access_token": "{JWT_token_here}",
        "token_type": "Bearer",
        "expires_in": 3599,
        "ext_expires_in": 0,
        "scope": "{scope_here},
        "refresh_token": "{JWT_refresh_token_here}",
    }
    ```

Then you're ready to make requests to the Microsoft Graph API, or Office 365 Rest API. The endpoint is `https://graph.microsoft.com/...`, and you can find further documentation [here](https://developer.microsoft.com/en-us/graph/docs). Generally you'll including your token in the headers as:

`Authorization`: `Bearer {JWT_token_here}`

If you're making POST requests, you'll also need to specify a `Content-type` header.

Note that by default, each access token will last 1 hour. You will need to refresh it after this point with the `refresh_token` value.

### I need user identification for my own app: Using the 2.0 endpoint and OpenID Connect

If you want to use the AD as user authentication for your own (for example, web) app, rather than for API authorization, you should probably be using [OpenID Connect](http://openid.net/connect/). The only real difference is using OpenID connect will instead give you an [ID token](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-tokens) which you can then use for identification. The flow is still Auth Code Grant.

- First set up the app as described above.

- Then, as if you're using the Authorisation Code Grant above, redirect the user (or make a GET request) to the authorization endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`.

  This time, however, use these parameters:

  1. `client_id`: `{client_id_here}`
  2. `response_type`: `id_token`
  3. `redirect_uri`: `{redirect_uri_to_use_here}` - this must match one of the URIs you registered.
  4. `response_mode`: `form_post`
  5. `scope`: `openid` - all of these must match the scopes you registered, though you don't have to request them all.
  6. `state`: `{csrf_token_value_here}` - this can be any number, but use a randomised token to protect from [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery).
  7. `nonce`: `{randomised_string_here}`
  8. (Optional) `msafed`: `0` - this will stop personal accounts from being used entirely.

- Overall, it should look something like this:

  ```
  https://login.microsoftonline.com/common/oauth2/v2.0/authorize
  ?msafed=0
  &client_id={client_id_here}
  &response_type=id_token
  &redirect_uri={redirect_uri_to_use_here}
  &response_mode=form_post
  &scope=openid
  &state={csrf_token_value_here}
  &nonce={randomised_string_here}
  ```

- The endpoint will then post a response to the redirect URI, containing the `state` and `id_token` in the body. You need to [validate the ID token](https://connect2id.com/blog/how-to-validate-an-openid-connect-id-token). Then (if you're making a web app), save their ID as a session cookie.

If you want to see Azure's OpenID metadata, you can find it here:  "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration"

### I need user identification for my app *and* acess to the Graph API: Using the 2.0 endpoint, OpenID Connect, and OAuth2 Authorisation Code Grant

If you want all of the above, follow this section. We'll get both an [ID token](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-tokens) and an access token to use for API requests.

In your authorization service (say it's a web-service) you'll need to make requests to these endpoints:

- Authorization Endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`. You need to redirect the user to this endpoint.

    1. `client_id`: `{client_id_here}`
    2. `response_type`: `id_token%20code`
    3. `redirect_uri`: `{redirect_uri_to_use_here}` - this must match one of the URIs you registered.
    4. `response_mode`: `form_post`
    5. `scope`: `openid%20{space_delimited_scopes_here}` - all of these must match the scopes you registered, though you don't have to request them all.
    6. `state`: `{csrf_token_value_here}` - this can be any number, but use a randomised token to protect from [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery).
    7. `nonce`: `{randomised_string_here}`
    8. (Optional) `msafed`: `0` - this will stop personal accounts from being used entirely.

    Overall, this looks something like this:

    ```
    https://login.microsoftonline.com/common/oauth2/v2.0/authorize
    ?msafed=0
    &client_id={client_id_here}
    &response_type=id_token%20code
    &redirect_uri={redirect_uri_to_use_here}
    &response_mode=form_post
    &scope={scope_here}%20openid%20offline_access
    &state={csrf_token_value_here}
    &nonce={randomised_string_here}
    ```

    If you want it to return a refresh token as well, you have to request the `offline_access` scope. *Note that this scope doesn't need to be specified in the application registration.*

    The endpoint will then post a response to the endpoint, which will contain and `id_token`, *and* `code` and `state` in the body, as so:

    `id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNB...&code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGBCmLdgfSTLEMPGYuNHSUYBrq...&state=12345`

You now need to [validate the ID token](https://connect2id.com/blog/how-to-validate-an-openid-connect-id-token). Then (if you're making a web app), save their ID as a session cookie. In order to get the access token, you then need to make another request to the Token Endpoint.

- Token Endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/token`. You need to make a POST request here to get a token.

    - In the headers, include a `Content-type` value set to `application/x-www-form-urlencoded`.

    - Then in the body of your request include the following values:

    1. `client_id`: `{client_id_here}`
    2. `scope`: `{space_delimited_scopes_here}`
    3. `redirect_uri`: `{redirect_uri_to_use_here}`
    4. `grant_type`: `authorization_code`
    5. `client_secret`: `{client_secret_here}` - this is the 'password' you generated.
    6. `code`: `{code_from_authorise_request}`

    - The body of the response will look like this:

    ```
    {
        "access_token": "{JWT_token_here}",
        "token_type": "Bearer",
        "expires_in": 3599,
        "ext_expires_in": 0,
        "scope": "{scope_here},
        "refresh_token": "{JWT_refresh_token_here}",
    }
    ```

Then you're ready to make requests to the Microsoft Graph API, or Office 365 Rest API. The endpoint is `https://graph.microsoft.com/...`, and you can find further documentation [here](https://developer.microsoft.com/en-us/graph/docs). Generally you'll including your token in the headers as:

`Authorization`: `Bearer {JWT_token_here}`

If you're making POST requests, you'll also need to specify a `Content-type` header.

Note that by default, each access token will last 1 hour. You will need to refresh it after this point with the `refresh_token` value.

### Refreshing tokens using the 2.0 endpoint

To refresh a token, simply make a POST request to the same token endpoint (`https://login.microsoftonline.com/common/oauth2/v2.0/token`), but use these parameters:

1. `client_id`: `{client_id_here}`
2. `scope`: `{space_delimited_scopes_here}`
3. `redirect_uri`: `{redirect_uri_to_use_here}`
4. `grant_type`: `refresh_token`
5. `client_secret`: `{client_secret_here}`
6. `refresh_token`: `{refresh_token_here}`

The body of the response will look exactly the same as before:

```
{
    "access_token": "{JWT_token_here}",
    "token_type": "Bearer",
    "expires_in": 3599,
    "ext_expires_in": 0,
    "scope": "{scope_here},
    "refresh_token": "{JWT_refresh_token_here}",
}
```
