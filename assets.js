import { world, GROUND_Y_PIXELS, BLOCK_SIZE, TREE_SCALE } from './config.js';

const fileNames = ['grass', 'tree_medium', 'pine', 'tree_lush', 'tree_puffy', 'tree_round', 'book'];

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function processImage(img, name) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img.width; tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    let lowestY = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 0 && data[i+1] === 0 && data[i+2] === 0) data[i+3] = 0; 
        else {
            const y = Math.floor((i / 4) / img.width);
            if (y > lowestY) lowestY = y;
            data[i+3] = 255;
        }
    }
    tempCtx.putImageData(imageData, 0, 0);
    const cleanedImg = new Image();
    cleanedImg.src = tempCanvas.toDataURL();
    world.anchors[name] = lowestY / img.height;
    return cleanedImg;
}

export function loadAssets(callback) {
    let loadedCount = 0;
    fileNames.forEach(name => {
        const rawImg = new Image();
        rawImg.src = `sprites/${name}.png`;
        rawImg.onload = () => {
            world.images[name] = processImage(rawImg, name);
            if (++loadedCount === fileNames.length) { initWorld(); callback(); }
        };
        rawImg.onerror = () => { if (++loadedCount === fileNames.length) { initWorld(); callback(); }};
    });
}

function initWorld() {
    const gyTop = Math.floor(GROUND_Y_PIXELS / BLOCK_SIZE);
    for (let x = -100; x < 500; x++) {
        world.blocks[`${x},${gyTop}`] = 'dirt';
        for (let y = 1; y < 10; y++) world.blocks[`${x},${gyTop + y}`] = 'stone';
    }
    for(let i = -50; i < 200; i++) {
        if(seededRandom(i) > 0.85) {
            const types = ['tree_medium', 'pine', 'tree_lush', 'tree_puffy', 'tree_round'];
            world.trees.push({ 
                x: i * 250 + (seededRandom(i+1)*100), 
                type: types[Math.floor(seededRandom(i+2)*types.length)],
                hp: 3, scale: TREE_SCALE
            });
        }
        if(seededRandom(i + 1000) > 0.96) {
            world.enemies.push({
                x: i * 250, y: GROUND_Y_PIXELS - 100, width: 80, height: 100,
                speed: 1.2, direction: 1, startX: i * 250, range: 150
            });
        }
    }
}
