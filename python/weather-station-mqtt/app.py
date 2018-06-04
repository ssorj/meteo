#!/usr/bin/python3
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

from __future__ import print_function

import json
import time

import paho.mqtt.client as mqtt

client_id = "weather-station-python-mqtt-{}"
client = mqtt.Client(client_id)

def on_log(client, userdata, level, buf):
    print(buf)

client.on_log = on_log

client.username_pw_set("meteo", "meteo")
client.connect("amqp.zone")

client.loop_start()
    
while True:
    time.sleep(5)

    data = {
        "id": client_id,
        "timestamp": round(time.time() * 1000),
        "latitude": 3.5,
        "longitude": -76,
        "temperature": 20,
    }

    client.publish("meteo/weather-station-updates", json.dumps(data))
