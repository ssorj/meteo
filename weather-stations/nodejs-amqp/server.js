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

const host = process.env.MESSAGING_SERVICE_HOST || "localhost";
const port = process.env.MESSAGING_SERVICE_PORT || 5672;

const station_id = `nodejs-amqp-${rhea.generate_uuid().slice(0, 4)}`
const container = rhea.create_container({id: `weather-station-${station_id}`});

let sender;

container.on("connection_open", (event) => {
    sender = event.connection.open_sender("meteo/weather-station-updates");
});

function send_status_update() {
    if (!sender || !sender.sendable()) {
        return;
    }

    console.log("NODEJS-AMQP: Sending update");

    let update = {
        content_type: "application/json",
        body: JSON.stringify({
            station_id: station_id,
            time: new Date().getTime(),
            latitude: 37.740656,
            longitude: -122.480608,
            temperature: 10.0,
            humidity: null,
            pressure: null
        })
    };

    sender.send(update);
}

setInterval(send_status_update, 5 * 1000);

container.connect({host: host, port: port});

console.log("Connected to AMQP messaging service at %s:%s", host, port);
