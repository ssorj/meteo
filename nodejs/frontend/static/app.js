/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

"use strict";

var app = {
    data: null,

    fetchDataPeriodically: function () {
        function handler(data) {
            app.data = data;
            window.dispatchEvent(new Event("statechange"));
        }

        gesso.fetchPeriodically("/api/data", handler);
    },

    renderWeatherStations: function (data) {
        console.log("Rendering weather stations");

        var oldContent = $("#weather-stations");
        var newContent = document.createElement("pre");

        var lines = [];

        for (var id in data.weatherStations) {
            var update = data.weatherStations[id];
            var timestamp = update.timestamp;
            var temperature = update.temperature;

            lines.unshift(("<b>" + id + ":</b> ").padEnd(30) + timestamp + ", " + temperature);
        }

        newContent.innerHTML = lines.join("\n");
        newContent.setAttribute("id", "weather-stations");

        oldContent.parentNode.replaceChild(newContent, oldContent);
    },

    init: function () {
        window.addEventListener("statechange", function (event) {
            app.renderWeatherStations(app.data);
        });

        window.addEventListener("load", function (event) {
            app.fetchDataPeriodically();
         });
    }
}
