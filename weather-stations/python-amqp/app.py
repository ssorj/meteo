#!/usr/bin/python
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

import sys
import time

from proton import Message
from proton.handlers import MessagingHandler
from proton.reactor import Container

class _Handler(MessagingHandler):
    def __init__(self, conn_url, user, password, address):
        super(_Handler, self).__init__()

        self.conn_url = conn_url
        self.user = user
        self.password = password
        self.address = address

        self.sender = None

    def on_start(self, event):
        conn = event.container.connect(self.conn_url, user=self.user, password=self.password)
        self.sender = event.container.create_sender(conn, self.address)

        event.container.schedule(5, self)

    def on_timer_task(self, event):
        self.send_update()
        event.container.schedule(5, self)

    def send_update(self):
        if self.sender is None or self.sender.credit < 1:
            return

        print("WEATHER-STATION-PYTHON: Sending update");
        
        message = Message()
        message.body = {
            "stationId": "weather-station-9999",
            "timestamp": round(time.time() * 1000),
            "latitude": 3.459718,
            "longitude": -76.439529,
            "temperature": 20.518,
            "humidity": None,
            "pressure": None,
        }
        
        self.sender.send(message)

def main():
    conn_url = "amqp://amqp.zone"
    user = "meteo"
    password = "meteo"
    address = "meteo/weather-station-updates"
    
    handler = _Handler(conn_url, user, password, address)
    container = Container(handler)

    container.run()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
