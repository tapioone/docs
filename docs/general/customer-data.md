# Customer Data

As tapio we believe in storing customer data only as long as we need it. As such, we delete all customer data when a customer stops using a product. The duration after which data gets deleted is defined in our terms and conditions.

To facilitate reliable data deletion in our applications, we have set up a process that is available to all applications in the tapio ecosystem.

## Notification by tapio

When a customer cancels their last application license, a 90 day grace period begins. If a customer does not acquire a new license within this timespan, an event is triggered and sent to the application. You will receive the notification multiple times (once a day at midnight), unless you explicitly confirm the data deletion (see next section). 

`one.tapio.selfservice.application.customerdatadeletionrequired`

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936"
}
```

> ⚠ **We encourage you to always double check any remaining licenses whenever you receive this event**. The data deletion notification and confirmation is based on the `applicationId`. If your logical application consists of multiple tapio applications, you can receive notifications about required data deletion even though the customer still has licenses for other `applicationIds`. What this means to your application depends on your requirements.

## Confirmation by the Application

When your application has deleted the data of a given customer, you can notify tapio. This will be persisted and can be used for traceability even when the application might have deleted its logs. You should not call this endpoint if your application did not actually delete any data.

> POST `https://globaldisco.tapio.one/api/subscriptionDataDeletion/confirmation`

**Request Body:**

```json
{
    "subscriptionId": "f6651146-2803-4ec0-8594-fd0fa8f0db19",
    "applicationId": "9d311e9d-b8ff-491a-b558-cbe7293ee936"
}
```

The `applicationId` parameter can be omitted if the caller is only associated with a single application.

### HTTP Status codes

| Status Code | Description                                                                             |
| ----------- | --------------------------------------------------------------------------------------- |
| 200         | The request has succeeded (OK).                                                         |
| 400         | Invalid request. Most likely if the `applicationId` was omitted but is actually needed. |
| 401         | The client must authenticate itself to get the requested response (Unauthorized).       |

