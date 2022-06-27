
# Update Module

## Introduction

Update Module is a module which is included in the tapio CloudConnector. The module checks frequently if a newer version of the CloudConnector is available. If there is a newer version it will download and trigger the installation of the newer version.

## Configuration

The configuration for the update module is automatically done by the tapio CloudConnector with default values. When you need specific values, it is possible to add the update module to the modules section in the configuration.

```xml
<Module xsi:type="UpdateModuleConfig">
    <Id>TapioUploadModule</Id>
    <AutoUpdateEnabled>true</AutoUpdateEnabled>
    <RegularUpdateCheckInterval>00:01:00</RegularUpdateCheckInterval>
    <NextCheckDelay>00:00:05</NextCheckDelay>
    <!-- Retry after 1 Minute when an error occur -->
    <ErrorUpdateCheckInterval>00:01:00</ErrorUpdateCheckInterval>
</Module>
```

| Property                   | Required | Description                                                                                             |
| -------------------------- | :------: | ------------------------------------------------------------------------------------------------------- |
| Id                         | required | Identifier for the module. value = TapioUploadModule                                                    |
| AutoUpdateEnabled          | optional | Auto update of the CloudConnector is default active(default `true`). To disable you need to set `false` |
| RegularUpdateCheckInterval | optional | The regular update check interval (default 7 days)                                                      |
| NextCheckDelay             | optional | The next check delay (timespan). Per default this will be calculated by the cloud connector id          |
| ErrorUpdateCheckInterval   | optional | The after error update check interval (default 8 hours)                                                 |

