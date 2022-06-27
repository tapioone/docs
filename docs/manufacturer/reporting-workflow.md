
# Machine Reporting

As a manufacturer, you can query information about your manufactured machines, to see how the machine is used and which applications are assigned to it. This will enable you to retrieve information about the customer usage of your machines.

## Reporting

> GET `https://api.tapio.one/management/manufacturer/machineinfo`

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
  ],
  "invalidMachineInformation" : []
}
```

## Reporting defined list of Tapio machine Ids

> POST `https://api.tapio.one/management/manufacturer/machineinfo`

The following properties can be set via query parameter.

| Property               | Description                                                                                                                                                                      | Default | Datatype |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| includeLimitedMachines | If **false**, will only return machines with an existing manufacturer machine, if **true** the response will return limited machines that exist only in a customer subscription. | false   | bool     |
| page                   | Number of the page **Obsolete**  use the offset parameter instead                                                                                                                | 0       | int      |
| offset                 | Offset for paging                                                                                                                                                                | 0       | int      |
| size                   | Number of items per page **Obsolete**  use the limit parameter instead                                                                                                           | 200     | int      |
| limit                  | Number of items per request                                                                                                                                                      | 200     | int      |

**Request body**

An example `JSON` response will then look like this:

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
    "message" : "Machine is not found testmachine13",
    "details" : [""]
  ]
}
```

### Response Model Description

As a response to this query, you will retrieve an array of manufacturerMachineInformations.

| Property                   | Description                                                 | Datatype                                                          |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| validMachineInformations   | list of valid manufacturer machine information              | [ManufacturerMachineInformation](#manufacturermachineinformation) |
| invalidMachineInformations | list of invalid requested tapio machine id and there reason | [ErrorInformation](#errorinformation)                             |

#### ManufacturerMachineInformation

| Property                 | Description                               | Datatype                                              |
| ------------------------ | ----------------------------------------- | ----------------------------------------------------- |
| tapioMachineId           | tapio machine id                          | string                                                |
| isCcInformationAvailable | this machines has an CloudConnector       | bool                                                  |
| deviceType               | Kind of the device (Machine, SmartDevice) | enum                                                  |
| deviceSubtype            | Device subtype of the device              | string                                                |
| subscriptions            | list of customer subscriptions            | [SubscriptionInformation](#subscriptioninformation)[] |

#### SubscriptionInformation

| Property            | Description                                                      | Datatype                                            |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| subscriptionId      | Id of the subscription in which the machine is onboarded         | guid                                                |
| customerMachineName | Name of the machine in the customer subscription                 | string                                              |
| state               | State of the machine (Pending, Active, Declined, Limited, Error) | string                                              |
| assignedApps        | List of apps assigned to the machine                             | [ApplicationInformation](#applicationinformation)[] |
| customerMachineName | Name of the customer subscription                                | string                                              |

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

