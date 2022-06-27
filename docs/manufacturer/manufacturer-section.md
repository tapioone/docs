# Manufacturer Routes

This is the section of api which is used by manufacturers. It contains routes which allow a manufacturer to manage their machines and customers in the tapio ecosystem.

## Find Customer by your customer number

By calling the route you can search a customer by your customer number.

> GET `https://api.tapio.one/manufacturer/customerSubscriptions?customerNumber=4711`

The following properties can be set via query parameter.

| Property       | Required | Description          | Datatype |
| -------------- | -------- | -------------------- | -------- |
| customerNumber | yes      | Your customer number | string   |

### Response model

```json
[
  {
    "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Max-Mustermann GmbH"
  }
]
```

## Create new Customer

By calling the route you can create a new customer in tapio ecosystem.

> POST `https://api.tapio.one/manufacturer/customerSubscriptions`

**Request body**

```json
{
  "adminUsereMail": "john@Doe.net", // Email of the customer admin
  "adminUserTitle": "Mr", // Salutation of the customer (Mr, Mrs, Company) (optional)
  "adminUserFirstName": "John",
  "adminUserLastName": "Doe",
  "companyName": "Digital wood works GmbH", // Display name of the customers company name
  "companyStreet": "Mainroad 1",
  "companyTown": "Nagold",
  "companyZipCode": "72202",
  "companyCountry": "DE",
  "companyVat": "DE 318235124", // VAT number of the customer.
  "localeId": "de-de",  
  "telVoice": "0020 001221312312", // Telephone number has to start with 00xx.
  "applicationSettings": {          
    "timeZone": "Central America Standard Time" // Has to be timezone of windows standard (optional).
  },
  "customerNumber" : "4711" // Customer number.
}
```

> `timeZone` expected [as windows standard](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones).

### Response model

```json
{
  "subscriptionId": "f6874d67-c827-4be3-9c6b-c9ebfaa037db"
}
```

## Get the application settings of a customer

> GET `https://api.tapio.one/manufacturer/customerSubscriptions/{customerSubscriptionId}/applicationSettings`

| Parameter              | Description                        | Datatype     | Mandatory |
| ---------------------- | ---------------------------------- | ------------ | --------- |
| customerSubscriptionId | The Id of a customer subscription. | string(Guid) | Yes       |

### Response Model Description

| Property             | Description                                                                                                                                                       | Datatype                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| subscriptionId       | The Id of the subscription.                                                                                                                                       | string(Guid)                                                    |
| countryId            | The country a customer specified for his company during registration as 2-letter code according [ISO 3611-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)    | string                                                          |
| internationalization | Internationalization object.                                                                                                                                      | [Internationalization](#internationalization-model-description) |
| logo                 | Logo object contains information about the uploaded company logo as png format. In case the customer has not specified a logo you will get null for this property | [Logo](#logo-model-description)                                 |

#### Internationalization Model Description

| Property      | Description                                                                                                                                                                                                                                                                                                                 | Datatype |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| locale        | Locale information according [culture information name of .NET](https://docs.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo?view=net-5.0), e.g. "de-DE", "en-US" more information, like the. This represents the locale specific settings for e.g. system emails, calendar format, number format and more. | string   |
| timeZone      | Name of the time zone where the customer is located [(as windows standard)](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones).                                                                                                                                                      | string   |
| currency      | Currency id based on [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217).                                                                                                                                                                                                                                                    | string   |
| systemOfUnits | System of units. Possible values: `metric` and `imperial`.                                                                                                                                                                                                                                                                  | string   |
| paperFormat   | Format of the paper. Possible values: `A4` and `Letter`.                                                                                                                                                                                                                                                                    | string   |

#### Logo Model Description

- The URL path will change when the customer changes their logo
- Be aware that the URLs **expire**. They are valid for a minimum of two weeks. New urls will be returned at least two weeks before the previous ones expire.

| Property  | Description                                                     | Datatype |
| --------- | --------------------------------------------------------------- | -------- |
| uri       | Uri to the company logo with original size.                     | string   |
| thumbnail | Uri to the company logo as thumbnail with the size 64x64 pixel. | string   |

### Response body example

An example JSON response will then look something like this:

``` json
{
    "subscriptionId": "b11fb489-6814-43b4-9803-b152812f441d",
    "countryId": "DE",
    "internationalization": {
        "locale": "de-DE",
        "timeZone": "W. Europe Standard Time",
        "currency": "EUR",
        "systemOfUnits": "Metric",
        "paperFormat": "A4"
    },
    "logo": {
        "uri": "https://sacusprodwe01.blob.core.windows.net/customerlogos/b11fb489-6814-43b4-9803-b152812f441d%2F1ef6cb32-379e-442f-8dc4-874bcc6de967?sv=2020-04-08&st=2021-02-28T00%3A00%3A00Z&se=2021-04-03T00%3A00%3A00Z&sr=b&sp=r&sig=Xs%2Fx%2FmNLEvsSDpc2r6NN0HCxEDfLUTnA0RakbPlepH8%3D",
        "thumbnail": "https://sacusprodwe01.blob.core.windows.net/customerlogos/b11fb489-6814-43b4-9803-b152812f441d%2F1ef6cb32-379e-442f-8dc4-874bcc6de967_thumbnail?sv=2020-04-08&st=2021-02-28T00%3A00%3A00Z&se=2021-04-03T00%3A00%3A00Z&sr=b&sp=r&sig=dBpjFoP1Kt%2F5PYBnOx%2Fok1VUD02h8yxdGa7a5tTvEKY%3D"
    }
}
```

> If a customer has not set any information, default values will be provided depending on the country specified during registration.

### Response HTTP status codes

| Status Code | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| 200         | The request has succeeded (OK).                                                  |
| 400         | The server could not understand the request due to invalid syntax (Bad Request). |
| 403         | The client is not allowed to access the application settings. (Forbidden).       |
| 404         | The customer was not found (Not Found).                                          |

## Send an email to a customer

> POST `https://api.tapio.one/manufacturer/customerSubscriptions/{customerSubscriptionId}/sendMail`

| Parameter              | Description                        | Datatype     | Mandatory |
| ---------------------- | ---------------------------------- | ------------ | --------- |
| customerSubscriptionId | The Id of a customer subscription. | string(Guid) | Yes       |

The email will be sent to the configured contact person of the customer subscription, not to the admin users of the subscription.

### Request body description

| Property | Description                                                                                                                                                                                                                                                                                                                 | Datatype |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| content  | HTML content of the email. Will be injected between the salutation and the service remark of the email.                                                                                                                                                                                                                     | string   |
| subject  | Email subject, will be prefixed with a message which indicates that this is a message from a manufacturer and not directly from tapio.                                                                                                                                                                                      | string   |
| locale   | Locale information according [culture information name of .NET](https://docs.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo?view=net-5.0), e.g. "de-DE", "en-US" more information, like the. This represents the locale specific settings for e.g. system emails, calendar format, number format and more. | string   |

### Request body example

```json
{
  "content": "The <b>new</b> application is awesome! Check it out!.",
  "subject": "There is a new application ready for you to use!",
  "locale": "en-US"
}
```

### Response HTTP status codes

| Status Code | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| 202         | The request has been accepted (OK).                                              |
| 400         | The server could not understand the request due to invalid syntax (Bad Request). |
| 403         | The client is not allowed to send an email to a customer. (Forbidden).           |

## Create Manufacturer Machine

The machine will be created in tapio ecosystem and tapioMachineId will be generated.

> POST `https://api.tapio.one/management/manufacturer/machines`

**Request body**

```json
{
  "displayName": "Test Machine", // Display name of the machine
  "serialNumber": "1122334455667788", // Serial number of the machine
  "deviceType": "Machine", // Enum (default 'Machine'). 'Machine' - means classic machine. 'SmartDevice' - smart devices like Raspberry
  "deviceSubType": "sub type", // Device sub type, which can be provided as additional classification of the machine (optional).
  "tmidPostfix":"1122334455667788", // The postfix which will be used to generate tapioMachineId(manufacturerId + tmidPostfix)
  "isTapioReady": true // Flag to indicate if the manufacturer machine is tapio-ready. `true` by default.
}
```

> We recommend a list of device subtypes which should be used for machines with `deviceType` set to `Machine`. You can also set them through `My tapio`. Available subtypes: `Unknown`, `Edge`, `Saw`, `Cnc`, `Sanding`, `Drilling`, `Assembly`, `Storing`, `Stock`, `Shipping`, `PreAssembly`, `Lamination`, `Moulding`, `Packaging`, `Handling`, `LineControl`. `deviceSubType` is still a nullable string.

### Response model

```json
{
  "tmid":"tdmtest1122334455667788"
}
```

### Response HTTP status codes

| Status Code | Description  |
| ----------- | ------------ |
| 201         | Created      |
| 400         | Bad Request  |
| 401         | Unauthorized |
| 403         | Forbidden    |
| 409         | Conflict     |

## Get Manufacturer Machine

> GET `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}`

| Property       | Description                          | Datatype |
| -------------- | ------------------------------------ | -------- |
| tapioMachineId | The Id of machine in tapio ecosystem | string   |

### Response model

```json
{
  "tmid": "tdmtest1122334455667788", // tapioMachineId
  "displayName": "Test Machine", // Display name of the machine
  "serialNumber": "1122334455667788", // Serial number of the machine
  "createdAt": "2020-05-12T11:59:23.4605816+00:00", // Created timestamp
  "deviceType": "Machine",
  "deviceSubType": "sub type",
  "isMassDevice": false, // In case that 'deviceType' is 'SmartDevice', then the property is true
  "cc": [
    {
      "ccid": "Nob9tAIG6z6QnS4-GeF_KVPS3j-eGQnMKA9A8b4KA0Jvb5WtAlE6-T2eA2hk5MkEBj1_pB9GJANdCgO261bZZw",
      "displayName": "CloudConnector"
    }
  ], // The list of cloud connectors, which serve this machine
  "isTapioReady": true // Flag to indicate if the manufacturer machine is tapio-ready. `true` by default.
}
```

## Delete Manufacturer Machine

**Important! The machine can be deleted only if it is not onboarded yet!**

> DELETE `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}`

| Property       | Description                          | Datatype |
| -------------- | ------------------------------------ | -------- |
| tapioMachineId | The Id of machine in tapio ecosystem | string   |

## Update Manufacturer Machine

To update machine, this route can be used. It uses JsonPatch approach, which allows to update machine properties partially. For more information please follow this [link](https://docs.microsoft.com/en-us/aspnet/core/web-api/jsonpatch?view=aspnetcore-3.1#path-syntax).

> PATCH `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}`

| Property       | Description                          | Datatype |
| -------------- | ------------------------------------ | -------- |
| tapioMachineId | The Id of machine in tapio ecosystem | string   |

**Request body**

```json
[
  {
    "value": "New DisplayName",
    "path": "/displayName", // The path to the property of json object. Only following properties can be updated: '/displayName', '/deviceType', '/deviceSubType', '/isTapioReady'
    "op": "replace" // The operation name. The following operations can be chosen: 'add', 'remove', 'replace'
  }
]
```

## Check if a machine can be assigned to an application

To check if you can assign a machine to an application. A distinction is made between limited and connected machines.

For connected machines you have to check if the capabilities array contains  `MachineAssignable`. For limited machines you have to check if the array contains the capability `LimitedMachineAssignable`. 

> GET `https://api.tapio.one/management/manufacturer/applications/{applicationId}`

| Property      | Description               | Datatype     |
| ------------- | ------------------------- | ------------ |
| applicationId | The Id of the application | string(Guid) |

### Response model

200 - Ok.

```json
{
  "capabilities": [
    "MachineAssignable",
    "LimitedMachineAssignable"
  ]
}
```

> In case the application has no capability this array will be empty.

## Manufacturer Machine Onboarding

To onboard a machine for a customer we have to use this route:

> PUT `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/onboarding`

| Property       | Description                              | Datatype |
| -------------- | ---------------------------------------- | -------- |
| tapioMachineId | The Id of the machine in tapio ecosystem | string   |

**Request body**

```json
{
  "customerSubscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Id of customer subscription
  "machineName": "string" // This is the name, which customer will see
}
```

### Response

201 - Created. If machine is onboarded first time.

200 - Ok. If machine is already onboarded.

409 - Conflict. If the manufacturer machine is blocked.

## Rename a Machine in a Customer Subscription

To change the machines display name for the customer use

> PUT `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/renaming`

| Property       | Description                                  | Datatype |
| -------------- | -------------------------------------------- | -------- |
| tapioMachineId | The id of the machine in the tapio ecosystem | string   |

**Request body**

```json
{
  "customerSubscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Id of customer subscription
  "displayName": "string" // The new name of the machine in the customer subscription
}
```

### Response

204 - No Content

## Create CloudConnector

> POST `https://api.tapio.one/management/manufacturer/connectors`

**Request body**

```json
{
  "displayName": "Test Machine", // Display name of the cloud connector
  "tmids": ["1122334455667788"], //  Serial number of the associated machines. Usually a cloud connector serves just a single machine.
  "publicClientCertificate": "<your certificate here, which will expire in 50 years>", // Public key of the client certificate, which will be used to secure communication between cloud connector and cloud. In case that this property is not specified, the certificate will be generated automatically. The client certificate should expire in 50 years (optional).
}
```

### Response model

CloudConnectorId

```json
{
  "ccid":"Nob9tAIG6z6QnS4-GeF_KVPS3j-eGQnMKA9A8b4KA0Jvb5WtAlE6-T2eA2hk5MkEBj1_pB9GJANdCgO261bZZw"
}
```

## Get CloudConnector Configuration

**Important! The configuration file will be available only 1h (one hour) after creation of cloud connector, then it will be automatically deleted!**.

> GET `https://api.tapio.one/management/manufacturer/connectors/{cloudConnectorId}/configuration`

| Property         | Description                                                    | Datatype |
| ---------------- | -------------------------------------------------------------- | -------- |
| cloudConnectorId | The Id of cloud connector, which we receive from previous step | string   |

### Response Model Description

As a response to this query, you will retrieve cloud connector configuration file. For more information please follow this [link](./cloud-connector/configuration).

## Get CloudConnector by Id

> GET `https://api.tapio.one/management/manufacturer/connectors/{cloudConnectorId}`

| Property         | Description                                                    | Datatype |
| ---------------- | -------------------------------------------------------------- | -------- |
| cloudConnectorId | The Id of cloud connector, which we receive from previous step | string   |

### Response model

```json
{
  "cloudConnectorId": "Nob9tAIG6z6QnS4-GeF_KVPS3j-eGQnMKA9A8b4KA0Jvb5WtAlE6-T2eA2hk5MkEBj1_pB9GJANdCgO261bZZw",
  "displayName": "CloudConnector",
  "manufacturerSubscriptionId": "cbadb5b3-2b4c-47ec-96de-b2a1126f186a",
  "createdDate": "2020-05-12T12:35:10.5247486+00:00",
  "tmids": [
    "tdmtest1122334455667788"
  ] // The list of machines, which cloud connector serves
}
```

## Update CloudConnector

To update machine, this route can be used. It uses JsonPatch approach, which allows to update machine properties partially. For more information please follow this [link](https://docs.microsoft.com/en-us/aspnet/core/web-api/jsonpatch?view=aspnetcore-3.1#path-syntax).

> PATCH `https://api.tapio.one/management/manufacturer/connectors/{cloudConnectorId}`

| Property         | Description                                                    | Datatype |
| ---------------- | -------------------------------------------------------------- | -------- |
| cloudConnectorId | The Id of cloud connector, which we receive from previous step | string   |

**Request body**

```json
[
  {
    "value": "tdmtest112233445566778822",
    "path": "/tmids/-", // Adds tapioMachineId to the end of the array. Only following properties can be updated: '/displayName', '/tmids'
    "op": "add" // The operation name. The following operations can be chosen: 'add', 'remove', 'replace'
  }
]
```

## Create Metadata for Application

Updates or creates metadata for a specific manufacturer machine and all applications:

> POST `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/global/keys/{key}`

| Property       | Description                                | Datatype |
| -------------- | ------------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem       | string   |
| key            | The key of metadata e.g. "displaytemplate" | string   |

| Header       | Description                                                 |
| ------------ | ----------------------------------------------------------- | ------ |
| Content-Type | "application/json", other MIME types are not supported yet. | string |

**Request body**

```json
{
    // Display template
}
```

Updates or creates metadata for a specific manufacturer machine and specific application:

> POST `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/{applicationId}/keys/{key}`

| Property       | Description                                | Datatype |
| -------------- | ------------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem       | string   |
| key            | The key of metadata e.g. "displaytemplate" | string   |
| applicationId  | The id of the application                  | string   |

| Header       | Description                                                 |
| ------------ | ----------------------------------------------------------- | ------ |
| Content-Type | "application/json", other MIME types are not supported yet. | string |

**Request body**

```json
{
    // Display template
}
```

## Get Metadata for Application

Retrieving metadata for a specific manufacturer machine and all applications:

> GET `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/global/keys/{key}`

| Property       | Description                                | Datatype |
| -------------- | ------------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem       | string   |
| key            | The key of metadata e.g. "displaytemplate" | string   |

### Response model

```json
{
    // Display template
}
```

Retrieving metadata for a specific manufacturer machine and application:

> GET `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/{applicationId}/keys/{key}`

| Property       | Description                                | Datatype |
| -------------- | ------------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem       | string   |
| key            | The key of metadata e.g. "displaytemplate" | string   |
| applicationId  | The id of the application                  | string   |

### Response model

```json
{
    // Display template
}
```

## Get Keys of the MetaData

Retrieving global metadata keys for specific machine:

> GET `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/global/keys`

| Property       | Description                          | Datatype |
| -------------- | ------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem | string   |
| limit          | The Maximum number of items returned | int      |
| offset         | Offset for paging                    | int      |

### Response model

```json
{
  "totalCount": 1,
  "results": [
    {
      "key": "displaytemplate"
    }
  ]
}
```

Retrieving metadata keys for specific machine and application:

> GET `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/{applicationId}/keys`

| Property       | Description                          | Datatype |
| -------------- | ------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem | string   |
| applicationId  | The id of the application            | string   |
| limit          | The Maximum number of items returned | int      |
| offset         | Offset for paging                    | int      |

### Response model

```json
{
  "totalCount": 1,
  "results": [
    {
      "key": "displaytemplate"
    }
  ]
}
```

