
# How-To Generate OpenAPI Sepecification


## Application API

- Get the OpenAPI specification from the [prod swagger page of SelfService](https://apissappssprodwe01.azurewebsites.net/swagger/v1/swagger.json).
- Adjust the server URL to `https://api.tapio.one/application`.
- Remove the `/api/v1/` prefix from each route.
- Add the `api-version` header with schema.
- Add schema for the `tapio-appliction-id` header and adjust the reference.
- Add the descriptions of the headers to each route - if the description is only at the schema, it will not be shown in the generated documentation.

Alternative:

- Export OpenAPI specification from the [API Management service in the Azure portal](https://portal.azure.com/#@tapio.one/resource/subscriptions/78557df6-0aaa-4854-ba5b-297e394930b1/resourceGroups/gwtapioprodwe01/providers/Microsoft.ApiManagement/service/managementtapioprodwe01/apim-apis).
- Add description, termsOfService and contact in "info" section.
- Adjust security schema.
