# Downloading Files to a Machine

## Introduction

tapio's TapioCore Web API enables:

- downloading a file from an external source to the machine.
- request the state of the download.

This way, large files can be transferred to the machine (like cutting plans) and at any moment it is possible to know if downloading is started or not and when the transfer is finished.

## General

To be able to make requests to the Core TapioCore Web API, you first need to [configure your CloudConnector instance](#cloudconnector-configuration) and [register a tapio application](../general/register-tapio-application) and assign machines to the application. **You won't be able to start download** for machines that are not assigned to your application or if machine is in "offline" state.  
**Authentication** in TapioCore Web API is done via Azure AD B2C. See our [guide on authentication](../general/authentication#non-interactive-authentication) for more details.
Also **do not modify** files inside `{dataDirectory}/persistentStorage/`.

> The `persistentStorage`-directory is used internally to persist the state of file transfers during critical phases.

## CloudConnector Configuration

Add a module configuration section to your XML configuration file:

### Example

```xml
<Module xsi:type="FileTransferModuleConfig">
  <Id>FileTransferModule</Id>
  <ApplicationUri>urn:Tapio:ServerName</ApplicationUri> <!-- => former "LdsName" -->
  <OpcServer>opc.tcp://tapio.one:17636/MyServer/</OpcServer>
  <RemoteLds>opc.tcp://tapio.one/MyServer/</RemoteLds>
  <OpcUaMaxConnectTime>00:01</OpcUaMaxConnectTime> <!-- => one minute -->
  <Authentication xsi:type="AuthenticationUserName">
    <UserName>thelegend27</UserName>
    <Password>somePassword!</Password>
  </Authentication>
  <Downloads>
    <Download>
      <Id>3dModel</Id>
      <NodeId>MyServer.TheTemporaryFileTransferTypeNode</NodeId>
    </Download>
    <Download>
      <Id>CustomerOrder</Id>
      <NodeId>MyServer.OtherTemporaryFileTransferTypeNode</NodeId> // different versions
    </Download>
  </Downloads>
</Module>
```

> Note: Either set the `ApplicationUri` tag to connect via local discovery service **or** set the `OpcServer` tag to establish a direct connection. Additionally you can use a remote discovery service using the `RemoteLds` tag.
<!-- -->
> Note: If you want to send files to multiple OPC UA servers you have to configure multiple file transfer modules.

### File transfer module configuration model

| Property              |  Type  | Description                                                                                                                                                                                   |
| --------------------- | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Id`                  | string | Unique identifier of the module. Simultaneously used as the OPC UA server identifier.                                                                                                         |
| `ApplicationUri`      | string | OPC UA server address to connect using a local discovery service.                                                                                                                             |
| `OpcServer`           | string | OPC UA server address to connect directly.                                                                                                                                                    |
| `RemoteLds`           | string | OPC UA server address to connect using a remote discovery service.                                                                                                                            |
| `OpcUaMaxConnectTime` | string | Maximum time span the OPC UA client takes to try to establish a connection. Formatted like a [C# TimeSpan](https://docs.microsoft.com/en-us/dotnet/api/system.timespan?view=netstandard-2.0). |
| `Authentication`      |   -    | [Authentication configuration.](../manufacturer/cloud-connector/configuration#authentication)                                                                                                  |
| `Downloads`           |   -    | List of [Download](#download-configuration-model) items.                                                                                                                                      |

> Note: If you want to connect using an `ApplicationUri` the XML tag `OpcServer` has to be empty.

#### Download configuration model

| Property |  Type  | Description                                                                                                                                                               |
| -------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Id`     | string | Unique identifier of the download.                                                                                                                                        |
| `NodeId` | string | The `NodeId` of the `TemporaryFileTransferType`-node on the destination OPC UA server. [Supported formats](../manufacturer/cloud-connector/configuration#node-identifier). |

## WebAPI Interaction

Downloading a file is done asynchronously. You need to enqueue a download request, which returns a correlation id. You can then use this correlation id to query the status of the download and wait for it to finish.

> Use the ResourceId `https://tapiousers.onmicrosoft.com/CoreApi` for the token request otherwise you get an Unauthorized.

### Enqueue a Request

You enqueue a download request using
`POST https://core.tapio.one/api/machines/<tmid>/downloads/`.
This call will return an http response with return code `202` if the request was successful, as well as a response body defined [here](#response-object). Because the call also immediately tries to trigger the download, the call may take a few seconds, especially if the device is currently offline.

`POST https://core.tapio.one/api/machines/<tmid>/downloads/`

> Use `Content-Type: application/json;charset=UTF-8` in your request headers
> Use the ResourceId `https://tapiousers.onmicrosoft.com/CoreApi` for the token request otherwise you get an Unauthorized.

### Request

```json
{
  "serverId": "UniqueId01",
  "id": "Download-Id",
  "downloadUrl": "https://url-to-file-download_incl-sas-token",
  "ttl": "P2D",
  "commandType": "TemporaryFileTransferType.GenerateFileForWrite",
  "inArguments":
  {
    "generateOptions":
    {
      "valueType": "string",
      "value": "- user specific data - will be passed into the argument -"
    }
  },
  "responseTimeOut" : "00:00:30",
  "connectionTimeOut" : "00:00:30"
}
```

#### Request-Properties

| Property          | Type                      | Required | Default value | Description                                                                         |
| ----------------- | ------------------------- | -------- | ------------- | ----------------------------------------------------------------------------------- |
| tmid              | string (guid)             | yes      |               | tapio machine id of the machine you want to download to                             |
| serverId          | string                    | yes      |               | Server Id of the OPC UA server as configured (TODO Add link)                        |
| id                | string                    | yes      |               | Id of the actual target where the file will be downloaded to                        |
| downloadUrl       | string (URL)              | yes      |               | URL of the file to download, including any authentication parameters if required    |
| ttl               | string (ISO8601 Timespan) | yes      |               | Time to life - time after which CloudConnector no longer tries to download the file |
| commandType       | string                    | yes      |               | Must be "TemporaryFileTransferType.GenerateFileForWrite"                            |
| inArguments       | InArguments-Object        | no       |               | See below                                                                           |
| responseTimeOut   | string (TimeSpan)         | no       | "00:05:00"    | Overall timeout for scheduling jobs                                                 |
| connectionTimeOut | string( TimeSpan)         | no       | "00:00:15"    | Timeout for the connection                                                          |

##### InArguments-Object

| Property        | Type                   | Description |
| --------------- | ---------------------- | ----------- |
| generateOptions | GenerateOptions-Object | See below   |

##### GenerateOptions-Object

| Property  | Type   | Description                                                  |
| --------- | ------ | ------------------------------------------------------------ |
| valueType | string | must be "string"                                             |
| value     | string | Options that need to be passed when creating download target |

#### Enqueue Download Response

```json
{
    "correlationId": "d4c45c5f-a234-40e8-b82e-81b4869b6caa"
}
```

##### Set connection-timeout and response-timeout

You can override the default response timeout for scheduling jobs and the connection timeout for each command.  
The timeouts can be set independently. If no timeouts are set, the default values are used.
> Be aware, that the connection timeout needs to be smaller than the response timeout. Also both values need to be set in a time range from 00:00:05 - 00:05:00

##### Response-Object

| Property      | Type          | Description                                 |
| ------------- | ------------- | ------------------------------------------- |
| correlationId | string (guid) | Correlation id used to query download state |

### Query State

`GET https://core.tapio.one/api/machines/<tmid>/downloads/<correlationId>`

> Use the ResourceId `https://tapiousers.onmicrosoft.com/CoreApi` for the token request otherwise you get an Unauthorized.

#### Query State Response

```json
{
    "enqueueDate": "2019-01-01T13:00:00Z",
    "status": "Ok",
    "statusDescription": "",
    "lastUpdateDate": "2019-01-01T13:05:00Z"
}
```

| Property          | Type                  | Description                                                 |
| ----------------- | --------------------- | ----------------------------------------------------------- |
| enqueueDate       | string (ISO8601 Date) | Date when the request was enqueued                          |
| status            | string                | One of `Ok` `Pending` `Failed` `Running`                    |
| statusDescription | string                | In case of `Failed` this includes the actual error message. |
| lastUpdateDate    | string (ISO8601 Date) | Date of the last status change                              |

| Value   | Description                                       |
| ------- | ------------------------------------------------- |
| Ok      | File download was successful                      |
| Pending | File download is enqueued but has not yet started |
| Failed  | File download was unsuccessful                    |
| Running | File download was started                         |

### Return Codes

Possible return status values: `200`, `202`,`400`, `401`, `403` , `404`

| Http Status Code | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| 200              | Execution of this request was successful.                                                     |
| 202              | Execution of this request was successful, query the result using the returned correlation id. |
| 400              | Execution of this request failed, because something went wrong. Check the response.           |
| 401              | Execution of this request failed, because application is not authorized. Check the response.  |
| 403              | Execution of this request is forbidden. Check the response.                                   |
| 404              | Execution of this request is not done because something does not exist.                       |

#### Ok

If you are trying to download file for an application which is authorized for commanding, this call will return an http response with return code `200` (ok), and appropriate body e.g. see: [Enqueue Download Response](#enqueue-download-response).

If you are trying to to get download state for an application which is authorized for commanding, this call will return an http response with return code `200` (ok), and appropriate body e.g. see: [Query State Response](#query-state-response).

#### Forbidden

If you are trying to download file or to get download status for an application which is not authorized for commanding, this call will return an http response with return code `403` (forbidden), and appropriate message: `Application is known, but not authorized for this action.`

#### Not found

An http response with return code `404` (not found) and appropriate message is returned in cases:

- If you are trying to download file using invalid tapio machine id (e.g. id not exist).
- If you are trying to get download status using invalid tapio machine (e.g. id not exist).
- If you are trying to get download status using invalid correlation id.

#### Bad Request

An http response with return code `400` (bad request) and appropriate message is returned in cases:

- If you are trying to enqueue download for the machine which is offline (Message: "Machine not reachable").
- If you are trying to enqueue download providing no body in request or providing invalid body.
- If you are trying to enqueue download providing invalid value for any parameter in request body.
- If the passed timeout values have the wrong format or are smaller then 00:00:05 or bigger then 00:05:00.
- If the connection timout is bigger than the response timeout.

#### Unauthorized

An http response with return code `401` (unauthorized) and appropriate message is returned in cases:

- If you do not send authorization header in request or can't be parsed.
- If the header is past it's expiration date.

If you have any further questions regarding our  Core Web API, don't hesitate to contact [developer@tapio.one](mailto:developer@tapio.one?Subject=Question%20About%20Download%20File)

## OPC UA Server Implementation Hints

We implemented OPC UA interaction according to the [official OPC UA specification](https://opcfoundation.org/developer-tools/specifications-unified-architecture/).

Therefore we expect that calling the `GenerateFileForWrite()` method on a `TemporaryFileTransferType` node returns a fully implemented `FileType` node (as specified in the OPC UA Specification - [Part 5](https://opcfoundation.org/developer-tools/specifications-unified-architecture/part-5-information-model/), Annex C).

You might have to extend existing OPC UA implementations in order to be able to support file transfer due to not being able to set a file handle on vanilla `FileType` nodes manually.

