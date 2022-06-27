# Large file upload module

The large file upload module transfers files from a directory in the local filesystem to tapio. With this module you can upload any binary file. Data uploaded to tapio via this module will be transferred directly to the configured applications. The data is not persisted in our historic data store and therefore **cannot** be retrieved via the [Historic Data API](./../../machine-data/historical-data). The application will only retrieve the [`Generic data`](./../../machine-data/tapio-data-categories#generic-data) once.
## Large file upload module `FileCollectorConfig`

```xml
<Module xsi:type="FileCollectorConfig">
    <Id>FileCollectorModule_1</Id>
    <BaseDirectory>%TEMP%\tapio\CloudConnector\fileupload</BaseDirectory> 
    <CheckIntervalInSec>60</CheckIntervalInSec>
    <Directories>
        <Directory>
            <Name>Cnc-4711</Name> 
            <TapioMachineId>e04df252-f9cd-4f6e-853b-dfe2881bc231</TapioMachineId>
            <SourceKey>Spindle.Health</SourceKey>
            <Mode>UploadAllExceptLatest</Mode>
            <MaxFileSizeForUploadInKb>25000</MaxFileSizeForUploadInKb> 
            <MaxAgeOfFilesInHours>192</MaxAgeOfFilesInHours> 
            <FilePattern>*.zip</FilePattern>
            <CreateConfirmOrErrorFile>true</CreateConfirmOrErrorFile>
        </Directory>
        <Directory>
            <Name>Saw-Cutter</Name>
            <TapioMachineId>e04df252-f9cd-4f6e-853b-dfe2881bc231</TapioMachineId>
            <SourceKey>Engine.Health</SourceKey>
            <Mode>FileMarkedAsReady</Mode>
            <MaxFileSizeForUploadInKb>25000</MaxFileSizeForUploadInKb> 
            <MaxAgeOfFilesInHours>192</MaxAgeOfFilesInHours>
        </Directory>
    </Directories>
    <Cleanup>
        <IntervalInSec>3600</IntervalInSec>
        <DeleteAllUnknownFolders>true</DeleteAllUnknownFolders> 
        <DeleteOldFiles>true</DeleteOldFiles> 
        <MinFreeSpaceInGb>5</MinFreeSpaceInGb>  
    </Cleanup>

    <Destinations>
        <Destination>BatchUpload</Destination>
    </Destinations>
</Module>
```

Inside the configuration there are the following options:

| Entry                | Type                   | Description                                                                                                                                                                                                                                                                                                                          |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Id`                 | string                 | Unique identifier of the module.                                                                                                                                                                                                                                                                                                     |
| `BaseDirectory`      | string                 | Base directory for file uploads for this module. CloudConnector needs write and read rights for the directories. The CloudConnector supports also the [System-Environment variables](https://docs.microsoft.com/en-us/windows/deployment/usmt/usmt-recognized-environment-variables). Directory will be created if it doesn't exist. |
| `CheckIntervalInSec` | integer                | Cyclical check if there are files to upload Minimum: 15 sec. Default `30` sec. The files are uploaded sequentially.                                                                                                                                                                                                                  |
| `Directories`        | list of `Directories`  | List of directories below the base directory that should be monitored.                                                                                                                                                                                                                                                               |
| `Cleanup`            | object of `Cleanup`    | Specify the clean up of the configured directories to be sure the memory will not run full.                                                                                                                                                                                                                                          |
| `Destinations`       | list of `Destinations` | List of destination with modules which are doing the real file upload to tapio.                                                                                                                                                                                                                                                      |

### `Directories`

`Directories` contains a list of defined directories that are monitored by the CloudConnector. If there is a file that matches the pattern, that file is uploaded.

| Entry                       | Type    | Description                                                                                                                                                   |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`                      | string  | The name of the directory.                                                                                                                                    |
| `TapioMachineId`            | string  | The tapio machine id for this subscription group, all data received via this group will be tagged with the configured tapio machine id.                       |
| `SourceKey`                 | string  | Key that is used to identify the data in tapio.                                                                                                               |
| `Mode`                      | string  | Mode when the file will be uploaded. `UploadAllExceptLatest`, `FileMarkedAsReady`, default: `UploadAll`.                                                      |
| `MaxFileSizeForUploadInKb`  | integer | Max. file size. If the file is larger it will be deleted (and upload fails).                                                                                  |
| `MaxAgeOfFilesInHours`      | integer | Max. age of files before they get deleted, even if not uploaded.                                                                                              |
| `FilePattern`               | string  | Opt.: Restrict to specific file pattern. Default value is `*.*`.                                                                                              |
| `CreateConfirmOrErrorFile`  | boolean | true: CC creates a {filename}.confirm or {filename}.error file for success / failure. These files are also automatically deleted with the "max-age" parameter.|
| `CompressFilesBeforeUpload` | boolean | If set to true the files will be zip compressed before they are uploaded. Default `false`.                                                                    |

### `Mode`

This module supports three different modes to handle the upload of the files in the configured directory.

| Mode                    | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `UploadAll`             | Upload all files in the directory.                                        |
| `UploadAllExceptLatest` | Upload all files except the newest file. Files are ordered by last write. |
| `FileMarkedAsReady`     | Only upload the files which filenames end with `*.ready`.                 |

### `Cleanup`

This section is needed to define how the cleanup of the directory should be done. This is also carried out when the CloudConnector is not onboarded by a customer (tapio deactivated state) or has no connection to tapio.

> ⚠ If the CloudConnector (Windows or Linux service) is disabled/deactivated, there is no cleanup. Be aware that this can lead to full disks ⚠.

| Entry                     | Type    | Description                                                                                                                                                                              |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IntervalInSec`           | string  | Cleanup interval in seconds. Default `3600` sec.                                                                                                                                         |
| `DeleteAllUnknownFolders` | string  | Deletes all folders below the Base Directory which are not configured in the Directories list. Default `true`.                                                                           |
| `DeleteOldFiles`          | boolean | Enable/disable deletion of old files. Disabling could lead to full disks if machine is not onboarded. Default `true`.                                                                    |
| `MinFreeSpaceInGb`        | double  | If the space requirement is less, files are deleted starting with the oldest files in all directories until the space requirement is reached. So you might loose data. Default `3.0` Gb. |

### `Destinations`

| Entry         | Type   | Description                                                                                                           |
| ------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `Destination` | string | Module Id of a module which uploads the files. **This module must be of type `BatchUploadConfig`.** |

> If the destination is not set correct the module can not upload the files to tapio.

