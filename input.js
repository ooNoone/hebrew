import { player, state, world, triviaPool, battleMusic, winSound, canvas, BLOCK_SIZE, GROUND_Y_PIXELS } from './config.js';

export const keys = {};

export function setupInputs() {
    window.addEventListener("keydown", e => {
        keys[e.code] = true;
    });
    window.addEventListener("keyup", e => keys[e.code] = false);
    
    // Prevent the right-click menu from opening so we can use it for building
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    canvas.addEventListener("mousedown", handleMouseDown);
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const uiX = e.clientX - rect.left;
    const uiY = e.clientY - rect.top;

    // 1. UI Interactions
    if (state.showHelp) { 
        state.showHelp = false; 
        return; 
    }

    if (uiX > canvas.width - 50 && uiX < canvas.width - 10 && uiY > 10 && uiY < 50) {
        state.showHelp = true;
        return;
    }

    if (state.gameState === "GAMEOVER" || state.gameState === "VICTORY") {
        location.reload();
        return;
    }

    // 2. Trivia Interactions
    if (state.gameState === "TRIVIA") {
        state.currentQuestion.options.forEach((opt, i) => {
            const btnY = 200 + (i * 60);
            if (uiX > 100 && uiX < 400 && uiY > btnY && uiY < btnY + 45) {
                if (i === state.currentQuestion.correct) {
                    world.enemies = world.enemies.filter(en => en !== state.activeEnemy);
                    state.score += 7;
                    state.gameState = "CORRECT_FEEDBACK";
                    state.feedbackTimer = 120;
                    winSound.play();
                } else {
                    state.lives -= 1;
                    state.gameState = state.lives <= 0 ? "GAMEOVER" : "PLAYING";
                }
                battleMusic.pause(); 
                battleMusic.currentTime = 0;
            }
        });
        return;
    }

    if (state.gameState === "CORRECT_FEEDBACK") return;

    // 3. World Interactions
    const worldMouseX = uiX + (player.x - canvas.width / 2);
    const worldMouseY = uiY;
    player.swing = 15;

    const gx = Math.floor(worldMouseX / BLOCK_SIZE);
    const gy = Math.floor(worldMouseY / BLOCK_SIZE);

    // LEFT CLICK (0): BREAK BLOCKS, CHOP TREES, START BATTLES
    if (e.button === 0) {
        // Break Trees
        world.trees = world.trees.filter(t => {
            const img = world.images[t.type];
            if(!img) return true;
            const w = img.width * t.scale, h = img.height * t.scale;
            const treeTop = GROUND_Y_PIXELS - (h * world.anchors[t.type]);
            if (worldMouseX > t.x - w/2 && worldMouseX < t.x + w/2 && worldMouseY > treeTop && worldMouseY < GROUND_Y_PIXELS) {
                return false; // Instant break
            }
            return true;
        });

        // Break Blocks
        if (world.blocks[`${gx},${gy}`]) {
            delete world.blocks[`${gx},${gy}`];
        }

        // Start Battle with Books
        world.enemies.forEach(en => {
            if (worldMouseX > en.x && worldMouseX < en.x + en.width && worldMouseY > en.y && worldMouseY < en.y + en.height) {
                state.gameState = "TRIVIA";
                state.activeEnemy = en;
                state.currentQuestion = triviaPool[Math.floor(Math.random() * triviaPool.length)];
                battleMusic.play().catch(() => {});
            }
        });
    } 
    // RIGHT CLICK (2): BUILD BLOCKS
    else if (e.button === 2) {
        if (!world.blocks[`${gx},${gy}`]) {
            world.blocks[`${gx},${gy}`] = 'dirt';
        }
    }
}
