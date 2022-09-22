# Call Endpoint Module

## Introduction

The Call Endpoint module was introduced to enable apps, running on a tapio connected machine, to call other tapio applications. Instead of making REST calls directly from an app running on the machine, we wanted to have the CloudConnector as a proxy, to be our single point of contact with the internet. This has several advantages, for example the use of the existing authentication of the CloudConnector against the tapio core platform. We therefore created a new module within the CloudConnector, called the `Call Endpoint Module`. It provides an OPC UA interface, which accepts a call and forwards it to the requested resource.

## Make a call

To call another tapio resource through the CloudConnector, you first need to adapt the CloudConnector configuration to provide at least one `CallEndpointIdModule`, which looks like this:

```xml
<Module xsi:type="CallEndpointIdModule">
  <Id>Endpoints</Id>
  <Endpoints>
    <Endpoint>
      <TapioMachineId>23123123</TapioMachineId>
      <NodeId>FirstMachine</NodeId>
    </Endpoint>
    <Endpoint>
      <TapioMachineId>123123123</TapioMachineId>
      <NodeId></NodeId> <!-- optional node id name -->
    </Endpoint>
  </Endpoints>
</Module>
```

> Tip: [Configuring a NodeId](./configuration#node-identifier).

The `NodeId` xml node defines the NodeId within OPC UA, that will accept a synchronous OPC UA call containing information about the tapio API to call.

### OPC UA Method Call Parameters

The following parameters can be defined within the OPC UA Call:

| Parameter         | Type        | Description                                                                     |
| ----------------- | ----------- | ------------------------------------------------------------------------------- |
| ResourceId        | String      | Unique Identifier (Guid) of the resource, which should be called                |
| RequestType       | String      | HTTP Method of the call (e.g. GET, POST, PUT, DELETE, HEAD, PATCH)              |
| PathAndParameters | String      | Relative path to be called on the resource (e.g. api/path?search=12)            |
| Headers           | StringArray | Array of strings in the form of "key:value" containing the HTTP request headers |
| Body              | ByteArray   | Optional request content. Content-Length Header will be set automatically       |

You may have noticed, that we're not defining an exact URL to call, just a relative path. We will receive the absolute URL of the endpoint we want to call from `GlobalDiscoveryService`, since our original OPC UA call is forwarded to `Field API` and `GlobalDiscoveryService`.

The `Field API` will concat the endpoint we got from `GlobalDiscoveryService` with the parameters it got from the OPC UA call and do the actual request on the resource. It will also add additional headers, for example authentication headers that might be necessary to call the resource. `Field API` will then return the call back to the `CloudConnector`, which maps the call back to OPC UA format with the following output parameters:

| Parameter         | Type        | Description                                                                      |
| ----------------- | ----------- | -------------------------------------------------------------------------------- |
| StatusCode        | Integer     | HTTP Status Code                                                                 |
| StatusDescription | String      |                                                                                  |
| Headers           | StringArray | Array of strings in the form of "key:value" containing the HTTP response headers |
| Body              | ByteArray   | The content of the response                                                      |

## Register external Endpoint Resource

To enable a resource to be called through the `Call Endpoint Module`, we first need to apply some settings within tapio SelfService.

Since there is currently no UI available, so you can adjust the settings yourself, please provide the following information via email to `developer@tapio.one`:

- Application that calls the endpoint (Application Name in tapio SelfService)
- Json Structure for endpoint Connection:

```json
{
  "url": "url of the endpoint",
  "authenticationType": "header",
  "authentication": {
    // depends on the authenticationType
    // if authenticationType === header
    "headers": {
      "user-provided-header-name": "shared-secret-value",
      "multiple-headers": "are supported"
    }
  }
}
```

You will then receive a `Guid` from us - the ResourceId of your Endpoint - that you need to pass in the OPC UA call, since we're not passing actual endpoint URLs as described in the [OPC UA Call parameters section](#opc-ua-method-call-parameters).

The endpoint does receive two additional HTTP headers from the tapio system:

| Header            | Description                                   |
| ----------------- | --------------------------------------------- |
| Tapio-Tmid        | The tapio machine id which calls the endpoint |
| Tapio-Endpoint-Id | The endpoint which is used for this call      |

