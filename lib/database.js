"use strict";

const findObjectByKey = require("./support_tools.js").findObjectByKey;
const findObjectIdByKey = require("./support_tools.js").findObjectIdByKey;
const findObjectsByKey = require("./support_tools.js").findObjectsByKey;
const findObjectsIdByKey = require("./support_tools.js").findObjectsIdByKey;

let parentAdapter;
const ActorsWithoutThermostat = [];
const Actors = [];
const Sensors = [];
const Thermostats = [];
const Rooms = [];

//adapter.config.rooms
//      - name
//      - isActive

//adapter.config.devices
//      - name
//      - isActive
//      - room
//      - type   1=thermostat, 2=actor, 3=sensor
//      - OID_Target
//      - OID_Current


//*******************************************************************
//
async function CreateDatabase(adapter) {

    parentAdapter = adapter;

    parentAdapter.log.info("start CreateDatabase");

    try {
        //create rooms
        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {

                const sensors = await GetSensorsId4Room( parentAdapter.config.rooms[room].name);
                const actors = await GetActorsId4Room( parentAdapter.config.rooms[room].name);
                const thermostats = await GetThermostatId4Room( parentAdapter.config.rooms[room].name);

                let HasActorsWithoutThermostat = false;
                if (actors.length > 0 && thermostats.length == 0) {
                    HasActorsWithoutThermostat = true;

                    for (let d = 0; d < actors.length; d++) {
                        ActorsWithoutThermostat.push({
                            name: actors[d].name,
                            id: actors[d].id,
                            room: parentAdapter.config.rooms[room].name
                        });
                    }

                }

                Rooms.push({
                    ID: room,
                    Name: parentAdapter.config.rooms[room].name,
                    WindowIsOpen: false,                    //heatingcontrol.0.Rooms.B�ro.WindowIsOpen
                    TemperaturOverrideTime: "00:00",        //heatingcontrol.0.Rooms.B�ro.TemperaturOverrideTime
                    TemperaturOverride: 0,                  //heatingcontrol.0.Rooms.B�ro.TemperaturOverride
                    State: "unknown",                       //heatingcontrol.0.Rooms.B�ro.State
                    CurrentTimePeriodTime: "00:00",         //heatingcontrol.0.Rooms.B�ro.CurrentTimePeriodTime
                    CurrentTimePeriodFull: "",              //heatingcontrol.0.Rooms.B�ro.CurrentTimePeriodFull
                    CurrentTimePeriod: -1,                  //heatingcontrol.0.Rooms.B�ro.CurrentTimePeriod
                    CurrentTarget: -99,                     //heatingcontrol.0.Rooms.B�ro.CurrentTarget
                    ActiveTimeSlot: -1,                     //heatingcontrol.0.Rooms.B�ro.ActiveTimeSlot
                    MinimumTemperature: -99,                //heatingcontrol.0.vis.RoomValues.MinimumTemperature
                    IsInOverride: false,
                    IsInReduced: false,
                    IsInManual: false,
                    ReducedState: "",
                    Sensors: sensors,           // list of sensor id's from Sensors
                    Actors: actors,             // list of actor id's from Actors
                    Thermostats: thermostats,    // list of thermostat id's from Thermostats
                    HasActorsWithoutThermostat: HasActorsWithoutThermostat
                });

                

            }
        }
        parentAdapter.log.debug("CreateDatabase: " + Rooms.length + " active rooms found " + JSON.stringify(Rooms));

        parentAdapter.log.debug("CreateDatabase: " + Sensors.length + " active sensors found " + JSON.stringify(Sensors));
        parentAdapter.log.debug("CreateDatabase: " + Actors.length + " active actors found " + JSON.stringify(Actors));
        parentAdapter.log.debug("CreateDatabase: " + Thermostats.length + " active thermostats found " + JSON.stringify(Thermostats));


      
    }
    catch (e) {
        parentAdapter.log.error("exception in CreateDatabase [" + e + "]");
    }




    parentAdapter.log.info("CreateDatabase done with " + Rooms.length + " rooms");
}

async function GetSensorsId4Room( room) {

    const sensors = [];
    if (parentAdapter.config.UseSensors) {
        const devices = findObjectsByKey(parentAdapter.config.devices, "room", room);

        if (devices !== null) {

            for (let d = 0; d < devices.length; d++) {

                if (devices[d].type == 3 && devices[d].isActive) {

                    Sensors.push({
                        name: devices[d].name,
                        room: room,
                        OID: devices[d].OID_Current,
                        lastState: false,
                        lastChange: ""
                    });

                    sensors.push({
                        name: devices[d].name,
                        id: Sensors.length - 1
                    });
                }
            }
        }
    }

    //adapter.log.debug("got sensors for " + room + "" + JSON.stringify(sensors) + " " + JSON.stringify(Sensors));


    return sensors;
}

async function GetActorsId4Room( room) {

    const actors = [];
    if (parentAdapter.config.UseActors) {
        const devices = findObjectsByKey(parentAdapter.config.devices, "room", room);

        if (devices !== null) {

            for (let d = 0; d < devices.length; d++) {

                if (devices[d].type == 2 && devices[d].isActive) {

                    Actors.push({
                        name: devices[d].name,
                        room: room,
                        OID: devices[d].OID_Target,
                        lastState: false,
                        lastChange: ""
                    });

                    actors.push({
                        name: devices[d].name,
                        id: Actors.length - 1
                    });
                }
            }
        }
    }

    //adapter.log.debug("got actors for " + room + "" + JSON.stringify(actors) + " " + JSON.stringify(Actors));
    return actors;
}

async function GetThermostatId4Room( room) {
    const thermostats = [];

    const devices = findObjectsByKey(parentAdapter.config.devices, "room", room);

    if (devices !== null) {

        for (let d = 0; d < devices.length; d++) {

            if (devices[d].type == 1 && devices[d].isActive) {

                Thermostats.push({
                    name: devices[d].name,
                    room: room,
                    OID_Target: devices[d].OID_Target,
                    OID_Current: devices[d].OID_Current,
                    lastTarget: -99,
                    lastChange: ""
                });

                thermostats.push({
                    name: devices[d].name,
                    id: Thermostats.length - 1
                });
            }
        }
    }

    //parentAdapter.log.debug("got thermostats for " + room + "" + JSON.stringify(thermostats) + " " + JSON.stringify(Thermostats));
    return thermostats;
}



async function ChangeStatus(state, room, target) {

    try {
        parentAdapter.log.debug("ChangeStatus not implemented yet " + state + " " + room + " target " + target);
    }
    catch (e) {
        parentAdapter.log.error("exception in ChangeStatus [" + e + "]");
    }
}

module.exports = {
    CreateDatabase,
    ChangeStatus
};