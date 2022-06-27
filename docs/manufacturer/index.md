# Create and manage machines on tapio

## Introduction

tapio's manufacturer API enables clients to create, update or manage manufacturer machines inside of tapio. You can create a manufacturer machines with your own certificate and get the configuration or the CloudConnector. Also can assign your machines to customers to whom you have sold the machine. Via this API you are able to get information about your machines for example which machine is used in which application. Also you can get the information whether the machine is connected to tapio or if your customer isn't using tapio with your machines.

If you are also an app developer, you are able to issue licenses for the application you created. As a manufacturer, you can assign your machines to applications for the customer.

> It is also possible to interact with machines that are not tapio-ready through this API.

## General

To be able to make requests to the manufacturer API, you first need to [register a tapio application](../general/register-tapio-application) for your manufacturer subscription. **You won't be able to manage machines**  which are not machines you created.  
**Authentication** for Management API is done via Azure AAD. See our [guide on authentication](../general/authentication#non-interactive-authentication) for more details.

> Use `Content-Type: application/json;charset=UTF-8` in your request headers for all requests
<!-- -->
> To request a token, use the ResourceId `https://tapiousers.onmicrosoft.com/ManagementApiGateway` otherwise you'll get an unauthorized.
<!-- -->
> Use the `Authorization: Bearer ey...` header with your token for all requests.

## Overview

Go to [manufacturer routes](./manufacturer-section), to get an overview over the existing routes.

See [machine onboarding workflow](./machine-onboarding-workflow), to view a description on how to onboard machines via the api,

Refer to [reporting workflow](./reporting-workflow), if you want to retrieve information on how your customer use your machines.

If you're a developer and want to issue licenses for your applications, see the
[licensing workflow](./licensing-workflow)

Finally, if you're an app developer and want to know if a certain machine is assigned to one of your applications, refer to [accessing assigned machines](./access-assigned-machines).

