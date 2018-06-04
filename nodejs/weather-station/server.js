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

const rhea = require("rhea");

const amqp_host = process.env.MESSAGING_SERVICE_HOST || "localhost";
const amqp_port = process.env.MESSAGING_SERVICE_PORT || 5672;
const amqp_user = process.env.MESSAGING_SERVICE_USER || "meteo";
const amqp_password = process.env.MESSAGING_SERVICE_PASSWORD || "meteo";

const id = Math.floor(Math.random() * (10000 - 1000)) + 1000;
const container = rhea.create_container({id: "weather-station-nodejs-" + id});

var sender = null;

container.on("connection_open", function (event) {
    sender = event.connection.open_sender("meteo/weather-station-updates");
});

function send_status_update() {
    if (!sender || !sender.sendable()) {
        return;
    }

    console.log("WEATHER-STATION-NODEJS: Sending status update");

    var status = {
        body: {
            id: container.id,
            timestamp: new Date().getTime(),
            latitude: 37.740656,
            longitude: -122.480608,
            temperature: 10.0,
            humidity: null,
            pressure: null,
            operator: "Justin R"
        }
    };

    sender.send(status);
}

setInterval(send_status_update, 5 * 1000);

const opts = {
    host: amqp_host,
    port: amqp_port,
    username: amqp_user,
    password: amqp_password,
};

container.connect(opts);

console.log("Connected to AMQP messaging service at %s:%s", amqp_host, amqp_port);
