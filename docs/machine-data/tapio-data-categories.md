# tapio Data Categories

There are several types of data available through the tapio ecosystem.

## Machine Data

tapio connected machines currently expose three types of data to the ecosystem.

| Data Type         | Description                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Streaming Data    | Current data values of the machine e.g. temperature, remaining time. Delivered in real time in a publish/subscribe way. To receive this data, you currently need an [Azure Event Hub](https://azure.microsoft.com/de-de/services/event-hubs/) instance. We'll provide a Webhook interface later this year.                                      |
| Batch Data        | Machine dependent data for long term analysis, based on `Streaming Data` but bundled in zip archives and is send in configurable intervals (e.g. once per day). To receive this data you currently need an [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction) instance with a `Queue Storage`. |
| Digital Twin Data | Based on `Streaming Data`, the last known state of the machine. Is actively requested. No real time or websocket here.                                                                                                                                                                                                                          |

## Streaming Data

The streaming data represents the real time information sent by a [CloudConnector](../manufacturer/cloud-connector), the streaming data will be written to configured azure event hub endpoints in real time.
The format is a `JSON` based container with the following message types:

| Message Type      | Description                                                                      |
| ----------------- | -------------------------------------------------------------------------------- |
| Item Data         | Delivers simple data values e.g. temperature, remaining time, energy consumption |
| Condition         | Condition updates like outstanding maintenance                                   |
| Condition Refresh | `Snapshot` of current condition states                                           |
| Event Data        | OPC UA Events                                                                    |
| Offline message   | Sent when the machine state switches to offline                                  |

An example of the `JSON`-Container format:

```json
{
  "tmid": "MachineId",
  "msgid": "bf8610fa-a5e9-4ede-ad37-51082e7eb372",
  "msgt": "cond",
  "msgts": "2017-06-29T10:39:03.7651013+01:00",
  "msg":  // json object payload based on msgt value
}
```

> NOTE: All the JSON properties are using a short name format to reduce the size of the messages due technical limitations of Azure Event Hub & Azure IoT Hub

| Property | Description                                             |
| -------- | ------------------------------------------------------- |
| tmid     | string: the tapio machine id                            |
| msgid    | string: a unique id for this message                    |
| msgt     | string: the type of the message payload, see list below |
| msgts    | string: ISO8601 timestamp                               |
| msg      | object: message payload, type is defined by `msgt`      |

| Message type                          | Description                             |
| ------------------------------------- | --------------------------------------- |
| `"msgt": "itd"`                       | [Item Data](#item-data)                 |
| `"msgt": "cond"`                      | [Condition](#condition)                 |
| `"msgt": "conds"` / `"msgt": "conde"` | [Condition Refresh](#condition-refresh) |
| `"msgt": "gooffline"`                 | [Offline Message](#offline-message)     |

### Item Data

> Used Message Type: `"msgt": "itd"`

An example message payload for an **it**em **d**ata message:

```json
{
  "p": "provider",
  "k": "temperature01",
  "vt": "f",
  "v": 42.43,
  "u": "c",
  "q": "g",
  "sts": "2017-06-29T10:38:43.7606016+01:00",
  "rts": "2017-06-29T10:38:53.7606016+01:00"
}
```

| Property | Description                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| p        | string: The `provider` field is a configurable grouping string to describe the logical `source` of item data messages, set by machine manufacturer |
| k        | string: the key name, represents usually an OPC UA node id, can be configured by machine manufacturer inside CloudConnector configuration file     |
| vt       | string: data value type, defines the datatype of the value property `v`, see list below                                                            |
| v        | value: the value, defined by value type property `vt`, see list below                                                                              |
| u        | optional string: unit of the value, e.g. `c` for celsius                                                                                           |
| q        | string: quality of the value, given by OPC UA server, `g` is good, `b` is bad, `u` is uncertain                                                    |
| sts      | string: source time stamp, sent by the OPC UA server, ISO8601 format                                                                               |
| rts      | string: receive time stamp, set by the CloudConnector (local time of CloudConnector), ISO8601 format                                               |

For the field `vt` the following **string** values are valid (`"vt":"<type>"`)

| Value Type   | Description                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `"vt":"s"`   | string values, represented as json string `"v": "value"`                                       |
| `"vt":"i"`   | integer values, represented as json number `"v": 5`                                            |
| `"vt":"f"`   | float values, represented as json number `"v": 5.24`                                           |
| `"vt":"n"`   | for “null”, unknown data type, `v` is not set or `"v" : null`                                  |
| `"vt":"dt"`  | datetime values, represented as ISO8601 json string `"v": "2017-06-29T10:38:43.7606016+01:00"` |
| `"vt":"b"`   | for byte array values. Represented as base64 json string `"v": "dA=="`                         |
| `"vt":"dss"` | string dictionary, json object `"v" : { "key1":"value",  "key2":"value" }`                     |

### Condition

> Used Message Type: `"msgt": "cond"`

A condition state update, will be send by CloudConnector when a condition occurs or disappears.

```json
{
  "p": "provider",
  "k": "key",
  "s": "source",
  "as": 1,
  "sv": 100,
  "ls": {
    "de": "Source 01-Deutsch",
    "en": "Source 01-English"
  },
  "lm": {
    "de": "Deutscher Text",
    "en": "English Text"
  },
  "vls": {
    "key1": {
      "t": "i",
      "v": 42
    },
    "key2": {
      "t": "f",
      "v": 41.45
    }
  },
  "sts": "2017-06-29T13:36:50.9516141+01:00",
  "rts": "2017-06-29T13:37:00.9516141+01:00"
}
```

| Property | Description                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| p        | string: The `provider` field is a configurable grouping string to describe the logical `source` of conditions, set by machine manufacturer |
| k        | string: Key, the opc ua node id of the condition node                                                                                      |
| s        | string: Source, the opc ua node id of the receiving node                                                                                   |
| as       | number: The active status as integer, `0` = Uncertain, `1` = Active, `2` = Inactive                                                        |
| sv       | number: The severity, value between 1 and 1000                                                                                             |
| ls       | optional object: localized source text                                                                                                     |
| lm       | optional object: localized message text                                                                                                    |
| vls      | optional object: additional value list, for `t` and `v` see equivalent type description in Item Data section (`vt` + `v`)                  |
| sts      | string: source time stamp, sent by the OPC UA server, ISO8601 format                                                                       |
| rts      | string: receive time stamp, set by the CloudConnector (local time of CloudConnector), ISO8601 format                                       |

### Condition Refresh

> Used Message Types: `"msgt": "conds"` and `"msgt": "conde"`

The condition refresh is a regularly update of the condition state of an OPC UA server node, it is used to make sure the current state representation inside tapio is correct, e.g. when a condition inactive update got lost because of technical issues like an unstable internet connection it would be still considered as active. To keep a consistent state of the active conditions the CloudConnector regularly sends a snapshot of all active conditions to clean up orphaned condition states.

A condition refresh sends the following message set:

```plaintext
Condition (Refresh) Start Message
    <List of Condition State Messages>
Condition (Refresh) End Message
```

It starts with a condition refresh start message followed by the list of active conditions (see [Condition](#condition) data description) and closed by a condition refresh end message

Both messages (`conds`, `conde`) are using the following format:

```json
{
  "p": "provider",
  "sts": "2017-06-29T13:36:50.9516141+01:00",
  "rts": "2017-06-29T13:37:00.9516141+01:00"
}
```

### Event Data

> Used Message Types: `"msgt": "evd"`

Example:

```json
{
    "p" : "provider",
    "k" : "key",
    "s" : "source",
    "vls" : {
        "NodeId" : {
            "t": "s",
            "v" : "ns=2;s=Server.NodeId"
        }
    },
    "sts" : "2019-01-31T10:52:50+0000",
    "rts" : "2019-01-31T10:52:50+0000"
}
```

Model:

| Property | Description                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| p        | string: The `provider` field is a configurable grouping string to describe the logical `source` of events, set by machine manufacturer      |
| k        | string: Key, the opc ua node id of the event node                                                                                           |
| s        | string: Source, the opc ua node id of the receiving node                                                                                    |
| vls      | object: Typed dictionary where the key is the value name. For `t` and `v` see equivalent type description in Item Data section (`vt` + `v`) |
| sts      | string: source time stamp, sent by the OPC UA server, ISO8601 format                                                                        |
| rts      | string: receive time stamp, set by the CloudConnector (local time of CloudConnector), ISO8601 format                                        |

### Offline Message

> Used Message Type: `"msgt": "gooffline"`

A message without payload, will be sent by CloudConnector on shutdown or is sent by the tapio system when no message has been received for two minutes.

## Batch Data

Batch data's data structure is similar to the structure of [streaming data](#streaming-data) but the messages will be transferred inside zip files.

An application will receive a `JSON` message to the configured azure storage account queue when a new batch archive is available.
The message has the following content:

```json
{
    "tmid": "<MachineId>",
    "downloadUri": "<RFC3986 Uri>",
    "expiry": "<ISO8601>",
    "messageType": "batch"
}
```

| Property    | Type   | Description                                                                                                                                             |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tmid        | string | The tapio machine id                                                                                                                                    |
| downloadUri | string | An HTTPS URI to download the batch data file (zip archive)                                                                                              |
| expiry      | string | An ISO8601 string to specify the lifetime of the download link                                                                                          |
| messageType | string | The type of the message. In case of batch data this type has to be `batch` otherwise the message can be ignored. Available values `batch` or `generic`. |

The download uri can be used to download a zip file with the following content:

The zip files usually have this file name schema:

```plaintext
2018-08-29_07-51-10_0000000001_9bc51540-f174-4677-be73-0c51201cbdd9.zip
<Date>_<Timestamp>_<TapioMachineId>_<UniqueId>.zip
```

The zip contains multiple batch json files with the following file name schema:

```plaintext
2018-08-29_07-35-04_6c3b08f2-efee-47ac-8a19-bc4be03d5198.json
<Date>_<Timestamp>_<BatchId>.json
```

> NOTE: the file name schema is not fixed and can change

Each of this json files have the following `JSON` schema:

```json
{
    "tx-batchid": "6c3b08f2-efee-47ac-8a19-bc4be03d5198",
    "tx-batchts": "2018-08-29T09:35:04.1954284+02:00",
    "messages": [
        {
            "tx-tmid": "0000000001",
            "tx-msgid": "aa7cc183-3efb-4cc3-aede-0b74994c61e0",
            "tx-msgtype": "itd",
            "tx-msgts": "2018-08-29T09:35:04.2004294+02:00",
            "msg_payload": {
                "p": "StatesAndCounters",
                "v": "MmrCounter000-2018-08-29T09:05:01.3396141+02:00",
                "k": "ns=2;s=Simu.0000000001MMRCounter.MmrCounterMMR01Counter000",
                "vt": "s",
                "q": "g",
                "sts": "2018-08-29T09:35:04.2044296+02:00",
                "rts": "2018-08-29T09:35:04.2044296+02:00"
            }
        },
        ...
    ]
}
```

| Property   | Description                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| tx-batchid | string: the batch id, set for each set of changes occurred inside machines                                                                |
| tx-batchts | string: ISO8601 timestamp                                                                                                                 |
| messages   | array of objects: array of messages, each message format is similar to streaming data (same structure, slightly different property names) |

## Generic Data

The structure of `Generic Data` is not defined by tapio. The receiving application needs to know how to handle the data itself.

An application will receive a `JSON` message to the configured azure storage account queue when a new generic data file is available.
The message has the following content:

```json
{
    "tmid": "<MachineId>",
    "downloadUri": "<RFC3986 Uri>",
    "expiry": "<ISO8601>",
    "messageType": "generic",
    "sourceKey": "Spindle.Health"
}
```

| Property    | Type   | Description                                                                                                                                                 |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tmid        | string | The tapio machine id                                                                                                                                        |
| downloadUri | string | An HTTPS URI to download the generic data file                                                                                                              |
| expiry      | string | An ISO8601 string to specify the lifetime of the download link                                                                                              |
| messageType | string | The type of the message. Available values `batch` or `generic`. |
| sourceKey   | string | Key that is used to identify the data, which is defined in the [XML module configuration](./../manufacturer/cloud-connector/large-file-upload-module).       |

## Last known state

The digital twin data or the last known state representation of a machine

Example response:

```json
[
    {
        "tmid": "0000000002aabb",
        "itds": [
            {
                "p": "StatesAndCounters",
                "v": 0,
                "k": "LeftPanelStates.000.State",
                "vt": "i",
                "u": null,
                "q": "g",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
                "p": "StatesAndCounters",
                "v": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAG9SURBVFhH7ZY9SANBEEbvTCIWapXCMlYBqyiks0ghWIqokMpesBNSaClCrIQU2ghaBEFsgtgY7QJiZ28jVgoRsRIVyfnmbhAhhtvF5CIkDz5mdnZnd3bvh3X69Dxuo9HYcF13RNvGeJ4XI29L/V3Mq/iWxKSAGybKaMCWcbV3aq2g8Ee/APwERZwF4XBIzDB+Fve7AGIX2GrQNGIBpRwpANWCmBksVkRCSuUxx752G8H4CnoY0HbXkALk6M79liFs+Aod4L6gJ7SNTpENZWR1av8XTiPJ80xrM3pYfA/dowLFxDUcHSw8j+S9kK+hiqa0KxRXbRPMNYQZC1rh6M5XkHzfg6jMv2IdfeLbwy7ysqO/wBw1TE6n/JVO/wcSalvStkcgkLOKWUSjSB5BAb1JX0fhqLPoUo/9GjOjXdHAokfoGZX05KKFhdOR77ptUP0akhfHGHY7LXnYYTly/Dya0G4jGJ8ld0mcOqpo3AgSm+4DUNRuIxh/yLrdvw/IlayOvUUnfsSMHN/3HPbnlewYa3OSy2jSL4DJkkHMmrZcSnco4F1jxpAsF9lN3Dh+Cf8j6DGHvJZ/4j69guN8AW62ZXUM0zjWAAAAAElFTkSuQmCC",
                "k": "LeftPanelStates.000.Image",
                "vt": "b",
                "u": null,
                "q": "g",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
                "p": "StatesAndCounters",
                "v": {
                    "de": "Ein",
                    "en": "Off"
                },
                "k": "LeftPanelStates.000.Text",
                "vt": "dss",
                "u": null,
                "q": "g",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
                "p": "StatesAndCounters",
                "k": "LeftPanelStates.000.Value",
                "vt": "n",
                "u": null,
                "q": "b",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
                "p": "StatesAndCounters",
                "v": 0,
                "k": "LeftPanelStates.000.IsVisible",
                "vt": "i",
                "u": null,
                "q": "g",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            }
        ],
        "conds": [
            {
                "p": "AlarmsAndErrors",
                "k": "ns=2;s=Simu.0000000002AaBb.0002-ConditionError01",
                "s": "ns=2;s=Simu.0000000002AaBb",
                "as": 1,
                "sv": 1000,
                "ls": null,
                "lm": {
                    "de": "Dies ist ein Fehler",
                    "en": "This is an error"
                },
                "vls": {
                    "SourceNode": {
                        "t": "n"
                    },
                    "AckedState/Id": {
                        "v": 0,
                        "t": "i"
                    }
                },
                "sts": "2018-09-03T13:53:08.1804467+02:00",
                "rts": "2018-09-03T13:53:08.4125751+02:00"
            },
            {
                "p": "AlarmsAndErrors",
                "k": "ns=2;s=Simu.0000000002AaBb.0002-ConditionMaintenance01",
                "s": "ns=2;s=Simu.0000000002AaBb",
                "as": 1,
                "sv": 200,
                "ls": null,
                "lm": {
                    "de": "Dies ist eine Wartung",
                    "en": "This is a maintenance"
                },
                "vls": {
                    "SourceNode": {
                        "t": "n"
                    },
                    "AckedState/Id": {
                        "v": 0,
                        "t": "i"
                    }
                },
                "sts": "2018-09-03T13:53:08.8505748+02:00",
                "rts": "2018-09-03T13:53:09.4075737+02:00"
            }
        ]
    }
]
```

The basic structure:

```json
[
    {
        "tmid": "0000000002aabb",
        "itds": [],
        "conds": []
    },
    {
        "tmid": "0000000001aabb",
        "itds": [],
        "conds": []
    },
]
```

An array of machine data values:

| Property | Description                                                                             |
| -------- | --------------------------------------------------------------------------------------- |
| tmid     | string: The tapio machine ids                                                           |
| itds     | array: The current data value set, see `Streaming data - Item Data` for structure       |
| conds    | array: The current active condition set, see `Streaming data - Condition` for structure |

## Notes

If you have further questions on data categories, don't hesitate to contact [developer@tapio.one](mailto:developer@tapio.one).

