param logAnalyticsWorkspaceResourceId string
param environmentSuffix string
param productPrefix string
param location string = resourceGroup().location

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
    location: location
    skuTier: 'Free'
  }
}

module alerts 'modules/alerts.bicep' = {
  name: '${deployment().name}-alerts'
  params: {
    appInsightsName: appInsights.outputs.name
    staticWebAppName: staticWebApp.outputs.name
  }
}
