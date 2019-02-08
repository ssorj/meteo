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

var net = require("net")
var mqttCon = require("mqtt-connection")
var server = new net.Server()
 
server.on("connection", function (stream) {
    var client = mqttCon(stream)
    
    // client connected
    client.on("connect", function (packet) {
        // acknowledge the connect packet
        client.connack({ returnCode: 0 });
    })
    
    // client published
    client.on("publish", function (packet) {
        console.log("publish", packet);
        // send a puback with messageId (for QoS > 0)
        client.puback({ messageId: packet.messageId })
    })
    
    // client pinged
    client.on("pingreq", function () {
        // send a pingresp
        client.pingresp()
    });
    
    // client subscribed
    client.on("subscribe", function (packet) {
        // send a suback with messageId and granted QoS level
        client.suback({ granted: [packet.qos], messageId: packet.messageId })
    })
    
    // timeout idle streams after 5 minutes
    stream.setTimeout(1000 * 60 * 5)
    
    // connection error handling
    client.on("close", function () { client.destroy() })
    client.on("error", function () { client.destroy() })
    client.on("disconnect", function () { client.destroy() })
    
    // stream timeout
    stream.on("timeout", function () { client.destroy(); })
})

// listen on port 1883
server.listen(1883)
