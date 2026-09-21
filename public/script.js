// ==================== CONFIG ====================
const CONFIG = {
    WINDOW: { WIDTH: 1200, HEIGHT: 600 },
    PLAYER: { SIZE: 40, SCREEN_X: 100, BOTTOM_OFFSET: 50 },
    GROUND: { HEIGHT: 50, PATTERN_SIZE: 80 },
    OBSTACLES: {
        SPIKE: { WIDTH: 40, HEIGHT: 40 },
        BLOCK: { WIDTH: 40 },
        PORTAL: { WIDTH: 20, HEIGHT: 120 },
        HOLE: { WIDTH: 80 },
        CEILING_LINE: { WIDTH: 40, HEIGHT: 50 }
    },
    FINISH_LINE: { WIDTH: 20 },
    PHYSICS: {
        GRAVITY: 0.6,
        JUMP_STRENGTH: -14,
        PUSH_FORCE: 15,
        PUSH_DECAY: 0.85,
        SHIP_THRUST: 0.35,
        SHIP_MAX_SPEED: 4,
        SHIP_ROTATION_FACTOR: 3
    },
    DEFAULT_SPEED: 4
};

// ==================== STAGES ====================
const stages = [
    {
        builtIn: true,
        name: "Stage 1: First Steps",
        worldSpeed: CONFIG.DEFAULT_SPEED,
        color: "#00ffcc",
        obstacles: [
            { type: "spike", x: 600 },
            { type: "block", x: 1000, height: CONFIG.OBSTACLES.BLOCK.WIDTH },
            { type: "spike", x: 1400 },
            { type: "spike", x: 1460 },
        ],
        finishX: 2500
    },
    {
        builtIn: true,
        name: "Stage 2: Double Trouble",
        worldSpeed: 4.5,
        color: "#ff66cc",
        obstacles: [
            { type: "spike", x: 500 },
            { type: "block", x: 800, height: CONFIG.OBSTACLES.BLOCK.WIDTH },
            { type: "spike", x: 860 },
            { type: "block", x: 1200, height: 80 },
            { type: "spike", x: 1600 },
            { type: "spike", x: 1660 },
        ],
        finishX: 3000
    },
    {
        builtIn: true,
        name: "Stage 3: Ship Trial",
        startMode: "ship",
        worldSpeed: 4,
        color: "#ffcc00",
        obstacles: [
            { type: "block", x: 600, height: 40, stackLevel: 0 },
            { type: "block", x: 640, height: 40, stackLevel: 1 },
            { type: "block", x: 1000, height: 40, stackLevel: 0 },
            { type: "block", x: 1000, height: 40, stackLevel: 3 },
            { type: "block", x: 1040, height: 40, stackLevel: 0 },
            { type: "block", x: 1040, height: 40, stackLevel: 3 },
            { type: "spike", x: 1400 },
            { type: "spike", x: 1440 },
            { type: "block", x: 1800, height: 40, stackLevel: 0 },
            { type: "block", x: 1800, height: 40, stackLevel: 1 },
            { type: "block", x: 1800, height: 40, stackLevel: 2 },
        ],
        finishX: 2200
    },
    {
        builtIn: true,
        name: "Stage 4: Portal Shift",
        startMode: "cube",
        worldSpeed: 4,
        color: "#00aaff",
        obstacles: [
            { type: "spike", x: 500 },
            { type: "portal", x: 800, targetMode: "ship" },
            { type: "block", x: 1200, height: 40, stackLevel: 2 },
            { type: "block", x: 1240, height: 40, stackLevel: 0 },
            { type: "spike", x: 1400 },
            { type: "portal", x: 1700, targetMode: "cube" },
            { type: "block", x: 2000, height: 40 },
            { type: "spike", x: 2100 },
            { type: "spike", x: 2160 }
        ],
        finishX: 2600
    },
    {
        builtIn: true,
        name: "Stage 5: Gravity Flip",
        startMode: "cube",
        worldSpeed: 4,
        color: "#ff00ff",
        obstacles: [
            { type: "spike", x: 600 },
            { type: "spike", x: 660 },
            { type: "portal", x: 1000, targetMode: "ball" },
            { type: "spike", x: 1400 },
            { type: "spike", x: 1460 },
            { type: "block", x: 1800, height: 40 },
            { type: "spike", x: 2200 },
            { type: "spike", x: 2260 },
            { type: "portal", x: 2600, targetMode: "cube" },
            { type: "spike", x: 3000 },
            { type: "block", x: 3400, height: 40 }
        ],
        finishX: 3800
    }
];

// ==================== GAME STATE ====================
let currentStage = null;
let cameraX = 0;
let playerWorldX = CONFIG.PLAYER.SCREEN_X;
let playerY = 0;
let velocityY = 0;
let pushVelocity = 0;
let playerMode = 'cube';
let isHoldingSpace = false;
let isOnGround = true;
let gameRunning = false;
let gameWon = false;
let gameLost = false;
let obstacleElements = [];
let gravityDir = 1;
let isFalling = false;

const gravity = CONFIG.PHYSICS.GRAVITY;
const jumpStrength = CONFIG.PHYSICS.JUMP_STRENGTH;
const pushForce = CONFIG.PHYSICS.PUSH_FORCE;
const pushDecay = CONFIG.PHYSICS.PUSH_DECAY;

// ==================== DOM ====================
const menuScreen = document.getElementById('menuScreen');
const gameArea = document.getElementById('gameArea');
const winOverlay = document.getElementById('winOverlay');
const loseOverlay = document.getElementById('loseOverlay');
const player = document.getElementById('player');
const groundLine = document.getElementById('groundLine');
const finishLine = document.getElementById('finishLine');
const obstacleContainer = document.getElementById('obstacleContainer');
const stageList = document.getElementById('stageList');

// ==================== MENU ====================
function buildMenu() {
    stageList.innerHTML = '';
    stages.forEach((stage, index) => {
        const row = document.createElement('div');
        row.className = 'stage-row';

        const btn = document.createElement('button');
        btn.className = 'stage-btn';
        btn.textContent = stage.name;
        btn.onclick = () => startStage(index);
        row.appendChild(btn);

        if (!stage.builtIn) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-stage-btn';
            deleteBtn.textContent = '✕';
            deleteBtn.onclick = () => deleteStage(index);
            row.appendChild(deleteBtn);
        }
        stageList.appendChild(row);
    });
}

function showMenu() {
    menuScreen.classList.remove('hidden');
    gameArea.classList.add('hidden');
    winOverlay.classList.add('hidden');
    loseOverlay.classList.add('hidden');
    gameRunning = false;
}

function deleteStage(index) {
    const stage = stages[index];
    if (stage.builtIn) {
        alert('⚠️ Built-in stages cannot be deleted!');
        return;
    }
    if (confirm(`Delete "${stage.name}"?`)) {
        stages.splice(index, 1);
        buildMenu();
    }
}

// ==================== START STAGE ====================
function startStage(stageIndex) {
    gameRunning = false;
    gameWon = false;
    gameLost = false;
    currentStage = stages[stageIndex];

    cameraX = 0;
    playerWorldX = CONFIG.PLAYER.SCREEN_X;
    velocityY = 0;
    pushVelocity = 0;
    playerMode = currentStage.startMode || 'cube';
    isHoldingSpace = false;
    gravityDir = 1;
    isFalling = false;

    player.classList.remove('ship-mode', 'ball-mode');
    gameArea.classList.remove('ball-mode-active');

    if (playerMode === 'ship') {
        player.classList.add('ship-mode');
        playerY = -150;
        isOnGround = false;
    } else if (playerMode === 'ball') {
        player.classList.add('ball-mode');
        gameArea.classList.add('ball-mode-active');
        playerY = 0;
        isOnGround = true;
    } else {
        player.classList.remove('ship-mode');
        playerY = 0;
        isOnGround = true;
    }

    updateDangerColors();
    obstacleContainer.innerHTML = '';
    obstacleElements = [];

    currentStage.obstacles.forEach(obs => {
        const el = document.createElement('div');
        el.className = `obstacle ${obs.type}`;
        
        if (obs.type === 'spike') {
            el.style.width = CONFIG.OBSTACLES.SPIKE.WIDTH + 'px';
            el.style.height = CONFIG.OBSTACLES.SPIKE.HEIGHT + 'px';
            const stackLevel = obs.stackLevel || 0;
            const bottomPos = CONFIG.GROUND.HEIGHT + (stackLevel * CONFIG.OBSTACLES.BLOCK.WIDTH);
            el.style.bottom = bottomPos + 'px';
        } else if (obs.type === 'block') {
            el.style.width = CONFIG.OBSTACLES.BLOCK.WIDTH + 'px';
            el.style.height = obs.height + 'px';
            const stackLevel = obs.stackLevel || 0;
            const bottomPos = CONFIG.GROUND.HEIGHT + (stackLevel * CONFIG.OBSTACLES.BLOCK.WIDTH);
            el.style.bottom = bottomPos + 'px';
        } else if (obs.type === 'portal') {
            el.style.width = CONFIG.OBSTACLES.PORTAL.WIDTH + 'px';
            el.style.height = CONFIG.OBSTACLES.PORTAL.HEIGHT + 'px';
            if (obs.bottom !== undefined) {
                el.style.bottom = obs.bottom + 'px';
            }
            if (obs.targetMode === 'ship') el.classList.add('portal-ship');
            else if (obs.targetMode === 'cube') el.classList.add('portal-cube');
            else if (obs.targetMode === 'ball') el.classList.add('portal-ball');
        } else if (obs.type === 'ground-hole') {
            el.style.width = (obs.width || CONFIG.OBSTACLES.HOLE.WIDTH) + 'px';
            el.style.height = CONFIG.GROUND.HEIGHT + 'px';
            el.style.bottom = '0px';
        } else if (obs.type === 'ceiling-hole') {
            el.style.width = (obs.width || CONFIG.OBSTACLES.HOLE.WIDTH) + 'px';
            el.style.height = CONFIG.GROUND.HEIGHT + 'px';
            el.style.bottom = (CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT) + 'px';
        } else if (obs.type === 'ceiling-line') {
            el.style.width = (obs.width || CONFIG.OBSTACLES.CEILING_LINE.WIDTH) + 'px';
            el.style.height = CONFIG.OBSTACLES.CEILING_LINE.HEIGHT + 'px';
            const stackLevel = obs.stackLevel || 0;
            const bottomPos = CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - (stackLevel * CONFIG.OBSTACLES.CEILING_LINE.HEIGHT);
            el.style.bottom = bottomPos + 'px';
        }

        if (obs.rotation) {
            el.style.transform = `rotate(${obs.rotation}deg)`;
        }

        obstacleContainer.appendChild(el);
        obstacleElements.push({ el, data: obs });
    });

    finishLine.style.width = CONFIG.FINISH_LINE.WIDTH + 'px';

    menuScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');
    winOverlay.classList.add('hidden');
    loseOverlay.classList.add('hidden');

    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// ==================== INPUT ====================
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        isHoldingSpace = true;
        if (playerMode === 'cube' && isOnGround && gameRunning && !gameWon && !gameLost) {
            velocityY = jumpStrength;
            isOnGround = false;
        } else if (playerMode === 'ball' && gameRunning && !gameWon && !gameLost) {
            gravityDir *= -1;
        }
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        isHoldingSpace = false;
    }
});

window.addEventListener('mousedown', () => {
    isHoldingSpace = true;
    if (playerMode === 'cube' && isOnGround && gameRunning && !gameWon && !gameLost) {
        velocityY = jumpStrength;
        isOnGround = false;
    } else if (playerMode === 'ball' && gameRunning && !gameWon && !gameLost) {
        gravityDir *= -1;
    }
});

window.addEventListener('mouseup', () => { isHoldingSpace = false; });

// ==================== DANGER COLOR SYSTEM ====================
function updateDangerColors() {
    if (playerMode === 'ball') {
        
        /*
        player.style.setProperty('--danger-color-1', '#ff00ff');
        player.style.setProperty('--danger-color-2', '#cc00cc');
        player.style.setProperty('--danger-glow-1', 'rgba(255, 0, 255, 0.6)');
        player.style.setProperty('--danger-glow-2', 'rgba(255, 0, 255, 0.9)');
        */
       player.style.setProperty('--danger-color-1', '#ff00ff');
    } else {
        
        /*
        player.style.setProperty('--danger-color-1', '#00ffcc');
        player.style.setProperty('--danger-color-2', '#00cc99');
        player.style.setProperty('--danger-glow-1', 'rgba(0, 255, 204, 0.6)');
        player.style.setProperty('--danger-glow-2', 'rgba(0, 255, 204, 0.9)');
        */
       player.style.setProperty('--danger-color-1', '#00ffcc');
    }
}

// ==================== GAME LOOP ====================
function switchMode(newMode) {
    if (playerMode === newMode) return;
    playerMode = newMode;
    
    player.classList.remove('ship-mode', 'ball-mode');
    gameArea.classList.remove('ball-mode-active');

    if (newMode === 'ship') {
        player.classList.add('ship-mode');
        if (playerY > -100) playerY = -150; 
        velocityY = 0;
        isOnGround = false;
    } else if (newMode === 'ball') {
        player.classList.add('ball-mode');
        gameArea.classList.add('ball-mode-active');
        gravityDir = 1;
        playerY = 0; 
        velocityY = 0; 
        isOnGround = true;
    } else {
        player.classList.remove('ship-mode');
        playerY = 0;
        velocityY = 0;
        isOnGround = true;
    }
    updateDangerColors();
}

// ==================== PROXIMITY SYSTEM ====================
function getClosestThreatDistance() {
    let minDist = Infinity;
    const playerRight = playerWorldX + CONFIG.PLAYER.SIZE;
    const playerBottom = -playerY; 
    const playerTop = playerBottom + CONFIG.PLAYER.SIZE;

    obstacleElements.forEach(({ data }) => {
        if (data.type === 'finish' || data.type === 'portal') return;
        
        const distX = data.x - playerRight;
        
        if (distX < -40 || distX > 300) return;

        let obsBottom = 0, obsTop = 0;
        let isThreat = false;

        
        if (data.type === 'spike' || data.type === 'block') {
            obsBottom = (data.stackLevel || 0) * CONFIG.OBSTACLES.BLOCK.WIDTH;
            obsTop = obsBottom + (data.type === 'spike' ? CONFIG.OBSTACLES.SPIKE.HEIGHT : data.height);
            isThreat = true;
        } else if (data.type === 'ground-hole') {
            if (isOnGround && playerMode !== 'ship') {
                obsBottom = 0; obsTop = CONFIG.GROUND.HEIGHT; isThreat = true;
            }
        } else if (data.type === 'ceiling-hole') {
            if (playerMode === 'ball' && gravityDir === -1 && isOnGround) {
                obsBottom = CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT; 
                obsTop = CONFIG.WINDOW.HEIGHT; isThreat = true;
            }
        } else if (data.type === 'ceiling-line') {
            const stackLevel = data.stackLevel || 0;
            obsTop = CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - (stackLevel * CONFIG.OBSTACLES.CEILING_LINE.HEIGHT);
            obsBottom = obsTop - CONFIG.OBSTACLES.CEILING_LINE.HEIGHT;
            isThreat = true;
        }

        
        if (isThreat) {
            const margin = 5;
            if (playerTop > obsBottom - margin && playerBottom < obsTop + margin) {
                if (distX < minDist) minDist = distX;
            }
        }
    });
    return minDist;
}

function gameLoop() {
    if (!gameRunning || gameWon || gameLost) return;

    cameraX += currentStage.worldSpeed;

    const ceilingY = -(CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - CONFIG.PLAYER.SIZE);

    if (isFalling) {
        velocityY += gravity * gravityDir;
        playerY += velocityY;
        
        if (playerY > 100 || playerY < -500) {
            die();
            return;
        }
    } else if (playerMode === 'cube') {
        velocityY += gravity;
        playerY += velocityY; 
        if (playerY >= 0) {
            playerY = 0;
            velocityY = 0;
            isOnGround = true;
        }
    } else if (playerMode === 'ship') {
        if (isHoldingSpace) {
            velocityY -= CONFIG.PHYSICS.SHIP_THRUST;
        } else {
            velocityY += gravity;
        }
        velocityY = Math.max(-CONFIG.PHYSICS.SHIP_MAX_SPEED, Math.min(CONFIG.PHYSICS.SHIP_MAX_SPEED, velocityY));
        playerY += velocityY; 

        if (playerY >= 0) {
            playerY = 0;
            if (velocityY > 0) velocityY = 0;
        } else if (playerY <= ceilingY) {
            playerY = ceilingY;
            if (velocityY < 0) velocityY = 0;
        }
    } else if (playerMode === 'ball') {
        velocityY += gravity * gravityDir;
        playerY += velocityY;
        
        
        const deathTop = -(CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT + 50);
        
        if (gravityDir === 1) {
            
            if (playerY >= 0) { playerY = 0; velocityY = 0; isOnGround = true; }
        } else {
            
            if (playerY >= 0) { playerY = 0; velocityY = 0; isOnGround = false; }
        }
        
        
        if (playerY < deathTop) { die(); return; }
    }

    playerWorldX += currentStage.worldSpeed;

    if (pushVelocity > 0) {
        playerWorldX -= pushVelocity;
        pushVelocity *= pushDecay;
        if (pushVelocity < 0.5) pushVelocity = 0;
    }

    const playerScreenX = playerWorldX - cameraX;
    if (playerScreenX <= 0) {
        die();
        return;
    }

    let rotation = 0;
    if (playerMode === 'cube') {
        rotation = isOnGround ? 0 : (playerY * -2);
    } else if (playerMode === 'ship') {
        rotation = 45;
    }

    player.style.transform = `translateX(${playerScreenX - CONFIG.PLAYER.SCREEN_X}px) translateY(${playerY}px) rotate(${rotation}deg)`;


    
    const threatDist = getClosestThreatDistance();
    const maxWarnDist = 300;
    
    if (threatDist < maxWarnDist && threatDist >= -40) {
        
        const normalized = Math.max(0, Math.min(1, (threatDist + 40) / (maxWarnDist + 40)));
        const fillAmount = 1 - normalized; 
        
        
        const pulseSpeed = 0.1 + (normalized * 0.7); 
        
        
        player.style.setProperty('--danger-fill', fillAmount);
        player.style.setProperty('--pulse-speed', pulseSpeed + 's');
    } else {
        
        player.style.setProperty('--danger-fill', 0);
    }

    const playerLeft = playerWorldX;
    const playerRight = playerWorldX + CONFIG.PLAYER.SIZE;
    const playerBottom = -playerY;
    const playerTop = playerBottom + CONFIG.PLAYER.SIZE;

  
    if (!isFalling) {
        let shouldFall = false;
        
        obstacleElements.forEach(({ el, data }) => {
            if (data.type === 'ground-hole') {
                const holeLeft = data.x;
                const holeRight = data.x + (data.width || CONFIG.OBSTACLES.HOLE.WIDTH);
                
                if (playerRight > holeLeft + 5 && playerLeft < holeRight - 5 && isOnGround) {
                    shouldFall = true;
                }
            } else if (data.type === 'ceiling-hole' && playerMode === 'ball' && gravityDir === -1) {
                const holeLeft = data.x;
                const holeRight = data.x + (data.width || CONFIG.OBSTACLES.HOLE.WIDTH);
                
                if (playerRight > holeLeft + 5 && playerLeft < holeRight - 5 && isOnGround) {
                    shouldFall = true;
                }
            }
        });
        
        if (shouldFall) {
            isFalling = true;
            isOnGround = false;
            velocityY = 0;
        }
    }                                  

    obstacleElements.forEach(({ el, data }) => {
        const screenX = data.x - cameraX;
        const rot = data.rotation || 0;
        el.style.transform = `translateX(${screenX}px) rotate(${rot}deg)`;

        if (screenX < -100 || screenX > CONFIG.WINDOW.WIDTH + 100) return;

        let baseW = data.type === 'spike' ? CONFIG.OBSTACLES.SPIKE.WIDTH : 
                    (data.type === 'portal' ? CONFIG.OBSTACLES.PORTAL.WIDTH : 
                    (data.type === 'ground-hole' || data.type === 'ceiling-hole' ? (data.width || CONFIG.OBSTACLES.HOLE.WIDTH) :
                    (data.type === 'ceiling-line' ? (data.width || CONFIG.OBSTACLES.CEILING_LINE.WIDTH) : CONFIG.OBSTACLES.BLOCK.WIDTH)));
        
        let baseH = data.type === 'spike' ? CONFIG.OBSTACLES.SPIKE.HEIGHT : 
                    (data.type === 'portal' ? CONFIG.OBSTACLES.PORTAL.HEIGHT : 
                    (data.type === 'ground-hole' || data.type === 'ceiling-hole' ? CONFIG.GROUND.HEIGHT :
                    (data.type === 'ceiling-line' ? CONFIG.OBSTACLES.CEILING_LINE.HEIGHT : (data.height || CONFIG.OBSTACLES.BLOCK.WIDTH))));

        if (rot === 90 || rot === 270) {
            const temp = baseW;
            baseW = baseH;
            baseH = temp;
        }

        const obsLeft = data.x;
        const obsRight = data.x + baseW;

        if (data.type === 'portal') {
            
            const portalBottom = (data.bottom || CONFIG.GROUND.HEIGHT) - CONFIG.GROUND.HEIGHT;
            const portalTop = portalBottom + CONFIG.OBSTACLES.PORTAL.HEIGHT;

            if (playerRight > obsLeft && playerLeft < obsRight &&
             playerTop > portalBottom && playerBottom < portalTop) {
                if (!data.triggered) {
                    data.triggered = true;
                    switchMode(data.targetMode);
                }
            } else {
                data.triggered = false;
            }
            return;
        }

        if (data.type === 'ground-hole' || data.type === 'ceiling-hole') {
            return;
        }

        if (data.type === 'ceiling-line') {
            const stackLevel = data.stackLevel || 0;
            const obsTop = CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - (stackLevel * CONFIG.OBSTACLES.CEILING_LINE.HEIGHT);
            const obsBottom = obsTop - CONFIG.OBSTACLES.CEILING_LINE.HEIGHT;

            if (playerRight > obsLeft && playerLeft < obsRight) {
                if (playerMode === 'ball' && gravityDir === -1) {
                    if (playerTop >= obsBottom && playerTop <= obsBottom + 15 && velocityY <= 0) {
                        playerY = CONFIG.PLAYER.SIZE - (CONFIG.WINDOW.HEIGHT - obsBottom);
                        velocityY = 0;
                        isOnGround = true;
                    } else if (playerRight > obsLeft && playerRight < obsLeft + 20 && playerTop < obsBottom - 5) {
                        pushVelocity = pushForce;
                    }
                } else if (playerMode === 'ship') {
                    if (playerBottom < obsTop && playerTop > obsBottom) {
                        if (velocityY < 0 && playerTop >= obsBottom - 10) {
                            playerY = -(CONFIG.WINDOW.HEIGHT - obsBottom + CONFIG.PLAYER.SIZE);
                            velocityY = 0;
                        } else if (velocityY >= 0 && playerBottom <= obsTop + 10) {
                            playerY = -(CONFIG.WINDOW.HEIGHT - obsTop);
                            velocityY = 0;
                        } else {
                            pushVelocity = pushForce;
                        }
                    }
                }
            }
            return;
        }

        const obsBottom = (data.type === 'block' || data.type === 'spike') ? (data.stackLevel || 0) * CONFIG.OBSTACLES.BLOCK.WIDTH : 0;
        const obsTop = obsBottom + (data.type === 'spike' ? CONFIG.OBSTACLES.SPIKE.HEIGHT : data.height);

        if (playerRight > obsLeft && playerLeft < obsRight) {
            if (data.type === 'spike') {
                if (playerBottom < obsTop && playerTop > obsBottom) die();
            } 
            else if (data.type === 'block') {
                if (playerMode === 'cube') {
                    if (playerBottom <= obsTop && playerBottom >= obsTop - 15 && velocityY >= 0) {
                        playerY = -obsTop;
                        velocityY = 0;
                        isOnGround = true;
                    } else if (playerRight > obsLeft && playerRight < obsLeft + 20 && playerBottom < obsTop - 5) {
                        pushVelocity = pushForce;
                    }
                } 
                else if (playerMode === 'ship') {
                    if (playerRight > obsLeft && playerRight < obsLeft + 20 && playerBottom < obsTop - 5) {
                        pushVelocity = pushForce;
                    } 
                    else if (playerBottom < obsTop && playerTop > obsBottom) {
                        if (velocityY >= 0 && playerBottom <= obsTop + 10) {
                            playerY = -obsTop;
                            velocityY = 0;
                        } else if (velocityY < 0 && playerTop >= obsBottom - 10) {
                            playerY = -(obsBottom + CONFIG.PLAYER.SIZE);
                            velocityY = 0;
                        } else {
                            pushVelocity = pushForce;
                        }
                    }
                }
                else if (playerMode === 'ball') {
                    if (gravityDir === 1) {
                        if (playerBottom <= obsTop && playerBottom >= obsTop - 15 && velocityY >= 0) {
                            playerY = -obsTop; velocityY = 0; isOnGround = true;
                        } 
                        else if (playerRight > obsLeft && playerRight < obsLeft + 20 && 
                                 playerBottom >= obsBottom - 5 && playerBottom < obsTop - 5) {
                            pushVelocity = pushForce;
                        }
                    } else {
                        if (playerTop >= obsBottom && playerTop <= obsBottom + 15 && velocityY <= 0) {
                            playerY = CONFIG.PLAYER.SIZE - obsBottom;
                            velocityY = 0;
                            isOnGround = true;
                        } 
                        else if (playerRight > obsLeft && playerRight < obsLeft + 20 && 
                                 playerTop <= obsTop + 5 && playerTop > obsBottom + 5) {
                            pushVelocity = pushForce;
                        }
                    }
                }
            }
            else if (data.type === 'portal') {
                const portalBottom = data.bottom || CONFIG.GROUND.HEIGHT;
                const portalTop = portalBottom + CONFIG.OBSTACLES.PORTAL.HEIGHT;
                if (playerRight > obsLeft && playerLeft < obsRight &&
                    playerTop > portalBottom && playerBottom < portalTop) {
                    if (!data.triggered) {
                        data.triggered = true;
                        switchMode(data.targetMode);
                    }
                } else {
                    data.triggered = false;
                }
                return;
            }
        }
    });

    const finishScreenX = currentStage.finishX - cameraX;
    finishLine.style.transform = `translateX(${finishScreenX}px)`;

    if (finishScreenX <= playerScreenX + CONFIG.PLAYER.SIZE) {
        win();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// ==================== WIN/LOSE ====================
function win() {
    gameWon = true;
    gameRunning = false;
    winOverlay.classList.remove('hidden');
}

function die() {
    gameLost = true;
    gameRunning = false;
    loseOverlay.classList.remove('hidden');
}

// ==================== BUTTONS ====================
document.getElementById('nextStageBtn').onclick = () => {
    const currentIndex = stages.indexOf(currentStage);
    const nextIndex = (currentIndex + 1) % stages.length;
    startStage(nextIndex);
};

document.getElementById('retryBtn').onclick = () => {
    startStage(stages.indexOf(currentStage));
};

document.getElementById('menuBtn1').onclick = showMenu;
document.getElementById('menuBtn2').onclick = showMenu;

// ==================== EDITOR ====================
let isTestModeFromEditor = false;
let testStageIndex = -1;

const editorState = {
    obstacles: [],
    selectedId: null,
    nextId: 1,
    selectedPaletteItem: null,
    isDraggingObstacle: false,
    dragData: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    stageWidth: 5000,
    gridSize: 40
};

const editorScreen = document.getElementById('editorScreen');
const editorStage = document.getElementById('editorStage');
const editorObstacles = document.getElementById('editorObstacles');
const obstacleListItems = document.getElementById('obstacleListItems');
const obstacleCount = document.getElementById('obstacleCount');

function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

function openEditor() {
    document.body.classList.add('editor-open');
    menuScreen.classList.add('hidden');
    editorScreen.classList.remove('hidden');

    editorState.obstacles = [];
    editorState.selectedId = null;
    editorState.nextId = 1;
    editorState.selectedPaletteItem = null;
    editorObstacles.innerHTML = '';
    refreshObstacleList();

    document.getElementById('editorStageName').value = 'My Custom Stage';
    document.getElementById('editorStageSpeed').value = CONFIG.DEFAULT_SPEED;
    document.getElementById('editorFinishX').value = 2500;

    document.querySelectorAll('.palette-item').forEach(p => p.classList.remove('selected'));

    const wrapper = document.querySelector('.editor-stage-wrapper');
    if (wrapper) wrapper.scrollLeft = 0;
}

function closeEditor() {
    document.body.classList.remove('editor-open');
    editorScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

document.getElementById('editorFinishX').addEventListener('input', () => {
    const finishX = parseInt(document.getElementById('editorFinishX').value);
    if (isNaN(finishX)) return;

    const existingFinish = editorState.obstacles.find(o => o.type === 'finish');
    if (existingFinish) {
        existingFinish.x = finishX;
        existingFinish.el.style.left = finishX + 'px';
        refreshObstacleList();
    } else {
        addObstacle('finish', finishX, 300);
    }
});

document.querySelectorAll('.palette-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.palette-item').forEach(p => p.classList.remove('selected'));
        item.classList.add('selected');
        editorState.selectedPaletteItem = { type: item.dataset.type };
        selectObstacle(null);
    });
});

editorStage.addEventListener('mousedown', (e) => {
    if (e.target.closest('.editor-obstacle')) return;

    if (editorState.selectedPaletteItem) {
        const wrapper = document.querySelector('.editor-stage-wrapper');
        const stageRect = editorStage.getBoundingClientRect();
        
        const clickX = e.clientX - stageRect.left;
        const clickY = e.clientY - stageRect.top;

        const gridX = snapToGrid(clickX, editorState.gridSize);
        const gridY = snapToGrid(clickY, editorState.gridSize);

        const { type } = editorState.selectedPaletteItem;

        if (type === 'finish') {
            addObstacle('finish', gridX, 300);
        } else if (type === 'spike') {
            const spikeBottom = stageRect.height - gridY - CONFIG.OBSTACLES.SPIKE.HEIGHT;
            const bottomPosition = Math.max(CONFIG.GROUND.HEIGHT, spikeBottom); 
            addObstacle('spike', gridX, CONFIG.OBSTACLES.SPIKE.HEIGHT, bottomPosition);
        } else if (type === 'block') {
            const blockBottom = stageRect.height - gridY - CONFIG.OBSTACLES.BLOCK.WIDTH;
            const stackLevel = Math.max(0, Math.round((blockBottom - CONFIG.GROUND.HEIGHT) / editorState.gridSize));
            const bottomPosition = CONFIG.GROUND.HEIGHT + (stackLevel * editorState.gridSize);
            addObstacle('block', gridX, editorState.gridSize, bottomPosition);
        } else if (type === 'portal-ship' || type === 'portal-cube' || type === 'portal-ball') {
             let targetMode = 'cube';
             if (type === 'portal-ship') targetMode = 'ship';
             else if (type === 'portal-ball') targetMode = 'ball';
             const portalBottom = stageRect.height - gridY - CONFIG.OBSTACLES.PORTAL.HEIGHT;
             const bottomPosition = Math.max(CONFIG.GROUND.HEIGHT, portalBottom);
             addObstacle('portal', gridX, CONFIG.OBSTACLES.PORTAL.HEIGHT, bottomPosition, targetMode);
            
            
        } else if (type === 'ground-hole') {
            addObstacle('ground-hole', gridX, CONFIG.GROUND.HEIGHT, 0);
        } else if (type === 'ceiling-hole') {
            addObstacle('ceiling-hole', gridX, CONFIG.GROUND.HEIGHT, CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT);
            
        } else if (type === 'ceiling-line') {
            const existingCeilingLines = editorState.obstacles.filter(o => o.type === 'ceiling-line');
            const stackLevel = existingCeilingLines.length;
            const bottomPosition = CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - (stackLevel * CONFIG.OBSTACLES.CEILING_LINE.HEIGHT);
            addObstacle('ceiling-line', gridX, CONFIG.OBSTACLES.CEILING_LINE.HEIGHT, bottomPosition, null, stackLevel);
            
        }
    } else {
        selectObstacle(null);
    }
});


document.addEventListener('mousemove', (e) => {
    if (!editorState.isDraggingObstacle) return;

    const obs = editorState.dragData;
    const wrapper = document.querySelector('.editor-stage-wrapper');
    const stageRect = editorStage.getBoundingClientRect();

    const clickX = e.clientX - stageRect.left - editorState.dragOffsetX;
    const clickY = e.clientY - stageRect.top - editorState.dragOffsetY;

    const gridX = snapToGrid(clickX, editorState.gridSize);
    const gridY = snapToGrid(clickY, editorState.gridSize);

    obs.x = Math.max(0, Math.min(gridX, editorState.stageWidth - 40));
    obs.el.style.left = obs.x + 'px';

    if (obs.type === 'block' || obs.type === 'spike' || obs.type === 'portal') {
        const itemHeight = obs.type === 'block' ? CONFIG.OBSTACLES.BLOCK.WIDTH : 
                            (obs.type === 'spike' ? CONFIG.OBSTACLES.SPIKE.HEIGHT : CONFIG.OBSTACLES.PORTAL.HEIGHT);
        const itemBottom = stageRect.height - gridY - itemHeight;
        const bottomPosition = Math.max(CONFIG.GROUND.HEIGHT, itemBottom);
        obs.bottom = bottomPosition;
        obs.el.style.bottom = bottomPosition + 'px';
    } else if (obs.type === 'ceiling-line') {
        
        const itemHeight = CONFIG.OBSTACLES.CEILING_LINE.HEIGHT;
        const mouseY = e.clientY - stageRect.top;
        const newBottom = stageRect.height - mouseY - (itemHeight / 2);
        const clampedBottom = Math.max(CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - (10 * itemHeight), Math.min(CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - itemHeight, newBottom));
        obs.bottom = clampedBottom;
        obs.el.style.bottom = clampedBottom + 'px';
        
        
        const stackLevel = Math.round((CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - clampedBottom - itemHeight) / itemHeight);
        obs.stackLevel = Math.max(0, stackLevel);
    }

    if (obs.type === 'finish') {
        document.getElementById('editorFinishX').value = obs.x;
    }

    refreshObstacleList();
});

document.addEventListener('mouseup', () => {
    if (editorState.isDraggingObstacle) {
        editorState.isDraggingObstacle = false;
        editorState.dragData = null;
    }
});

function addObstacle(type, x, height, bottomPosition, targetMode, stackLevel) {
    if (type === 'finish') {
        const existingFinish = editorState.obstacles.find(o => o.type === 'finish');
        if (existingFinish) {
            existingFinish.el.remove();
            editorState.obstacles = editorState.obstacles.filter(o => o.id !== existingFinish.id);
        }
    }

    const id = editorState.nextId++;
    const el = document.createElement('div');
    el.className = `editor-obstacle ${type}`;
    el.style.left = x + 'px';

    if (type === 'block' || type === 'spike') {
        const width = type === 'block' ? CONFIG.OBSTACLES.BLOCK.WIDTH : CONFIG.OBSTACLES.SPIKE.WIDTH;
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.style.bottom = (bottomPosition !== undefined ? bottomPosition : CONFIG.GROUND.HEIGHT) + 'px';
    } else if (type === 'finish') {
        el.style.width = CONFIG.FINISH_LINE.WIDTH + 'px';
        el.style.height = '300px';
    } else if (type === 'portal') {
         el.style.width = CONFIG.OBSTACLES.PORTAL.WIDTH + 'px';
         el.style.height = height + 'px';
         el.style.bottom = (bottomPosition !== undefined ? bottomPosition : CONFIG.GROUND.HEIGHT) + 'px';
         if (targetMode === 'ship') el.classList.add('portal-ship');
         else if (targetMode === 'cube') el.classList.add('portal-cube');
         else if (targetMode === 'ball') el.classList.add('portal-ball');
    } else if (type === 'ground-hole' || type === 'ceiling-hole') {
        el.style.width = CONFIG.OBSTACLES.HOLE.WIDTH + 'px';
        el.style.height = height + 'px';
        el.style.bottom = bottomPosition + 'px';
    } else if (type === 'ceiling-line') {
        el.style.width = CONFIG.OBSTACLES.CEILING_LINE.WIDTH + 'px';
        el.style.height = height + 'px';
        el.style.bottom = bottomPosition + 'px';
    }

    const obs = { 
        id, type, x, 
        height: type === 'block' ? height : (type === 'finish' ? 300 : 
               (type === 'ground-hole' || type === 'ceiling-hole' || type === 'ceiling-line' ? CONFIG.GROUND.HEIGHT : 
               CONFIG.OBSTACLES.SPIKE.HEIGHT)),
        bottom: bottomPosition || CONFIG.GROUND.HEIGHT,
        targetMode: type === 'portal' ? targetMode : undefined,
        rotation: 0,
        stackLevel: stackLevel || 0,
        width: type === 'ground-hole' || type === 'ceiling-hole' ? CONFIG.OBSTACLES.HOLE.WIDTH : 
               (type === 'ceiling-line' ? CONFIG.OBSTACLES.CEILING_LINE.WIDTH : undefined),
        el  
    };

    editorState.obstacles.push(obs);
    editorObstacles.appendChild(el);

    if (type === 'finish') {
        document.getElementById('editorFinishX').value = x;
    }

    el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        selectObstacle(id);
        editorState.isDraggingObstacle = true;
        editorState.dragData = obs;

        const wrapper = document.querySelector('.editor-stage-wrapper');
        const stageRect = editorStage.getBoundingClientRect();
        editorState.dragOffsetX = e.clientX - stageRect.left - x;
        
        
        if (type === 'ceiling-line') {
            const elementTop = stageRect.height - obs.bottom - obs.height;
            editorState.dragOffsetY = e.clientY - stageRect.top - elementTop - (obs.height / 2);
        } else {
            editorState.dragOffsetY = e.clientY - stageRect.top - (stageRect.height - obs.bottom - obs.height);
        }
    });

    refreshObstacleList();
    return obs;
}

function removeObstacle(id) {
    const idx = editorState.obstacles.findIndex(o => o.id === id);
    if (idx === -1) return;

    editorState.obstacles[idx].el.remove();
    editorState.obstacles.splice(idx, 1);

    if (editorState.selectedId === id) editorState.selectedId = null;
    refreshObstacleList();
   
}

function selectObstacle(id) {
    editorState.selectedId = id;
    document.querySelectorAll('.editor-obstacle').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.obstacle-list-item').forEach(el => el.classList.remove('selected'));

    if (id !== null) {
        const obs = editorState.obstacles.find(o => o.id === id);
        if (obs) {
            obs.el.classList.add('selected');
            const listItem = document.querySelector(`.obstacle-list-item[data-id="${id}"]`);
            if (listItem) {
                listItem.classList.add('selected');
                listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }
}

function rotateSelectedObstacle() {
    if (editorState.selectedId === null) return;
    const obs = editorState.obstacles.find(o => o.id === editorState.selectedId);
    if (obs) {
        obs.rotation = ((obs.rotation || 0) + 90) % 360;
        obs.el.style.transform = `rotate(${obs.rotation}deg)`;
        refreshObstacleList();
    }
}

function refreshObstacleList() {
    obstacleListItems.innerHTML = '';
    obstacleCount.textContent = editorState.obstacles.length;

    const sorted = [...editorState.obstacles].sort((a, b) => a.x - b.x);

    sorted.forEach(obs => {
        const item = document.createElement('div');
        item.className = 'obstacle-list-item';
        item.dataset.id = obs.id;

        let icon = '🟨';
        if (obs.type === 'spike') icon = '🔺';
        else if (obs.type === 'finish') icon = '🏁';
        else if (obs.type === 'portal') {
            if (obs.targetMode === 'ship') icon = '🚀';
            else if (obs.targetMode === 'ball') icon = '⚽';
            else icon = '🟦';
        } else if (obs.type === 'ground-hole') icon = '🕳️';
        else if (obs.type === 'ceiling-hole') icon = '⬛';
        else if (obs.type === 'ceiling-line') icon = '📏';

        let details = `${obs.type} @ ${obs.x}px`;
        if (obs.type === 'block') {
            const stackLevel = Math.round((obs.bottom - CONFIG.GROUND.HEIGHT) / editorState.gridSize);
            details += stackLevel > 0 ? ` (stack ${stackLevel})` : ' (ground)';
        } else if (obs.type === 'ceiling-line') {
            details += ` (level ${obs.stackLevel || 0})`;
        }
        if (obs.rotation && obs.rotation > 0) {
            details += ` (${obs.rotation}°)`;
        }

        item.innerHTML = `
            <span>${icon}</span>
            <span>${details}</span>
            <button class="delete-btn" data-id="${obs.id}">✕</button>
        `;

        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;
            selectObstacle(obs.id);
            const wrapper = document.querySelector('.editor-stage-wrapper');
            wrapper.scrollTo({ left: obs.x - 200, behavior: 'smooth' });
        });

        obstacleListItems.appendChild(item);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeObstacle(parseInt(btn.dataset.id));
        });
    });
}

document.addEventListener('keydown', (e) => {
    if (editorScreen.classList.contains('hidden')) return;

    if ((e.key === 'Delete' || e.key === 'Backspace') && editorState.selectedId !== null) {
        if (document.activeElement.tagName === 'INPUT') return;
        e.preventDefault();
        removeObstacle(editorState.selectedId);
    }

    if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement.tagName === 'INPUT') return;
        rotateSelectedObstacle();
    }

    if (e.key === 'Escape') {
        selectObstacle(null);
        editorState.selectedPaletteItem = null;
        document.querySelectorAll('.palette-item').forEach(p => p.classList.remove('selected'));
    }
});

function buildStageFromEditor() {
    const name = document.getElementById('editorStageName').value || 'Custom Stage';
    const speed = parseFloat(document.getElementById('editorStageSpeed').value) || CONFIG.DEFAULT_SPEED;
    const finishLineObs = editorState.obstacles.find(o => o.type === 'finish');

    if (!finishLineObs) return null;
    const finishX = finishLineObs.x;

    const obstacles = editorState.obstacles
        .filter(obs => obs.type !== 'finish')
        .map(obs => {
            const o = { type: obs.type, x: obs.x };
            if (obs.type === 'block' || obs.type === 'spike') {
                const stackLevel = Math.round((obs.bottom - CONFIG.GROUND.HEIGHT) / editorState.gridSize);
                if (obs.type === 'block') o.height = editorState.gridSize;
                if (stackLevel > 0) o.stackLevel = stackLevel;
            } else if (obs.type === 'portal') {
                o.targetMode = obs.targetMode;
                if (obs.bottom !== CONFIG.GROUND.HEIGHT) {
                    o.bottom = obs.bottom;
                }
            } else if (obs.type === 'ground-hole' || obs.type === 'ceiling-hole') {
                o.width = obs.width || CONFIG.OBSTACLES.HOLE.WIDTH;
            } else if (obs.type === 'ceiling-line') {
                o.width = obs.width || CONFIG.OBSTACLES.CEILING_LINE.WIDTH;
                o.height = CONFIG.OBSTACLES.CEILING_LINE.HEIGHT;
                if (obs.stackLevel > 0) o.stackLevel = obs.stackLevel;
            }
            if (obs.rotation && obs.rotation > 0) {
                o.rotation = obs.rotation;
            }
            return o;
        })
        .sort((a, b) => a.x - b.x);

    return { name, worldSpeed: speed, color: "#00ffcc", obstacles, finishX };
}

document.getElementById('editorSaveBtn').addEventListener('click', () => {
    const stage = buildStageFromEditor();
    if (!stage) {
        alert('❌ You must add a finish line before saving!');
        return;
    }
    stages.push(stage);
    buildMenu();
    alert(`✅ Stage "${stage.name}" saved!`);
});

document.getElementById('editorExportBtn').addEventListener('click', () => {
    const stage = buildStageFromEditor();
    if (!stage) {
        alert('❌ You must add a finish line before exporting!');
        return;
    }
    const json = JSON.stringify(stage, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        alert('📋 Stage JSON copied to clipboard!');
    }).catch(() => {
        prompt('Copy this JSON:', json);
    });
});

document.getElementById('editorLoadBtn').addEventListener('click', () => {
    const json = prompt('Paste stage JSON here:');
    if (!json) return;
    try {
        const stage = JSON.parse(json);
        loadStageIntoEditor(stage);
    } catch (e) {
        alert('❌ Invalid JSON: ' + e.message);
    }
});

function loadStageIntoEditor(stage) {
    editorState.obstacles.forEach(o => o.el.remove());
    editorState.obstacles = [];
    editorState.nextId = 1;
    editorState.selectedId = null;
    editorObstacles.innerHTML = '';

    document.getElementById('editorStageName').value = stage.name || 'Custom Stage';
    document.getElementById('editorStageSpeed').value = stage.worldSpeed || CONFIG.DEFAULT_SPEED;
    document.getElementById('editorFinishX').value = stage.finishX || 2500;

    if (stage.finishX) addObstacle('finish', stage.finishX, 300);

    (stage.obstacles || []).forEach(obs => {
        let newObs = null;
        if (obs.type === 'spike') {
            const stackLevel = obs.stackLevel || 0;
            const bottomPosition = CONFIG.GROUND.HEIGHT + (stackLevel * editorState.gridSize);
            newObs = addObstacle('spike', obs.x, CONFIG.OBSTACLES.SPIKE.HEIGHT, bottomPosition);
        } else if (obs.type === 'block') {
            const stackLevel = obs.stackLevel || 0;
            const bottomPosition = CONFIG.GROUND.HEIGHT + (stackLevel * editorState.gridSize);
            newObs = addObstacle('block', obs.x, editorState.gridSize, bottomPosition);
        } else if (obs.type === 'portal') {
            newObs = addObstacle('portal', obs.x, CONFIG.OBSTACLES.PORTAL.HEIGHT, obs.bottom || CONFIG.GROUND.HEIGHT, obs.targetMode);
        } else if (obs.type === 'ground-hole') {
            newObs = addObstacle('ground-hole', obs.x, CONFIG.GROUND.HEIGHT, 0);
            if (obs.width) newObs.width = obs.width;
        } else if (obs.type === 'ceiling-hole') {
            newObs = addObstacle('ceiling-hole', obs.x, CONFIG.GROUND.HEIGHT, CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT);
            if (obs.width) newObs.width = obs.width;
        } else if (obs.type === 'ceiling-line') {
            const stackLevel = obs.stackLevel || 0;
            const bottomPosition = CONFIG.WINDOW.HEIGHT - CONFIG.GROUND.HEIGHT - (stackLevel * CONFIG.OBSTACLES.CEILING_LINE.HEIGHT);
            newObs = addObstacle('ceiling-line', obs.x, CONFIG.OBSTACLES.CEILING_LINE.HEIGHT, bottomPosition, null, stackLevel);
            if (obs.width) newObs.width = obs.width;
        }
        
        if (newObs && obs.rotation) {
            newObs.rotation = obs.rotation;
            newObs.el.style.transform = `rotate(${obs.rotation}deg)`;
        }
    });
    
    
}

document.getElementById('editorTestBtn').addEventListener('click', () => {
    const stage = buildStageFromEditor();
    if (!stage) {
        alert('❌ You must add a finish line before testing!');
        return;
    }
    if (stage.obstacles.length === 0) {
        alert('⚠️ Add some obstacles first!');
        return;
    }

    if (testStageIndex >= 0 && testStageIndex < stages.length) {
        stages.splice(testStageIndex, 1);
    }

    testStageIndex = stages.length;
    stages.push(stage);
    isTestModeFromEditor = true;

    document.body.classList.remove('editor-open');
    editorScreen.classList.add('hidden');
    startStage(testStageIndex);

    document.getElementById('menuBtn1').textContent = '🎨 Back to Editor';
    document.getElementById('menuBtn1').onclick = returnToEditor;
    document.getElementById('menuBtn2').textContent = '🎨 Back to Editor';
    document.getElementById('menuBtn2').onclick = returnToEditor;
    document.getElementById('nextStageBtn').textContent = '🎨 Back to Editor';
    document.getElementById('nextStageBtn').onclick = returnToEditor;
});

function returnToEditor() {
    gameRunning = false;
    gameWon = false;
    gameLost = false;

    if (testStageIndex >= 0 && testStageIndex < stages.length) {
        stages.splice(testStageIndex, 1);
    }
    testStageIndex = -1;
    isTestModeFromEditor = false;

    gameArea.classList.add('hidden');
    winOverlay.classList.add('hidden');
    loseOverlay.classList.add('hidden');

    document.body.classList.add('editor-open');
    editorScreen.classList.remove('hidden');
    resetButtonHandlers();
}

function resetButtonHandlers() {
    document.getElementById('menuBtn1').textContent = 'Menu';
    document.getElementById('menuBtn2').textContent = 'Menu';
    document.getElementById('nextStageBtn').textContent = 'Next Stage';
    document.getElementById('menuBtn1').onclick = showMenu;
    document.getElementById('menuBtn2').onclick = showMenu;
    document.getElementById('nextStageBtn').onclick = () => {
        const currentIndex = stages.indexOf(currentStage);
        const nextIndex = (currentIndex + 1) % stages.length;
        startStage(nextIndex);
    };
}



document.getElementById('openEditorBtn').addEventListener('click', openEditor);
document.getElementById('editorBackBtn').addEventListener('click', closeEditor);
document.getElementById('rotateObstacleBtn').addEventListener('click', rotateSelectedObstacle);

window.addEventListener('load', () => {
    editorScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    gameArea.classList.add('hidden');
    winOverlay.classList.add('hidden');
    loseOverlay.classList.add('hidden');
});

buildMenu();