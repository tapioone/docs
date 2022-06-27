
# tapio Connectivity

## tapio CloudConnector

To make tapio a woodworking ecosystem, we needed a generic way, to send data from woodworking machines to the tapio ecosystem. We therefore created a piece of software, called the tapio CloudConnector. It gets installed either on a machine itself or on a windows computer, that's connected to the machine via ethernet and sends data to an Azure IoT Hub. Once the CloudConnector is configured via `.xml` configuration file, it's ready to send data.

An advanced documentation on the tapio CloudConnector can be found in the [CloudConnector Documentation](../Manufacturer/CloudConnector)

## Connection States

Since not every machine has an active CloudConnector installed, we introduced multiple states for a machine's connection.
There are currently four types of connection states a machine can have in tapio  

| State           | Description                                                                                                                                                                                                                                                                 | Icon                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Active          | The machine is able to connect to tapio through the [CloudConnector](#tapio-cloudconnector).                                                                                                                                                                                | ![Active](../../static/img/docs/ActiveMachine.png)                  |
| In verification | tapio service needs to verify your machine and approve it.                                                                                                                                                                                                                  | ![In verification](../../static/img/docs/InverificationMachine.png) |
| Not possible    | Your machine is not able to connect to tapio.                                                                                                                                                                                                                               | ![Not possible](../../static/img/docs/NotPossibleMachine.png)       |
| Limited         | Your machine has limited tapio functionality enabled. That usually means the machine has no active cloud connection but a user can e.g. create a ticket within [tapio ServiceBoard](https://apps.apple.com/de/app/tapio-serviceboard/id1359195005) for that machine. | ![Limited](../../static/img/docs/OfflineMachine.png)                |
| Error           | There is an error with your machine. Reach out to the [tapio support](mailto:developer@tapio.one) to resolve this issue.                                                                                                                                                    | ![Error](../../static/img/docs/ErrorMachine.png)                    |

