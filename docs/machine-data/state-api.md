
# Access the State of a Machine

The tapio (core) State API is part of the tapio core system and provides information about the digital device twin of a machine inside tapio. You can retrieve the current state of a machine trough the State API. You won't receive realtime events, when the current state of a machine changes.

It can be used to get the current state of tapio machines.

## Query Machine State

> To be able to make requests to the State API, you first need to [register a tapio application](../General/RegisterTapioApplication) and assign machines to the application. **You won't receive data** for machines that are not assigned to your application.  
> **Authentication** for State API is done via Azure AD B2C. See our [guide on authentication](../General/Authentication#non-interactive-authentication) for more details.

You can retrieve the latest state of a machine using the following request:

`POST https://core.tapio.one/api/machines/state`

> Use the ResourceId `https://tapiousers.onmicrosoft.com/CoreApi` for the token request otherwise you get an Unauthorized.

You may wonder, why we are using an `HTTP POST` request to query data. We're using `HTTP POST` because, we're passing the actual query (containing machine id's etc.) in the request body. State API is even capable of processing multiple queries in one request.
This means, our request body will contain an array of `JSON` object, each representing a query:

> NOTE: Use `Content-Type: application/json;charset=UTF-8` in your request headers

Basic structure of request body is a `JSON` array of machine queries:

```json
[
    {
        "tmid": "0000000001aabb",
        "ks": [],
        "excond": true
    },
    {
        "tmid": "0000000002aabb",
        "ks": [],
        "excond": false,
        "exitd": false
    },
    ...
]
```

Each machine query has the following properties:

| Property | Description                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| tmid     | string: The tapio machine id                                                                                                 |
| ks       | array of strings: List of [item data](./TapioDataCategories#item-data)  keys to return, returns **ALL** item data when empty |
| excond   | optional bool: return also [condition](./TapioDataCategories#condition) states in response                                   |
| exitd    | optional bool: do not return any data item information in response, overrules `ks`                                           |

Example request:

```json
[
    {
        "tmid": "0000000001aabb",
        "ks": [
            "State.CurrentStateGroup",
            "State.CurrentStateDescription",
            "DigitalTwin!AliveState",
            "RemainingTime.RemainingTimeInSec",
            "RemainingTime.TimePaused",
            "RemainingTime.TotalTimeInSec"
        ],
        "excond": true
    },
    {
        "tmid": "0000000002aabb",
        "ks": [
            "State.CurrentStateGroup",
            "State.CurrentStateDescription",
            "DigitalTwin!AliveState",
            "Energy!ElectricPower"
        ],
        "excond": true
    }
]
```

The State API will then return an array of the requested machine states.

Basic structure of response body is a `JSON` array of machine queries:

Each machine query has the following properties:

| Property | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| tmid     | string: The tapio machine id                                              |
| itds     | array of [item date](./TapioDataCategories#item-data): List of item data. |
| conds    | array of [condition](./TapioDataCategories#condition): List of condition. |

```json
[
    {
        "tmid": "0000000002aabb",
        "itds": [],
        "conds": []
    }
]
```

The struct of [itds](./TapioDataCategories#item-data) and [conds](./TapioDataCategories#condition) are described.

```json
[
    {
        "tmid": "0000000002aabb",
        "itds": [
            {
                "v": 0,
                "k": "LeftPanelStates.000.State",
                "vt": "i",
                "u": null,
                "q": "g",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
                "v": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAG9SURBVFhH7ZY9SANBEEbvTCIWapXCMlYBqyiks0ghWIqokMpesBNSaClCrIQU2ghaBEFsgtgY7QJiZ28jVgoRsRIVyfnmbhAhhtvF5CIkDz5mdnZnd3bvh3X69Dxuo9HYcF13RNvGeJ4XI29L/V3Mq/iWxKSAGybKaMCWcbV3aq2g8Ee/APwERZwF4XBIzDB+Fve7AGIX2GrQNGIBpRwpANWCmBksVkRCSuUxx752G8H4CnoY0HbXkALk6M79liFs+Aod4L6gJ7SNTpENZWR1av8XTiPJ80xrM3pYfA/dowLFxDUcHSw8j+S9kK+hiqa0KxRXbRPMNYQZC1rh6M5XkHzfg6jMv2IdfeLbwy7ysqO/wBw1TE6n/JVO/wcSalvStkcgkLOKWUSjSB5BAb1JX0fhqLPoUo/9GjOjXdHAokfoGZX05KKFhdOR77ptUP0akhfHGHY7LXnYYTly/Dya0G4jGJ8ld0mcOqpo3AgSm+4DUNRuIxh/yLrdvw/IlayOvUUnfsSMHN/3HPbnlewYa3OSy2jSL4DJkkHMmrZcSnco4F1jxpAsF9lN3Dh+Cf8j6DGHvJZ/4j69guN8AW62ZXUM0zjWAAAAAElFTkSuQmCC",
                "k": "LeftPanelStates.000.Image",
                "vt": "b",
                "u": null,
                "q": "g",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
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
                "k": "LeftPanelStates.000.Value",
                "vt": "n",
                "u": null,
                "q": "b",
                "sts": "2018-09-03T13:51:32.099116+02:00",
                "rts": "2018-09-03T13:51:35.3033155+02:00"
            },
            {
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

## Query Machine State V2

`POST https://core.tapio.one/api/v2/machines/state`

The main advantage of new version of api is that caller receives proper information about machine state, especially online/offline via "isOnline" property. In old route, in case that machine is offline, the client received just an empty response, which is quite confusing. An other advantage is that new route returns back a reponse, which consists of valid data and invalid data. Invalid data contains information about which requests where failed and what was a reason. It helps client to diagnose and better understand an issue.

Basic structure of request body is a `JSON` array of machine queries:

```json
[
    {
        "tmid": "0000000001aabb",
        "ks": [],
        "excond": true
    },
    {
        "tmid": "0000000002aabb",
        "ks": [],
        "excond": false,
        "exitd": false
    },
    ...
]
```

Each machine query has the following properties:

| Property | Description                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| tmid     | string: The tapio machine id                                                                                                 |
| ks       | array of strings: List of [item data](./TapioDataCategories#item-data)  keys to return, returns **ALL** item data when empty |
| excond   | optional bool: return also [condition](./TapioDataCategories#condition) states in response                                   |
| exitd    | optional bool: do not return any data item information in response, overrules `ks`                                           |

Example request:

```json
[
    {
        "tmid": "0000000001aabb",
        "ks": [
            "State.CurrentStateGroup",
            "State.CurrentStateDescription",
            "DigitalTwin!AliveState",
            "RemainingTime.RemainingTimeInSec",
            "RemainingTime.TimePaused",
            "RemainingTime.TotalTimeInSec"
        ],
        "excond": true
    },
    {
        "tmid": "0000000002aabb",
        "ks": [
            "State.CurrentStateGroup",
            "State.CurrentStateDescription",
            "DigitalTwin!AliveState",
            "Energy!ElectricPower"
        ],
        "excond": true
    }
]
```

The State API will then return a structure, which consists of an array of the requested machine states and an array of invalid requests.

Basic structure of response body is a `JSON` object:

```json
{
    "lastKnownStateResponses": [ // an array of valid last know state responses
        {
            "tmid": "1122334455",
            "itds": [],
            "conds": [],
            "isOnline": false // machine is offline
        },
        {
            "tmid": "1122334455",
            "itds": [...],
            "conds": [...],
            "isOnline": true // machine is online
        }
    ],
    "invalidRequests": [ // an array of invalid requests
        {
            "request": { // failed request
                "tmid": "tdmtest223344556677",
                "ks": [],
                "excond": false,
                "exitd": false
            },
            "code": "403", // error code
            "message": "The application with clientId '24af0cc6-89a2-402c-ade7-cd4dfc25a62e' is not allowed to read the state of the machine 'tdmtest223344556677'.", // error message
            "details": [] // error details
        }
    ]
}
```

You will find a detailed description on the response object within our documentation about [Data Categories - Last known state](./TapioDataCategories#last-known-state).

[Read historical data](./HistoricalData)
