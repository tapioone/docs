# Machine Reporting

As a manufacturer, you can query information about your manufactured machines, to see how the machine is used and which applications are assigned to it. This will enable you to retrieve information about the customer usage of your machines.

## Reporting with cursor pagination

> POST `https://api.tapio.one/management/v2/manufacturer/machineinfo`

This endpoint returns a page of machine information, ordered by tapio machine ID. It supports both querying all eligible machines and filtering by a list of IDs. A JSON request body is required; use `{}` to request the first page with the default settings.

| Request property         | Description                                                                                         | Default               |
| ------------------------ | --------------------------------------------------------------------------------------------------- | --------------------- |
| `tapioMachineIds`        | Optional list of tapio machine IDs. An omitted or empty list requests all eligible machines.        | All eligible machines |
| `includeLimitedMachines` | Whether to include limited machines.                                                                | `false`               |
| `limit`                  | Maximum number of machines per page, from 1 to 200.                                                 | `200`                 |
| `cursor`                 | Exclusive tapio machine ID returned by the previous page. Omit it or use `null` for the first page. | `null`                |

For example, request the first page of a filtered list:

```json
{
  "tapioMachineIds": ["testmachine12", "testmachine13"],
  "includeLimitedMachines": false,
  "limit": 1
}
```

Example response when another page is available:

```json
{
  "data": [
    {
      "tmid": "testmachine12",
      "isCcInformationAvailable": true,
      "deviceType": "Machine",
      "deviceSubtype": null,
      "createdAt": "2026-01-01T10:00:00Z",
      "subscriptions": [],
      "isTapioReady": true
    }
  ],
  "cursor": "testmachine12",
  "invalidMachineInformation": []
}
```

To retrieve the next page, send the same request with `"cursor": "testmachine12"`. Keep `tapioMachineIds` and `includeLimitedMachines` unchanged across pages. Continue until the response `cursor` is `null`. The cursor is the last machine ID on the current page; the next page starts after it. Results are live reads, not a snapshot, so changes while paging can affect the results.

The response contains:

| Property                    | Description                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data`                      | Machine information for this page. See [ManufacturerMachineInformation](#manufacturermachineinformation).                                                          |
| `cursor`                    | Cursor for the next page, or `null` when no more results are available.                                                                                            |
| `invalidMachineInformation` | Errors for requested machine IDs not found in the eligible result set. These are returned on the first page only; collect them before requesting subsequent pages. |

An invalid machine ID format, cursor, or limit results in a `400 Bad Request`. A well-formed requested machine ID that is not found is reported in `invalidMachineInformation` instead.

## Reporting

> GET `https://api.tapio.one/management/manufacturer/machineinfo`

This legacy endpoint is deprecated. Use [cursor pagination](#reporting-with-cursor-pagination) for new integrations.

The following properties can be set via query parameter.

| Property               | Description                                                                                                                                                                      | Default | Datatype |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| includeLimitedMachines | If **false**, will only return machines with an existing manufacturer machine, if **true** the response will return limited machines that exist only in a customer subscription. | false   | bool     |
| page                   | Number of the page  **Obsolete** use the offset parameter instead                                                                                                                | 0       | int      |
| offset                 | Offset for paging                                                                                                                                                                | 0       | int      |
| size                   | Number of items per page **Obsolete**  use the limit parameter instead                                                                                                           | 200     | int      |
| limit                  | Number of items per request                                                                                                                                                      | 200     | int      |

### Response model

An example `JSON` response will then look like this:

``` json
{
  "ManufacturerMachineInformations" : [
    {
      "tmid": "testmachine12",
      "isCcInformationAvailable": true,
      "deviceType": "Machine",
      "deviceSubtype": null,
      "subscriptions": [
        {
          "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "customerMachineName": "Test super saw 5000",
          "state": "Active",
          "assignedApps": [
            {
              "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              "applicationName": "MachineBoard"
            }
          ]
        }
      ]
    }
  ]
}
```

## Reporting defined list of Tapio machine Ids

> POST `https://api.tapio.one/management/manufacturer/machineinfo`

This legacy endpoint is deprecated. Use [cursor pagination](#reporting-with-cursor-pagination) for new integrations.

The following properties can be set via query parameter.

| Property               | Description                                                                                                                                                                      | Default | Datatype |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| includeLimitedMachines | If **false**, will only return machines with an existing manufacturer machine, if **true** the response will return limited machines that exist only in a customer subscription. | false   | bool     |
| page                   | Number of the page **Obsolete**  use the offset parameter instead                                                                                                                | 0       | int      |
| offset                 | Offset for paging                                                                                                                                                                | 0       | int      |
| size                   | Number of items per page **Obsolete**  use the limit parameter instead                                                                                                           | 200     | int      |
| limit                  | Number of items per request                                                                                                                                                      | 200     | int      |

**Request body**

An example `JSON` request looks like this:

``` json
{
  "tmids" : ["testmachine12", "testmachine13"]
}
```

### Response model

An example `JSON` response will then look like this:

``` json
{
  "validMachineInformation" : [
    {
      "tmid": "testmachine12",
      "isCcInformationAvailable": true,
      "deviceType": "Machine",
      "deviceSubtype": null,
      "subscriptions": [
        {
          "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "customerMachineName": "Test super saw 5000",
          "state": "Active",
          "assignedApps": [
            {
              "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              "applicationName": "MachineBoard"
            }
          ]
        }
      ]
    }
  ],
  "invalidMachineInformation" : [
    {
      "message" : "Machine is not found testmachine13",
      "details" : []
    }
  ]
}
```

### Response Model Description

The legacy POST response contains the following properties:

| Property                   | Description                                                 | Datatype                                                            |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| validMachineInformation    | List of valid manufacturer machine information              | [ManufacturerMachineInformation](#manufacturermachineinformation)[] |
| invalidMachineInformation  | Errors for requested machine IDs not found                  | [ErrorInformation](#errorinformation)[]                             |

#### ManufacturerMachineInformation

| Property                 | Description                                     | Datatype                                              |
| ------------------------ | ----------------------------------------------- | ----------------------------------------------------- |
| tmid                     | tapio machine id                                | string                                                |
| isCcInformationAvailable | this machines has an CloudConnector             | bool                                                  |
| deviceType               | Kind of the device (Machine, SmartDevice)       | enum                                                  |
| deviceSubtype            | Device subtype of the device                    | string                                                |
| createdAt                | Creation time of the manufacturer machine       | date-time                                             |
| subscriptions            | list of customer subscriptions                  | [SubscriptionInformation](#subscriptioninformation)[] |
| isTapioReady             | Whether the manufacturer machine is tapio ready | bool                                                  |

#### SubscriptionInformation

| Property            | Description                                                      | Datatype                                            |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| subscriptionId      | Id of the subscription in which the machine is onboarded         | guid                                                |
| customerMachineName | Name of the machine in the customer subscription                 | string                                              |
| state               | State of the machine (Pending, Active, Declined, Limited, Error) | string                                              |
| assignedApps        | List of apps assigned to the machine                             | [ApplicationInformation](#applicationinformation)[] |

#### ApplicationInformation

| Property        | Description             | Datatype |
| --------------- | ----------------------- | -------- |
| applicationId   | Id of the application   | guid     |
| applicationName | Name of the application | string   |

#### ErrorInformation

| Property | Description                               | Datatype       |
| -------- | ----------------------------------------- | -------------- |
| message  | reason why this is an error               | string         |
| details  | optional set details why this is an error | list of string |
