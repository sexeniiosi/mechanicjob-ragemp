// server.js
function repairVehicleComponent(vehicle, component) {
    vehicle.setPartHealth(0, component, 1000);
}

mp.events.add("playerEnteredVehicle", (player, vehicle, seat) => {
    if (seat === -1 && player.getVariable("isMechanic")) {
        mp.players.forEachInStreamRange((mechanic) => {
            if (mechanic.getVariable("isMechanic")) {
                mechanic.call("checkAndShowVehicleDamage", [vehicle.id]);
            }
        });
    }
});

function getVehicleDamageData(vehicle) {
    const damageData = {};

    damageData.Hood = calculatePercentage(vehicle.getPartHealth(0, "bonnet"));

    for (let i = 0; i < 6; i++) {
        damageData[`Door${i + 1}`] = calculatePercentage(vehicle.getPartHealth(0, `door_${i + 1}`));
    }

    damageData.BumperFront = calculatePercentage(vehicle.getPartHealth(0, "bumper_f"));
    damageData.BumperRear = calculatePercentage(vehicle.getPartHealth(0, "bumper_r"));

    damageData.Trunk = calculatePercentage(vehicle.getPartHealth(0, "boot"));

    for (let i = 0; i < 4; i++) {
        damageData[`Wheel${i + 1}`] = calculatePercentage(vehicle.getWheelHealth(i));
    }

    damageData.Engine = calculatePercentage(vehicle.getPartHealth(0, "engine"));

    return damageData;
}

function calculatePercentage(value) {
    return Math.round((1 - value / 1000) * 100);
}

mp.events.add("repairVehicleComponent", (vehicleId, component) => {
    const vehicle = mp.vehicles.atHandle(vehicleId);
    if (vehicle) {
        repairVehicleComponent(vehicle, component);
    }
});
