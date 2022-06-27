# General machine onboarding workflow 

This is the workflow, which describes, how manufacturers can create machine in tapio ecosystem, configure it and onboard the machine on behalf of customer.

## Manufacturer Machine Creation

The entry point of the workflow is the creation of the machine in the manufacturer subscription. The machine will be registered in tapio ecosystem and a tapioMachineId will be generated.

> POST `https://api.tapio.one/management/manufacturer/machines`

**Request body**

``` json
{
  "displayName": "Test Machine", // Display name of the machine
  "serialNumber": "1122334455667788", // Serial number of the machine
  "deviceType": "Machine", // Enum (default 'Machine'). 'Machine' - means classic machine. 'SmartDevice' - smart devices like Raspberry
  "deviceSubType": "sub type", // Device sub type, which can be provided as additional classification of the machine
  "tmidPostfix":"1122334455667788" // The postfix which will be used to generate tapioMachineId(manufacturerId + tmidPostfix)
}
```

### Response model

``` json
{
  "tmid":"tdmtest1122334455667788"
}
```

### Response Model Description

As a response to this query, you will receive the tapioMachineId, which is the unique identifier of the machine in tapio ecosystem.

## Create CloudConnector

In this step we create a cloud connector in the tapio ecosystem and configure it with the tapioMachineId from the previous step.

> POST `https://api.tapio.one/management/manufacturer/connectors`

**Request body**

``` json
{
  "displayName": "Test Machine", // Display name of the cloud connector
  "tmids": [ "1122334455667788" ], // Serial number of the associated machines. Usually a cloud connector serves just a single machine.
  "publicClientCertificate": "<your certificate here, which will expire in 50 years>", // Public key of the client certificate, which will be used to secure communication between cloud connector and cloud. In case that this property is not specified, the certificate will be generated automatically. The client certificate should expire in 50 years.
}
```

### Response model

``` json
{
  "ccid":"Nob9tAIG6z6QnS4-GeF_KVPS3j-eGQnMKA9A8b4KA0Jvb5WtAlE6-T2eA2hk5MkEBj1_pB9GJANdCgO261bZZw"
}
```

### Response Model Description

As a response to this query, you will retrieve the cloud connector unique identifier.

## Get CloudConnector Configuration

In this step we have to download the cloud connector configuration file in xml format. This file has to be uploaded to the device where cloud connector is installed. **Important! The configuration file will be available only for 1h (one hour), then it will be automatically deleted!**.

> GET `https://api.tapio.one/management/manufacturer/connectors/{cloudConnectorId}/configuration`

| Property         | Description                                                    | Datatype |
| ---------------- | -------------------------------------------------------------- | -------- |
| cloudConnectorId | The Id of cloud connector, which we receive from previous step | string   |

### Response Model Description

As a response to this query, you will retrieve the cloud connector configuration file. For more information, see [documentation of cloud connector configuration](./cloud-connector/configuration).

## Create Metadata for Application

Next, we can upload some metadata for the machine, which will be used by the application. For instance the MachineBoard application requires display template metadata, which describes rules of how the data should be represented.

We can provide global metadata, which will be used by all applications or we can provide metadata for specific application.

If we want to create global metadata, we have to use this route:

> POST `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/metadata/global/keys/{key}`

| Property       | Description                                | Datatype |
| -------------- | ------------------------------------------ | -------- |
| tapioMachineId | The id of machine in tapio ecosystem       | string   |
| key            | The key of metadata e.g. "displaytemplate" | string   |

| Header       | Description                                                 |
| ------------ | ----------------------------------------------------------- | ------ |
| Content-Type | "application/json", other MIME types are not supported yet. | string |

**Request body**

``` json
{
    // Display template
}
```

If we want to create metadata for a specific application, we have to use the route below.

> Note that you need to know the application id, which is provided to you by tapio if you're an application developer. See also: [register a tapio application](../general/register-tapio-application)
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

``` json
{
    // Display template
}
```

## On-boarding of the Machine on behalf of Customer

Then we can onboard machine for a customer. To do that we have to use the route:

> PUT `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/onboarding`

| Property       | Description                              | Datatype |
| -------------- | ---------------------------------------- | -------- |
| tapioMachineId | The id of the machine in tapio ecosystem | string   |

**Request body**

``` json
{
  "customerSubscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Id of customer subscription
  "machineName": "string" // This is the name, which the customer will see
}
```

### Response

201 - Created. If machine is onboarded first time.

200 - Ok. If machine is already onboarded.

> If you're a manufacturer and your customers have already onboarded machines in tapio, you can infer the customer subscription ids using the [reporting route](./reporting-workflow)

## Rename a Machine on behalf of the customer

It is also possible to change the name of the onboarded machine in the customer subscription retroactively. To do that we have to use the route:

> PUT `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/renaming`

| Property       | Description                              | Datatype |
| -------------- | ---------------------------------------- | -------- |
| tapioMachineId | The id of the machine in the tapio ecosystem | string   |

**Request body**

``` json
{
  "customerSubscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Id of customer subscription
  "displayName": "string" // The new name of the machine in the customer subscription
}
```

### Response

204 - No content. Renaming was successful.

## Off-boarding of the Machine on behalf of Customer

Then we can offboard machine for a customer. To do that we have to use the route:

**Important! This is only possible if the machine is not assigne to any application!**

> DELETE `https://api.tapio.one/management/manufacturer/machines/{tapioMachineId}/onboarding`

| Property               | Description                                          | Datatype |
| ---------------------- | ---------------------------------------------------- | -------- |
| tapioMachineId         | The id of the machine in tapio ecosystem  (required) | string   |
| customerSubscriptionId | The customer subscription id (required)              | Guid     |

### Response

204 - Deleted - Machine is offboarded.

404 - NotFound. Machine is already offboarded.

