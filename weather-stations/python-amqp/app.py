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

import json
import sys
import time
import uuid

from proton import Message
from proton.handlers import MessagingHandler
from proton.reactor import Container

station_id = f"python-amqp-{str(uuid.uuid4())[:4]}"

class Handler(MessagingHandler):
    def __init__(self, conn_url, user, password, address):
        super().__init__()

        self.conn_url = conn_url
        self.user = user
        self.password = password
        self.address = address

        self.sender = None

    def on_start(self, event):
        conn = event.container.connect(self.conn_url)
        self.sender = event.container.create_sender(conn, self.address)

        event.container.schedule(5, self)

    def on_connection_opened(self, event):
        print(f"PYTHON-AMQP: Connected to '{self.conn_url}'")
        
    def on_timer_task(self, event):
        self.send_update()
        event.container.schedule(5, self)

    def send_update(self):
        if self.sender is None or self.sender.credit < 1:
            return

        print("PYTHON-AMQP: Sending update");

        update = {
            "station_id": station_id,
            "time": round(time.time() * 1000),
            "latitude": 3.459718,
            "longitude": -76.439529,
            "temperature": 20.518,
            "humidity": None,
            "pressure": None,
        }

        message = Message()
        message.content_type = "application/json"
        message.inferred = False
        message.body = json.dumps(update).encode("utf-8")

        self.sender.send(message)

def main():
    conn_url = "amqp://127.0.0.1"
    user = "meteo"
    password = "meteo"
    address = "meteo/weather-station-updates"

    handler = Handler(conn_url, user, password, address)
    container = Container(handler)
    container.container_id = f"weather-station-{station_id}"

    container.run()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
