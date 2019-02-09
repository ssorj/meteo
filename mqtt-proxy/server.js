//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
//

"use strict";

const net = require("net");
const mqtt_connection = require("mqtt-connection")
const rhea = require("rhea")

const mqtt_server = new net.Server()
const amqp_server = rhea.create_container()
const amqp_senders = new Map();

let amqp_conn;

mqtt_server.on("connection", (stream) => {
    const client = mqtt_connection(stream);

    client.on("connect", (packet) => {
        console.log("MQTT: Client connected");
        client.connack({ returnCode: 0 });
    });

    client.on("publish", (packet) => {
        console.log("MQTT: Client published");

        if (!amqp_conn) return;

        let sender = amqp_senders[packet.topic];

        if (sender) {
            if (sender.sendable()) {
                send_amqp_message(sender, packet);
            }
        } else {
            sender = amqp_conn.open_sender(packet.topic);
            amqp_senders[packet.topic] = sender;

            send_amqp_message(sender, packet);
        }
    });

    client.on("pingreq", () => {
        console.log("MQTT: Client pinged");
        client.pingresp();
    });

    stream.setTimeout(1000 * 60 * 5);

    client.on("close", () => { client.destroy() });
    client.on("error", () => { client.destroy() });
    client.on("disconnect", () => { client.destroy() });
    stream.on("timeout", () => { client.destroy(); });
});

amqp_server.on("connection_open", (event) => {
    console.log("AMQP: Connected");
});

amqp_server.on("sender_open", (event) => {
    console.log("AMQP: Sender opened");
});

function send_amqp_message(sender, packet) {
    let message = {
        content_type: "application/json",
        body: packet.payload
    };

    sender.send(message);
}

mqtt_server.listen(1883);
amqp_conn = amqp_server.connect({port: 5672});
