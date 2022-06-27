# Sending Commands to Machines

## Introduction

Commanding is about sending synchronous specific commands from an application to a tapio connected machine.

> One example use case for commanding would be an operator, who starts the glue heating of a machine from home, in order to start working without any delay.

Sending specific commands in an synchronous manner, allows to execute a command on one or even multiple machines. For more information about executing commands see [Execute a new command](#execute-a-new-command).

> The commanding feature is only available from the version '6.0.19015.58385' or higher.

## Configuration

A tapio connected machine can only accept commands if the configuration of the CloudConnector allows it. The following excerpt shows how the CloudConnector should be configured to enable the commanding feature:

```xml
<Module xsi:type="DataModuleConfig">
      <Id>DataModule</Id>
      <Source>
        <Servers>
          <SourceBase xsi:type="SourceOpcUa">
            <Id>UniqueId01</Id>
            <ApplicationUri>urn:VenjakobOpcUaServer</ApplicationUri>
            <RemoteLds />
```

> If required fields are not set, no error occurs at CloudConnector startup. Instead, when you invoke this command, you receive an "Unsupported" response [Predefined command misconfigured](#predefined-command-misconfigured)

Insert the `Commanding` section as shown in the following example:

```xml
            <Commanding>
              <Commands>
                  <Command xsi:type="CommandMethodCall">
                    <Id>Command-Id-01</Id> <!-- required  -->
                    <TapioMachineId>vjkz1807001001</TapioMachineId> <!-- required  -->
                    <ObjectNodeId>Optional node id</ObjectNodeId> <!-- required  -->
                    <MethodNodeId>MethodName01-NodeId</MethodNodeId> <!-- required  -->
                    <Arguments>
                      <Argument>
                        <Name>Argument01</Name>
                        <Value type="string">NewSawFileAvailable</Value>
                      </Argument>
                    </Arguments>
                  </Command>
                  <!-- Method without value for the argument -->
                  <Command xsi:type="CommandMethodCall">
                    <Id>Command-Id-01</Id> <!-- required  -->
                    <TapioMachineId>vjkz1807001001</TapioMachineId> <!-- required  -->
                    <ObjectNodeId>Optional node id</ObjectNodeId> <!-- required  -->
                    <MethodNodeId>MethodName01-NodeId</MethodNodeId> <!-- required  -->
                    <Arguments>
                        <!-- No argument has set a value - so you have to send the value in your command -->
                    </Arguments>
                  </Command>
                  <Command xsi:type="CommandItemWrite">
                    <Id>MainHeating-On</Id> <!-- required  -->
                    <TapioMachineId>vjkz1807001001</TapioMachineId> <!-- required  -->
                    <NodeId>ns=2;s=Framework.SoftKeys.003.Value</NodeId> <!-- required  -->
                    <Value type="UInt32">2</Value>  <!-- default type is string -->
                  </Command>
                  <!-- Write command without predefined value -->
                  <Command xsi:type="CommandItemWrite">
                    <Id>MainHeating-On</Id> <!-- required  -->
                    <TapioMachineId>vjkz1807001001</TapioMachineId> <!-- required  -->
                    <NodeId>ns=2;s=Framework.SoftKeys.003.Value</NodeId> <!-- required  -->
                  </Command>
                  <Command xsi:type="CommandItemRead">
                    <Id>IsMainHeating-On</Id> <!-- required  -->
                    <TapioMachineId>vjkz1807001001</TapioMachineId> <!-- required  -->
                    <NodeId>ns=2;s=Framework.SoftKeys.003.Value</NodeId> <!-- required  -->
                  </Command>
                </Commands>
            </Commanding>
```

add as many commands as required, then continue with the rest of the configuration as shown below:

```xml
            <Groups>
               <!-- ... -->
          </SourceBase>
        </Servers>
      </Source>
</Module>
```

### Configure command types

It is possible to configure the following specific Command types:

#### CommandMethodCall

The CommandMethodCall command type contains:

| Parameter         | Type               | Required | Default value | Description                                                                                                                                                                                   |
| ----------------- | ------------------ | -------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Id                | String             | yes      |               | the identifier for the call, a unique id of this command within the current "SourceOpcUa" section                                                                                             |
| TapioMachineId    | String             | yes      |               | the tapio machine id, for which this command being registered                                                                                                                                 |
| MethodNodeId      | String             | yes      |               | node id to identify the method on the opc ua server; if this is not specified in the configuration then the command is not executed and an error is returned!                                 |
| ObjectNodeId      | String             | yes      |               | node id of method containing folder node; if this is specified in the configuration and the IoT-Hub call also contains this value, then the command is not executed and an error is returned! |
| Arguments         | List of "Argument" | no       |               | can be configured and received from call                                                                                                                                                      |
| ResponseTimeOut   | string (TimeSpan)  | no       | "00:05:00"    | overall timeout for scheduling jobs                                                                                                                                                           |
| ConnectionTimeOut | string (TimeSpan)  | no       | "00:00:15"    | timeout for the connection                                                                                                                                                                    |

`Argument` DataType contains:

- Name (string; the name of the argument)
- Value (string; the value of the argument; this has also a attribute of "valueType" which matches the supported values types from the JSON interface (see above))

> You cannot overwrite argument values that are predefined in the CloudConnector configuration. If there is no values predefined for an argument, you can pass the value of it within the actual command call.
>
> When you transfer a value in a command you must set the type of your command for example *"commandType" : "itemWrite"*

#### Available command types

| CommandType | Description                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------- |
| method      | Command type to call a method. This type is required if your command contains at least one argument |
| itemRead    | Command type to read a value.                                                                       |
| itemWrite   | Command type to write a value. This type is required if your command contains a value               |

#### CommandItemWrite

The CommandItemWrite command type contains:

| Parameter      | Type             | Required | Description                                                                                                                                                                                                                          |
| -------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Id             | String           | yes      | the identifier for the call, a unique id of this command within the current "SourceOpcUa" section                                                                                                                                    |
| TapioMachineId | String           | yes      | the tapio machine id, on which this command is being registered                                                                                                                                                                      |
| NodeId         | String           | yes      | node id to identify the method on the opc ua server; if this is not specified in the configuration then the command is not executed and an error is returned!                                                                        |
| Value          | (Argument) Value | no       | the value of the argument; can be configured and received from call, this has also a attribute of "valueType" which matches the supported values types from the JSON interface (see above) example: `<Value type="UInt32">2</Value>` |

Example can be found in excerpt above.

#### CommandItemRead

The CommandItemRead command type contains:

| Parameter      | Type   | Required | Description                                                                                                                                                   |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Id             | String | yes      | the identifier for the call, a unique id of this command within the current "SourceOpcUa" section                                                             |
| TapioMachineId | String | yes      | the tapio machine id, on which this command is being registered                                                                                               |
| NodeId         | String | yes      | node id to identify the method on the opc ua server; if this is not specified in the configuration then the command is not executed and an error is returned! |

Example can be found in excerpt above.

> The available commands (and the parameters required by each command) are depending on the
> manufacturer and the type of the machine.
>
> For more information on this matter, please contact the manufacturer of the machine.

## Execute command

Execute a command using the REST API requires you to execute:

- A `POST` request to execute the command on the following end-point `https://core.tapio.one/api/commanding`.

> A [JWT Bearer token](https://tools.ietf.org/html/rfc7519) is required as authentication header and the `MachineCommanding`-Capability should be set, see [Register tapio Application](../general/register-tapio-application) and [-authentication](../general/authentication) for details.
> This function ensures that only one of the same command, e.g. EdgeHeating-On can be execute at the same time.
> Use the ResourceId `https://tapiousers.onmicrosoft.com/CoreApi` for the token request otherwise you get an Unauthorized.
>
> The execution time of a command cannot be longer than 5 minutes. After this time span, a "timeout" error will occur.

### Execute a new command

In the body of the `POST` request from above, the following `JSON` entity should be passed.

> Use the ResourceId `https://tapiousers.onmicrosoft.com/CoreApi` for the token request otherwise you get an Unauthorized.

```json
{
    "tmid" : "the tapio machine id of the target machine",
    "serverId": "the identification number of the server sending the command",
    "id": "the name of the command to send"
}
```

As an example, the following command starts the heater, using a predefined command on the specified machine.

```json
{
    "tmid": "012345678901243",
    "serverId": "Simu2",
    "id": "EdgeHeater-On"
}
```

This call will return an http response, with return code `200` if the request was successful, as well as the following response body:

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "200",
    "commandResponse":
    {
      "statusCode": 0,
      "outArguments":
      {
        "value":
        {
          "valueType": "Double",
          "value": "1.1"
        }
      }
    }
  }
]
```

### Additional command information

The response of a command execution, is a json array of command objects. You will receive an array as a response, because you're command could be executed on multiple machines.

| Property          | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| cloudConnectorId  | string: id of the CloudConnector                              |
| status            | string: the status of the command, see list below             |
| statusDescription | string: additional status information when job handling fails |
| commandResponse   | object: the command response when available                   |

> Possible status values: `200`, `400`, `409`, `429`, `500` (**has no relation to HTTP Status Codes!**)

| IoT hub status code | Description                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200                 | Execution of this command was successful                                                                                                                    |
| 400                 | Execution of this command failed, because something went wrong on the machine's OPC UA server. Check the response                                           |
| 409                 | Multiple CloudConnectors are responsible for one machine and execute the command but do not respond. See response for more information (example see below). |
| 429                 | The device is busy and can not execute multiple commands at the same time                                                                                   |
| 500                 | An error occurred by executing the command in the CloudConnector. Check the response                                                                        |

The "commandResponse" can contain different properties:

In case of an internal error. It could contains some more detail error information of the machine. The error information depends on the machine how detailed the information are.

```json
...
"commandResponse":
  {
    "internalError":
    {
      "errorCode": 5,
      "errorText": "Device is busy"
    }
  }
...
```

In case of successful read command, it returns the value and the type of the value. For "write"-commands it will only return the "statusCode".

```json
...
"commandResponse":
  {
    "statusCode": 0,
    "outArguments":
    {
      "value":
      {
        "valueType": "Double",
        "value": "1.1"
      }
    }
  }
...
```

In case of a `conflict` error, the response contains information which CloudConnector did not responded and the reason at least with an error code.

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "501",
    "commandResponse": null
  }
]
```

The status code in this response tells the call the responding CloudConnector send an information with `501` which means `Not Implemented`.

The table below describes the status codes which you can get by calling a command on a CloudConnector.

| CloudConnector status code | Description                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 200                        | Execution of this command was successful (Can occur when 2 CloudConnectors are responsible for a command)         |
| 204                        | The command was empty                                                                                             |
| 400                        | The command execution failed during communication with the OPC UA server, check the `commandResponse` for details |
| 500                        | An internal server error occurred while executing the command, check the `commandResponse` for details            |
| 501                        | The called predefined command is not configured for the selected CloudConnector                                   |

#### Set connection-timeout and response-timeout

You can override the default response timeout for scheduling jobs and the connection timeout for each command.  
The timeouts can be set independently. If no timeouts are set, the default values are used.
> Be aware, that the connection timeout needs to be smaller than the response timeout. Also both values need to be set in a timerange from 00:00:05 - 00:05:00

#### Supported value types

The given types are supported as value types for arguments:

- Int32
- UInt32
- Boolean
- String
- byte[] (base64 encoded string)
- Double
- Float

#### Write Command

Below is an example of a "write"-command, which changes the state of the edge heater to "on" using a predefined command configuration on the specified machine.

```json
{
   "tmid": "012345678901243",
   "serverId": "Simu2",
   "id": "EdgeHeater-On",
   "commandType" : "itemWrite",
   "inArguments":
   {
      "value":
      {
        "valueType": "Boolean",
        "value": "true"
      }
   }
}
```

> When the value to write is not pre-configured inside the config, it should be passed as an single value input parameter, see example (above).

The "inArguments" have the following format:

| Property | Description                                                         |
| -------- | ------------------------------------------------------------------- |
| name     | object: name of the argument (for itemWrite this is always "value") |
| argument | Argument: argument with the valueType and value                     |

The "argument" have the following format:

| Property  | Description                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| valueType | string: valueType which matches the supported value types (see above [Supported value types](#supported-value-types)) |
| value     | string; the value of the argument                                                                                     |

An example of a successful read command:

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "200",
    "commandResponse":
    {
      "statusCode": 0
    }
  }
]
```

For example this 'statusCode = 0' means that no error has occurred while executing the command.

#### Read Command

As an example the following command reads the state of the edge heater via a predefined command on the specified machine.

```json
{
    "tmid": "012345678901243",
    "serverId": "Simu2",
    "id": "IsEdgeHeater-On"
}
```

An example of a successful read command:

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "200",
    "commandResponse":
    {
      "statusCode": 0,
      "outArguments":
      {
        "value":
        {
          "valueType": "Double",
          "value": "1.1"
        }
      }
    }
  }
]
```

#### Method call with argument

As an example, the following command will execute a method which will change the drill of a machine. Therefore it needs to pass two parameters using a predefined command on the specified machine.

```json
{
   "tmid": "012345678901243",
   "serverId": "Simu2",
   "id" : "Change-Drill",
   "commandType": "method",
   "inArguments":
   {
      "Parameter1":
      {
         "valueType": "String",
         "value": "countersunk drill"
      },
      "Parameter2":
      {
         "valueType": "Double",
         "value": "1.4"
      }
   }
}
```

An example of a successful method command:

```json
[
  {
      "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
      "status": "200",
      "commandResponse":
      {
         "statusCode": 0,
         "outArguments":
         {
            "Parameter1":
            {
              "valueType": "String",
              "value": "countersunk drill"
            },
            "YouThinkItsNice":
            {
              "valueType": "Double",
              "value": "1.4"
            }
         }
      }
   }
]
```

##### Method call with merged argument

As an example the following command will execute a method which will change the drill using two parameters. One parameter value will be passed
within the command, and the other parameter's value will be added through the CloudConnector configuration.

```json
{
    "tmid": "012345678901243",
    "serverId": "Simu2",
    "id" : "Change-Drill",
    "commandType": "method",
    "inArguments":
    {
      "Parameter1":
      {
          "valueType": "String",
          "value": "override countersunk drill"
      }
    }
}
```

An example of a successful method command:

```json
[
  {
      "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
      "status": "200",
      "commandResponse":
      {
         "statusCode": 0,
         "outArguments":
         {
            "Parameter1":
            {
              "valueType": "String",
              "value": "countersunk drill"
            },
            "YouThinkItsNice":
            {
              "valueType": "Double",
              "value": "1.4"
            }
         }
      }
   }
]
```

> When you try to overwrite the first parameter (in this example "Parameter1") an error will occur, because it is not allowed to override parameter values, which have a predefined value in the CloudConnector configuration.

#### CloudConnector is busy

When you try to execute the same command multiple times, before the execution of a previous command is finished, you will get an error with HTTP status code 429. This means "to many requests" for this machine.

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "400",
    "commandResponse":
    {
      "internalError":
      {
        "errorCode": 5,
        "errorText": "Device is busy"
      }
    }
  }
]
```

#### Opc Ua server is not connected

An example error response, if the CloudConnector has no connection to the Opc UA server:

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "400",
    "commandResponse":
    {
      "internalError":
      {
        "errorCode": 5,
        "errorText": "Opc Ua Server is not connected"
      }
    }
  }
]
```

And last but not least, responses can vary based on the type of information read on the machine.

The following JSON snippets show the response types returned be the "Execute Command" end-point:

#### Predefined command is not found

This response occurs, if the called machine has not defined such a command in it's configuration.

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "400",
    "commandResponse":
    {
      "internalError":
      {
        "errorCode": 6,
        "errorText": "The [predefined Command id:] EdgeHeater2-OFF behind the [tmid:] 012345678901243 is not found"
      }
    }
  }
]
```

#### Predefined command misconfigured

This response occurs, if a predefined command is misconfigured, for example the Node Id is not set.

```json
[
  {
    "cloudConnectorId": "fenEqD-IRGoJbzCa7mGyzEcLGbiSKAYbgYY2t31aFZouL0ofRhZ2tlYtd6rD9s7h8XdoHuDBZiFomNN5cqLD1w",
    "status": "400",
    "commandResponse":
    {
      "internalError":
      {
        "errorCode": 2,
        "errorText": "The method called is not supported. Invalid node id information for predefined command IsMainHeating-NoNodeId."
      }
    }
  }
]
```

#### CloudConnector of machine has no connection to the tapio cloud

This error occurs, if the CloudConnector of a machine is not connected to the tapio system and cannot receive the command in time.

```json
[
  {
    "cloudConnectorId": "JCk_1EBFef58bEoCiaBbD88DkxQ9HSkJ-lJVAhjf1wI_tIMFTiGZKwXfKUxMaqaLZhVx7rLKeHo3xqs7q9jNOw",
    "status": "429",
    "statusDescription": "Failed to start direct method call for device: JCk_1EBFef58bEoCiaBbD88DkxQ9HSkJ-lJVAhjf1wI_tIMFTiGZKwXfKUxMaqaLZhVx7rLKeHo3xqs7q9jNOw, message: Timed out waiting for device to connect.",
    "commandResponse": null
  }
]
```

#### Sample response without values

An example of a response without returned values.

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "400",
    "commandResponse":
    {
        "statusCode":0
    }
  }
]
```

The parameter "statusCode" contains the status of the OPC UA Server where `0` indicates "success". The property "status" describe if the command was successful.

#### Sample response containing values

The following sample shows a response containing return values:

```json
[
  {
      "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
      "status": "200",
      "commandResponse":
      {
         "statusCode": 0,
         "outArguments":
         {
            "Arg01":
            {
               "valueType":"UInt32",
               "value":"758568236"
            },
            "Name":
            {
               "valueType" : "String",
               "value" : null
            }
         }
      }
   }
]
```

#### Sample response containing error information

Furthermore, a response could also contain information about errors the CloudConnector service is returning.
The following sample shows a response containing detailed error information:

```json
[
  {
    "cloudConnectorId": "fenddsD-IRGoJk.........LD1w",
    "status": "400",
    "commandResponse":
    {
      "internalError":
      {
        "errorCode": 3,
        "errorText": "Invalid 'serverId' passed"
      }
    }
  }
]
```

