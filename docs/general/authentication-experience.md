
# Authentication Experience

This document aims to explain what user experience should be possible when using tapio authentication.

# Overview

| Application Type                              | OAuth Grant        | Interactive authentication                                  | Password entry required    |
| --------------------------------------------- | ------------------ | ----------------------------------------------------------- | -------------------------- |
| Single Page Application (e.g. Angular, React) | Implicit           | Initial login(silent renewal) <br/> or every 24h             | 7d without authentication  |
| Single Page Application (e.g. Angular, React) | Auth Code + PKCE   | Initial login(silent renewal)<sup>1</sup> <br/> or every 24h | 7d without authentication  |
| Web Application (e.g. ASP.NET MVC)            | Auth Code          | Initial login                                               | 90d without authentication |
| Mobile Application (e.g. Xamarin)             | Auth Code + PKCE   | Initial login                                               | 90d without authentication |
| Daemon/Service Application                    | Client Credentials | -                                                           | -                          |

> 💡 For most applications, "*without authentication*" is equivalent to "*without using the application*".

- <sup>1</sup>: When using PKCE, refresh tokens can be used to get new tokens for up to 24hrs, after which silent token renewal via iFrames can be used ([MSAL.js documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/token-lifetimes.md#token-renewal)). This was chosen as a balance between user experience and security. See also "[Security implications of refresh tokens in the browser](https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-third-party-cookies-spas#security-implications-of-refresh-tokens-in-the-browser)".


## Interactive Authentication
Whenever a user experiences a redirect or sees a popup, we call this *interactive authentication*. If the user has a preexisting session, they will not have to enter a password and will immediately be redirected back to the application. This can be influenced by controlling "[*prompt behavior*](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-prompt-behavior)"

If the user has a valid session, interactive authentication can be avoided by using *silent token renewal*. This will acquire new tokens by using a hidden iFrame (implicit flow) or refresh tokens(PKCE). If you use MSAL.js, the method to use is called `acquireTokenSilent`. MSAL.js handles token caching and expiry internally, you do not check the expiry time of the token yourself.

> 💡 An application can always force the user to explicitly sign in by using the `prompt` parameter.
> ```javascript
> var request = {
>    scopes: ["user.read"],
>    prompt: 'login',
> }
> userAgentApplication.loginRedirect(request);
> ```

## About the implicit flow
Implicit flow relies heavily on cookies to achieve a seamless user experience using silent token renewal. These cookies are issued for `login.mytapio.one`. As your applications are always hosted on a different domain, those cookies are considered third-party cookies and will be blocked in privacy-focused browsers. If those cookies are blocked, you must fall back to interactive authentication. More on browser behavior below. This should always be the default behavior because the overall user session can expire and require interactive authentication.

If you want to add Content Security Policy headers to your application, the following settings are required for silent token renewal.

```
connect-src https://login.mytapio.one;
frame-src https://login.mytapio.one https://federation.homag.de;
```

## Password Reset and MSAL.js
If you use MSAL.JS, it is recommended to sign out the user after changing their password. See also this [GitHub issue](https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/440).

# Browser Issues

## Infinite redirects or redirect to a different application/host
Open the developer console and check the network log. Make sure you enable `Preserve Log`. Then take a closer look at the redirect from B2C back to your application. The error is usually part of the redirect response. The most common issues are related to missing reply urls. 

> When you use an **invalid redirect url**, the browser will be redirected to a **valid redirect url** with an information about the error. 

```
https://localhost:6420/#error=redirect_uri_mismatch&error_description=AADB2C90006%3a+The+redirect+URI+%27http%3a%2f%2flocalhost%3a6421%2f%27+provided+in+the+request+is+not+registered+for+the+client+id+%27a76b9dc0-aa0f-4088-98ed-8e34b07c9c4b%27.%0d%0aCorrelation+ID%3a+01ed07ff-2d46-4e84-bd79-8a06d338422d%0d%0aTimestamp%3a+2020-06-30+15%3a17%3a44Z%0d%0a&state=eyJpZC....
```


## Firefox Private Mode, Internet Explorer and Microsoft Edge
These browsers can get issues like `invalid_state` errors and infinite loops during interactive authentication.

In Firefox private mode, local and session storage is cleared when the user left the site for an extended period of time. As of Firefox 78, this can even happen during normal logins. This can lead to errors when the application is performing the authentication as an redirect. Especially password reset can take so long that Firefox removes the site's data.

Internet Explorer and Edge can also clear local and session storage if the redirect causes a switch of security zones. [This is a known issue](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-known-issues-ie-edge-browsers).

To fix the issue, you are advised to use the `storeAuthStateInCookie` flag in MSAL.js regardless of the user's current browser.

```typescript
this.msal = new Msal.UserAgentApplication({
    auth: {
        // ...
    },
    cache: {
        storeAuthStateInCookie: true
    }
});
```

## Chrome 83+ Icognito Mode and other Privacy Focused Browsers
With Chrome 83, third party cookies are [blocked by default](https://9to5google.com/2020/05/19/chrome-83-mac-windows-stable/). This is also the default behavior of Safari and other privacy focused browsers, even without private mode.
> A related change sees Chrome 83 block third-party cookies by default in Incognito. Users, however, will have the option to enable on a site-by-site basis. A new “eye” icon in the address bar opens a panel that notes how many cookies were blocked, while there’s a toggle on the Incognito New Tab Page to allow/disable third-party cookies.

This means that non-interactive authentication requests will **always fail** when these cookies are blocked. Applications should always fall back to interactive authentication automatically. However, this will still mean that a customer experience popups or redirects more often than they would otherwise.

The answer to these issues will be to use [PKCE for Single Page Applications](https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-third-party-cookies-spas).

> 💡 Redirect Urls must be explicitly enabled in order to use PKCE. Otherwise CORS requests will be rejected. If you want to try out PKCE, let us know so we can update your application accordingly.

