@@ -53,19 +53,19 @@ To install the tapio CloudConnector on your machine, you can use the `install.sh
Unzip the archive on your machine and follow the step. You can also find those steps in the `readme.md` file which is included in the archive.
Before starting the installation make sure to prepare a CloudConnector configuration for the target machine to have all OPC UA server settings in place.

```bash
tar xzvf tapio.cloudconnector.<platform>.tar.gz
cd Tapio.CloudConnector.Service
chmod +x install.sh # optional to make sure executable bit is set
sudo ./install.sh TapioCloudConnector.xml # path to a valid tapio CloudConnector configuration
```

To install the CloudConnector UI (see [UI](./ui) for configuration):

```bash
cd Tapio.CloudConnector.UI
chmod +x install.sh # optional to make sure executable bit is set
sudo ./install.sh config.json # path to a valid ui config (could be '{}' for using default settings)
```

> For quiet installation add `-q` as argument
@@ -74,18 +74,20 @@ user@example:~$ sudo ./install.sh config.json # path to a valid ui config (could

At the moment no automatic deinstallation script is provided, the CloudConnector can be removed running the following commands:

```bash




sudo systemctl disable tapiocloudconnector.service
sudo systemctl stop tapiocloudconnector.service
sudo rm /etc/systemd/system/tapiocloudconnector.service

sudo systemctl disable tapiocloudconnectorui.service
sudo systemctl stop tapiocloudconnectorui.service
sudo rm /etc/systemd/system/tapiocloudconnectorui.service

sudo rm -rf /opt/tapio
sudo userdel -r tapio
sudo userdel -r tapioui
sudo groupdel tapio
```

## Run on Linux
@@ -94,11 +96,11 @@ To run the tapio CloudConnector on your machine, you can use the `run.sh` script

> Be aware when you only run the CloudConnector without installing, you also accept our [legal information](#legal-information-of-the-cloudconnector).

```bash
cp ./TapioCloudConnector.xml Tapio.CloudConnector.Service
cd Tapio.CloudConnector.Service
chmod +x run.sh
./run.sh
```

## File system requirements
@@ -157,20 +159,20 @@ The CloudConnector is divided into several modules, which extend the CloudConnec

Location:

- SDK - The module is delivered via the CloudConnector SDK
- SVC - The module is delivered with the tapio CloudConnector Service (Setup File)

Config Type:

- XML - The module can be configured via the CloudConnector config xml file. See [configuration](./configuration).
- AUTO - The module has an pre configured static configuration
- INTERNAL - The module configuration is created internally based on global settings

## Machine to Cloud OPC UA Conventions

To use the full feature set of tapio there the reported data has to satisfy the following constraints:

- [Condition constraints](./condition-constraints)

## How to update to a new configuration manually

@@ -186,8 +188,8 @@ Open the task manager -> navigate to the Services Tab -> search for the Tapio.Cl

To restart the service run the following command.

```bash
sudo systemctl restart tapiocloudconnector.service
```

After restarting the service, the CloudConnector will try to start with the new configuration. If this succeed the old configuration file will be overwritten with the new configuration. If the configuration is invalid for some reason, the old configuration will be used to start the CC. The new configuration file will be renamed to `TapioCloudConnector.Error_TimeStamp.xml`.
@@ -209,9 +211,9 @@ After starting the service you can also have a look in the Diagnostic UI which c

LoadedConfigFile description:

- `Default config` is the case when no new configuration was provided and the service starts with the default config.
- `New config` is the case when the loading and starting of a new configuration was successfully
- `Fallback config` is the case when a new configuration was provided but the service could not be started with it. Then the old configuration will be used instead.

## Internal CloudConnector Diagnostic server

