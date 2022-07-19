---
sidebar_label: Check licenses
---

# Check licenses for your tapio-Application

`Licenses` can be acquired through different sales channels (e.g. the [tapio store](https://store.tapio.one)) in the scope of a `Subscription`.
A `Subscription` is the equivalent of an account of a company which uses tapio.

To get details about licenses for your `tapio-Application` you can utilize the **Global Discovery Service API** (see [available APIs](./available-apis)).

:::info
In order to use the Global Discovery Service API you first have to [register your application](./register-tapio-application).
:::

:::caution
The Global Discovery Service API returns information based on the set of `tapio-Applications` that are assigned to the calling `AAD-Application`. Make sure that the `AAD-Application` you are using is assigned to the `tapio-Application` you want to check licenses for in [my tapio](https://my.tapio.one).
:::

## Check if a subscription has a license

Call the `GET /api/subscriptionOverview` route and provide the id of the subscription you want to check as query parameter `subscriptionId`.

To check if the `Subscription` has a `License` for your `tapio-Application` you have to go through all `Licenses` of the `Subscription` in the response and check if there is a `License` with the id of your `tapio-Application` (`subscriptions[0].licenses[].applicationId` [JMESPath][jmes-path]).

## Check if a machine has a license

Call the `GET /api/subscriptionOverview` route with the `offset` and `limit` query parameters to page through all `Subscriptions` that your `tapio-Application` is authorized to see.

To check if a `Machine` has a `License` for your `tapio-Application` you have to go through all assigned `Machines` of all `Subscriptions` and check if your `tapio-Application` is assigned to a `Machine` with the `TapioMachineId` of the `Machine` you are looking for (`subscriptions[].assignedMachines[].assignedApplications[].id` [JMESPath][jmes-path]).

## Check if a user has a license

Call the `GET /api/userProfile/{email}` route with the email address of the `User` in the route.

To check if the `User` has a `License` for your `tapio-Application` you have to go through all `Licenses` of of all `Subscriptions` in the response and check if there is a `License` with the id of your `tapio-Application` (`subscriptions[].licenses[].applicationId` [JMESPath][jmes-path]).

[jmes-path]: https://jmespath.org/
