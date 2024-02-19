
# How-To Generate OpenAPI Sepecification


## Application API

- Get the OpenAPI specification from the [prod swagger page of SelfService](https://apissappssprodwe01.azurewebsites.net/swagger/v1/swagger.json).
- Adjust the server URL to `https://api.tapio.one/application/`.
- Add the `api-version` header with schema.
- Add schema for the `tapio-appliction-id` header and adjust the reference.
- Add the descriptions of the headers to each route - if the description is only at the schema, it will not be shown in the generated documentation.
