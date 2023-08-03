import { world, MinecraftBlockTypes, EntityEquipmentInventoryComponent, EquipmentSlot, BlockInventoryComponent, EntityInventoryComponent } from "@minecraft/server";

const MAX_PLAYER_INVENTORY_SZ = 36;

/**
 * Returns true if the entity is a player.
 * 
 * @param {Entity} entity 
 */
const isPlayer = (entity) => {
    const id = entity.id;

    /**
     * @param {Player} player 
     * @returns {Boolean}
     */
    const matcher = (player) => player.id === id;
    return Boolean(world.getAllPlayers().find(matcher));
}

/**
 * Creates a chest at the provided location.
 * 
 * @param {Dimension} dimension 
 * @param {Vector3} coords
 * @param {ChestSz} sz
 * @return {Block}
 */
const spawnChest = (dimension, coords, sz) => {
    const mainChestBlock = dimension.getBlock(coords);
    mainChestBlock.setType(MinecraftBlockTypes.chest);
    if (sz === 'single') {
        return mainChestBlock;
    }

    const secondaryChestBlock = dimension.getBlock({...coords, x: coords.x + 1});
    secondaryChestBlock.setType(MinecraftBlockTypes.chest);
    return mainChestBlock;
}

/**
 * Transfers inventory from the player to a chest.
 * 
 * @param {Player} player 
 * @param {Block} chest 
 */
const transferInventory = (player, chest) => {
    /**
     * @type {BlockInventoryComponent}
     */
    const chestInventoryComponent = chest.getComponent(BlockInventoryComponent.componentId);
    /**
     * @type {Container}
     */
    const chestContainer = chestInventoryComponent.container;

    /**
     * @type {EntityEquipmentInventoryComponent}
     */
    const equipmentComponent = player.getComponent(EntityEquipmentInventoryComponent.componentId);
    
    let chestSlotCursor = 0;
    Object.values(EquipmentSlot).forEach((slot) => {
        const itemStack = equipmentComponent.getEquipment(slot);
        if (!itemStack) {
            return;
        }

        chestContainer.setItem(chestSlotCursor++, itemStack.clone());
        equipmentComponent.setEquipment(slot);
    });

    /**
     * @type {PlayerInventoryComponent}
     */
    const playerInventoryComponent = player.getComponent(EntityInventoryComponent.componentId);
    /**
     * @type {Container}
     */
    const playerInventory = playerInventoryComponent.container;

    for (let playerSlotCursor = 0; playerSlotCursor < MAX_PLAYER_INVENTORY_SZ; ++playerSlotCursor) {

        const itemStack = playerInventory.getItem(playerSlotCursor);
        if (!itemStack) {
            continue;
        }

        chestContainer.setItem(chestSlotCursor++, itemStack.clone());
        playerInventory.setItem(playerSlotCursor);
    }
};

world.afterEvents.entityDie.subscribe((e) => {
    const entity = e.deadEntity;
    if (!isPlayer(entity)) {
        return;
    }

    /**
     * @type {Player}
     */
    const player = entity;
    const {x, y, z} = player.location;
    player.sendMessage(`You died at ${x|0}, ${y|0}, ${z|0}`);
    const chest = spawnChest(world.getDimension('overworld'), {x, y, z}, 'double');
    transferInventory(player, chest);
});

/**
 * @typedef {import('@minecraft/server').Entity} Entity
 */

/**
 * @typedef {import('@minecraft/server').Player} Player
 */

/**
 * @typedef {import('@minecraft/server').Block} Block
 */

/**
 * @typedef {import('@minecraft/server').Dimension} Dimension
 */

/**
 * @typedef {import('@minecraft/server').Vector3} Vector3
 */

/**
 * @typedef {import('@minecraft/server').Container} Container
 */

/**
 * @typedef {'single' | 'double'} ChestSz
 */