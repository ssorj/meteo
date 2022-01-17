# Meteo

## Interesting aspects

* Multiprotocol
* Highlights backbone role of the router
* JSON data
* Future: database integration - elasticsearch, or prometheus?
* Future: AMQP in the browser
* Future: req-resp to get snapshot of all stations

## Components

XXX

## Update schema

    {
        station_id: <string>,
        time: <number>,        // unix epoch
        latitude: <number>,
        longitude: <number>,
        temperature: <number>, // celsius
        humidity: <XXX>,
        pressure: <XXX>,
    }

## Todo

* Test scripts that orchestrate everything
* Containers for the router and proxy
* Configure the router for broadcast
* Container with config for router

## JMS presentation

* Do three demos - hello world, work queue, data collection
