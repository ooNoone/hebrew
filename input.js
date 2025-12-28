import { player, state, world, triviaPool, battleMusic, winSound, canvas, BLOCK_SIZE, GROUND_Y_PIXELS } from './config.js';

export const keys = {};

export function setupInputs() {
    window.addEventListener("keydown", e => {
        keys[e.code] = true;
        if (e.code === "Tab") { player.showInventory = !player.showInventory; e.preventDefault(); }
        if (["1", "2", "3", "4"].includes(e.key)) player.selectedSlot = parseInt(e.key) - 1;
    });
    window.addEventListener("keyup", e => keys[e.code] = false);
    canvas.addEventListener("mousedown", handleMouseDown);
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    // Inside handleMouseDown(e) function:

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const uiX = e.clientX - rect.left;
    const uiY = e.clientY - rect.top;

    // 1. Toggle Help Window
    if (state.showHelp) {
        state.showHelp = false;
        return;
    }

    // 2. Check if Help Button [?] was clicked
    if (uiX > canvas.width - 50 && uiX < canvas.width - 10 && uiY > 10 && uiY < 50) {
        state.showHelp = true;
        return;
    }

    // ... (rest of your existing handleMouseDown code: GAMEOVER, TRIVIA, etc.) ...
}
    const uiX = e.clientX - rect.left;
    const uiY = e.clientY - rect.top;

    // 1. Toggle Help Window
    if (state.showHelp) {
        state.showHelp = false;
        return;
    }

    // 2. Check if Help Button [?] was clicked
    if (uiX > canvas.width - 50 && uiX < canvas.width - 10 && uiY > 10 && uiY < 50) {
        state.showHelp = true;
        return;
    }

    if (state.gameState === "CORRECT_FEEDBACK") return;

    const worldMouseX = uiX + (player.x - canvas.width / 2);
    const worldMouseY = uiY;
    player.swing = 15;

    if (player.showInventory) {
        if (uiX > 300 && uiX < 500) {
            if (uiY > 150 && uiY < 190 && player.inventory.wood >= 5) { player.inventory.wood -= 5; player.inventory.axe = true; }
            if (uiY > 200 && uiY < 240 && player.inventory.wood >= 3 && player.inventory.stone >= 3) {
                player.inventory.wood -= 3; player.inventory.stone -= 3; player.inventory.pickaxe = true;
            }
        }
        return; 
    }

    world.enemies.forEach(en => {
        if (worldMouseX > en.x && worldMouseX < en.x + en.width && worldMouseY > en.y && worldMouseY < en.y + en.height) {
            state.gameState = "TRIVIA";
            state.activeEnemy = en;
            state.currentQuestion = triviaPool[Math.floor(Math.random() * triviaPool.length)];
            battleMusic.play().catch(() => {});
        }
    });

    world.trees = world.trees.filter(t => {
        const img = world.images[t.type];
        if(!img) return true;
        const w = img.width * t.scale, h = img.height * t.scale;
        const treeTop = GROUND_Y_PIXELS - (h * world.anchors[t.type]);
        if (worldMouseX > t.x - w/2 && worldMouseX < t.x + w/2 && worldMouseY > treeTop && worldMouseY < GROUND_Y_PIXELS) {
            t.hp -= (player.hotbar[player.selectedSlot] === "גרזן" && player.inventory.axe) ? 1.5 : 0.5;
            if (t.hp <= 0) { player.inventory.wood += 4; return false; }
        }
        return true;
    });

    const gx = Math.floor(worldMouseX / BLOCK_SIZE), gy = Math.floor(worldMouseY / BLOCK_SIZE);
    if (player.hotbar[player.selectedSlot] === "אדמה" && player.inventory.dirt > 0 && !world.blocks[`${gx},${gy}`]) {
        world.blocks[`${gx},${gy}`] = 'dirt'; player.inventory.dirt--;
    } else if (world.blocks[`${gx},${gy}`]) {
        const type = world.blocks[`${gx},${gy}`];
        if (type === 'dirt') player.inventory.dirt++;
        else if (type === 'stone' && player.hotbar[player.selectedSlot] === "מכוש" && player.inventory.pickaxe) player.inventory.stone += 2;
        else if (type === 'stone') player.inventory.stone += 1;
        delete world.blocks[`${gx},${gy}`];
    }
}