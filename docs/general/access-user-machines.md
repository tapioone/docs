---
sidebar_label: Retrieve Machines of a User
---

# Accessing Machines that are assigned to a User

Before we can retrieve actual machine data, we need to know which user is logged in and which machines are accessible by this user. To retrieve this information we use the `tapio Global Discovery Service`. This service is the pivotal point when it comes to relationships between machines, applications, users and their permissions. [My tapio](https://my.tapio.one) also uses this service very extensively.

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

Now that we have the users email address - let's assume it is `woodgod@example.localhost` - we can use it to retrieve the `UserProfile` via the `GlobalDiscoveryService` (GDS). The GDS provides the route `api/userProfile/{email}` which takes an email address as route parameter and returns the `UserProfile` for that email address. The base URL of the GlobalDiscoveryService is `https://globaldisco.tapio.one`.

Our request to the GlobalDiscoveryService could look like this:

```csharp
async Task MainAsync(CancellationToken cancellationToken)
{
    string authority = "https://login.microsoftonline.com/tapiousers.onmicrosoft.com";
    string clientId = "your-client-id";
    string clientSecret = "your-client-secret";
    string targetResource = "https://tapiousers.onmicrosoft.com/GlobalDiscoveryService";
    string targetUrl = "https://globaldisco.tapio.one";
    string userEmail = "woodgod@example.localhost";

    var authContext = new AuthenticationContext(authority);
    var clientCredential = new ClientCredential(clientId, clientSecret);

    using (var httpClient httpClient = new HttpClient())
    {
        httpClient.BaseAddress = new Uri(targetUrl);

        var result = await DoAuthenticate(authContext, targetResource, clientCredential);
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result.AccessToken);

        var profile = await GetUserProfile(httpClient, userEmail, cancellationToken);

        // Do asserts here
        Console.WriteLine(profile.Email);
        Console.WriteLine(profile.UserSubscriptions);
    }
}

async Task<UserProfile> GetUserProfileAsync(HttpClient httpClient, string userEmail, CancellationToken cancellationToken)
{
    using (var getRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/userProfile/{WebUtility.UrlEncode(userEmail)}"))
    {
        using (var profileMessage = await httpClient.SendAsync(getRequest, cancellationToken).ConfigureAwait(false))
        {
            profileMessage.EnsureSuccessStatusCode();

            string responsebody = await profileMessage.Content.ReadAsStringAsync().ConfigureAwait(false);

            var profile = JsonConvert.DeserializeObject<UserProfile>(responsebody, new JsonSerializerSettings
            {
            DateParseHandling = DateParseHandling.DateTimeOffset
            });

            return profile;
        }
    }
}

async Task<AuthenticationResult> DoAuthenticateAsync(AuthenticationContext authContext, string targetResource, ClientCredential clientCredential)
{
    AuthenticationResult result = null;
    int retryCount = 0;
    bool retry = false;

    do
    {
        retry = false;
    try
    {
        // ADAL includes an in memory cache, so this call will only send a message to the server if the cached token is expired.
        result = await authContext.AcquireTokenAsync(targetResource, clientCredential);
    }
    catch (AdalException ex)
    {
        if (ex.ErrorCode == "temporarily_unavailable")
            {
            retry = true;
            retryCount++;
            Thread.Sleep(3000);
            continue;
        }

        throw;
        }
    } while ((retry == true) && (retryCount < 3));

    return result;
}
```

This request returns the `UserProfile`, which contains the following information:

```csharp
    public class UserProfile
    {
        /// <summary>
        /// The email address / account of profile
        /// </summary>
        [JsonProperty("email")]
        public string EMail { get; set; }

        /// <summary>
        /// The subscriptions of the user
        /// </summary>
        [JsonProperty("subscriptions")]
        public IEnumerable<SubscriptionInfo> Subscriptions { get; set; }
    }
```

The interesting part about this object, is the list of `SubscriptionInfo` objects it contains. It represents all the tapio subscriptions, a user has access to. In most cases this will only be one subscription.

```csharp
    /// <summary>
    /// Information about a subscription
    /// </summary>
    public class SubscriptionInfo
    {
        /// <summary>
        /// The subscription id
        /// </summary>
        [JsonProperty("subscriptionId")]
        public Guid SubscriptionId { get; set; }

        /// <summary>
        /// The subscription name
        /// </summary>
        [JsonProperty("name")]
        public string Name { get; set; }

        /// <summary>
        /// The tapio id
        /// </summary>
        [JsonProperty("tapioId")]
        public string TapioId { get; set; }

        /// <summary>
        /// The assigned machines
        /// </summary>
        [JsonProperty("assignedMachines")]
        public IEnumerable<MachineInfo> AssignedMachines { get; set; }

        /// <summary>
        /// The role of the user
        /// </summary>
        [JsonProperty("role")]
        public string Role { get; set; }
    }
```

You may have noticed the list of `MachineInfo` objects, which is the actual data we want. Each `SubscriptionInfo` contains a list of machines that are assigned to this subscription.

```csharp
    /// <summary>
    /// Information about a machine
    /// </summary>
    public class MachineInfo
    {
        /// <summary>
        /// The unique tapio machine id
        /// </summary>
        [JsonProperty("tmid")]
        public string TapioMachineId { get; set; }

        /// <summary>
        /// The device type of the machine
        /// </summary>
        [JsonProperty("deviceType")]
        public DeviceType DeviceType { get; set; }

        /// <summary>
        /// The device sub-type of the machine
        /// </summary>
        [JsonProperty("deviceSubType")]
        public string DeviceSubType { get; set; } = string.Empty;

        /// <summary>
        /// The serial number given to the machine by its manufacturer.
        /// </summary>
        [JsonProperty("manufacturerSerialNumber")]
        public string ManufacturerSerialNumber { get; set; }

        /// <summary>
        /// The name to display for machine
        /// </summary>
        [JsonProperty("displayName")]
        public string DisplayName { get; set; }

        /// <summary>
        /// The date, when the machine has been added to the subscription
        /// </summary>
        [JsonProperty("onboardingDate")]
        public DateTimeOffset OnboardingDate { get; set; }

        /// <summary>
        /// Information about the equipment group to which this machine is assigned, or null if there is none.
        /// </summary>
        [JsonProperty("equipmentGroup")]
        public EquipmentGroupMachineInfo EquipmentGroup { get; set; }

        /// <summary>
        /// List of assigned applications for this machine
        /// </summary>
        [JsonProperty("assignedApplications")]
        public IEnumerable<AssignedApplication> AssignedApplications { get; set; }
    }
```

The `EquipmentGroupMachineInfo` contains the position information of the machine in customer Equipment group.

```csharp
    /// <summary>
    /// Information about a group in the context of a machine, assigned to it.
    /// </summary>
    public class EquipmentGroupMachineInfo
    {
        /// <summary>
        /// Id of the equipment group.
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; set; }

        /// <summary>
        /// Position of the machine within the group.
        /// </summary>
        [JsonProperty("groupPosition")]
        public int GroupPosition { get; set; }
    }
```

Each `AssignedApplication` contains a list of assigned applications for this machine.

```csharp
    /// <summary>
    /// Model for an assigned application
    /// </summary>
    public class AssignedApplication
    {
        /// <summary>
        /// The application id
        /// </summary>
        [JsonProperty("id")]
        public Guid Id { get; set; }
    }
```

Possible values for `deviceType`:

- `Unknown`
- `Machine`
- `SmartDevice`

`deviceSubType` can be any string, except if `deviceType` is set to `Machine`, `deviceSubType` will only contain one the following values:

- `Unknown`
- `Edge`
- `Saw`
- `Cnc`
- `Sanding`
- `Drilling`
- `Assembly`
- `Storing`
- `Stock`
- `Sorting`
- `Shipping`
- `PreAssembly`
- `Lamination`
- `Moulding`
- `Packaging`
- `Handling`

When iterating over all subscriptions from above, we can get all the machines the user has access to. We don't have any data sent from the machine yet, but what we have would be enough to built apps for machines with [limited tapio connectivity](../machine-data/connectivity)
