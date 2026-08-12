param appInsightsName string
param staticWebAppName string
param customDomainName string

param location string = resourceGroup().location
param availabilityTestFrequencyInSeconds int
param availabilityTestLocationSet 'northAndWestEurope' | 'northEurope'

import { northAndWestEuropeTestLocations, northEuropeTestLocations } from 'br:crtapiobicep.azurecr.io/availability-standard-test:2.0.1'

var availabilityTestLocationIds = availabilityTestLocationSet == 'northAndWestEurope' ? northAndWestEuropeTestLocations : northEuropeTestLocations

module availabilityTest 'br:crtapiobicep.azurecr.io/availability-standard-test:2.0.1' = {
  name: '${deployment().name}-availabilityTest'
  params: {
    nameSuffix: staticWebAppName
    appInsightsName: appInsightsName
    testUrl: 'https://${customDomainName}'
    resourceLocation: location
    frequencyInSeconds: availabilityTestFrequencyInSeconds
    testLocationIds: availabilityTestLocationIds
  }
}
