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

const body_parser = require("body-parser");
const express = require("express");
const rhea = require("rhea");

const http_host = process.env.HOST || "0.0.0.0";
const http_port = process.env.PORT || 8080;

const amqp_host = process.env.MESSAGING_SERVICE_HOST || "localhost";
const amqp_port = process.env.MESSAGING_SERVICE_PORT || 5672;
const amqp_user = process.env.MESSAGING_SERVICE_USER || "meteo";
const amqp_password = process.env.MESSAGING_SERVICE_PASSWORD || "meteo";

// AMQP

const id = Math.floor(Math.random() * (10000 - 1000)) + 1000;
const container = rhea.create_container({id: `map-server-${rhea.generate_uuid().slice(0, 4)}`});

let receiver;

const weather_stations = {};

container.on("connection_open", (event) => {
    receiver = event.connection.open_receiver("meteo/weather-station-updates");
});

container.on("message", (event) => {
    if (event.receiver !== receiver) return;

    let json = event.message.body;
    let update = JSON.parse(json);

    console.log("MAP-SERVER: Received status update from %s", update.station_id);

    weather_stations[update.station_id] = update;
});

const opts = {
    host: amqp_host,
    port: amqp_port,
    // username: amqp_user,
    // password: amqp_password,
};

container.connect(opts);

console.log("MAP-SERVER: Connected to AMQP messaging service at %s:%s", amqp_host, amqp_port);

// HTTP

const app = express();

app.use(express.static("static"));
app.use(body_parser.json());

app.get("/api/data", function (req, resp) {
    resp.json({weatherStations: weather_stations});
});

app.listen(http_port, http_host);

console.log("Listening for new HTTP connections at %s:%s", http_host, http_port);
