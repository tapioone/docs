
# Configuration

## Global Configuration

The tapio CloudConnector can be configured through a [.xml](https://www.w3.org/TR/xml/)-file named `TapioCloudConnector.xml`. The configuration provides two different ways to store the information. It is also possible to mix both ways together.

> If a section, e.g. `Modules` contains content in the `GlobalConfig` the tapio CloudConnector will take these information and will ignore the file behind the given file path. If you want to use the information from the file, you need to remove the content from the `GlobalConfig` file in the specific section like `Modules`.

1. Store all information in one xml file. (see example 1)
2. Split the different sections like ManufacturerConfig and CloudConnectorConfig in different files. (see example 2)

> By default it's located at: `C:\ProgramData\tapio\CloudConnector\`

Example 1:

```xml
<?xml version="1.0"?>
<GlobalConfig xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <!-- Optional: Manufacturer Configuration for on the fly machine registration -->
  <ManufacturerConfig>
    <ManufacturerSubscriptionId>33386422-f77e-493c-8db6-9d48a1a3cbbb</ManufacturerSubscriptionId>
    <DeviceType>Test</DeviceType>
  </ManufacturerConfig>

  <ConnectorConfig>
    <ConnectorId>q8AElWQ8Iqc7vbMiy2jnmYbguEH-K...</ConnectorId>
    <ConnectorCert>MIacAQMwgAYJKoZIhvcNAQcBoIAkg...</ConnectorCert>
    <DiscoveryServiceUri>https://disco.tapio.one</DiscoveryServiceUri>
    <DiscoveryServiceCert>MiIDQaDCCAiigAwIBAgI...</DiscoveryServiceCert>
    <AuthAppId>00000000-0000-0000-0000-000000000000</AuthAppId>
    <AuthSecret>secret</AuthSecret>
    <ResourceId>https://tapiousers.onmicrosoft.com/DiscoveryService</ResourceId>
    <Authority>https://login.microsoftonline.com/32896ed7-d559-401b-85cf-167143d61be0</Authority>
    <InstrumentationKey>00000000-0000-0000-0000-000000000000</InstrumentationKey>
    <LogLevel>Verbose</LogLevel>
    <OpcUaServerUrl>opc.tcp://somedomain:4433/CloudConnectorDiagnostic/</OpcUaServerUrl> <!-- optional -->
  </ConnectorConfig>
  <Modules>
    <Module xsi:type="DataModuleConfig">...</Module>
    <Module xsi:type="FileTransferModuleConfig">...</Module>
  </Modules>
</GlobalConfig>
```

Example 2:

```xml
<?xml version="1.0"?>
<GlobalConfig xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
 <ManufacturerConfig source="C:\ReadOnlyPath\tapio\CloudConnector\config\ManufacturerConfig.xml">
  </ManufacturerConfig>
  <ConnectorConfig source="C:\ProgramData\tapio\CloudConnector\config\ConnectorConfig.xml">
  </ConnectorConfig>
  <Modules>
    <Module xsi:type="DataModuleConfig">...</Module>
    <Module xsi:type="FileTransferModuleConfig">...</Module>
  </Modules>
</GlobalConfig>
```

ModuleConfig.xml example 3:

```xml
<Modules xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >
  <Module xsi:type="DataModuleConfig">...</Module>
  <Module xsi:type="AzureIotHubConfig">
      <Id>AzureIotHub</Id>
      <ServiceId>AzureIoTHub</ServiceId>
  </Module>
</Modules>
```

In case of using path information for one of the three section in a configuration, you are able to store e.g. the `ManufacturerConfig` in a section which is read-only.

### `GlobalConfig` Model

| Element              | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `ManufacturerConfig` | ManufacturerConfig, required for automatic machine registration |
| `ConnectorConfig`    | Configuration required for connecting to the tapio platform.    |
| `Modules`            | List of [module configurations](#module-configuration).         |

### `ManufacturerConfig` Model

This configuration section is required if you want to use automatic machine registration. The following information about a device will be stored in the manufacturer section.

| Element                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `ManufacturerSubscriptionId` | The SubscriptionId of the manufacturer |
| `DeviceType`                 | The device type                        |
| `DeviceSubType`              | Optional: Device sub type              |

### `ConnectorConfig` Model

The `ConnectorConfig` will contain the following information. You will get the information via a xml file download by registering a device in My tapio.

| Property               |      Required      | Description                                                                                                                                                                   |
| ---------------------- | :----------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ConnectorId`          | :white_check_mark: | Identifier of the CloudConnector instance.                                                                                                                                    |
| `ConnectorCert`        | :white_check_mark: | CloudConnector certificate (client-certificate).                                                                                                                              |
| `DiscoveryServiceUri`  | :white_check_mark: | Discovery service URI.                                                                                                                                                        |
| `DiscoveryServiceCert` | :white_check_mark: | Discovery service certificate (server-certificate).                                                                                                                           |
| `AuthAppId`            | :white_check_mark: | App identifier for discovery service [OAuth2 flow](https://oauth.net/2/).                                                                                                     |
| `AuthSecret`           | :white_check_mark: | App secret for discovery service [OAuth2 flow](https://oauth.net/2/).                                                                                                         |
| `ResourceId`           | :white_check_mark: | Resource id for discovery service [OAuth2 flow](https://oauth.net/2/).                                                                                                        |
| `Authority`            | :white_check_mark: | Authority for discovery service [OAuth2 flow](https://oauth.net/2/).                                                                                                          |
| `InstrumentationKey`   | :white_check_mark: | Instrumentation key for logging into [Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)                                   |
| `LogLevel`             |      optional      | Verbosity of the logs. There are [six log levels](#log-level) available. Default is `Error`.                                                                                  |
| `LogFileCount`         |      optional      | The count of log files to use, at least 1, default 10.                                                                                                                        |
| `LogFileSize`          |      optional      | The max size per log file, min `4K` (4 KiB)  , default `10M` (10 MiB), format `{number}{unit}`, allowed units:  `K` - KiB, `M` - MiB, `G` - GiB. See below for more examples. |
| `OpcUaServerUrl`       |      optional      | OPC UA server address. Default is `opc.tcp://localhost/CloudConnectorDiagnostic/`. You can set a specific port with this tag.                                                 |

Examples for **`LogFileSize`**:

| Value            | Description                                  |
| ---------------- | -------------------------------------------- |
| `{number}{unit}` |                                              |
| `4K`             | 4 Kilobyte = 4096 Byte                       |
| `1M`             | 1 Megabyte = 1024 Kilobyte = ‭1048576‬ Bytes |
| `10M`            | 10 Megabyte = ‭10240‬ Kilobyte               |
| `1G`             | 1 Gigabyte = 1024 Megabyte                   |

### Log level

| Level       | Logged events                                    |
| ----------- | ------------------------------------------------ |
| Verbose     | Everything                                       |
| Debug       | Information logs and information for developers. |
| Information | Warning logs and general information.            |
| Warning     | Error logs and expected exceptions.              |
| Error       | Critical logs and unexpected exceptions.         |
| Critical    | Only critical events.                            |

It is also possible to disable logging on the file system. You need to add the property `LoggingSinkLocation` to the `ConnectorConfig`.

```xml
<ConnectorConfig>
    ...
    <InstrumentationKey>00000000-0000-0000-0000-000000000000</InstrumentationKey>
    <LogLevel>Verbose</LogLevel>
    <LoggingSinkLocation>Ai</LoggingSinkLocation>
</ConnectorConfig>
```

| Location  | Description                                                            |
| --------- | ---------------------------------------------------------------------- |
| AiAndFile | Logs are stored in the application insights and file log on the device |
| Ai        | Logs are stored in the application insights                            |

> If no location is set in the configuration, the CloudConnector will use the `AiAndFile` location.

## Module Configuration

Each module has a unique configuration model. Have a look at the [documentation](./index#module-structure) of the module you want to configure.

### OPC UA Client Configuration

Some modules like the [file transfer](../../machine-data/file-transfer) or [call endpoint module](./call-endpoint) contain a OPC UA client which has to be configured according to the documentation of the module in charge. Configuration patterns for [authentication](#authentication) and [node identifiers](#node-identifier) are reused in multiple modules.

#### Authentication

There are three different ways for authentication. Set the `xsi:type` property of the `Authentication` XML tag to either [AuthenticationUserName](#authentication-with-username-and-password), [AuthenticationCertificate](#authentication-with-certificates) or [AuthenticationNone](#no-authentication) and configure accordingly.

> Currently used in `BackupModule`, `DataModule` and `FileTransferModule`.

##### Authentication with username and password

Example:

```xml
<Authentication xsi:type="AuthenticationUserName">
  <UserName>thelegend27</UserName>
  <Password>somePassword!</Password>
</Authentication>
```

Model:

| Property   | Description                         |
| ---------- | ----------------------------------- |
| `UserName` | OPC UA username.                    |
| `Password` | OPC UA password for given username. |

##### Authentication with certificates

Example:

```xml
<Authentication xsi:type="AuthenticationCertificate">
  <X509CertBase64>
    HDAJBgNVBAYTAlJVMA8GA1UEAx4IAFQAZQBzAHQwggEiMA0GCSqGSIb3DQEBA...
  </X509CertBase64>
  <CertPassword>somePassword!</CertPassword>
</Authentication>
```

Model:

| Property         | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `X509CertBase64` | A X509 certificate encoded as Base64 string.                      |
| `CertPassword`   | Password to load certificate with private key, set when required. |

##### No authentication

Example:

```xml
<Authentication xsi:type="AuthenticationNone">
</Authentication>
```

#### Node Identifier

There are many ways to format a `NodeId`. We support the following notations:

> Currently used in `DataModule` and `FileTransferModule`.

##### Full notation

The full notation is just a string with specific formatting.

Format:

```xml
ns=<namespaceIndex>;s=<identifier>
```

Example:

```xml
<NodeId>ns=2;s=MyServer.MyFolder.MyNode</NodeId>
```

It is possible to resolve the index namespace on runtime:

```xml
<!-- Note the nsu parameter has to be the first one -->
<NodeId>nsu=http://tapio.one;i=45</NodeId>
```

##### Identifier and Namespace Index notation

Model:

| Property         | Description                           |
| ---------------- | ------------------------------------- |
| `NamespaceIndex` | OPC UA namespace index of the node.   |
| `Identifier`     | OPC UA identifier string of the node. |

Example:

```xml
<NodeIdIndex>
  <NamespaceIndex>2</NamespaceIndex>
  <Identifier>MyServer.MyFolder.MyNode</Identifier>
</NodeIdIndex>
```

##### Identifier and Namespace URI

Model:

| Property       | Description                           |
| -------------- | ------------------------------------- |
| `NamespaceUri` | OPC UA namespace URI of the node.     |
| `Identifier`   | OPC UA identifier string of the node. |

Example:

```xml
<NodeIdNamespace>
  <NamespaceUri>urn:MyCompany:MyServer</NamespaceUri>
  <Identifier>MyFolder.MyNode</Identifier>
</NodeIdNamespace>
```

## Distributed Configuration

The configuration can be split up into separate parts that are located at different locations.
A location is given by an uri in the `source` attribute of the element for which the contents should be load. While loading the configuration, the
serializer will resolve referenced uris and insert the contents.

Example:

```xml
<?xml version="1.0"?>
<GlobalConfig xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <ConnectorConfig source="file:///c:/programdata/tapio/cloudconnector/config/Modules.xml">
  </ConnectorConfig>
  <Modules>
    <Module xsi:type="DataModuleConfig">...</Module>
    <Module xsi:type="FileTransferModuleConfig">...</Module>
  </Modules>
</GlobalConfig>
```

```xml
<ConnectorConfig>
  <ConnectorId>q8AElWQ8Iqc7vbMiy2jnmYbguEH-K...</ConnectorId>
  <ConnectorCert>MIacAQMwgAYJKoZIhvcNAQcBoIAkg...</ConnectorCert>
  ....
</ConnectorConfig>
```

Currently the `ConnectorConfig` element and the `Modules` element support the `source` attribute.
If the configuration is split up, each individual file needs to be a valid `XML`. Required namespaces (e.g. `xsi`) need to be
defined in all files where they are used.

The `source` must be a valid uri. Ideally, only absolute uris are used, but relative uris are supported as well
if a base uri is provided while loading the configuration. When a `source` attribute is given for an element that also has children, it is ignored.

By default only the `file` scheme is supported.

