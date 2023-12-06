param appInsightsName string
param staticWebAppName string

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' existing = {
  name: staticWebAppName
}

module availabilityTest 'br:crtapiobicep.azurecr.io/availability-test:1.0.0' = {
  name: '${deployment().name}-availabilityTest'
  params: {
    nameSuffix: staticWebAppName
    applicationInsightsName: appInsightsName
    url: staticWebApp.properties.defaultHostname
  }
}
