# ServiceBoard

ServiceBoard is an app for managing service cases with minimal effort. The following core features are included:

* Service cases can easily be created and can be send directly to the correct service partner
* An easy to use video diagnosis with a service partner speeds up failure analysis
* Exchange of 3D-models and construction plans
* Reduction of unplanned disruptions through maintenance planning

## ServiceBoard network requirements

### ServiceBoard API

This is the URL where the tapio ServiceBoard receives all it's data from:
<!-- markdown-link-check-disable-next-line -->
<https://lcsservice.tapio.one/>

### Push notifications

In order to receive push notifications please read the following documentations provided by [Google](https://firebase.google.com/docs/cloud-messaging/concept-options#messaging-ports-and-your-firewall) (Android devices) and [Apple](https://support.apple.com/en-us/HT203609) (iOS) devices:

### Video diagnosis

<!-- markdown-link-check-disable-next-line -->
The tapio ServiceBoard uses the [Video API by Vonage](https://www.vonage.com/communications-apis/video/) to enable In-App video calls.

<!-- markdown-link-check-disable-next-line -->
Please read the [official guide](https://support.tokbox.com/hc/en-us/articles/360029733631) by Vonage (formerly Tokbox) for detailed information.

**Short version:**

- Open TCP port 443
- Whitelist the following domains:
  - *.tokbox.com
  - *.opentok.com

## Create service cases with applinks

An app link is a link that opens an app. A common example is a web browser that will be opened when clicking on ```http://...``` or a mail client that will be opened as soon as the user clicks on an email (```mailto://...```).

tapio ServiceBoard enables tapio partner developers to communicate with ServiceBoard through an app link which is defined as follows:

```plaintext
tapio-serviceboard://<createServiceCase>[?<queryParameters>]
```

As query parameters the following options are valid:

| Query parameter      | Required                       | Description                                                                                                                                              | Example                              |
| -------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| servicePartnerId     | yes                            | The id of the service partners subscription (`Guid`). You must provide this value otherwise there will be an error.                                      | 23683e0f-3f2b-4673-8add-6a090b8606ac |
| machine              | depends on the service partner | The tapio machine id. You can define if this field is required or not through your service partner configuration.                                        | hg0011223344                         |
| stoppage             | no                             | Set to "1" (true) if the problem causes a machine or production stoppage. Everything other than "1" will be evaluated as false.                          | 1                                    |
| problemDescription   | no                             | Text that describes the underlying problem and provides additional information that will help the tapio service partner to help fast.                    |                                      |
| title   | no                             | Text that describes the topic of the ServiceCase                    |                                      |
| customerContactPhone | no                             | The phone number of the customer.                                                                                                                        | +49 176 12345678                     |
| {idOfATemplateField} | depends on the service partner | tapio service partners can define their own fields through service partner configuration. You can use the id of this field as a query parameter as well. **Templatefields are currently not supported by SerivceBoard Web** |                                      |

### Further notes

* There is no length limit for links. However they should be as concise as possible.
* The values of the query parameters must be url encoded.

### Example

```plaintext
tapio-serviceboard://createServiceCase?servicePartnerId=23683e0f-3f2b-4673-8add-6a090b8606ac&machine=hg0011223344&problemDescription=ExampleDescription%20with%0ALinebreaks
```

### Testing

You can easily test app links with html links:

```html
<a href="tapio-serviceboard://createServiceCase?servicePartnerId=f6190e5c-cb33-411e-9654-8e1ce2c2eb0c&machine=hg0011223344&problemDescription=Test%20with%0ALinebreaks">Test</a>
```

<!-- markdown-link-check-disable-next-line -->
If you develop for Android devices you can use the [Android Debug Bridge (adb)](https://developer.android.com/studio/command-line/adb) command line tool.
Your device must be connected via USB and USB debugging must be enabled. Please note that you must escape the ampersand ('\\&') for the query parameters to work.

```console
adb shell am start -a android.intent.action.VIEW -d "tapio-serviceboard://createServiceCase?servicePartnerId=f6190e5c-cb33-411e-9654-8e1ce2c2eb0c\&machine=hg0011223344\&problemDescription=Test%20with%0ALinebreaks"
```
### ServiceBoard Web prefill Service Case

Similar to the ServiceBoard native app we allow prefiling ServiceCase data via query parameters. We don´t want to run into limitations of query parameters so we accept only jwt tokens with a payload inside. The creation of the jwt token from your payload can be easily achieved by a lib like jose: [jose on github](https://github.com/panva/jose)

The created token can be appended to the create route:
<!-- markdown-link-check-disable-next-line -->
`https://serviceboard.tapio.one/servicecases/create?jwt=yourJWT`

INTEGRATION
<!-- markdown-link-check-disable-next-line -->
`https://tlcsintwasbweb.azurewebsites.net/create?jwt=yourJWT`

Example Implementation wit jose:

````
import * as jose from "jose";

const payload = {
    problemDescription: "TestFall",
    stoppage: true,
    machine: "0000000001aabb",
    title: "Test",
    subscriptionId: "00000000-0000-0000-0000-000000000003",
    servicePartnerId: "00000000-0000-0000-0000-000000000009",
    customerContactPhone: "0788888",
}

const jwt = new jose.UnsecuredJWT(payload).encode();

console.log(jwt)
"eyJhbGciOiJub25lIn0.eyJwcm9ibGVtRGVzY3JpcHRpb24iOiJUZXN0RmFsbCIsInN0b3BwYWdlIjp0cnVlLCJtYWNoaW5lIjoiMDAwMDAwMDAwMWFhYmIiLCJ0aXRsZSI6IlRlc3QiLCJzdWJzY3JpcHRpb25JZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMyIsInNlcnZpY2VQYXJ0bmVySWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDkiLCJjdXN0b21lckNvbnRhY3RQaG9uZSI6IjA3ODg4ODgifQ."

// prefill link example:
https://serviceboard.tapio.one/servicecases/create?jwt=eyJhbGciOiJub25lIn0.eyJwcm9ibGVtRGVzY3JpcHRpb24iOiJUZXN0RmFsbCIsInN0b3BwYWdlIjp0cnVlLCJtYWNoaW5lIjoiMDAwMDAwMDAwMWFhYmIiLCJ0aXRsZSI6IlRlc3QiLCJzdWJzY3JpcHRpb25JZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMyIsInNlcnZpY2VQYXJ0bmVySWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDkiLCJjdXN0b21lckNvbnRhY3RQaG9uZSI6IjA3ODg4ODgifQ.

````

