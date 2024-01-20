// client.js
let isMouseEnabled = false;

mp.events.add("checkAndShowVehicleDamage", (vehicleId) => {
    const vehicle = mp.vehicles.atHandle(vehicleId);

    if (vehicle) {
        const player = mp.players.local;
        const distance = mp.game.gameplay.getDistanceBetweenCoords(player.position.x, player.position.y, player.position.z, vehicle.position.x, vehicle.position.y, vehicle.position.z, true);

        if (distance <= 3) {
            const damageData = getVehicleDamageData(vehicle);
            showVehicleDamage(damageData, vehicle.id);
        }
    }
});

function showVehicleDamage(damageData, vehicleId) {
    Object.keys(damageData).forEach((component) => {
        if (damageData[component] > 0) {
            const position = getComponentPosition(vehicleId, component);
            if (!position) return;

            const componentText = `${component}: ${damageData[component]}%`;
            const yOffset = -0.5; // Adjust vertical offset as needed

            mp.game.graphics.drawText(componentText, position.x, position.y, { font: 4, color: [255, 255, 255, 255], scale: [0.5, 0.5], outline: true });

            mp.events.add("render", () => {
                const screenCoords = mp.game.graphics.worldToScreen(position.x, position.y, position.z);

                if (mp.game.controls.isControlPressed(0, 25)) {
                    isMouseEnabled = true;
                } else {
                    isMouseEnabled = false;
                }

                if (isMouseEnabled && mp.game.controls.isControlPressed(0, 24) && screenCoords[0] !== -1 && screenCoords[1] !== -1) {
                    mp.events.callRemote("repairVehicleComponent", vehicleId, component);
                    mp.game.audio.playSoundFrontend(-1, "ON", "HUD_FRONTEND_DEFAULT_SOUNDSET", false);
                    mp.game.streaming.requestAnimDict("mini@repair");
                    mp.game.streaming.requestAnimDict("anim@amb@clubhouse@tutorial@bkr_tut_ig3@");
                    mp.game.player.taskPlayAnim(mp.players.local.handle, "mini@repair", "fixing_a_ped", 8.0, -8.0, 5000, 0, 0, false, false, false);

                    isMouseEnabled = false;
                }
            });
        }
    });
}

function getComponentPosition(vehicleId, component) {
    const vehicle = mp.vehicles.atHandle(vehicleId);
    if (!vehicle) return null;

    const boneIndex = vehicle.getBoneIndexByName(component);
    if (boneIndex === -1) return null;

    const bonePosition = vehicle.getBoneCoords(boneIndex, 0, 0, 0);
    const position = mp.game.graphics.world3dToScreen2d(bonePosition.x, bonePosition.y, bonePosition.z);

    return position;
}

// Function for determining vertical text offset based on component
function getYOffset(component) {
    // Adjust vertical offset as needed
    switch (component) {
        case "Hood":
            return -0.1;
        case "Engine":
            return -2;
        case "Trunk":
            return -0.8;
        case "Wheel1":
        case "Wheel2":
            return -1.1;
        case "Wheel3":
        case "Wheel4":
            return -1.4;
        case "BumperFront":
            return -1.7;
        case "BumperRear":
            return -2;
        default:
            const componentNumber = parseInt(component.match(/\d+/)[0]);
            if (component.includes("Door")) {
                return -(componentNumber + 1) * 0.1;
            }
            return 0;
    }
}
