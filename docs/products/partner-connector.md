# Partner Connector

## Table of Contents

- [Introduction](#introduction)
- [Glossary](#glossary)
- [Core architecture](#core-architecture)
  - [Technologies](#technologies)
  - [Architecture Diagram](#architecture-diagram)
  - [Primary message requirements](#primary-message-requirements)
  - [The integration system](#the-integration-system)
- [Data](#data)
  - [CloudEvents Data Format](#cloudevents-data-format)
- [Messaging Channels](#messaging-channels)
  - [Partner-To-Connector Channel](#partner-to-connector-channel)
    - [Cloud Event Message Headers](#cloud-event-message-headers)
    - [Message Body](#message-body)
      - [Create ServiceCase](#create-servicecase)
      - [CreateOrReplace](#createorreplace)
      - [Read](#read)
      - [Delete](#delete)
      - [Add attachment to the ServiceCase](#add-attachment-to-the-servicecase)
      - [Add comment to the ServiceCase](#add-comment-to-the-servicecase)
      - [How "ServiceCase" is resolved for operations](#how-servicecase-is-resolved-for-operations)
      - [How "Customer's subscription" is resolved for operations](#how-customers-subscription-is-resolved-for-operations)
  - [Connector-to-Partner Channel](#connector-to-partner-channel)
    - [Cloud Event Message Headers](#cloud-event-message-headers-1)
    - [Message Body](#message-body-1)
    - [Error Handling](#error-handling)

## Introduction

The purpose of this document is to outline the architecture and functionality of the "ServiceBoard PartnerConnector Service". This document is intended for potential and existing partners.

The PartnerConnector Service, provided by ServiceBoard, enables partners to integrate their own CRM or ticketing systems with the tapio ServiceBoard application. This integration allows partner employees to continue using their existing systems while providing seamless customer support through the tapio ServiceBoard interface.

## Glossary

- _Service Partner_ or _Partner_: The partner which provides service to the customer. Can have their own support system, e.g. a CRM. A Service Partner has a dedicated subscription in My tapio and can be selected by a customer when creating service cases.
- _external customer Id_: Uniquely identifies the customer within the partner system.
- _external entity Id_: Uniquely idenfities the entity within the partner system.
- _Connector_ or _Partner Connector_ is the component of the ServiceBoard which allows integration of the partner CRM.
- _Subscription_ is a customer account in tapio, containing one or many licenses for the ServiceBoard.
- _subscriptionId_ is a string identifying a _Subscription_ uniquely
- _Tapio Machine Id (tmid)_ Uniquely identifies a machine within the tapio ecosystem

## Core architecture

## Technologies

- Communication is facilitated through message-based interactions using [Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview). This service supports multiple client libraries and REST APIs for seamless integration.
- Each partner gets two dedicated [Service Bus Topics](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions):
  - `ConnectorToPartner` for messages from the ServiceBoard to the partner system.
  - `PartnerToConnector` for messages from the partner system to the ServiceBoard.
- Binary data (attachments) are stored in [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction) and referenced in corresponding Service Bus messages.
- Referential integrity of partner data is not validated by ServiceBoard.

## Architecture Diagram

```plantuml
@startuml azure-architecture
!define AzurePuml https://raw.githubusercontent.com/plantuml-stdlib/Azure-PlantUML/master/dist

!includeurl AzurePuml/AzureCommon.puml
!includeurl AzurePuml/Compute/AzureFunction.puml
!includeurl AzurePuml/Compute/AzureAppService.puml
!includeurl AzurePuml/Integration/AzureServiceBusTopic.puml
!includeurl AzurePuml/Integration/AzureServiceBus.puml
!includeurl AzurePuml/Storage/AzureBlobStorage.puml
!includeurl AzurePuml/Web/AzureWebApp.puml
!includeurl AzurePuml/Databases/AzureCosmosDb.puml

title Azure Infrastructure Overview

package "AzureServiceBus" as AzureServiceBus {
AzureServiceBusTopic(sbservicebusC2P, "ConnectorToPartner", "sbservicepartner", "connetortopartner")
AzureServiceBusTopic(sbservicebusP2C, "PartnerToConnector", "sbservicepartner", "partnertoconnector")
}

package "PartnerConnector" as pc {
    AzureFunction(faconnectortopartner, "ConnectorToPartner", "faconnectortopartner")
    AzureFunction(fapartnertoconnector, "PartnerToConnector", "fapartnertoconnector")
}

package "ServiceBoardCore" as core {
    AzureServiceBusTopic(internalChannel, "InternalEventsChannel", "coevents", "coevents")
    AzureCosmosDb(cosdb, "ServiceCases", "cosdb")
}

fapartnertoconnector <-up- sbservicebusP2C
faconnectortopartner -up-> sbservicebusC2P

fapartnertoconnector --> sbservicebusC2P : read-request responses & exception messages

fapartnertoconnector --> cosdb
internalChannel --> faconnectortopartner : trigger

@enduml
```

## Primary message requirements

**Who is the customer?**

The customer is a person or organization which acquired a tapio ServiceBoard subscription in order to obtain support for machines and production problems.

**Who is the Service Partner?**

The service partner is a person or organization which concluded a service contract with the customer and aims to provide support for machines and production problems.

**What is the message about?**

An complete message specification is given in [Partner-To-Connector Channel](#partner-to-connector-channel) and [Connector-to-Partner Channel](#connector-to-partner-channel). All messages in the system are about operations on data. The partner can trigger CRUD-operations by sending messages via the [Partner-To-Connector Channel](#partner-to-connector-channel) and receives messages about changing data via the [Connector-to-Partner Channel](#connector-to-partner-channel).

## The integration system

We provide a staging system for integrating partner systems without affecting production data.

# Data

This section provides an overview over the data, which can be transferred via the channels.

## CloudEvents Data Format

We use the CloudEvents data format to send messages over Azure Service Bus. This ensures that the messages are structured and standardized for seamless integration and processing. Customers must use this standard to be able to send commands to channels. The messages should correspond to the specified format, which includes necessary headers and a JSON body as described in the sections below. This format allows for efficient communication and data exchange between the partner systems and the ServiceBoard. For more details, refer to the [CloudEvents specification](https://cloudevents.io/).

## Messaging Channels

## Partner-To-Connector Channel

The partner-to-connector channel is a Azure service bus topic dedicated to send messages to the ServiceBoard. The partner is provided with credentials to post messages. The channel supports CRUD-operations for the data.

### Cloud Event Message Headers

The partner sends messages and data to the ServiceBoard via service bus messages ("brokered messages"). This section describes the mandatory and optional message headers that the partner needs to provide.

| Key         | Mandatory | Allowed Values                                          | Short Explanation                                                                                                                                                                                                                   |
| ----------- | --------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| specversion | Always    | "1.0"                                                   | The specific version of cloud events which are supported by tapio                                                                                                                                                                   |
| id          | Always    | GUID                                                    | The unique identifier for the cloud event.                                                                                                                                                                                          |
| type        | Always    | "Create", "Read", "CreateOrReplace", "Delete"           | The operation type header property indicates what kind of activity has happened.<br/>Please note that "CreateOrReplace" is used when an entity should be updated.                                                                   |
| subject     | Always    | "ServiceCase", "ServiceCaseComment", "CustomerDocument" | The type of entity on which the operation is performed. Possible values are "ServiceCase" for service cases, "ServiceCaseComment" for comments on service cases, and "CustomerDocument" for adding attachments to the service case. |
| source      | Always    | URL                                                     | If this message is an answer to a request from the Partner-to-Connector channel, this field includes the provided sourceId to map answers to the corresponding requests.                                                            |

### Message Body

#### Create ServiceCase

**Request**

```json
{
  "specversion": "1.0",
  "id": "8a072bae-58da-4b89-aa0d-47602e582c93",
  "type": "Create",
  "subject": "ServiceCase",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "subscriptionid": "00000000-0000-0000-0000-000000000003",
    "casenumber": "yourCaseNumber",
    "externalEntityId": "externalServiceCase1",
    "externalCustomerId": null,
    "tmid": "yourTapioMachineId",
    "customercontactid": "test-customer-user@tapiotest.onmicrosoft.com",
    "servicecontactname": null,
    "title": "Strange noise",
    "problem": "Machine produces strange noise on startup.",
    "solution": null,
    "state": 0,
    "stoppage": false,
    "customercontactphone": "+491763334333",
    "customercontactname": "Test-Customer-User"
  }
}
```

For creating new entities you can either provide an **externalCustomerId**, a **subscriptionId** or a **tmid** to associate the freshly created entity with the correct tapio subscription.
Adding a tapio machine id (tmid) is recommended. If a customer cannot be identified, data will be discarded to protect data privacy.

| Parameter Name       | Explanation                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| subscriptionid       | Identifier for the subscription associated with the service case.                      |
| casenumber           | The case number assigned by the partner system.                                        |
| externalEntityId     | Unique identifier for the service case in the partner system.                          |
| externalCustomerId   | Unique identifier for the customer in the partner system (if available).               |
| tmid                 | Unique identifier for the machine within the tapio ecosystem.                          |
| customercontactid    | Email address of the customer contact.                                                 |
| servicecontactname   | Name of the service contact (if available).                                            |
| title                | Title of the service case.                                                             |
| problem              | Description of the problem reported in the service case.                               |
| solution             | Solution provided for the service case (if available).                                 |
| state                | Current state of the service case (e.g., 0 for open, 1 for in progress, 2 for closed). |
| stoppage             | Indicates whether the issue causes a stoppage (true or false).                         |
| customercontactphone | Phone number of the customer contact.                                                  |
| customercontactname  | Name of the customer contact.                                                          |

**Response**

```json
{
  "specversion": "1.0",
  "id": "8fe90781-2be0-4c40-a4db-4f4407cc178f",
  "type": "Create",
  "subject": "ServiceCase",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "id": "8fe90781-2be0-4c40-a4db-4f4407cc178f",
    "subscriptionid": "00000000-0000-0000-0000-000000000003",
    "casenumber": "yourCaseNumber",
    "externalEntityId": "externalServiceCase1",
    "externalCustomerId": null,
    "tmid": "yourtapiomachineid",
    "customercontactid": "test-customer-user@tapiotest.onmicrosoft.com",
    "servicecontactname": null,
    "title": "Strange noise",
    "problem": "Machine produces strange noise on startup.",
    "solution": null,
    "state": 0,
    "timestamp": "2025-01-20T15:20:59.9128782+00:00",
    "stoppage": false,
    "customercontactphone": "+491763334333",
    "customercontactname": "Test-Customer-User"
  }
}
```

### CreateOrReplace

The message body contains the serialized JSON-Object as defined in [Request](#create-servicecase). Read-Only fields need not be provided.

### Read

**Request**

The `data.id` is the internal ID of the service case generated by ServiceBoard, which can be used for "Read" operations. The `data.externalEntityId` is the external ID from the partner system, which can also be used for "Read" operations to identify the service case.

```json
{
  "specversion": "1.0",
  "id": "00bceaca-3a2d-4bec-a3d4-fb6521af8be7",
  "type": "Read",
  "subject": "ServiceCase",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "id": "6874b47c-6d44-4dec-bda2-7153937fad49",
    "subscriptionid": "00000000-0000-0000-0000-000000000003",
    "externalEntityId": "externalServiceCase8",
    "externalCustomerId": "95475636",
    "tmid": "yourtapiomachineid"
  }
}
```

| Parameter Name     | Explanation                                                           |
| ------------------ | --------------------------------------------------------------------- |
| id                 | The internal ID of the service case generated by ServiceBoard.        |
| subscriptionid     | The identifier for the subscription associated with the service case. |
| externalEntityId   | The unique identifier for the service case in the partner system.     |
| externalCustomerId | The unique identifier for the customer in the partner system.         |
| tmid               | The unique identifier for the machine within the tapio ecosystem.     |

**Response**

```json
{
  "specversion": "1.0",
  "id": "6874b47c-6d44-4dec-bda2-7153937fad49",
  "type": "Read",
  "subject": "ServiceCase",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "id": "6874b47c-6d44-4dec-bda2-7153937fad49",
    "subscriptionid": "00000000-0000-0000-0000-000000000003",
    "casenumber": "yourCaseNumber7",
    "externalEntityId": "externalServiceCase8",
    "externalCustomerId": "95475636",
    "comments": null,
    "sparepartids": null,
    "tmid": "yourtapiomachineid",
    "customercontactid": "test-customer-user@tapiotest.onmicrosoft.com",
    "servicecontactname": null,
    "title": "Strange noise with attachments and comments",
    "problem": "Machine produces strange noise on startup.",
    "solution": null,
    "state": 0,
    "timestamp": "2025-01-21T08:12:59.50952+00:00",
    "stoppage": false,
    "customercontactphone": "+491763334333",
    "customercontactname": "Test-Customer-User"
  }
}
```

### Delete

The delete operation uses the same syntax as the [Read](#read) operation.
The only difference is that the "type" of the cloud event operation should be set to "Delete".

### Add attachment to the ServiceCase

**Request**

```json
{
  "specversion": "1.0",
  "id": "3ed8eeb1-352d-4de0-aa5a-8004a826325d",
  "type": "Create",
  "subject": "CustomerDocument",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "subscriptionid": "00000000-0000-0000-0000-000000000003",
    "servicepartnerid": "00000000-0000-0000-0000-000000000012",
    "serviceCaseId": "2fd90b3d-585e-4572-85ba-585c20dc6ad6",
    "externalEntityId": "externalAttachmentId",
    "externalCustomerId": "95475636",
    "name": "bear.avif",
    "mimetype": "image/avif",
    "downloadLink": "https://tlcsintattachmentstore.blob.core.windows.net/serviceboard/624850df-bc37-447b-aec1-ae098826355a?sv=2025-01-05&se=2025-01-23T10%3A20%3A39Z&sr=b&sp=r&sig=er5qv5%2FhsFkURkEJ%2BZjYjtLjUZF%2BfRzYixeX3S8rszg%3D",
    "localizeddocuments": [
      {
        "name": "Bohrer Wartung",
        "language": "de-DE",
        "externalEntityId": "optional id-of-entity-in-partner-system",
        "downloadLink": "link -to-download-the-document"
      },
      {
        "name": "Drill Maintenance",
        "language": "en-US",
        "externalEntityId": "optional id-of-entity-in-partner-system",
        "downloadLink": "link -to-download-the-document"
      }
    ]
  }
}
```

| Parameter Name     | Explanation                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| subscriptionid     | Identifier for the subscription associated with the document.              |
| servicepartnerid   | Identifier for the service partner associated with the document.           |
| serviceCaseId      | Identifier for the service case associated with the document.              |
| externalEntityId   | Unique identifier for the attachment in the partner system.                |
| externalCustomerId | Unique identifier for the customer in the partner system.                  |
| name               | Name of the document.                                                      |
| mimetype           | MIME type of the document.                                                 |
| downloadLink       | URL to download the document.                                              |
| localizeddocuments | Optional additional files, representing localized instances of a document. |

> **Warning:** The `externalEntityId` is mandatory and should be unique within the scope of the service case. This ensures that each attachment can be uniquely identified and managed correctly.

**Response**

```json
{
  "specversion": "1.0",
  "id": "hg2bc974cf-ea27-4b65-9b67-81a1a91d4cc8",
  "type": "Create",
  "subject": "CustomerDocument",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "id": "hg2bc974cf-ea27-4b65-9b67-81a1a91d4cc8",
    "subscriptionid": "00000000-0000-0000-0000-000000000003",
    "servicepartnerid": "00000000-0000-0000-0000-000000000012",
    "serviceCaseId": "2fd90b3d-585e-4572-85ba-585c20dc6ad6",
    "externalEntityId": "externalServiceCase19",
    "externalCustomerId": "95475636",
    "name": "bear.avif",
    "mimetype": "image/avif",
    "downloadLink": "https://tlcsintattachmentstore.blob.core.windows.net/serviceboard/623b8f01-0a04-4c5a-a4d8-94663ab95753?sv=2025-01-05&se=2025-01-23T10%3A46%3A53Z&sr=b&sp=r&sig=EvMNXxSMEwDkDxp%2B%2FEaVo1e2HF59BODrQ4RuVI9%2BojM%3D",
    "localizeddocuments": [
      {
        "name": "Bohrer Wartung",
        "language": "de-DE",
        "externalEntityId": "optional id-of-entity-in-partner-system",
        "downloadLink": "link -to-download-the-document"
      },
      {
        "name": "Drill Maintenance",
        "language": "en-US",
        "externalEntityId": "optional id-of-entity-in-partner-system",
        "downloadLink": "link -to-download-the-document"
      }
    ]
  }
}
```

### Add comment to the ServiceCase

**Request**

```json
{
  "specversion": "1.0",
  "id": "7dd48b76-93da-4588-81ed-6c1bc6994907",
  "type": "Create",
  "subject": "ServiceCaseComment",
  "source": "externalcrm.com",
  "datacontenttype": "application/json",
  "data": {
    "serviceCaseId": "05c41d57-2f71-4da5-a115-df0feb01f653",
    "subscriptionId": "00000000-0000-0000-0000-000000000003",
    "author": "Test author",
    "authorId": "test-customer-user@tapiotest.onmicrosoft.com",
    "body": "Hi here is my new comment",
    "timestamp": "2025-01-22T14:35:23.1450398+00:00",
    "externalEntityId": "external1234554433",
    "externalCustomerId": "95475636"
  }
}
```

| Parameter Name     | Explanation                                                  |
| ------------------ | ------------------------------------------------------------ |
| serviceCaseId      | Identifier for the service case associated with the comment. |
| subscriptionId     | Identifier for the subscription associated with the comment. |
| author             | Name of the author of the comment.                           |
| authorId           | Email address of the author of the comment.                  |
| body               | Content of the comment.                                      |
| timestamp          | Timestamp indicating when the comment was made.              |
| externalEntityId   | Unique identifier for the comment in the partner system.     |
| externalCustomerId | Unique identifier for the customer in the partner system.    |

> **Warning:** The `externalEntityId` is mandatory and should be unique within the scope of the service case. This ensures that each comment can be uniquely identified and managed correctly.

**Response**

The functionality to add comments is not available at the moment, but it will be implemented soon.

#### How "ServiceCase" is resolved for operations

For executing read, CreateOrReplace or delete operations on existing objects, they need to be uniquely identifiable. This can be done in two ways:

- Using the externalEntityId of the partner system. This has to be provided by a preceding operation.
- Using the internal Id of the entity
- If both ids are provided, the externalEntityId takes precedence over the internal id, and the internal id is used as fallback.

#### How "Customer's subscription" is resolved for operations

For creating new entities you can either provide an externalCustomerId, a subscriptionId or a tmid to associate the freshly created entity with the correct tapio subscription. Adding a tapio machine id (tmid) is recommended. If a customer cannot be identified, data will be discarded to protect data privacy.

## Connector-to-Partner Channel

The connector-to-partner channel is a Azure service bus topic, which notifies the partner about activities in the system. In order to work with multiple message consumers, partners can create multiple subscriptions within that topic.

The connector-to-partner channel

- contains responses to requests that the partner sended to the partner-to-connector channel
- is proactively notifying partners about activities in the ServiceBoard, e.g. creation of service requests.

In general, these messages look the same, but can be distinguished via the source property in the header.

### Cloud Event Message Headers

The ServiceBoard sends messages to the partner via service bus messages ("brokered messages"). This section describes the header properties that the ServiceBoard includes in messages sent to the partner via the connector-to-partner channel.

The message headers for cloud events in the Connector-to-Partner Channel are identical to those used in the [Partner-To-Connector Channel](#partner-to-connector-channel). Refer to the Cloud Event Message Headers section under the Partner-To-Connector Channel for detailed information on the required headers and their values.

Messages with operation type "Create", "CreateOrReplace" or "Delete" occur in the system whenever the corresponding operation has been executed. There are two possible sources that can trigger such an operation.

1. The URL which is provided by partner connector, because the partner sent a request to the [Partner-To-Connector Channel](#partner-to-connector-channel)
2. The "serviceboard.Tapio.one", because a customer created an entity, e.g. a service case

If the source is the partner connector, a response code indicates whether the operation was a success.

### Message Body

**Create, CreateOrReplace and Read**

If successful, the body contains the json data of the affected element, as described in [Partner-To-Connector Channel](#create-servicecase), otherwise an exception message.

If a Create, CreateOrReplace or Read operation has been issued by the partner via the [Partner-To-Connector Channel](#partner-to-connector-channel) and the operation was unsuccessful, the body contains an exception message.

**Delete**

Successful operations return the same body as in the [Partner-To-Connector Channel "Delete" operation](#delete). The necessary information of the affected object is provided there. Since the object is deleted, it cannot be retrieved via a read request anymore.

If a Delete operation has been issued by the partner via the [Partner-To-Connector Channel](#partner-to-connector-channel) and the operation was unsuccessful, the body contains an exception message.

### Error Handling

When a request to the Partner-to-Connector channel can not be processed, an error message is posted to the Connector-to-Partner channel.

Error messages contain in the header the subject "Error" and a description of the error in the body. The response code contains information about what went wrong e.g.

```json
{
  "specversion": "1.0",
  "id": "b4c9d23a-4056-4693-b8de-b738ca9663d8",
  "type": "Error",
  "subject": "Error",
  "source": "serviceboard.Tapio.one",
  "datacontenttype": "application/json",
  "data": {
    "originalType": "Create",
    "originalSubject": "ServiceCaseComment",
    "originalData": {
      "serviceCaseId": "05c41d57-2f71-4da5-a115-df0feb01f653",
      "subscriptionId": "00000000-0000-0000-0000-000000000003",
      "author": "Test author",
      "authorId": "test-customer-user@tapiotest.onmicrosoft.com",
      "body": "Example comment 4",
      "timestamp": "2025-01-22T14:02:23.1450398+00:00",
      "externalEntityId": null,
      "externalCustomerId": null
    },
    "responseModel": {
      "responseCode": 400,
      "message": "ExternalEntityId  already exists."
    }
  }
}
```

| Parameter       | Explanation                                                                     |
| --------------- | ------------------------------------------------------------------------------- |
| originalType    | The type of the original operation that was attempted.                          |
| originalSubject | The subject of the original operation that was attempted.                       |
| originalData    | The data associated with the original operation.                                |
| responseModel   | The model containing the response details, including response code and message. |
| responseCode    | The code indicating the result of the operation (e.g., 400 for error).          |
| message         | The message providing additional information about the response.                |

| Response Code | Description                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 0             | Success                                                                                                                                     |
| 1             | Unknown Exception                                                                                                                           |
| 200           | Invalid value provided in the "type" field of the request header.                                                                           |
| 300           | Validation of request body failed. The body is not in the specified format or is missing required fields.                                   |
| 400           | Executing the request would result in a duplicate external entity id.                                                                       |
| 500           | The customer which you tried to access could not be uniquely identified. Try providing more information in the request header, e.g. a tmid. |
| 600           | The requested element does not exist.                                                                                                       |
| 700           | Unauthorized. Please ensure that you have a service partner relation with the customer.                                                     |
| 800           | The service partner could not be resolved. Either because it was not found or there were some ambiguities.                                  |
