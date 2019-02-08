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

const app = {
    data: null,
    map: null,
    markers: {},

    fetchDataPeriodically: function () {
        function handler(data) {
            app.data = data;
            window.dispatchEvent(new Event("statechange"));
        }

        gesso.fetchPeriodically("/api/data", handler);
    },

    renderWeatherStations: function (data) {
        console.log("Rendering weather stations");

        for (let id in data.weatherStations) {
            let update = data.weatherStations[id];
            let timestamp = update.timestamp;
            let temperature = update.temperature;

            let celsius = temperature + String.fromCharCode(176) + "C"
            let farenheit = ((9 / 5) * temperature + 32) + String.fromCharCode(176) + "F"

            let marker = app.markers[id];

            if (!marker) {
                marker = new google.maps.Marker({
                    map: app.map,
                    label: {
                        text: "-",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "10px"
                    }
                });

                app.markers[id] = marker;

                marker.meteoInfoWindow = new google.maps.InfoWindow();

                marker.addListener("click", function() {
                    marker.meteoInfoWindow.open(app.map, marker);
                });
            }

            marker.setPosition(new google.maps.LatLng(update.latitude, update.longitude));
            marker.getLabel().text = Math.round(temperature).toString() + String.fromCharCode(176);

            const elem = document.createElement("div");
            elem.classList.add("weather-station-properties")

            gesso.createDiv(elem, "temperature", celsius + " " + farenheit);
            gesso.createDiv(elem, "timestamp", new Date(timestamp).toLocaleString());

            marker.meteoInfoWindow.setContent(elem);
        }
    },

    init: function () {
        window.addEventListener("statechange", function (event) {
            app.renderWeatherStations(app.data);
        });

        window.addEventListener("load", function (event) {
            app.map = new google.maps.Map(document.getElementById("map"), {
                center: {lat: 30, lng: -30},
                zoom: 3
            });

            app.fetchDataPeriodically();
        });
    }
}
