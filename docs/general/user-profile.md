---
sidebar_label: User-Profile
---

# Get the profile of a user to check for app license and retrieve assigned machines

After a user has successfully logged in, we first need to check that the logged in user has a valid license for our app. Then we can get further information about the scope a user is allowed to see, e. g. which machines are accessible by this user. To retrieve this information we use the `tapio Global Discovery Service`. This service is the pivotal point when it comes to relationships between machines, applications, users and their permissions. [My tapio][my-tapio] also uses this service very extensively.

> This route is rate limited based on client id.

If your application makes too many requests, HTTP status code `429` is returned. A `Retry-After` header is included in this response which indicates how long to wait before making the next request. [HTTP 429 standard](https://datatracker.ietf.org/doc/html/rfc6585#section-4) is followed.

## Decode the Access Token

We start with collecting some information about the user that is currently logged-in. If you don't know how to enable tapio login in your application, read our guide about [authentication](./authentication). When a user has successfully logged-in to our application, we receive an access token, which is used for authorization in further requests against tapio APIs. This access token also contains some information about the user. In our case, we need the email address of the user, to retrieve his user profile. To do so, we need to decode the access token (which is a [Json Web Token](https://jwt.io)) and access the `email` property of it.

```javascript
let accessToken = "eyJ0eXAiO..."; /// jwt token

//little helper function to decode access token
const decodeAccessToken = (base64string: string) => {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  let result = window.atob(output); // poly fill https://github.com/davidchambers/Base64.js
  try {
    return decodeURIComponent(encodeURI(result));
  } catch (err) {
    return result;
  }
};

// json web tokens are structured in three parts: header, payload, signature. we only want to decode the payload of the token (often called 'claim')
const claim = accessToken.split(".")[1];
const email = decodeAccessToken(claim).email;
```

If you don't want to write your own function that decodes the access token, there's a small open source library called [jwt-decode](https://github.com/auth0/jwt-decode) which does the same :wink:.

## Retrieve the UserProfile

See [Get User Profile](../apis/gds/get-user-profile.api.mdx).

When iterating over all subscriptions from above, we can get all the machines the user has access to. We don't have any data sent from the machine yet, but what we have would be enough to built apps for machines with [limited tapio connectivity](../machine-data/connectivity)

## Check licenses for your tapio-Application

`Licenses` can be acquired through different sales channels (e.g. the [tapio store](https://store.tapio.one)) in the scope of a `Subscription`.
A `Subscription` is the equivalent of an account of a company which uses tapio.

### Check if a user has a license

Retrieve the user profile, [as described above](#retrieve-the-userprofile).

:::caution
The Global Discovery Service API returns information based on the set of `tapio-Applications` that are assigned to the calling `AAD-Application`. Make sure that the `AAD-Application` you are using is assigned to the `tapio-Application` you want to check licenses for in [my tapio][my-tapio].
:::

To check if the `User` has a `License` for your `tapio-Application` you have to go through all `Licenses` of of all `Subscriptions` in the response and check if there is a `License` with the id of your `tapio-Application` (`subscriptions[].licenses[].applicationId` [JMESPath][jmes-path]).

### Detect license changes

`Licenses` can expire or be unassigned from a certain `User` or `Machine`.
It is not recommended to poll the **Global Discovery Service API** and detect those changes yourself.
Instead we encourage you [to setup a CloudEvent endpoint](./cloud-events) and listen for `License`-related changes.

[jmes-path]: https://jmespath.org/
[my-tapio]: https://my.tapio.one
