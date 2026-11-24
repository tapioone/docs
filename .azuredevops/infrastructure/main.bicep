param logAnalyticsWorkspaceResourceId string
param environmentSuffix string
param customDomainName string

param location string = resourceGroup().location
param availabilityTestFrequencyInSeconds int
param availabilityTestLocationSet 'northAndWestEurope' | 'northEurope'

var productPrefix = 'docs'

module appInsights 'br:crtapiobicep.azurecr.io/application-insights:1.1.0' = {
  params: {
    logAnalyticsWorkspaceResourceId: logAnalyticsWorkspaceResourceId
    nameSuffix: '${productPrefix}${environmentSuffix}'
    location: location
  }
}

module staticWebApp 'br:crtapiobicep.azurecr.io/static-web-app:2.1.0' = {
  params: {
    branch: 'master'
    nameSuffix: '${productPrefix}${environmentSuffix}'
    repositoryUrl: 'https://github.com/tapioone/docs'
    skuTier: 'Free'
    customDomainName: customDomainName
    location: location
  }
}

module alerts 'modules/alerts.bicep' = {
  params: {
    appInsightsName: appInsights.outputs.name
    staticWebAppName: staticWebApp.outputs.name
    customDomainName: customDomainName
    location: location
    availabilityTestFrequencyInSeconds: availabilityTestFrequencyInSeconds
    availabilityTestLocationSet: availabilityTestLocationSet
  }
}
