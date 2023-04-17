# Authentication Implementation

## Authentication Information

Authentication in tapio is based on OAuth2 and Azure AD B2C. You should have a basic understanding of OAuth2 before you start integrating tapio.

This table contains information which applies across all authorization types.

| Term            |                    Value/(Example)                    | Remark                                                  |
| --------------- | :---------------------------------------------------: | ------------------------------------------------------- |
| Tenant          |             `tapiousers.onmicrosoft.com`              | Identification of the tapio directory in Azure AD B2C   |
| Tenant ID       |         32896ed7-d559-401b-85cf-167143d61be0          | Identification of the tapio directory in Azure AD B2C   |
| Client ID       |                           -                           | A guid that uniquely identifies an application          |
| Client Secret   |                           -                           | A secret value used in machine to machine communication |
| Application URI | (`https://tapiousers.onmicrosoft.com/My-Application`) | Human readable application identification               |
| Scopes          |       (openid APPLICATION_URI APPLICATION_URI)        | Specifies the desired resource access during login      |
| Policy          |                 (B2C_1A_Tapio_Signin)                 | The B2C policy which triggers the desired user journey  |

### Interactive Authentication

When creating an application with user login, the user must authenticate against the tapio directory while in the context of your application.
Most of the critical configuration is provided by your application during the *Login* redirect. For the user login, your application should redirect the user to a login page where they authenticate. After authentication, the user will be redirected back to your application, and the application will receive the authentication details in the redirect.

A login url should look something like this:

```bash
GET https://login.mytapio.one/32896ed7-d559-401b-85cf-167143d61be0/TAPIO_SIGNIN_POLICY_NAME/oauth2/v2.0/authorize?
    client_id=YOUR_CLIENT_ID
    &response_type=code
    &scope=openid
    &redirect_uri=YOUR_APPS_AUTH_CALLBACK_URI
    &response_mode=query
```

- **ClientId**: Your client id (guid)
- **TAPIO_SIGNIN_POLICY_NAME**: The policy to use.
  - *B2C_1A_Tapio_Signin* for signin.
  - *B2C_1A_Tapio_ResetPW* for password reset.
- **response_type**: Either*"code"*for*Authorization Code Grant*or*"id_token"* for *Implicit Grant*.
- **Scope**: A list of resources separated with a space (" "). Must include *"openid"*.
- **redirect_uri**: A valid redirect URI of your application. This list is managed by tapio and can be updated upon request. We recommend keeping this list short.
- **response_mode**: How your application would like to receive the authentication information in the redirect back to your application.*"query"*,*"fragment"*and*"form_post"* are valid values.

#### Authorization Code Grant

This is the recommended flow for all web applications which have code executing on a server (e.g. ASP .NET, PHP). After the login redirect, the application receives a *code* which can be exchanged for an *Access Token* with a *POST* request.

##### Exchanging the code for an Access Token

To exchange the *Authorization Code* for tokens, you have to perform this request:

```bash

curl -X POST \
  'https://login.mytapio.one/32896ed7-d559-401b-85cf-167143d61be0/b2c_1a_tapio_signin/oauth2/v2.0/token' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -F 'client_id=YOUR_CLIENT_ID' \
  -F 'grant_type=authorization_code' \
  -F 'scope=YOUR_SCOPE' \
  -F 'redirect_uri=YOUR_APPS_AUTH_CALLBACK_URI' \
  -F 'code=RECEIVED_FROM_LOGIN' \
  -F 'client_secret=YOUR_CLIENT_SECRET'
```

A successful response will look like this:

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs....",
  "token_type": "Bearer",
  "not_before": 1532358090,
  "access_token_expires_in": 3600,
  "refresh_token": "eyJraWQiOiJVVW5kMXFkMDU4NGQ0VFNhLWRw...",
  "refresh_token_expires_in": 7776000
}
```

##### Refreshing an Access Token

To refresh an *Access Token*, you can use the *Refresh Token* you received when exchanging the *Authorization Code*.
> You will only receive a *Refresh Token* if your scope included *"offline_access*".

```bash
curl -X POST \
  'https://login.mytapio.one/32896ed7-d559-401b-85cf-167143d61be0/b2c_1a_tapio_signin/oauth2/v2.0/token' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -F 'client_id=YOUR_CLIENT_ID' \
  -F 'grant_type=refresh_token' \
  -F 'scope=YOUR_SCOPE' \
  -F 'redirect_uri=YOUR_APPS_AUTH_CALLBACK_URI' \
  -F 'refresh_token=RECEIVED_FROM_PREVIOUS_REQUEST' \
  -F 'client_secret=YOUR_CLIENT_SECRET'
```

The response will include a new *Refresh Token* which can be used for further requests.

#### Authorization Code Grant + PKCE

Native apps (Xamarin, UWP, ...) and since MSAL 2.0 also Single Page Applications (React, Angular) should use the *Authorization Code* flow with *PKCE* extensions. The advantage of using this flow is that you have all the benefits of silent token renewal without needing to expose the *Client Secret* to your application or providing additional infrastructure for authentication. For React we created a sample application with a basic implementation of MSAL.JS with PKCE. You can try to login with your tapio Account on this website:
- [Preview Sample App](https://tapioone.github.io/tapio-auth-react/)
- [Github Repository](https://github.com/tapioone/tapio-auth-react)

Useful links:

- [Microsoft Authentication Library (MSAL) for .NET](https://github.com/AzureAD/microsoft-authentication-library-for-dotnet)
- [Microsoft Authentication Library (MSAL) for JavaScript](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [WPF application signing in users with Azure Active Directory B2C and calling an API](https://github.com/Azure-Samples/active-directory-b2c-dotnet-desktop)
- [Integrate Azure AD B2C into a Xamarin forms app using MSAL](https://github.com/Azure-Samples/active-directory-b2c-xamarin-native)
- [Working with Azure AD B2C and MSAL.JS](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/working-with-b2c.md)
- [Request an access token in B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/access-tokens#openid-connect-scopes)

#### Implicit Grant

The *Implicit Grant* uses the users session with the authentication server and hidden iFrames to acquire and renew tokens.

If you are creating a single page application (SPA), we currently recommend using the *Authorization Code Grant with PKCE*.

#### Edge cases to implement in your client application

In general, AAD B2C will redirect the user back to your application if the authentication did not complete as expected. You will receive information about the error the same way you would receive the *Access Token*. If the user is not redirected back, there is usually a configuration error like an invalid redirect url.

Your application code needs to handle these errors and react accordingly.

##### Canceled signin
In some situations like password reset, a user can cancel the signin journey. If that happens, your application will be notified with this error:

```text
AADB2C90091: The user has cancelled entering self-asserted information.
```

The suggested behavior in this case is to return the user to the home page of your application where they can choose to signin again.

##### Social login without proper registration

To ensure a user really has consented to the tapio terms of use, the user must register through tapio. If a user selects *Extranet* and is not registered, they will be shown an error. The user will then be returned to your application as if they canceled the signin (see above). In rare situations, you might also get this error:

```text
Error while Login: server_error / AADB2C: 'B2C_1A_Tapio_Signin' policy in 'tapiousers.onmicrosoft.com'
specifies the subject claim 'sub' which is missing in the claims collection.
```

You should handle this error like a canceled signin.

### Non-interactive Authentication

#### Client Credentials Grant

If your use case does not include a user context, you can use the *Client Credentials Grant*. A main use case for this would be services which are triggered by events and communicate without any user interaction.
Be aware that this flow should only be used if you are in complete control over the client. It should not be used in native applications. Key parts of this flow are your *Client ID* and the *Client Secret*.

You will need:

- Your *Client ID*
- Your *Client Secret*
- The *Application URI* of the resource you want to call

##### Sample request (cURL)

Please make sure to properly url encode all parameters.

```bash
curl -X POST \
  https://login.microsoftonline.com/tapiousers.onmicrosoft.com/oauth2/token \
  -H 'Accept: application/json' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&scope=openid&resource=RESOURCE_APPLICATION_URI&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET'
```

##### Sample request (NodeJs)

```javascript
var request = require("request");

var options = { method: 'POST',
  url: 'https://login.microsoftonline.com/tapiousers.onmicrosoft.com/oauth2/token',
  headers:
   { 'Cache-Control': 'no-cache',
     'Content-Type': 'application/x-www-form-urlencoded',
     Accept: 'application/json' },
  form:
   { grant_type: 'client_credentials',
     scope: 'openid',
     resource: 'APPLICATION_URI',
     client_id: 'YOUR_CLIENT_ID',
     client_secret: 'YOUR_CLIENT_SECRET' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

#### Resource Owner Password Credentials Grant

This flow is not supported at this point.

## Examples

### Get a Token for GlobalDiscoveryService with Machine-to-Machine authentication

This implementation sample is using the nuget package [Microsoft.Identity.Client](https://www.nuget.org/packages/Microsoft.Identity.Client).

```csharp
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.Identity.Client;

var authority = new Uri("https://login.microsoftonline.com/tapiousers.onmicrosoft.com");
var clientId = "your-client-id";
var clientSecret = "your-client-secret";
var targetResource = "https://tapiousers.onmicrosoft.com/GlobalDiscoveryService/.default";
var targetUrl = new Uri("https://globaldisco.tapio.one");
var userEmail = "tapio.fair@tapio.one";

var confidentialClientApplication = ConfidentialClientApplicationBuilder
    .Create(clientId)
    .WithAuthority(authority)
    .WithClientSecret(clientSecret)
    .Build();
    
var httpClient = new HttpClient
{
    BaseAddress = targetUrl,
};

var tokenBuilder = confidentialClientApplication.AcquireTokenForClient(new[] { targetResource });
var token = await tokenBuilder.ExecuteAsync(CancellationToken.None);

httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

var userProfileResponse = await httpClient.GetAsync(new Uri("api/userProfile/{userEmail}", UriKind.Relative), CancellationToken.None);
```

### Secure you ASP.NET Core API with B2C authentication

#### Using login.mytapio.one

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(options =>
    {
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(jwtOptions =>
    {
        // https://login.mytapio.one/32896ed7-d559-401b-85cf-167143d61be0/B2C_1A_Tapio_Signin/v2.0
        jwtOptions.Authority = appConfig.AuthAuthority;
        jwtOptions.Audience = appConfig.AuthClientId;
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ...
    app.UseAuthentication();
    app.UseAuthorization();
    // ...
}
```

#### Using login.mytapio.one and accepting tokens from a previous authority at the same time

Previous authorities in the ecosystem are login.microsoftonline.com and tapiousers.b2clogin.com.

```csharp
private const string _FallbackScheme = "fallback";

public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(options =>
    {
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(jwtOptions =>
    {
        // https://login.mytapio.one/32896ed7-d559-401b-85cf-167143d61be0/B2C_1A_Tapio_Signin/v2.0
        jwtOptions.Authority = appConfig.AuthAuthority;
        jwtOptions.Audience = appConfig.AuthClientId;
    }).AddJwtBearer(_FallbackScheme, jwtOptions =>
    {
        // https://login.microsoftonline.com/32896ed7-d559-401b-85cf-167143d61be0/B2C_1A_Tapio_Signin/v2.0
        jwtOptions.Authority = appConfig.AuthAuthorityFallback;
        jwtOptions.Audience = appConfig.AuthClientId;
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseAuthentication();
    app.Use(async (context, next) => {
        if (!context.User.Identity.IsAuthenticated)
        {
            var result = await context.AuthenticateAsync(_FallbackScheme);
            if (result.Succeeded)
            {
                context.User = result.Principal;
            }
        }
        await next();
    });
}
```

### Secure your own ASP.NET WebAPI with B2C authentication

[A combined sample for a .NET web application that calls a .NET Web API, both secured using Azure AD B2C](
https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi)

```csharp
    public partial class Startup
    {
        // These values are pulled from web.config
        public static string AadInstance = ConfigurationManager.AppSettings["ida:AadInstance"];
        public static string Tenant = ConfigurationManager.AppSettings["ida:Tenant"];
        public static string ClientId = ConfigurationManager.AppSettings["ida:ClientId"];
        public static string SignUpSignInPolicy = ConfigurationManager.AppSettings["ida:SignUpSignInPolicyId"];
        public static string DefaultPolicy = SignUpSignInPolicy;

        /*
         * Configure the authorization OWIN middleware
         */
        public void ConfigureAuth(IAppBuilder app)
        {
            TokenValidationParameters tvps = new TokenValidationParameters
            {
                // Accept only those tokens where the audience of the token is equal to the client ID of this app
                ValidAudience = ClientId,
                AuthenticationType = Startup.DefaultPolicy
            };

            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions
            {
                // This SecurityTokenProvider fetches the Azure AD B2C metadata & signing keys from the OpenIDConnect metadata endpoint
                AccessTokenFormat = new JwtFormat(tvps, new OpenIdConnectCachingSecurityTokenProvider(String.Format(AadInstance, Tenant, DefaultPolicy)))
            });
        }
    }


    // This class is necessary because the OAuthBearer Middleware does not leverage
    // the OpenID Connect metadata endpoint exposed by the STS by default.
    public class OpenIdConnectCachingSecurityTokenProvider : IIssuerSecurityKeyProvider
    {
        public ConfigurationManager<OpenIdConnectConfiguration> _configManager;
        private string _issuer;
        private IEnumerable<SecurityKey> _keys;
        private readonly string _metadataEndpoint;

        private readonly ReaderWriterLockSlim _synclock = new ReaderWriterLockSlim();

        public OpenIdConnectCachingSecurityTokenProvider(string metadataEndpoint)
        {
            _metadataEndpoint = metadataEndpoint;
            _configManager = new ConfigurationManager<OpenIdConnectConfiguration>(metadataEndpoint, new OpenIdConnectConfigurationRetriever());

            RetrieveMetadata();
        }

        /// <summary>
        /// Gets the issuer the credentials are for.
        /// </summary>
        /// <value>
        /// The issuer the credentials are for.
        /// </value>
        public string Issuer
        {
            get
            {
                RetrieveMetadata();
                _synclock.EnterReadLock();
                try
                {
                    return _issuer;
                }
                finally
                {
                    _synclock.ExitReadLock();
                }
            }
        }

        /// <summary>
        /// Gets all known security keys.
        /// </summary>
        /// <value>
        /// All known security keys.
        /// </value>
        public IEnumerable<SecurityKey> SecurityKeys
        {
            get
            {
                RetrieveMetadata();
                _synclock.EnterReadLock();
                try
                {
                    return _keys;
                }
                finally
                {
                    _synclock.ExitReadLock();
                }
            }
        }

        private void RetrieveMetadata()
        {
            _synclock.EnterWriteLock();
            try
            {
                OpenIdConnectConfiguration config = Task.Run(_configManager.GetConfigurationAsync).Result;
                _issuer = config.Issuer;
                _keys = config.SigningKeys;
            }
            finally
            {
                _synclock.ExitWriteLock();
            }
        }
    }

```

