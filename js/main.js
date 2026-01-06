// Game State Management
const GameState = {
    health: 100,
    sanity: 100,
    energy: 100,
    currentScene: 'loading',
    orientation: 'portrait',
    isGameStarted: false,
    world: 'surface', // 'surface' (表世界) or 'inner' (里世界)
    currentLocation: '新城区 · 战略局总部',
    day: 1,
    hour: 8,
    minute: 0
};

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const surfaceWorld = document.getElementById('surface-world');
const innerWorld = document.getElementById('inner-world');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const btnStart = document.getElementById('btn-start');
const btnContinue = document.getElementById('btn-continue');
const btnSettings = document.getElementById('btn-settings');

// Initialize Game
function init() {
    // Simulate loading
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        GameState.currentScene = 'menu';
    }, 2000);

    // Event Listeners
    setupEventListeners();
    setupOrientationListener();
    
    console.log('Mirror Moon initialized');
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu buttons
    btnStart.addEventListener('click', startGame);
    btnContinue.addEventListener('click', continueGame);
    btnSettings.addEventListener('click', showSettings);

    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleNavClick(e.target.closest('.nav-btn')));
    });

    // Dungeon buttons
    document.querySelectorAll('.dungeon-btn').forEach(btn => {
        btn.addEventListener('click', () => enterDungeon(btn.dataset.type));
    });

    // Return button
    document.getElementById('btn-return')?.addEventListener('click', returnToSurfaceWorld);

    // Map button
    document.getElementById('btn-map')?.addEventListener('click', toggleMap);

    // Explore button
    document.getElementById('btn-explore')?.addEventListener('click', toggleEnvironmentView);

    // Close buttons
    document.getElementById('close-map')?.addEventListener('click', toggleMap);
    document.getElementById('close-environment')?.addEventListener('click', toggleEnvironmentView);

    // Chat
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // View controls
    document.getElementById('rotate-left')?.addEventListener('click', rotateSceneLeft);
    document.getElementById('rotate-right')?.addEventListener('click', rotateSceneRight);
}

// Setup Screen Orientation Listener
function setupOrientationListener() {
    function checkOrientation() {
        if (window.innerHeight > window.innerWidth) {
            GameState.orientation = 'portrait';
        } else {
            GameState.orientation = 'landscape';
        }
        updateLayoutForOrientation();
    }

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();
}

// Update Layout Based on Orientation
function updateLayoutForOrientation() {
    console.log('Orientation:', GameState.orientation);
    // Layout updates handled by CSS media queries
}

// Start Game
function startGame() {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    surfaceWorld.classList.remove('hidden');
    GameState.currentScene = 'game';
    GameState.isGameStarted = true;
    GameState.world = 'surface';

    // 创建场景元素
    createStars();
    createWaterRipples();

    updateGameTime();
    updateMiniStatusBar();
    setTimeout(() => {
        addSystemMessage('欢迎来到表世界 - 新城区');
        setTimeout(() => {
            addAIMessage('我是你的AI队友"镜"。你可以在表世界休息、接受任务，或进入副本探索里世界。');
        }, 1000);
    }, 500);

    console.log('Game started');
}

// Create Stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.width = (Math.random() * 2 + 1) + 'px';
        star.style.height = star.style.width;
        starsContainer.appendChild(star);
    }
}

// Create Water Ripples
function createWaterRipples() {
    const ripplesContainer = document.querySelector('.water-ripples');
    if (!ripplesContainer) return;

    for (let i = 0; i < 5; i++) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = (30 + Math.random() * 40) + '%';
        ripple.style.top = (20 + Math.random() * 60) + '%';
        ripple.style.animationDelay = (i * 0.8) + 's';
        ripplesContainer.appendChild(ripple);
    }
}

// Continue Game
function continueGame() {
    const savedGame = localStorage.getItem('mirror-moon-save');
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        Object.assign(GameState, gameState);
        updateStatusBar();
        startGame();
        addSystemMessage('游戏已加载');
    } else {
        addSystemMessage('没有找到存档');
    }
}

// Show Settings
function showSettings() {
    addSystemMessage('设置功能开发中...');
}

// Handle Navigation Click
function handleNavClick(btn) {
    const section = btn.dataset.section;

    // Update active state
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    switch (section) {
        case 'home':
            addSystemMessage('已在主页');
            break;
        case 'characters':
            addSystemMessage('角色功能开发中...');
            break;
        case 'inventory':
            addSystemMessage('背包功能开发中...');
            break;
        case 'rest':
            restAtBase();
            break;
        case 'settings':
            showSettings();
            break;
    }
}

// Enter Dungeon
function enterDungeon(type) {
    if (GameState.energy < 30) {
        addSystemMessage('能量不足！请先休息恢复。');
        return;
    }

    const dungeonNames = {
        'chinese': '古宅惊魂',
        'western': '废弃剧院',
        'cthulhu': '深渊凝视'
    };

    addSystemMessage(`即将进入副本: ${dungeonNames[type]}...`);
    setTimeout(() => {
        // Switch to inner world
        surfaceWorld.classList.add('hidden');
        innerWorld.classList.remove('hidden');
        GameState.world = 'inner';
        GameState.energy -= 30;
        updateStatusBar();

        addAIMessage('已进入里世界副本。请保持警惕，这里充满了未知的危险。');

        // Add initial messages to chat
        setTimeout(() => {
            addSystemMessage('--- 副本开始 ---');
            addSystemMessage('目标: 探索并找到出口');
            addSystemMessage('提示: 输入"地图"查看当前区域，输入"探索"调查周围环境');
        }, 1000);
    }, 1500);
}

// Visit Organization
function visitOrganization(card) {
    const orgName = card.querySelector('.org-info h4').textContent;
    addSystemMessage(`进入 ${orgName}...`);
    setTimeout(() => {
        addAIMessage(`欢迎来到 ${orgName}。这里可以接受任务、查看情报或与其他冒险者交流。`);
    }, 1000);
}

// Update Mini Status Bar
function updateMiniStatusBar() {
    const miniHealth = document.getElementById('mini-health');
    const miniSanity = document.getElementById('mini-sanity');
    const miniEnergy = document.getElementById('mini-energy');

    if (miniHealth) miniHealth.textContent = GameState.health;
    if (miniSanity) miniSanity.textContent = GameState.sanity;
    if (miniEnergy) miniEnergy.textContent = GameState.energy;
}

// Rest at Base
function restAtBase() {
    if (GameState.world === 'inner') {
        addSystemMessage('无法在副本中休息！请先返回表世界。');
        return;
    }

    addSystemMessage('正在休息中...');
    setTimeout(() => {
        // Recover stats
        const healthRecover = 20;
        const sanityRecover = 15;
        const energyRecover = 30;

        GameState.health = Math.min(100, GameState.health + healthRecover);
        GameState.sanity = Math.min(100, GameState.sanity + sanityRecover);
        GameState.energy = Math.min(100, GameState.energy + energyRecover);
        updateStatusBar();

        // Advance time
        advanceTime(4); // Rest for 4 hours

        addSystemMessage(`休息完成！生命值+${healthRecover} 理智+${sanityRecover} 能量+${energyRecover}`);
        addAIMessage('你已经恢复了状态，准备好迎接新的挑战了吗？');
    }, 2000);
}

// Update Game Time
function updateGameTime() {
    const timeEl = document.getElementById('game-time');
    if (timeEl) {
        const hourStr = GameState.hour.toString().padStart(2, '0');
        const minuteStr = GameState.minute.toString().padStart(2, '0');
        timeEl.textContent = `第${GameState.day}天 ${hourStr}:${minuteStr}`;
    }
}

// Advance Game Time
function advanceTime(hours) {
    GameState.hour += hours;
    while (GameState.hour >= 24) {
        GameState.hour -= 24;
        GameState.day++;
    }
    updateGameTime();
}

// Return to Surface World
function returnToSurfaceWorld() {
    if (confirm('确定要返回表世界吗？未完成的副本进度将会丢失。')) {
        addSystemMessage('正在返回表世界...');
        setTimeout(() => {
            innerWorld.classList.add('hidden');
            surfaceWorld.classList.remove('hidden');
            GameState.world = 'surface';
            addSystemMessage('已返回表世界 - 新城区');
            addAIMessage('欢迎回来。在表世界你可以休息、恢复状态或准备下一次冒险。');

            // Close any open overlays
            const mapContainer = document.getElementById('map-container');
            const environmentView = document.getElementById('environment-view');
            if (mapContainer) mapContainer.classList.add('hidden');
            if (environmentView) environmentView.classList.add('hidden');
        }, 1000);
    }
}

// Toggle Map View
function toggleMap() {
    const mapContainer = document.getElementById('map-container');
    const environmentView = document.getElementById('environment-view');

    if (mapContainer) {
        const isHidden = mapContainer.classList.contains('hidden');

        if (isHidden) {
            // Close environment view first if open
            if (environmentView) environmentView.classList.add('hidden');

            // Show map
            mapContainer.classList.remove('hidden');
            drawMap();
            addSystemMessage('地图已展开');
        } else {
            // Close map
            mapContainer.classList.add('hidden');
        }
    }
}

// Toggle 360° Environment View
function toggleEnvironmentView() {
    const environmentView = document.getElementById('environment-view');
    const mapContainer = document.getElementById('map-container');

    if (environmentView) {
        const isHidden = environmentView.classList.contains('hidden');

        if (isHidden) {
            // Close map first if open
            if (mapContainer) mapContainer.classList.add('hidden');

            // Show environment view
            environmentView.classList.remove('hidden');
            addSystemMessage('进入360°探索模式');
        } else {
            // Close environment view
            environmentView.classList.add('hidden');
        }
    }
}

// Send Message
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addPlayerMessage(message);
    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
        processPlayerInput(message);
    }, 1000);
}

// Process Player Input
function processPlayerInput(message) {
    // Simple response logic (will be replaced with AI)
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('你好') || lowerMessage.includes('hi')) {
        addAIMessage('你好!我是镜,你的AI队友。有什么我可以帮助你的吗?');
    } else if (lowerMessage.includes('探索') || lowerMessage.includes('前进')) {
        addSystemMessage('开始探索周围环境...');
        exploreEnvironment();
    } else if (lowerMessage.includes('地图')) {
        showMap();
    } else if (lowerMessage.includes('状态')) {
        updateStatusBar();
        addSystemMessage(`生命值: ${GameState.health} | 理智: ${GameState.sanity} | 能量: ${GameState.energy}`);
    } else {
        addAIMessage(`你说:"${message}"。我听到了你的声音。`);
    }
}

// Explore Environment
function exploreEnvironment() {
    setTimeout(() => {
        addAIMessage('这里似乎有什么东西...让我们仔细看看。');
        updateStatus('energy', -5);
        updateStatus('sanity', -2);
    }, 1000);
}

// Show Map
function showMap() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.classList.remove('hidden');
        addSystemMessage('地图已展开');
        drawMap();
    }
}

// Draw Map (Placeholder)
function drawMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw player position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw fog of war (simplified)
    ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out visibility circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

// Rotate Scene
function rotateSceneLeft() {
    console.log('Rotate scene left');
    // Implement 360° rotation logic
}

function rotateSceneRight() {
    console.log('Rotate scene right');
    // Implement 360° rotation logic
}

// Update Status
function updateStatus(type, value) {
    if (type === 'health') {
        GameState.health = Math.max(0, Math.min(100, GameState.health + value));
    } else if (type === 'sanity') {
        GameState.sanity = Math.max(0, Math.min(100, GameState.sanity + value));
    } else if (type === 'energy') {
        GameState.energy = Math.max(0, Math.min(100, GameState.energy + value));
    }
    updateStatusBar();
    updateMiniStatusBar();
}

// Update Status Bar
function updateStatusBar() {
    const healthValue = document.getElementById('health-value');
    const sanityValue = document.getElementById('sanity-value');
    const energyValue = document.getElementById('energy-value');
    const healthBar = document.querySelector('.health-bar');
    const sanityBar = document.querySelector('.sanity-bar');
    const energyBar = document.querySelector('.energy-bar');

    if (healthValue) healthValue.textContent = GameState.health;
    if (sanityValue) sanityValue.textContent = GameState.sanity;
    if (energyValue) energyValue.textContent = GameState.energy;

    if (healthBar) healthBar.style.width = GameState.health + '%';
    if (sanityBar) sanityBar.style.width = GameState.sanity + '%';
    if (energyBar) energyBar.style.width = GameState.energy + '%';
}

// Add Chat Messages
function addSystemMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message system';
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function addPlayerMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message player';
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
    saveGame();
}

function addAIMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ai-teammate';
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function addNPCMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message npc';
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

// Scroll Chat to Bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save Game
function saveGame() {
    const gameStateToSave = {
        health: GameState.health,
        sanity: GameState.sanity,
        energy: GameState.energy,
        isGameStarted: GameState.isGameStarted
    };
    localStorage.setItem('mirror-moon-save', JSON.stringify(gameStateToSave));
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
