# ServiceBoard

ServiceBoard is an app for managing service cases with minimal effort. The following core features are included:

* Service cases can easily be created and can be send directly to the correct service partner
* An easy to use video diagnosis with a service partner speeds up failure analysis
* Exchange of 3D-models and construction plans

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

