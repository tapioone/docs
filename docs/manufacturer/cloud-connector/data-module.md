
# DataModule

The data module transfers data from OPC UA servers to the cloud.

## SourceOpcUa

Inside the DataModule multiple sources (OPC UA server) can be configured, the following XML snippets shows an example for an OPC UA Source configuration.

```XML
<SourceOpcUa xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <Id>UniqueId01</Id>
  <ApplicationUri>urn:App</ApplicationUri>
  <RemoteLds />
  <!-- Optional  OPC UA Authentication Options -->
  <Authentication xsi:type="AuthenticationNone" />
  <!-- Data source groups -->
  <Groups>
    <SourceGroup>
     <TapioMachineId>000000001</TapioMachineId>
     <UpdateIntervallInMs>500</UpdateIntervallInMs>
     <CyclicUpdateInSec xsi:nil="true" />
     <Items>
        <SourceItem xsi:type="SourceEventItem">
          <NodeId>ns=2;s=PublicInterface</NodeId>
          <Provider>PublicInterface.M5-C1</Provider>
          <UseConditionData>false</UseConditionData>
          <SelectClauses>
            <SelectClause eventTypeId="nsu=FullNameSpace;s=sdsd" browsePath="Test" attribute="15" />
            <SelectClause attribute="16" />
            <SelectClause browsePath="EventType" />
          </SelectClauses>
        </SourceItem>
      </Items>
      <Targets>
        <Target>AzureIoTHub</Target>
        <Target>BatchAggregation</Target>
      </Targets>
    </SourceGroup>
  </Groups>
  <!-- Commanding feature -->
  <Commanding />

</SourceOpcUa>
```

Inside the configuration there are the following options:

| Entry             | Type                  | Description                                                                                    |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| `Id`              | string                | Unique identifier of the module. Simultaneously used as the OPC UA server identifier.          |
| `ApplicationUri`§ | string                | OPC UA server address to connect using a local discovery service (OPC UA LDS).                 |
| `OpcServer`§      | string                | OPC UA server address to connect directly. `<OpcServer>opc.tcp://localhost:4553</OpcUaServer>` |
| `RemoteLds`       | string                | OPTIONAL OPC UA server address to connect using a remote discovery service.                    |
| `Authentication`  | object                | OPTIONAL: See [OPC UA Client Configuration](./Configuration#opc-ua-client-configuration)       |
| `Groups`          | List of `SourceGroup` | See [`SourceGroup`](#sourcegroup)                                                              |
| `Commanding`      | object                | For Commanding see [Commanding Configuration](../../machine-data/Commanding#configuration)     |

**§ Only one of the Options `ApplicationUri` or `OpcServer` has to be configured.**

> For more Information about OPC UA LDS see [Unified Architecture Part 12: Discovery and Global Services](https://opcfoundation.org/developer-tools/specifications-unified-architecture/part-12-discovery/)

### `SourceGroup`

A `SourceGroup` represents a OPC UA Client Subscription

| Entry                 | Type                 | Description                                                                                                                                                                                      |
| --------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TapioMachineId`      | string               | The tapio machine id for this subscription group, all data received via this group will be tagged with the configured tapio machine id.                                                          |
| `UpdateIntervallInMs` | integer              | The OPC UA receiving interval, all value changed will be received in this interval; default is `500`                                                                                             |
| `CyclicUpdateInSec`   | integer/null         | The cyclic update to resend all data and send a current active condition list; to disable use `<CyclicUpdateInSec xsi:nil="true" />`, the default is `<CyclicUpdateInSec>600<CyclicUpdateInSec>` |
| `Items`               | list of `SourceItem` | See [`SourceEventItem`](#sourceeventitem) and [`SourceDataItem`](#sourcedataitem)                                                                                                                |
| `Targets`             | list of `Target`     | See [`Targets`](#targets)                                                                                                                                                                        |

#### `SourceEventItem`

With the `SourceEventItem` two kind of events can be configured:

- The basic variant provides the *Condition*-Types, so events which have a *Retain*-Property are persistent.
- The second variant are the pure *Event*-Types, which will be just reported on occurrence (on report) and are not persistent.

##### Condition Type

The basic condition type to produces the [condition messages](../../machine-data/TapioDataCategories#condition).
Conditions are *persistent events* and can send regularly status updates via the condition refresh handling.

```XML
<SourceItem xsi:type="SourceEventItem">
  <NodeId>ns=2;s=PublicInterface</NodeId>
  <Provider>PublicInterface.M5-C1</Provider>
  <SelectClauses/>
</SourceItem>
```

| Entry              | Type                   | Description                                                                                                                  |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `NodeId`           | object                 | The node id to listen for events, see [supported formats](./Configuration#node-identifier).                                  |
| `Provider`         | string                 | Defines the provider grouping for received conditions, it is used as *Key* for condition refresh                             |
| `SelectClauses`    | list of `SelectClause` | Optional, will be added as additional values, besides the pre-configured properties, see description of `SelectClause` below |
| `UseConditionData` | bool                   | Disable the default condition type handling and use the event type handling; default is `true` (Condition Handling)          |

##### Event type

The event type handles the non-persistent events and produces the [event data messages](../../machine-data/TapioDataCategories#event-data)

```XML
<SourceItem xsi:type="SourceEventItem">
  <NodeId>ns=2;s=PublicInterface</NodeId>
  <Provider>PublicInterface.M5-C1</Provider>
  <UseConditionData>false</UseConditionData>
  <SelectClauses>
    <SelectClause eventTypeId="nsu=FullNameSpace;s=sdsd" browsePath="Test" attribute="15" />
    <SelectClause attribute="16" />
    <SelectClause browsePath="EventType" />
  </SelectClauses>
</SourceItem>
```

The `SelectClause` has the following XML attributes (OPC UA):

| Entry         | Type    | Description                                                                                                    |
| ------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `eventTypeId` | string  | the event type node id, see [full node id](./Configuration#full-notation); default is `i=2041` (BaseEventType) |
| `browsePath`  | string  | the browse path to select; default is `""`                                                                     |
| `attribute`   | integer | the attribute to be used; default `13` (Value)                                                                 |

A value without attributes is **not allowed**:

```XML
<SelectClause />
```

When `eventTypeId` is configured then also `browsePath` or `attribute` has to be configured.

The select clauses defines the properties which will be transferred via the [EventData `vls`-property](../../machine-data/TapioDataCategories#event-data) or [ConditionData `vls`-property](../../machine-data/TapioDataCategories#condition) to the tapio system (based on `UseConditionData` property).

- Conditions: The select clauses will be used as additional clauses to the pre-configured select clauses.
- Events: When no select clauses are configured a default set of the *OPC UA BaseEventType* properties is used, otherwise only the configured are used

> Note: The `NodeId`-Attribute and a `Time`-Property should be always available
<!-- -->
> Note: If a generic event configuration does not filter out conditions/condition refresh and the containing source group does have another condition `SourceEventItem` and the `CyclicUpdateInSec` is enabled, the condition refresh will be send as generic events
> To avoid this put generic event configuration in a separate source group.

#### `SourceDataItem`

```XML
<SourceItem xsi:type="SourceDataItem">
  <NodeId>ns=2;s=Simu.0000000001.0001-State.CurrentStateGroup</NodeId>
  <SrcKey>State.CurrentStateGroup</SrcKey>
</SourceItem>
```

| Entry              | Type             | Description                                                                                                                                     |
| ------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `NodeId`           | object           | The node id of the data value; see [supported formats](./Configuration#node-identifier).                                                        |
| `SrcKey`           | string           | The identifier(key) used for transferring the values to the tapio system [See `k`](../../machine-data/TapioDataCategories#item-data)            |
| `TrimStrings`      | bool             | Optionally trim the string and remove whitespace and nul-characters; default is `false`                                                         |
| `QueueSize`        | unsigned integer | Optional queue size of the item/event changes queue on the server; will be cleared on every receive from the client; default is `-1` (max(int)) |
| `SamplingInterval` | integer          | Optional server sampling interval of the OPC UA item in ms; default is `-1` (sampling is the same as `UpdateIntervallInMs` )                    |
| `Provider`         | string           | Optional provider which can be used for grouping data                                                                                           |

#### `Targets`

```XML
<Targets>
  <Target>AzureIoTHub</Target>
  <Target>BatchAggregation</Target>
</Targets>
```

The targets configuration section defines the destinations of the received data from the OPC UA source group.
It is possible to have multiple Destination*-Modules, like Batch Aggregation or Azure IoT Hub. Batch Aggregation is used for long cycle or for size based transfers, while Azure IoT Hub is used for real time streaming.

