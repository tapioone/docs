---
sidebar_label: Global Customer Settings
---

# Access global customer settings via the Global Discovery Service

tapio's Global Discovery Service API enables to retrieve information of subscriptions. For example, you can retrieve information about application settings which the customer has set, like paper format if you want to print something via a tapio connected application.

> Global Discovery Service API is rate limited based on client id for all routes.

If your application makes too many requests, HTTP status code `429` is returned. A `Retry-After` header is included in this response which indicates how long to wait before making the next request. [HTTP 429 standard](https://datatracker.ietf.org/doc/html/rfc6585#section-4) is followed.

## Query application settings

> GET `https://globaldisco.tapio.one/api/applicationSettings?subscriptionId={subscriptionId}&offset={offset}&limit={limit}`

| Parameters     | Description                                                                                                                     | Datatype     | Mandatory | Default |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------- | ------- |
| subscriptionId | The Id of a specific subscription. If no subscription id is specified it will query all subscriptions where you have access to. | string(Guid) | No        | -       |
| offset         | The offset is the position in the dataset of a particular record. Offset hast to be >= 0.                                       | int          | No        | 0       |
| limit          | The limit defines the maximum of records which are requested. Limit has to be 1 >= 200.                                         | int          | No        | 25      |

If your application is configured to receive CloudEvents, it will receive an [Application-Settings-Changed-CloudEvent](./cloud-events#application-settings-updated-event) when there are new application settings available.

### Response Model Description

As a response to this query, you will retrieve an array of objects, wrapping the actual data with the following properties:
> The totalCount defines how many records are total available.

| Properties           | Description                                                                                                                                                       | Datatype                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| subscriptionId       | The Id of the subscription.                                                                                                                                       | string(Guid)                                                    |
| countryId            | The country a customer specified for his company during registration as 2-letter code according [ISO 3611-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)    | string                                                          |
| internationalization | Internationalization object.                                                                                                                                      | [Internationalization](#internationalization-model-description) |
| logo                 | Logo object contains information about the uploaded company logo as png format. In case the customer has not specified a logo you will get null for this property | [Logo](#logo-model-description)                                 |

#### Internationalization Model Description

| Properties    | Description                                                                                                                                                                                                                                                                                                                 | Datatype |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| locale        | Locale information according [culture information name of .NET](https://docs.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo?view=net-5.0), e.g. "de-DE", "en-US" more information, like the. This represents the locale specific settings for e.g. system emails, calendar format, number format and more. | string   |
| timeZone      | Name of the time zone where the customer is located [(as windows standard)](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones).                                                                                                                                                      | string   |
| currency      | Currency id based on [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217).                                                                                                                                                                                                                                                    | string   |
| systemOfUnits | System of units. Possible values: `metric` and `imperial`.                                                                                                                                                                                                                                                                  | string   |
| paperFormat   | Format of the paper. Possible values: `A4` and `Letter`.                                                                                                                                                                                                                                                                    | string   |

#### Logo Model Description

- The URL path will change when the customer changes their logo
- Be aware that the URLs **expire**. They are valid for a minimum of two weeks. New urls will be returned at least two weeks before the previous ones expire.

| Properties | Description                                                     | Datatype |
| ---------- | --------------------------------------------------------------- | -------- |
| uri        | Uri to the company logo with original size.                     | string   |
| thumbnail  | Uri to the company logo as thumbnail with the size 64x64 pixel. | string   |

### Response body example

An example JSON response will then look something like this:

``` json
{
    "totalCount": 1,
    "data": [
        {
            "subscriptionId": "b11fb489-6814-43b4-9803-b152812f441d",
            "countryId": "DE",
            "internationalization": {
                "locale": "de-DE",
                "timeZone": "W. Europe Standard Time",
                "currency": "EUR",
                "systemOfUnits": "Metric",
                "paperFormat": "A4"
            },
            "logo": {
                "uri": "https://sacusprodwe01.blob.core.windows.net/customerlogos/b11fb489-6814-43b4-9803-b152812f441d%2F1ef6cb32-379e-442f-8dc4-874bcc6de967?sv=2020-04-08&st=2021-02-28T00%3A00%3A00Z&se=2021-04-03T00%3A00%3A00Z&sr=b&sp=r&sig=Xs%2Fx%2FmNLEvsSDpc2r6NN0HCxEDfLUTnA0RakbPlepH8%3D",
                "thumbnail": "https://sacusprodwe01.blob.core.windows.net/customerlogos/b11fb489-6814-43b4-9803-b152812f441d%2F1ef6cb32-379e-442f-8dc4-874bcc6de967_thumbnail?sv=2020-04-08&st=2021-02-28T00%3A00%3A00Z&se=2021-04-03T00%3A00%3A00Z&sr=b&sp=r&sig=dBpjFoP1Kt%2F5PYBnOx%2Fok1VUD02h8yxdGa7a5tTvEKY%3D"
            }
        }
    ]
}
```

> If a customer has not set any information, default values will be provided depending on the country specified during registration.

### HTTP Status codes

| Status Code | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| 200         | The request has succeeded (OK).                                                   |
| 400         | The server could not understand the request due to invalid syntax (Bad Request).  |
| 401         | The client must authenticate itself to get the requested response (Unauthorized). |

