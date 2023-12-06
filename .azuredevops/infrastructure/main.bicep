param logAnalyticsWorkspaceResourceId string
param environmentSuffix string
param customDomainName string

param location string = resourceGroup().location

var productPrefix = 'docs'

module appInsights 'br:crtapiobicep.azurecr.io/application-insights:1.1.0' = {
  name: '${deployment().name}-appInsights'
  params: {
    logAnalyticsWorkspaceResourceId: logAnalyticsWorkspaceResourceId
    nameSuffix: '${productPrefix}${environmentSuffix}'
    location: location
  }
}

module staticWebApp 'br:crtapiobicep.azurecr.io/static-web-app:2.1.0' = {
  name: '${deployment().name}-staticWebApp'
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
  name: '${deployment().name}-alerts'
  params: {
    appInsightsName: appInsights.outputs.name
    staticWebAppName: staticWebApp.outputs.name
  }
}
