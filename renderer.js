import { ctx, canvas, player, state, world, BLOCK_SIZE, GROUND_Y_PIXELS, gScale } from './config.js';

export function draw() {
    // 1. DRAW BACKGROUND FIRST (So it doesn't cover the UI)
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bobAmount = Math.sin(player.walkTimer) * (player.isGrounded ? 5 : 0);
    const camBob = bobAmount * 0.07;
    const camX = -player.x + canvas.width / 2;

    // 2. DRAW WORLD OBJECTS
    ctx.save();
    ctx.translate(camX, camBob); 

    const startX = Math.floor((player.x - canvas.width) / BLOCK_SIZE);
    const endX = Math.floor((player.x + canvas.width) / BLOCK_SIZE);

    for (let gx = startX; gx < endX; gx++) {
        for (let gy = 0; gy < 30; gy++) {
            const block = world.blocks[`${gx},${gy}`];
            if (block) {
                ctx.fillStyle = (block === 'dirt') ? "#3d2b1f" : "#757575";
                ctx.fillRect(gx * BLOCK_SIZE, gy * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                if (block === 'dirt' && gy === Math.floor(GROUND_Y_PIXELS/BLOCK_SIZE) && world.images['grass']) {
                    const gW = BLOCK_SIZE * gScale;
                    ctx.drawImage(world.images['grass'], (gx * BLOCK_SIZE) - (gW - BLOCK_SIZE)/2, (gy * BLOCK_SIZE) - 25, gW + 4, 40);
                }
            }
        }
    }

    world.trees.forEach(t => {
        const img = world.images[t.type];
        if (img) ctx.drawImage(img, t.x - (img.width*t.scale)/2, GROUND_Y_PIXELS - (img.height*t.scale*world.anchors[t.type]), img.width*t.scale, img.height*t.scale);
    });

    world.enemies.forEach(en => { if (world.images['book']) ctx.drawImage(world.images['book'], en.x, en.y, en.width, en.height); });

    // Player drawing
    const legSwing = Math.sin(player.walkTimer) * 15, armSwing = Math.cos(player.walkTimer) * 10;
    ctx.strokeStyle = "#222"; ctx.lineWidth = 4; ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(player.x, player.y - 55, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(player.x, player.y - 47); ctx.lineTo(player.x, player.y - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(player.x, player.y - 20); ctx.lineTo(player.x + legSwing, player.y); 
    ctx.moveTo(player.x, player.y - 20); ctx.lineTo(player.x - legSwing, player.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(player.x, player.y - 35); ctx.lineTo(player.x + 15, player.y - 35 + (player.swing > 0 ? player.swing : armSwing)); ctx.stroke();

    ctx.restore();

    // 3. DRAW UI ELEMENTS LAST (So they are always on top)
    
    // Help Button [?]
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(canvas.width - 50, 10, 40, 40);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 50, 10, 40, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("?", canvas.width - 30, 40);
    ctx.textAlign = "left";

    // Score and Lives
    ctx.fillStyle = "white"; ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`ניקוד: ${state.score} / ${state.targetScore}`, canvas.width - 20, 80); // Adjusted Y so it doesn't hit the button
    ctx.textAlign = "left";
    ctx.font = "24px Arial";
    ctx.fillText("❤️".repeat(state.lives), 20, 30);
    ctx.fillStyle = "gold";
    ctx.fillText(`גביעים: 🏆 x ${player.inventory.trophy}`, 20, 430);

    // Help Window
    if (state.showHelp) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(100, 50, 600, 350);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 4;
        ctx.strokeRect(100, 50, 600, 350);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("איך משחקים?", 400, 100);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        const instructions = [
            ":מטרה", "להשיג 100 נקודות על ידי ניצחון בקרבות נגד ספרים", "",
            ":מקשים", "תנועה וקפיצה - (WASD) או חצים", "בשביל לפתוח את התפריט (מלאי) - Tab",
            "החלפת כלים - מספרים 1-4", "חציבה/תקיפה/בנייה - לחיצה עם העכבר", "",
            ":איך להילחם", "בשביל להכנס לקרב צריך ללחוץ על הספרים המרחפים",
            ".תשובה נכונה מעניקה נקודות, טעות מורידה חיים", "",
            "!ללחוץ בכל מקום כדי לסגור"
        ];
        instructions.forEach((line, i) => ctx.fillText(line, 400, 140 + (i * 22)));
        ctx.textAlign = "left";
    }

    // Battle, Victory, Gameover, and Hotbar logic...
    if (state.gameState === "TRIVIA") {
        ctx.fillStyle = "rgba(0, 0, 30, 0.9)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (world.images['book']) ctx.drawImage(world.images['book'], 500, 75, 250, 300);
        ctx.fillStyle = "#FFD700"; ctx.font = "bold 32px Arial"; ctx.fillText("קרב טריוויה!", 100, 80);
        ctx.fillStyle = "white"; ctx.font = "20px Arial"; ctx.fillText(state.currentQuestion.q, 100, 140);
        state.currentQuestion.options.forEach((opt, i) => {
            const btnY = 200 + (i * 60);
            ctx.fillStyle = "#333"; ctx.fillRect(100, btnY, 300, 45);
            ctx.fillStyle = "white"; ctx.fillText(opt, 120, btnY + 30);
        });
    }

    // (Include the rest of your original state checks: CORRECT_FEEDBACK, GAMEOVER, VICTORY, PLAYING/HOTBAR, INVENTORY)
    if (state.gameState === "CORRECT_FEEDBACK") { /* ... as in your original ... */ }
    if (state.gameState === "GAMEOVER") { /* ... as in your original ... */ }
    if (state.gameState === "VICTORY") { /* ... as in your original ... */ }
    if (state.gameState === "PLAYING") { /* ... as in your original ... */ }
    if (player.showInventory && state.gameState === "PLAYING") { /* ... as in your original ... */ }
}