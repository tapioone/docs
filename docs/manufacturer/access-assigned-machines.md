# Accessing assigned machines

As an application developer you can query whether a specific machine is assigned to one of your applications. This is especially useful, if you write applications that run in the context of a machine. The workflow below can be used to verify your application has been assigned to the machine in question and is therefore allowed to run.

## Accessing Machines

> GET `https://api.tapio.one/management/application/machines?tmid={tapioMachineId}`

The following properties can be set via query parameter.

| Property | Required | Description                                                           | Datatype |
| -------- | ---------| --------------------------------------------------------------------- | -------- |
| tmid     | yes      |  Tapio machine id to query                                            | string   |

### Response model

An example `JSON` response will then look like this:

``` json
{
  "totalCount": 2,
  "data": [
    {
      "tmid": "machineid12345",
      "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "applicationId": "b718a624-96f2-4973-9f5b-823bc11dc370"
    },
    {
      "tmid": "machineid12345",
      "subscriptionId": "8b20a95a-7721-4d2c-84bc-efe9b9b482e6",
      "applicationId": "b718a624-96f2-4973-9f5b-823bc11dc370"
    }
  ]
}
```
The response contains the tapio machine id in question (`tmid`), as well as the `subscriptionId` of the subscription(s) in which the machine is onboarded. Most of the time, the response will only contain a single subscription. 

Additionally the `applicationId` is returned. This is automatically inferred from the access token you use. In certain licensing scenarios (e.g. Basic and Advanced licenses) multiple application ids can be returned. In this case it is the responsibility of your application to ensure that the desired license is contained in the response.
