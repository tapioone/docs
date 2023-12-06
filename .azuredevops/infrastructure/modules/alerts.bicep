param appInsightsName string
param staticWebAppName string
param customDomainName string

module availabilityTest 'br:crtapiobicep.azurecr.io/availability-test:1.0.0' = {
  name: '${deployment().name}-availabilityTest'
  params: {
    nameSuffix: staticWebAppName
    applicationInsightsName: appInsightsName
    url: 'https://${customDomainName}'
  }
}
