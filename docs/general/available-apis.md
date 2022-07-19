---
sidebar_label: Available APIs
---

# Available tapio APIs to use in your Applications

This page contains an overview on all APIs that are currently available for third party developers, to integrate tapio ecosystem features within their applications.

> Before using one of the APIs below, we highly recommend to read our [authentication guide](./authentication)

## Common URLs used to Authenticate

We're using some services provided by Microsoft, to authenticate applications and users against the tapio ecosystem. Therefore, you need to know some common Login URLs, to get the tokens you need, depending on the OAuth flow you're using. As microsoft is also evolving their service constantly, there have been recent changes to the login URLs. We recommend, to use the new OAuth Token V2 endpoint to perform OAuth and OIDC authentication, because it's backwards compatible and can provide tokens for all kinds of services.

**The Authority is:** `https://login.microsoftonline.com/tapiousers.onmicrosoft.com`

**The Authorization Endpoint is:** `https://login.microsoftonline.com/tapiousers.onmicrosoft.com/oauth2/v2.0/authorize`  
**The Token Endpoint is:** `https://login.microsoftonline.com/tapiousers.onmicrosoft.com/oauth2/token`

## Available APIS

| API Name                     | Purpose                                                                       | Base Url                           | Detailed Documentation Available                                                                                                                                       | Authentication Flow    | ResourceId                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| Core API                     | Retrieve machine states and send commands to a machine                        | `https://core.tapio.one/`          | [Access Machine States](../machine-data/state-api), [-read Historical Data](../machine-data/historical-data), [Send Commands to a Machine](../machine-data/Commanding) | Client Credential Flow | `https://tapiousers.onmicrosoft.com/CoreApi`                |
| Global Discovery Service API | Retrieve the profile of a user, including assigned subscriptions and machines | `https://globaldisco.tapio.one/`   | [Retrieve Machines of a User](./access-user-machines), [-global Customer Settings](./global-discovery-service), [Check licenses](./check-licenses)                     | Client Credential Flow | `https://tapiousers.onmicrosoft.com/GlobalDiscoveryService` |
| Management API               | Create and manage your tapio machines                                         | `https://api.tapio.one/management` | [Manage your Machines](../manufacturer)                                                                                                                                | Client Credential Flow | `https://tapiousers.onmicrosoft.com/ManagementApiGateway`   |

Policies
______

If you have further questions on our APIs, how to use them, don't hesitate to contact us at [developer@tapio.one](mailto:developer@tapio.one).
