# CloudEvents

# Motivation

For tapio, CloudEvents present the desired message format for decoupling systems and facilitate event driven architectures. They allow us to have common guidelines about how distributed messages should be formatted, so we can focus on the actual content of the message.

Extracts from the [CloudEvents Primer](https://github.com/cloudevents/spec/blob/v1.0/primer.md):
> CloudEvents are typically used in a distributed system to allow for services to be loosely coupled during development, deployed independently, and later can be connected to create new applications.
>
> The goal of the CloudEvents specification is to define interoperability of event systems that allow services to produce or consume events, where the producer and consumer can be developed and deployed independently.
>
> CloudEvents, at its core, defines a set of metadata, called attributes, about the event being transferred between systems, and how those pieces of metadata should appear in that message. This metadata is meant to be the minimal set of information needed to route the request to the proper component and to facilitate proper processing of the event by that component. So, while this might mean that some of the application data of the event itself might be duplicated as part of the CloudEvent's set of attributes, this is to be done solely for the purpose of proper delivery, and processing, of the message. Data that is not intended for that purpose should instead be placed within the event (data) itself.

# CloudEvents Specification

We recommend you take a look at the specification first:

<https://github.com/cloudevents/spec>

- [Core Specification](https://github.com/cloudevents/spec/blob/v1.0/spec.md)
- [JSON Event Format](https://github.com/cloudevents/spec/blob/v1.0/json-format.md)

# Why you may want to use CloudEvents

The main purpose of CloudEvents is for applications to be able to show users the most up-to-date data available, without constantly needing to call tapio for data which did not change.
As such, CloudEvents mainly enable a poke/pull style of architecture: We tell you that something has changed (*poke*), and you call our APIs to get the new data (*pull*). The most common use case is caching the user profile returned by GlobalDiscoveryService. When the customer assigns a new machine to your application, you get an event and know that there is updated data.
With this style of architecture, we strive to tell you just enough about **what** changed, but not **how** it changed. You will always need to pull the new data. This way, you don't have to worry about preserving the order of events, since calling the API will always yield you the result you need.

# How Your Application can Receive CloudEvents

## Configuration in tapio

Please contact us in order to set this up. A self-service UI is in our backlog.

## HTTP Endpoints

Data is sent via POST in **structured content mode**.

- [HTTP Protocol Binding](https://github.com/cloudevents/spec/blob/v1.0/http-protocol-binding.md)
- [Web Hook](https://github.com/cloudevents/spec/blob/v1.0/http-webhook.md)

> ℹ We are currently not performing webhook validation of your HTTP endpoints when they are being set up. You are encouraged to set them up anyways, see webhook spec mentioned above.

Authentication options:

- Client Certificate
- OAuth2 Client Credentials Flow via Azure Active Directory (you can use ours, or your own if you prefer)
- Custom headers

An easy way to process the events is the [official CloudEvents SDK](https://github.com/cloudevents/sdk-csharp).

```csharp
#r "nuget: CloudNative.CloudEvents.AspNetCore"

var cloudEvent = await HttpContext.Request.ReadCloudEventAsync();
// Should always be the case when we send in structured content mode, and the default (JsonEventFormatter) is used.
if (cloudEvent.Data is JToken jtoken)
{
    MyClass myData = jtoken.ToObject<MyClass>();
}
else {/* Error handling */}

// -------------
// OR
// -------------

public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc(opts =>
    {
        opts.InputFormatters.Insert(0, new CloudEventJsonInputFormatter());
    });
}
//...
[HttpPost("resource")]
public IActionResult ReceiveCloudEvent([FromBody] CloudEvent cloudEvent)
{
    if (cloudEvent.Data is JToken jtoken)
    {
        MyClass myData = jtoken.ToObject<MyClass>();
    }
    else {/* Error handling */}
    return Ok();
}

```

## Service Bus Endpoints

Support for queues and topics. We always set a `sessionId` property, usually the customer `subscriptionId`, in case the target requires sessions. We format our events according to the [AMQP Protocol Binding](https://github.com/cloudevents/spec/blob/v1.0/amqp-protocol-binding.md) in **binary content mode**.

Processing of incoming messages can be done with the Nuget Package [CloudNative.CloudEvents.AzureServiceBus](https://www.nuget.org/packages/CloudNative.CloudEvents.AzureServiceBus/)

```csharp
var queueClient = new QueueClient("...", "queueName");

queueClient.RegisterSessionHandler(async (session, msg, cancellationToken) => {

    msg.IsCloudEvent(); // Will be true

    var cloudEvent = msg.ToCloudEvent();

    // Deserialize into what you need
    var json = Encoding.UTF8.GetString(cloudEvent.Data as byte[]);

    await Task.CompletedTask;
}, (e) => /*Error handling */);

await Task.Delay(TimeSpan.FromSeconds(10));
await queueClient.CloseAsync();
```

# Available CloudEvents

> ⚠
>
> You might receive CloudEvents that are not (yet) documented on this page. You can consider these *preview* events which are not supported for production use. Your application should not reject unknown events, they should be treated as successfully processed.
>
> You might see some additional properties in the payloads you receive. Any undocumented properties may change without prior notice and should be considered unsafe for production use.

## Full CloudEvent Example 1.0

Example of structured content mode.

```json
{
    "type": "one.tapio.selfservice.machinetoapplicationassignmentchanged",
    "specversion" : "1.0",
    "source": "one.tapio.selfservice",
    "id": "22d65a83-3716-472a-b2b9-bf28f49f87db",
    "time": "2020-07-27T12:17:20.1360490Z",
    "datacontenttype": "application/json",
    "data": {
        "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
        "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936",
        "tmids": {
            "added": [
                "hg12345678"
            ],
            "removed": []
        }
    },
    "subject": null,
    "schemaUrl": null,
}
```

## Machine Assignment Events

`one.tapio.selfservice.machinetoapplicationassignmentchanged`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936",
    "tmids": {
        "added": [
            "hg12345678"
        ],
        "removed": []
    }
}
```

## User Assignment Events

`one.tapio.selfservice.usertoapplicationassignmentchanged`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936",
    "users": {
        "added": [
            "max.mustermann@examplecorp.com"
        ],
        "removed": []
    }
}
```

## License Events

`one.tapio.selfservice.application.license.changed`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936",
}
```

## Shopfloor Events

Fired for all events which affect the customer's view in the shopfloor editor in my tapio.

`one.tapio.selfservice.equipmenthierarchy.machine.created`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "tmid": "hg1234567"
}
```

`one.tapio.selfservice.equipmenthierarchy.machine.updated`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "tmid": "hg1234567"
}
```

`one.tapio.selfservice.equipmenthierarchy.machine.deleted`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "tmid": "hg1234567"
}
```

`one.tapio.selfservice.equipmenthierarchy.machine.parentchanged`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "tmid": "hg1234567"
}
```

`one.tapio.selfservice.equipmenthierarchy.group.created`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19"
}
```

`one.tapio.selfservice.equipmenthierarchy.group.updated`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19"
}
```

`one.tapio.selfservice.equipmenthierarchy.group.parentchanged`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19"
}
```

`one.tapio.selfservice.equipmenthierarchy.positions.updated`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19"
}
```

## Application Settings Updated Event

`one.tapio.selfservice.application.settings.changed`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19"
}
```

## Application Terms of Use Published Event

Fired when new terms of use have been published for an application in a developer subscription.
The application then may get the latest terms of use through the [Get Terms Of Use](../api/gds/get-terms-of-use.api.mdx) Global Discovery Service API route.

`one.tapio.selfservice.applicaton.termsofuse.published`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936"
}
```

## Service Partner Relation Changed Event

Fired when something about the service partner relation of a subscription has been changed.

- A new service partner relation is created
- The state of an existing service partner relation changed
- The customer number of an existing service partner relation changed
- A service partner relation has been deleted

> 💡 Note that service partner data can only be consumed via tapio's Global Discovery Service API if the application is configured to retrieve that kind of data.

`one.tapio.selfservice.servicepartner.relation.changed`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19"
}
```

## Data Deletion Required Event

See [Customer Data](./customer-data).

`one.tapio.selfservice.application.customerdatadeletionrequired`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936"
}
```
