# General licensing workflow

This document describes:  

1. how licenses that are bound to a machine can be created,
2. how to retrieve created licenses and
3. how the license can be used to assign the machine to an application, so the customer can use it.

For the different steps of the process, different access rights are needed. To manage licenses, the calling api client needs to act in scope of a developer subscription. In order to assign machines to applications, the calling api client needs to act as the manufacturer of the machine.

If your company has separate manufacturer and developer subscriptions, you will need to use different clients to execute all the steps in this workflow.

## Managing licenses for machines

This section describes how to create licenses which are bound to a machine. Such a license will grant the rights to use an application to the current owner(s) of its machine. In other words, if a customer onboards the machine in his subscription, he will be granted the rights to use the license. If he removes the machine, e.g. because it is sold, the license will be automatically revoked and transferred to the new owner.

### Create a license

In order to create a license, you first need to obtain the id of the application for which you want to create the license. This application id is provided by tapio when an application is created in a developer subscription. Second, you need the tapioMachineId of the machine to which the license should be bound.

Each license is unique per application and machine. Consequently, you cannot issue multiple licenses for the same application to a single machine.

> Altough ownership of a license can be bound to a specific machine, the usage for the customer can not. This means the customer is free to assign the license to any machine. To ensure that a certain machine is actually assigned to a specific machine refer to [access assigned machines](./access-assigned-machines).

To create the license use the following route:

> POST `https://api.tapio.one/management/applications/{targetApplicationId}/machines/{tapioMachineId}/license`

#### Parameters

| Property            | Location | Description                                                 | Datatype | Required |
| ------------------- | -------- | ----------------------------------------------------------- | -------- | -------- |
| targetApplicationId | Route    | Id of the application for which the license will be created | Guid     | Yes      |
| tapioMachineId      | Route    | Id of the machine to which the license will be bound        | string   | Yes      |

**Request body**

```json
{
  "data": {  
    "name": "Example license",  // Name of your license (required).
    "issuedAt": "2020-04-03T00:00:00", // Time the license was issued (required).
    "machineCount": 1, // Number of machines, that can be assigned to this license (usually 1) (required).
    "serialNumber": "serial.myapp.2345", // Your serial number (required).
    "validFrom": "2020-04-03T00:00:00", // Start time of your license (required).
    "validTo": "2021-03-30T00:00:00" // Expiry date of your license (required).
   }
}
```

#### Response model

201 - Created.

```jsonc
{
  "id": "c91d01ba-b4b8-4510-99d6-0c984f26420e" // The id of the created object.
}
```

### Retrieve a license

After creating a license, it can be retrieved using the unique combination of applicationId and tapioMachineId.

> GET `https://api.tapio.one/management/applications/{targetApplicationId}/machines/{tapioMachineId}/license`

| Property            | Location | Description                                             | Datatype | Required |
| ------------------- | -------- | ------------------------------------------------------- | -------- | -------- |
| targetApplicationId | Route    | Id of the application for which to retrieve the license | Guid     | Yes      |
| tapioMachineId      | Route    | Id machine for which to retrieve the license            | string   | Yes      |

#### Response Model

200 - Ok

404 - NotFound.

```jsonc
{
    "id": "c91d01ba-b4b8-4510-99d6-0c984f26420e", // id of the license
    "createdAt": "2020-05-11T14:58:48.3777842+00:00", // creation date
    "tapioMachineId": "ma1234567890", // id of the machine
    "applicationId": "b19fbf71-7c32-4a51-aab5-c1bc3b3eb5b7", // targetApplicationId
    "data": {
      "name": "Example license",  // Name of your license
      "issuedAt": "2020-04-03T00:00:00", // Time the license was issued
      "machineCount": 1, // Number of machines, that can be assigned to this license.
      "serialNumber": "serial.myapp.2345", // Your serial number.
      "validFrom": "2020-04-03T00:00:00", // Start time of your license
      "validTo": "2021-03-30T00:00:00" // Expiry date of your license
    }
}
```

### Retrieve all licenses for an application

Using the route below, it is also possible to retrieve all the licenses that have been issued for a specific application.

> GET `https://api.tapio.one/management/applications/{targetApplicationId}/machines/licenses?continuationToken={continuationToken}`

| Property            | Location | Description                                                                                  | Datatype | Required |
| ------------------- | -------- | -------------------------------------------------------------------------------------------- | -------- | -------- |
| targetApplicationId | Route    | Id of the application for which to retrieve the licenses                                     | Guid     | Yes      |
| continuationToken   | Query    | ContinuationToken to request a specific page. If null or empty, the first page is retrieved. | string   | No       |

The route uses continuation tokens for server-side paging. In order to access the next page of the result, clients have to provide the continuation token that has been returned by the previous response. To access the first page use an empty or null token. The continuationToken must be URL-encoded. Finally, if the server returns an empty token there are no further pages.

#### Response Model

200 - Ok

```jsonc
{
    "items": [
      {
        "id": "c91d01ba-b4b8-4510-99d6-0c984f26420e", // id of the license
        "createdAt": "2020-05-11T14:58:48.3777842+00:00", // creation date
        "tapioMachineId": "ma1234567890", // id of the machine
        "applicationId": "b19fbf71-7c32-4a51-aab5-c1bc3b3eb5b7", // targetApplicationId
        "data": {
          "name": "Example license",  // Name of your license
          "issuedAt": "2020-04-03T00:00:00", // Time the license was issued
          "machineCount": 1, // Number of machines, that can be assigned to this license.
          "serialNumber": "serial.myapp.2345", // Your serial number.
          "validFrom": "2020-04-03T00:00:00", // Start time of your license
          "validTo": "2021-03-30T00:00:00" // Expiry date of your license
        }
      }
    ],
    "pagination": {
      "continuationToken": "-RID:IDVQdYALe2seBzAQAAAAAAAA==", // The continuation token to access the next page. Null or empty if there are no further pages.
  }
}
```

## Managing bundle for customer

In the tapio environment there are applications. These applications like MachineBoard can be used in the tapio environment, for example to interact with machines. Therefore, you have to order a license for these applications. Often several licenses of different applications belong together and are called Bundles. This section describes how to manage bundles for a customer. Those licenses can be managed by the partner or can handover to the tapio shop, so the customer can manage them by himself.

> API is asynchronous designed.

### Get all bundle definitions

To create a bundle for a customer you first have to retrieve a bundle definition.

> GET `https://api.tapio.one/management/bundleDefinitions?continuationToken=<continuationToken>`

| Property          | Description                                                                  | Datatype | Required |
| ----------------- | ---------------------------------------------------------------------------- | -------- | -------- |
| continuationToken | Used for pagination, in case it is empty there is no further page available. | string   | no       |

#### Response Model

```jsonc
{
  "continuationToken": "",
  "data": [
    {
      "id": "78ff519c-9c58-405c-a41e-6d8f5150f44e",   
      "displayName": "Edgeband Management Set 'Classic'", 
      "supportedPeriods": [
          "R/P1Y" // Supported periods like R/P1Y (ISO 8601 repeating intervals) 
          ],
      "licenses": [ 
        {
          "applicationId": "60dfa00f-1245-425d-83cd-d20bd638c15b",  
          "displayName": "materialAssist Boards Classic",           
          "minimalCount": 1,                                        
          "maximumCount": null                                      
        },
        {
          "applicationId": "4940f484-1c04-439e-a084-18358d540725", 
          "displayName": "twinio",
          "minimalCount": 1,
          "maximumCount": null
        }
      ],
      "canBeManagedByShop": false // Can be managed by the shop so you can call the handoverToShop route
    }
  ]
}
```

200 - OK.

### Create bundle

To create a bundle you have to call the route with the following information. Afterwards, you have to call the [Get bundle information](#get-bundle-information) with the returned bundle id to check the provisioning state.

> POST `https://api.tapio.one/management/bundles`

**Request body**

```jsonc
{
  "bundleDefinitionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Id of the bundle definition you want to create an instance of (required).
  "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Subscription id of the customer (required).
  "externalId": "string", // External id to have an unique identifier for the license (optional).
  "licenses": [ // List of license so you can override the count of the definition. (optional).
    {
      "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "count": 0, // The count to define how many licenses of this application should be ordered.
      "comment": "string" // Comment on the license (optional).
    }
  ],
  "comment": "string" // Comment on the bundle (optional).
}
```

> Duplication prevention is implemented via the external id. The external id has to be unique in your context. So you can use this, to avoid creating two times a bundle for a same order.

#### Response model

201 - Created.
400 - Bad Request.
401 - Unauthorized.
409 - Conflict. e.g. the external id is already used.

```jsonc
{
  "id": "c91d01ba-b4b8-4510-99d6-0c984f26420e" 
}
```

### Get all Bundles

You can call this route to query all your created bundles.

> GET `https://api.tapio.one/management/bundles​?applicationId=<applicationId>&subscriptionId=<subscriptionId>`

| Property       | Description                     | Datatype | Required |
| -------------- | ------------------------------- | -------- | -------- |
| applicationId  | Application id                  | Guid     | no       |
| subscriptionId | Subscription id of the customer | Guid     | no       |

#### Response model

```jsonc
{
  "continuationToken": "string",
  "data": [
    {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // Id of the bundle
        "salesChannel": { // Current sales channel
            "type": "API",  // Type of the channel (API, CloudBlueCommerce, Admin)
            "channelId": "string", // String of the channel Id
            "referenceId": "string" // String of the reference id, e.g. could be the external id 
        },
        "bundleDefinitionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Bundle definition id
        "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Subscription id of the owner of the bundle.
        "externalId": "string", // External id to have a unique identifier for these bundle
        "licenses": [
            {
            "licenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "count": 0, // Count of the licenses for this application
            "comment": "string" // Comment of the license // (optional)
            }
        ],
        "provisioningState": "Creating", // Provisioning state of the bundle (Creating, Updating, Succeeded, Failed, Deleting, Deleted)
        "bundleState": "Active", // State of the bundle (Active, Paused)
        "comment": "string" 
    }
  ]
}
```

### Get bundle information

After you created a bundle you can query the bundle and can check the state of this bundle.

> GET `https://api.tapio.one/management/bundles​/{bundleId}?applicationId=<applicationId>&subscriptionId=<subscriptionId>`

| Property       | Description                     | Datatype | Required |
| -------------- | ------------------------------- | -------- | -------- |
| bundleId       | Bundle id                       | Guid     | yes      |
| applicationId  | Application id                  | Guid     | no       |
| subscriptionId | Subscription id of the customer | Guid     | no       |

#### Response model

```jsonc
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // Id of the bundle
  "salesChannel": { // Current sales channel
    "type": "API",  // Type of the channel (API, CloudBlueCommerce, Admin)
    "channelId": "string", // String of the channel Id
    "referenceId": "string" // String of the reference id, e.g. could be the external id 
  },
  "bundleDefinitionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Bundle definition id
  "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Subscription id of the owner of the bundle.
  "externalId": "string", // External id to have a unique identifier for these bundle
  "licenses": [
    {
      "licenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "count": 0, // Count of the licenses for this application
      "comment": "string" // Comment of the license // (optional)
    }
  ],
  "provisioningState": "Creating", // Provisioning state of the bundle (Creating, Updating, Succeeded, Failed, Deleting, Deleted)
  "bundleState": "Active", // State of the bundle (Active, Paused)
  "comment": "string" 
}
```

> Duplication prevention is implemented via the external id. The external id has to be unique in your context. So you can use this, to avoid creating two times a bundle for a same order.
> `ProvisioningState` display if the bundle was successful provisioned in the system. This state model get information for long-running background operations. In case the state is `Failed` you have to contact the tapio support [developer@tapio.one](mailto:developer@tapio.one).
> `BundleState` display the information if this bundle can be used (active) by the customer or it can not be used (paused). No costs are incurred in the paused state.

### Delete bundle

After a bundle was created (bundle exist and provisioning state is `Succeeded`), you also can delete it. Delete of a bundle means all containing licenses are deleted afterwards. This is possible until you called [Handover the bundle to the shop](#handover-a-bundle-to-shop). After a bundle was handed over to shop, you can no longer delete it. You have to [cancel it](#cancel-a-bundle-in-shop) instead.

> DELETE `https://api.tapio.one/management/bundles​/{id}?subscriptionId=<subscriptionId>`

| Property       | Description              | Datatype | Required |
| -------------- | ------------------------ | -------- | -------- |
| id             | Bundle id                | Guid     | yes      |
| subscriptionId | Customer subscription id | Guid     | no       |

#### Response model

204 - No Content.

### Handover a bundle to shop

After the bundle was created successfully (provisioning state), you can hand it over to the shop. This means the shop is responsible for the billing of the customer as well as bundle durations. The customer can also manage bundles by himself.

> POST `https://api.tapio.one/management/bundles​/{bundleId}​/handovertoshop`

| Property | Description | Datatype | Required |
| -------- | ----------- | -------- | -------- |
| bundleId | Bundle id   | Guid     | yes      |

**Request body**

```jsonc
{
  "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Subscription of the bundle owner (required).
  "period": "string", // Period of the bundle which have to match with the supportedPeriods of the bundle definition (ISO 8601 repeating intervals) (required).
  "voucherCode": "string", // Voucher code (optional).
  "numberOfPeriodsPaid": 0 // Number of paid periods (optional). If the customer already paid for a certain amount of periods through your offer, you have to make sure that the shop does not charge the customer too soon.
}
```

> The system do not allow `voucherCode` and `numberOfPeriodsPaid` to be set at the same time. You can only use one of this two options.
> You as a partner can have you own `voucherCode` to get a specified discount for your bundle. This voucher code has to be setup in the shop. Therfore you have contact tapio [developer@tapio.one](mailto:developer@tapio.one).
> You can use the `numberOfPeriodsPaid` to construct something like 3 times 1 year of bundle `Edgeband Management Set 'Classic'`. The free times for the customer, are paid by the partner.

#### Response model

202 - Accepted.
400 - Bad Request.
401 - Unauthorized.
404 - Bad request. Body contains the information.
409 - Conflict e.g. a concurrent operation on this bundle or bundle alredy exists in shop.

After the handover was successfully called, you have to query the bundle by calling the [Get bundle information](#get-bundle-information) route to check the provisioning state. The state update can take up to 1 minute. In case the state is `Failed` you have to contact the tapio support [developer@tapio.one](mailto:developer@tapio.one). If the provisioning state is `Succeeded` the handover was successful.

### Cancel a bundle in shop

Shop-managed bundles can be canceled. Calling this route will suspend the given bundle in the shop. This means the customer can not longer use this bundle. The customer will be notified of this bundle cancel by the shop.

> DELETE `https://api.tapio.one/management/bundles​/{id}/inshop?subscriptionId=<subscriptionId>`

| Property       | Description              | Datatype | Required |
| -------------- | ------------------------ | -------- | -------- |
| id             | bundle id                | Guid     | yes      |
| subscriptionId | customer subscription id | Guid     | yes      |

> The canceled bundle will be available as pause bundle for a grace-period. After the grace-period, it will be delteted in the system.

#### Response model

202 - No Content.

### Get the shop expiry date of a bundle

Only works for shop-managed bundles. Gets the current shop expiry date of the bundle. After this period, the bundle will automatically renew. The customer can cancel it in the shop if the bundle is no longer required.

> GET `https://api.tapio.one/management/bundles​/{bundleId}/shopExpiryDate`

| Property       | Description              | Datatype | Required |
| -------------- | ------------------------ | -------- | -------- |
| id             | bundle id                | Guid     | yes      |
| subscriptionId | customer subscription id | Guid     | yes      |

#### Response model

```jsonc
{
    "expiryDate": "2021-10-26T00:00:00.000Z" // Expiry date as ISO 8601.
}
```

200 - OK.

### Set the shop expiry date of a bundle

Only works for shop-managed bundles. Sets the shop expiry date of the bundle.

> POST `https://api.tapio.one/management/bundles​/{bundleId}/shopExpiryDate`

| Property | Description | Datatype | Required |
| -------- | ----------- | -------- | -------- |
| id       | bundle id   | Guid     | yes      |

```jsonc
{
  "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Subscription id of the bundle owner. (required)
  "expiryDate": "2021-10-26T06:49:57.976Z" // Expiry date (relative to Coordinated Universal Time (UTC)). Must be at least 24h in the future(ISO 8601) (required). The system will just adapt the date and will ignore the concrete time. 
}
```

#### Response model

200 - OK.

## Accept terms of use for a specific application

After creating a license for an application, the next step is to accept the terms of use of an application on behalf of the customer. Afterwards, it is possible to assign a machine to an application.

> PUT `https://api.tapio.one/management/manufacturer/customerSubscriptions/{subscriptionId}/applications/{applicationId}/termsofuse`

| Property       | Description              | Datatype | Required |
| -------------- | ------------------------ | -------- | -------- |
| subscriptionId | customer subscription id | Guid     | yes      |
| applicationId  | application id           | Guid     | yes      |

**Request body**

```jsonc
{
  "versionNumber": "1.0.0", // Semantic versioning. Version number needs to exist (optional).
  "contractNumber": "4711", // Your contract number (required).
  "acceptedLanguage": "de"  // Two letter language (optional).
}
```

### Response

201 - Created. If terms of use are accepted the first time for this application.

200 - Ok. If terms of use were already accepted.

## Assign a machine to an application

After accepting the terms of use of an application, the last step is to assign the machine to the application in the customer's subscription. Afterwards, the customer is able to use it.

**Important! In this step the client needs to act as the manufacturer of the machine!**

> PUT `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/applicationassignment`

**Request body**

```jsonc
{
    "customerSubscriptionId": "aafb748b-e7ad-4b56-a45c-79a52bf4023d", // Id of the customer subscription (required).
    "applicationId": "aafb1932-e7ad-4b56-a45c-79a52bf4023d" // Application to which the machine is assigned (required).
}
```

For a successful assignment, the machine must already exist in the customer subscription. For instructions how to onboard a machine, refer to [Machine Onboarding Workflow](./machine-onboarding-workflow).

### Response

201 - Created. If machine is assigned to application first time.

200 - Ok. If machine is already assigned.

404 - Not found. The application assignment could not be created because there exists no free license for the specified applicationId in the specified customer subscription. Make sure that you have created a license for the machine (see [Create a License](#create-a-license)) and that the machine is onboarded in the customer subscription (see [Machine Onboarding Workflow](./machine-onboarding-workflow)).

## Unassign a machine from an application

At least there is a route to unassign the machine from an application in the customer's subscription.

> DELETE `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/applicationassignment`

| Property               | Location | Description                                          | Datatype | Required |
| ---------------------- | -------- | ---------------------------------------------------- | -------- | -------- |
| TapioMachineId         | Route    | The id of the machine in tapio ecosystem             | string   | Yes      |
| applicationId          | Query    | application from which the machine should unassigned | Guid     | Yes      |
| customerSubscriptionId | Query    | id of the customer subscription                      | Guid     | Yes      |

For a successful unassignment, the machine must be assigned to the application.

### Response

204 - Deleted. Machine was successful unassigned from the application.

404 - NotFound. Machine is already unassigned.

