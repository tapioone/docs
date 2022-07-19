/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'General',
      link: {
        type: 'doc',
        id: 'general/index'
      },
      items: [
        'general/available-apis',
        'general/authentication',
        'general/authentication-experience',
        'general/register-tapio-application',
        'general/check-licenses',
        'general/cloud-events',
        'general/access-user-machines',
        'general/global-discovery-service',
        'general/customer-data',
      ],
    },
    {
      type: 'category',
      label: 'Machine Data',
      link: {
        type: 'doc',
        id: 'machine-data/index'
      },
      items: [
        'machine-data/connectivity',
        'machine-data/tapio-data-categories',
        'machine-data/state-api',
        'machine-data/commanding',
        'machine-data/file-transfer',
        'machine-data/historical-data',
      ],
    },
    {
      type: 'category',
      label: 'Manufacturer',
      link: {
        type: 'doc',
        id: 'manufacturer/index'
      },
      items: [
        {
          type: 'category',
          label: 'Cloud Connector',
          link: {
            type: 'doc',
            id: 'manufacturer/cloud-connector/index',
          },
          items: [
            'manufacturer/cloud-connector/configuration',
            'manufacturer/cloud-connector/data-module',
            'manufacturer/cloud-connector/large-file-upload-module',
            'manufacturer/cloud-connector/update-module',
            'manufacturer/cloud-connector/call-endpoint',
            'manufacturer/cloud-connector/condition-constraints',
            'manufacturer/cloud-connector/cloud-connector-pi',
            'manufacturer/cloud-connector/ui/index',
            'manufacturer/cloud-connector/activator/index',
          ],
        },
        'manufacturer/licensing-workflow',
        'manufacturer/machine-onboarding-workflow',
        'manufacturer/manufacturer-section',
        'manufacturer/reporting-workflow',
        'manufacturer/access-assigned-machines',
      ],
    },
    {
      type: 'category',
      label: 'Products',
      link: {
        type: 'doc',
        id: 'products/index'
      },
      items: [
        'products/service-board',
      ],
    },
  ],
};
