import { player, state, world, BLOCK_SIZE, GROUND_Y_PIXELS } from './config.js';
import { loadAssets } from './assets.js';
import { setupInputs, keys } from './input.js';
import { draw } from './renderer.js';

function update() {
    if (state.gameState === "CORRECT_FEEDBACK") {
        state.feedbackTimer--;
        if (state.feedbackTimer <= 0) state.gameState = state.score >= state.targetScore ? "VICTORY" : "PLAYING";
        return;
    }

    if (state.gameState !== "PLAYING" || state.showHelp) return;

    // INFINITE WORLD
    const playerGX = Math.floor(player.x / BLOCK_SIZE);
    for (let x = playerGX - 20; x < playerGX + 20; x++) {
        const gyTop = Math.floor(GROUND_Y_PIXELS / BLOCK_SIZE);
        if (!world.blocks[`${x},${gyTop}`]) {
            world.blocks[`${x},${gyTop}`] = 'dirt';
            for (let y = 1; y < 10; y++) world.blocks[`${x},${gyTop + y}`] = 'stone';
        }
    }

    if (keys["KeyA"] || keys["ArrowLeft"]) { player.velocityX = -player.speed; player.walkTimer += 0.15; }
    else if (keys["KeyD"] || keys["ArrowRight"]) { player.velocityX = player.speed; player.walkTimer += 0.15; }
    else { player.velocityX *= 0.8; player.walkTimer = 0; }

    world.enemies.forEach(en => {
        en.x += en.speed * en.direction;
        if (Math.abs(en.x - en.startX) > en.range) en.direction *= -1;
    });

    player.velocityY += player.gravity;
    if (player.swing > 0) player.swing--;
    player.x += player.velocityX; player.y += player.velocityY;

    if (player.y > GROUND_Y_PIXELS) { player.y = GROUND_Y_PIXELS; player.velocityY = 0; player.isGrounded = true; }
    else player.isGrounded = false;

    if ((keys["Space"] || keys["ArrowUp"]) && player.isGrounded) { player.velocityY = player.jumpForce; player.isGrounded = false; }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

loadAssets(() => { setupInputs(); gameLoop(); });
