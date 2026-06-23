// ==========================================
// 1. CONSTANTS & CONFIG
// ==========================================
const ZONES = {
    A: { name: "ZONE A: MYSTIC WOODS", color: 0x00ff88, foggy: 0x002211, startZ: -500, endZ: 100, allowedElements: ['Water', 'Light', 'Nature', 'Earth'], levelRange: [1, 2] },
    B: { name: "ZONE B: RUGGED LANDS", color: 0xffaa00, foggy: 0x331100, startZ: 100, endZ: 400, allowedElements: ['Wind', 'Poison', 'Metal', 'Ice'], levelRange: [2, 3] },
    C: { name: "ZONE C: CHAOS REALM", color: 0xaa00ff, foggy: 0x110022, startZ: 400, endZ: 1000, allowedElements: ['Fire', 'Lightning', 'Dark', 'Psychic'], levelRange: [3, 5] }
};

const ENEMY_LEVEL_MULTIPLIERS = {
    1: { hp: 1.0, dmg: 1.0, color: 0xaaaaaa, label: 'Lv.1' },
    2: { hp: 1.5, dmg: 1.3, color: 0x55ff55, label: 'Lv.2' },
    3: { hp: 2.2, dmg: 1.6, color: 0x5599ff, label: 'Lv.3' },
    4: { hp: 3.0, dmg: 2.0, color: 0xcc55ff, label: 'Lv.4' },
    5: { hp: 4.0, dmg: 2.5, color: 0xff5555, label: 'Lv.5' }
};

const MONSTERS = {
    'Fire': { name: 'Lava Skeleton', color: 0xff4400, symbol: '🔥', hp: 40, buff: 'Damage Up', skills: ['Firebolt', 'Flame Circle', 'Meteor Fall'] },
    'Water': { name: 'Aqua Skeleton', color: 0x0088ff, symbol: '💧', hp: 30, buff: 'Regen', skills: ['Water Shot', 'Ice Nova', 'Tsunami Wall'] },
    'Wind': { name: 'Aero Skeleton', color: 0x00ff88, symbol: '🌪️', hp: 25, buff: 'Speed', skills: ['Wind Blade', 'Cyclone', 'Hurricane'] },
    'Earth': { name: 'Terra Skeleton', color: 0x885500, symbol: '🪨', hp: 80, buff: 'Defense', skills: ['Rock Throw', 'Quake', 'Earth Spike'] },
    'Light': { name: 'Holy Skeleton', color: 0xffffaa, symbol: '☀️', hp: 50, buff: 'Heal', skills: ['Light Ray', 'Flash', 'Solar Beam'] },
    'Dark': { name: 'Shadow Skeleton', color: 0x440088, symbol: '🌑', hp: 60, buff: 'Vamp', skills: ['Shadow Orb', 'Void Zone', 'Black Hole'] },
    'Lightning': { name: 'Volt Skeleton', color: 0xffff00, symbol: '⚡', hp: 35, buff: 'Haste', skills: ['Spark', 'Chain Lgt', 'Chain Strike'] },
    'Poison': { name: 'Toxic Skeleton', color: 0x99cc00, symbol: '🧪', hp: 45, buff: 'Dot Atk', skills: ['Venom Spit', 'Toxic Cloud', 'Venom Mode'] },
    'Metal': { name: 'Iron Skeleton', color: 0xaadddd, symbol: '⚔️', hp: 100, buff: 'Armor', skills: ['Dagger', 'Blade Spin', 'Iron Maiden'] },
    'Ice': { name: 'Frost Skeleton', color: 0x00ffff, symbol: '❄️', hp: 50, buff: 'Slow', skills: ['Ice Shard', 'Frost Nova', 'Absolute Zero'] },
    'Nature': { name: 'Vine Skeleton', color: 0x228b22, symbol: '🌿', hp: 60, buff: 'Thorns', skills: ['Leaf Razor', 'Vine Trap', 'Root Trap'] },
    'Psychic': { name: 'Mind Skeleton', color: 0xff00ff, symbol: '🧠', hp: 40, buff: 'Focus', skills: ['Mind Ray', 'Psi Field', 'Mind Control'] },
    // Fusion Monsters
    'Tornado Flame': { color: 0xff5500, symbol: '🌪️🔥', skills: ['Flame Spin', 'Fire Tornado', 'Firestorm'] },
    'Mud Barrier': { color: 0x8b4513, symbol: '🛡️', skills: ['Mud Shot', 'Mud Wall', 'Landslide'] },
    'Blizzard': { color: 0x00ffff, symbol: '❄️🌪️', skills: ['Ice Shard', 'Cold Snap', 'Absolute Zero'] },
    'Black Blaze': { color: 0x4b0082, symbol: '⚫🔥', skills: ['Dark Fire', 'Shadow Burn', 'Hell Gate'] },
    'Plasma': { color: 0x8a2be2, symbol: '⚛️', skills: ['Plasma Beam', 'Energy Pulse', 'Ion Cannon'] },
    'Toxic Growth': { color: 0x006400, symbol: '☣️🌿', skills: ['Spore Shot', 'Poison Vines', 'Forest Death'] },
    'Mindflare': { color: 0xff69b4, symbol: '✨🧠', skills: ['Psi Blast', 'Mind Flash', 'Psychic Nuke'] }
};

const WEAPONS = {
    'Longsword': { name: 'Longsword', type: 'melee', symbol: '🗡️', damage: 20, speed: 15, range: 10, color: 0xeeeeee },
    'Bow': { name: 'Bow', type: 'ranged', symbol: '🏹', damage: 12, speed: 20, range: 50, color: 0x8b4513 },
    'Staff': { name: 'Staff', type: 'magic', symbol: '🪄', damage: 15, speed: 10, range: 40, color: 0x8a2be2 },
    'Knuckles': { name: 'Knuckles', type: 'melee', symbol: '🥊', damage: 10, speed: 25, range: 6, color: 0xcd7f32 }
};

// ==========================================
// 2. GAME STATE VARIABLES
// ==========================================
let scene, camera, renderer, raycaster;
let player, cameraPivot, swordMesh, aimReticle;
let isGameActive = false, isMenuOpen = false, isAimingUlt = false;
let lastTime = performance.now();
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 10; // 10 seconds
const MAX_ENEMIES = 300;
const keys = { w: false, a: false, s: false, d: false, q: false, r: false, e: false, g: false };
const mouse = new THREE.Vector2();

const playerStats = {
    hp: 100, maxHp: 100, level: 1, exp: 0,
    inventory: { 'Fire': 0, 'Water': 0, 'Wind': 0, 'Earth': 0, 'Light': 0, 'Dark': 0, 'Lightning': 0, 'Poison': 0, 'Metal': 0, 'Ice': 0, 'Nature': 0, 'Psychic': 0 },
    currentElement: 'Normal', weapon: 'Longsword',
    baseDamage: 15, baseSpeed: 15, baseRange: 8,
    activeBuffs: {},
    activeTimers: { s1: 0, s2: 0, ult: 0 },
    cooldowns: { s1: 0, s2: 0, ult: 0, heal: 0 },
    maxCooldowns: { s1: 0.5, s2: 8, ult: 30, heal: 15.0 },
    isAttacking: false, attackTimer: 0, meleeCooldown: 0
};

let fusionSlots = [null, null];
const bullets = [], enemies = [], particles = [], boneDebris = [], droppedWeapons = [], resources = [], persistentEffects = [], allies = [];

// ==========================================
// 3. INITIALIZATION
// ==========================================
function init() {
    setupWeaponMenu();
    setupMenu();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x001100, 0.005);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4); scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(50, 100, 50); sun.castShadow = true; scene.add(sun);

    raycaster = new THREE.Raycaster();

    // Aim Reticle
    const ringGeo = new THREE.RingGeometry(3, 3.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
    aimReticle = new THREE.Mesh(ringGeo, ringMat);
    aimReticle.rotation.x = -Math.PI / 2; aimReticle.visible = false;
    scene.add(aimReticle);

    createWorld();
    createPlayer();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);

    // Pointer Lock Logic
    renderer.domElement.addEventListener('click', () => { if (!isGameActive && !isMenuOpen) renderer.domElement.requestPointerLock(); });
    document.addEventListener('pointerlockchange', () => {
        isGameActive = document.pointerLockElement === renderer.domElement;
        if (isGameActive) document.getElementById('crosshair').classList.remove('hidden');
        if (!isGameActive) isAimingUlt = false;
    });

    animate();
}

// ==========================================
// 4. SETUP FUNCTIONS
// ==========================================
function setupMenu() {
    const grid = document.getElementById('element-grid');
    const elements = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning', 'Dark', 'Light', 'Poison', 'Metal', 'Ice', 'Nature', 'Psychic'];
    elements.forEach(el => {
        const info = MONSTERS[el];
        const div = document.createElement('div');
        div.className = 'element-card';
        div.style.borderColor = '#' + info.color.toString(16);
        div.innerHTML = `<div class="icon" style="color:#${info.color.toString(16)}">${info.symbol}</div><h3>${el}</h3>`;
        div.onclick = () => selectElement(el);
        grid.appendChild(div);
    });
}

function setupWeaponMenu() {
    const grid = document.getElementById('weapon-grid');
    const weapons = ['Longsword', 'Bow', 'Staff', 'Knuckles'];
    weapons.forEach(w => {
        const info = WEAPONS[w];
        const div = document.createElement('div');
        div.className = 'element-card';
        div.style.borderColor = '#' + info.color.toString(16);
        div.innerHTML = `<div class="icon" style="color:#${info.color.toString(16)}">${info.symbol}</div><h3>${w}</h3><p style="font-size:10px;margin:0;">DMG:${info.damage} SPD:${info.speed}</p>`;
        div.onclick = () => selectWeapon(w);
        grid.appendChild(div);
    });
}

function selectWeapon(w) {
    const info = WEAPONS[w];
    playerStats.weapon = w;
    playerStats.baseDamage = info.damage;
    playerStats.baseSpeed = info.speed;
    playerStats.baseRange = info.range;
    playerStats.maxCooldowns.s1 = (playerStats.currentElement === 'Dark' && w === 'Longsword') ? 50 : 0.5;
    if (playerStats.cooldowns.s1 > playerStats.maxCooldowns.s1) {
        playerStats.cooldowns.s1 = playerStats.maxCooldowns.s1;
    }
    playerStats.maxCooldowns.s2 = (playerStats.currentElement === 'Dark' && w === 'Longsword') ? 10 : 8;
    if (playerStats.cooldowns.s2 > playerStats.maxCooldowns.s2) {
        playerStats.cooldowns.s2 = playerStats.maxCooldowns.s2;
    }
    playerStats.maxCooldowns.ult = (playerStats.currentElement === 'Dark' && w === 'Longsword') ? 20 : 30;
    if (playerStats.cooldowns.ult > playerStats.maxCooldowns.ult) {
        playerStats.cooldowns.ult = playerStats.maxCooldowns.ult;
    }

    updatePlayerWeapon();

    document.getElementById('weapon-menu').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function updatePlayerWeapon() {
    if (!player) return;
    const pivot = player.userData.swordPivot;
    while (pivot.children.length > 0) {
        pivot.remove(pivot.children[0]);
    }
    const info = WEAPONS[playerStats.weapon];
    const swordGroup = new THREE.Group();

    if (playerStats.activeBuffs && playerStats.activeBuffs['God of Lightning']) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        bolt.position.set(0, 0, 2);
        bolt.rotation.x = -Math.PI / 1.5;
        swordGroup.add(bolt);
    } else if (playerStats.weapon === 'Longsword') {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 4.0), new THREE.MeshStandardMaterial({ color: info.color }));
        blade.position.set(0, 0, 2.2); swordGroup.add(blade);
        const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x444444 }));
        hilt.position.set(0, 0, 0.2); swordGroup.add(hilt);
        swordGroup.rotation.x = -Math.PI / 1.5; // Tilt sword naturally
    } else if (playerStats.weapon === 'Bow') {
        const bowArc = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 8, 16, Math.PI), new THREE.MeshStandardMaterial({ color: info.color }));
        bowArc.rotation.y = Math.PI / 2;
        bowArc.rotation.x = Math.PI / -2;
        bowArc.position.set(0, 0, 1); swordGroup.add(bowArc);
        const string = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        string.position.set(0, 0, 1); swordGroup.add(string);
        swordGroup.position.set(0.1, -0.5, 0.5);
    } else if (playerStats.weapon === 'Staff') {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 4), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
        pole.rotation.x = Math.PI / 2; pole.position.set(0, 0, 0); swordGroup.add(pole);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial({ color: info.color }));
        orb.position.set(0, 0, 1.7); swordGroup.add(orb);
        swordGroup.rotation.x = -Math.PI / 1.5;
    } else if (playerStats.weapon === 'Knuckles') {
        const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: info.color }));
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        for (let i = 0; i < 3; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), spikeMat);
            spike.position.set((i - 1) * 0.12, 0, 0.25);
            spike.rotation.x = Math.PI / 2;
            knuckle.add(spike);
        }
        knuckle.position.set(0, 0, 0.2);
        swordGroup.add(knuckle);
        swordGroup.rotation.x = -Math.PI / 1.5;
    }

    pivot.add(swordGroup);
    swordMesh = swordGroup;
}

function createWorld() {
    createGroundZone(ZONES.A.startZ, ZONES.A.endZ, ZONES.A.color);
    createGroundZone(ZONES.B.startZ, ZONES.B.endZ, ZONES.B.color);
    createGroundZone(ZONES.C.startZ, ZONES.C.endZ, ZONES.C.color);
    for (let i = 0; i < 50; i++) createResource();
}

function createGroundZone(start, end, color) {
    const geo = new THREE.PlaneGeometry(400, end - start);
    const mat = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.z = start + (end - start) / 2; mesh.receiveShadow = true;
    scene.add(mesh);
}

function createPlayer() {
    const group = new THREE.Group();
    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x3366cc }));
    body.position.y = 2.25; group.add(body);
    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0xffccaa }));
    head.position.y = 3.3; group.add(head);
    // Cape
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2), new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
    cape.position.set(0, 2, 0.5); cape.rotation.x = -0.2; group.add(cape);

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: 0x3366cc });

    // Left Arm
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), armMat);
    lArm.position.set(-0.65, 2.5, 0);
    group.add(lArm);

    // Right Arm (Pivot for sword)
    const rArm = new THREE.Group();
    rArm.position.set(0.65, 2.8, 0);
    group.add(rArm);
    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), armMat);
    rArmMesh.position.y = -0.4;
    rArm.add(rArmMesh);

    [body, head, cape, lArm, rArmMesh].forEach(m => m.userData.isPlayerBody = true);

    // Sword Pivot (at hand)
    const swordPivot = new THREE.Group();
    swordPivot.position.set(0, -0.8, -0.8);
    rArm.add(swordPivot);

    group.userData.swordPivot = swordPivot;
    group.userData.rArm = rArm;
    group.userData.lArm = lArm;

    player = group; scene.add(player);
    updatePlayerWeapon();

    cameraPivot = new THREE.Object3D(); cameraPivot.position.y = 3.0; player.add(cameraPivot);
    camera.position.set(2, 0.5, 4); cameraPivot.add(camera);
}

function createResource() {
    const z = (Math.random() * 600) - 100; const x = (Math.random() * 200) - 100;
    const geo = new THREE.CylinderGeometry(0.5, 0.8, 4); const mat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(geo, mat); trunk.position.set(x, 2, z);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(3, 6, 8), new THREE.MeshLambertMaterial({ color: 0x00aa00 }));
    leaf.position.y = 4; trunk.add(leaf); scene.add(trunk);
}

// ==========================================
// 5. GAME LOGIC (ENTITIES)
// ==========================================
function spawnEnemy(forcedZoneKey = null) {
    if (enemies.length > MAX_ENEMIES || !player) return;

    let zCenter, xCenter, zoneData, zoneKey;

    if (forcedZoneKey) {
        zoneKey = forcedZoneKey;
        zoneData = ZONES[zoneKey];
        // Spawn at a random location within the zone
        zCenter = zoneData.startZ + Math.random() * (zoneData.endZ - zoneData.startZ);
        xCenter = (Math.random() - 0.5) * 160;
    } else {
        // Fallback or dynamic spawn near player
        zCenter = player.position.z + 50 + (Math.random() * 50);
        xCenter = player.position.x + (Math.random() * 60) - 30;
        zoneData = ZONES.A; zoneKey = 'A';
        if (zCenter > 100) { zoneData = ZONES.B; zoneKey = 'B'; }
        if (zCenter > 400) { zoneData = ZONES.C; zoneKey = 'C'; }
    }

    const elemKey = zoneData.allowedElements[Math.floor(Math.random() * zoneData.allowedElements.length)];
    const info = MONSTERS[elemKey];

    // Determine enemy level from zone's level range
    const [minLv, maxLv] = zoneData.levelRange;
    const enemyLevel = minLv + Math.floor(Math.random() * (maxLv - minLv + 1));
    const lvData = ENEMY_LEVEL_MULTIPLIERS[enemyLevel];

    const scaledHp = Math.round(info.hp * lvData.hp);
    const scaledDmg = lvData.dmg;

    const groupId = Date.now() + Math.random();
    const groupSize = 8 + Math.floor(Math.random() * 8); // Increased from 3-5 to 8-15
    for (let i = 0; i < groupSize; i++) {
        const x = xCenter + (Math.random() - 0.5) * 15;
        const z = zCenter + (Math.random() - 0.5) * 15;

        // Scale enemy model slightly larger for higher levels
        const sizeScale = 1 + (enemyLevel - 1) * 0.1;

        const group = new THREE.Group();
        const boneMat = new THREE.MeshStandardMaterial({ color: info.color });
        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.6 * sizeScale, 0.7 * sizeScale, 0.6 * sizeScale), boneMat); skull.position.y = 3.2 * sizeScale; group.add(skull);
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.4 * sizeScale, 1.2 * sizeScale, 0.3 * sizeScale), boneMat); spine.position.y = 2.2 * sizeScale; group.add(spine);
        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.15 * sizeScale, 1 * sizeScale, 0.15 * sizeScale), boneMat); lArm.position.set(-0.5 * sizeScale, 2.2 * sizeScale, 0); group.add(lArm);
        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.15 * sizeScale, 1 * sizeScale, 0.15 * sizeScale), boneMat); rArm.position.set(0.5 * sizeScale, 2.2 * sizeScale, 0); group.add(rArm);

        const weaponsList = ['Sword', 'Bow', 'Hammer'];
        const wType = weaponsList[Math.floor(Math.random() * weaponsList.length)];

        const swPivot = new THREE.Object3D(); swPivot.position.set(0, -0.4 * sizeScale, 0); rArm.add(swPivot);
        let sw;
        if (wType === 'Sword') {
            sw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.5 * sizeScale), new THREE.MeshStandardMaterial({ color: 0xffffff }));
            sw.position.set(0, -0.5, 1);
        } else if (wType === 'Bow') {
            sw = new THREE.Mesh(new THREE.TorusGeometry(0.8 * sizeScale, 0.1, 8, 16, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
            sw.position.set(0, -0.2, 0.5); sw.rotation.y = Math.PI / 2;
        } else if (wType === 'Hammer') {
            const hGroup = new THREE.Group();
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 2.5 * sizeScale), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
            handle.position.set(0, -0.5, 1);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.8 * sizeScale, 0.8 * sizeScale, 1.2 * sizeScale), new THREE.MeshStandardMaterial({ color: 0x555555 }));
            head.position.set(0, -0.5, 2.0 * sizeScale);
            hGroup.add(handle); hGroup.add(head);
            sw = hGroup;
        }
        sw.userData.isWeapon = true; swPivot.add(sw); group.userData.swordPivot = swPivot;

        group.position.set(x, 0, z);
        group.userData = {
            hp: scaledHp, maxHp: scaledHp, type: elemKey, name: info.name,
            buff: info.buff, canAbsorb: false, lastAttack: 0, statuses: {},
            groupId: groupId, isAggro: false,
            level: enemyLevel, dmgMultiplier: scaledDmg, zone: zoneKey,
            spawnPoint: new THREE.Vector3(x, 0, z),
            wanderTarget: new THREE.Vector3(x + (Math.random() - 0.5) * 10, 0, z + (Math.random() - 0.5) * 10),
            wanderWait: 0,
            lArm: lArm, rArm: rArm, skull: skull, spine: spine, sizeScale: sizeScale,
            weaponType: wType
        };

        // Health Bar Background
        const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        hpBg.position.y = 4.5 * sizeScale + 0.5; group.add(hpBg);
        const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        hpFill.position.z = 0.02; hpFill.position.x = -2; hpBg.add(hpFill);
        group.userData.hpBar = hpFill; group.userData.hpBarBg = hpBg;

        // Level Label Sprite (above HP bar)
        const lvCvs = document.createElement('canvas'); lvCvs.width = 256; lvCvs.height = 64;
        const lvCtx = lvCvs.getContext('2d');
        lvCtx.font = 'bold 36px Arial';
        lvCtx.textAlign = 'center'; lvCtx.textBaseline = 'middle';
        lvCtx.shadowColor = 'black'; lvCtx.shadowBlur = 4;
        const lvColorHex = '#' + lvData.color.toString(16).padStart(6, '0');
        lvCtx.fillStyle = lvColorHex;
        lvCtx.fillText(lvData.label + ' ' + info.name, 128, 32);
        const lvSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lvCvs) }));
        lvSpr.scale.set(6, 1.5, 1); lvSpr.position.y = 4.5 * sizeScale + 1.2; group.add(lvSpr);

        // Symbol Sprite
        const cvs = document.createElement('canvas'); cvs.width = 128; cvs.height = 128;
        const ctx = cvs.getContext('2d'); ctx.font = '80px Arial'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = "black"; ctx.shadowBlur = 5; ctx.fillText(info.symbol, 64, 64);
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cvs) }));
        spr.scale.set(3, 3, 1); spr.position.y = 5.5 * sizeScale + 1.0; group.add(spr);

        // Level glow indicator for high-level enemies (lv 4-5)
        if (enemyLevel >= 4) {
            const glowGeo = new THREE.SphereGeometry(2 * sizeScale, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({ color: lvData.color, transparent: true, opacity: 0.15, wireframe: true });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 2.5; group.add(glow);
            group.userData.levelGlow = glow;
        }

        scene.add(group); enemies.push(group);
    }
}

function spawnBoss(forcedZoneKey = null) {
    if (enemies.length > MAX_ENEMIES || !player) return;

    let zCenter, xCenter, zoneData, zoneKey;

    if (forcedZoneKey) {
        zoneKey = forcedZoneKey;
        zoneData = ZONES[zoneKey];
        zCenter = zoneData.startZ + Math.random() * (zoneData.endZ - zoneData.startZ);
        xCenter = (Math.random() - 0.5) * 160;
    } else {
        zCenter = player.position.z + 50 + (Math.random() * 50);
        xCenter = player.position.x + (Math.random() * 60) - 30;
        zoneData = ZONES.A; zoneKey = 'A';
        if (zCenter > 100) { zoneData = ZONES.B; zoneKey = 'B'; }
        if (zCenter > 400) { zoneData = ZONES.C; zoneKey = 'C'; }
    }

    const elemKey = zoneData.allowedElements[Math.floor(Math.random() * zoneData.allowedElements.length)];
    const info = MONSTERS[elemKey];

    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: info.color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), mat); body.position.y = 4; group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), mat); head.position.y = 6.75; group.add(head);

    const lArm = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), mat); lArm.position.set(-2, 4, 0); group.add(lArm);
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), mat); rArm.position.set(2, 4, 0); group.add(rArm);

    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), mat); lLeg.position.set(-1, 1, 0); group.add(lLeg);
    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), mat); rLeg.position.set(1, 1, 0); group.add(rLeg);

    group.position.set(xCenter, 0, zCenter);
    group.userData = {
        hp: 100, maxHp: 100, type: elemKey, name: info.name.replace('Skeleton', 'Golem'),
        buff: info.buff, canAbsorb: false, lastAttack: 0, statuses: {},
        isAggro: false, isBoss: true,
        level: 5, zone: zoneKey,
        spawnPoint: new THREE.Vector3(xCenter, 0, zCenter),
        wanderTarget: new THREE.Vector3(xCenter + (Math.random() - 0.5) * 10, 0, zCenter + (Math.random() - 0.5) * 10),
        wanderWait: 0,
        lArm: lArm, rArm: rArm, body: body, walkTimer: 0,
        attackType: 'melee'
    };

    const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.5), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    hpBg.position.y = 8.5; group.add(hpBg);
    const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    hpFill.position.z = 0.02; hpFill.position.x = -3; hpBg.add(hpFill);
    group.userData.hpBar = hpFill; group.userData.hpBarBg = hpBg;

    const lvCvs = document.createElement('canvas'); lvCvs.width = 512; lvCvs.height = 64;
    const lvCtx = lvCvs.getContext('2d');
    lvCtx.font = 'bold 36px Arial'; lvCtx.textAlign = 'center'; lvCtx.textBaseline = 'middle';
    lvCtx.shadowColor = 'black'; lvCtx.shadowBlur = 4; lvCtx.fillStyle = '#ff0000';
    lvCtx.fillText('BOSS: ' + elemKey + ' Golem', 256, 32);
    const lvSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lvCvs) }));
    lvSpr.scale.set(10, 1.5, 1); lvSpr.position.y = 9.5; group.add(lvSpr);

    scene.add(group); enemies.push(group);
}

function shatterEnemy(enemy) {
    enemy.traverse(c => {
        if (c.isMesh && c !== enemy.userData.hpBar && c !== enemy.userData.hpBarBg) {
            if (c.userData.isWeapon) {
                const m = new THREE.Mesh(c.geometry.clone(), c.material.clone());
                c.getWorldPosition(m.position); c.getWorldQuaternion(m.quaternion);
                m.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 2 + 3, (Math.random() - 0.5) * 4), angularVelocity: new THREE.Vector3(Math.random(), Math.random(), Math.random()), life: 30 };
                scene.add(m); droppedWeapons.push(m);
            } else {
                const m = new THREE.Mesh(c.geometry.clone(), c.material.clone());
                c.getWorldPosition(m.position); c.getWorldQuaternion(m.quaternion);
                m.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 5 + 3, (Math.random() - 0.5) * 8), angularVelocity: new THREE.Vector3(Math.random(), Math.random(), Math.random()), type: enemy.userData.type, isBone: true, level: enemy.userData.level || 1 };
                scene.add(m); boneDebris.push(m);
            }
        }
    });
    scene.remove(enemy);
}

function applyDamage(enemy, amount) {
    enemy.userData.hp -= amount;
    enemy.userData.isAggro = true;
    if (enemy.userData.groupId) {
        enemies.forEach(e => {
            if (e.userData.groupId === enemy.userData.groupId) e.userData.isAggro = true;
        });
    }
    if (enemy.userData.hpBar) {
        const hpPercent = Math.max(0, enemy.userData.hp / enemy.userData.maxHp);
        enemy.userData.hpBar.scale.x = hpPercent;
    }
    // Flash effect
    enemy.children.forEach(child => {
        if (child.isMesh && child.material && child.material.emissive) {
            child.material.emissiveIntensity = 1.0; setTimeout(() => { if (child) child.material.emissiveIntensity = 0.0; }, 100);
        }
    });
}

// ==========================================
// 6. SKILLS & COMBAT
// ==========================================
function performBasicAttack() {
    const now = Date.now();
    let speedMult = playerStats.activeBuffs['Lightning Speed'] ? 1.1 : 1.0;
    if (playerStats.activeBuffs['Shadow Form']) speedMult *= 1.1;
    const cooldownTime = (6000 / (playerStats.baseSpeed * speedMult));

    if (now - (playerStats.lastAttackTime || 0) > cooldownTime * 2.5) {
        playerStats.comboStep = 0;
    }

    if (now - playerStats.meleeCooldown < cooldownTime) return;

    playerStats.meleeCooldown = now;
    playerStats.lastAttackTime = now;
    playerStats.isAttacking = true;
    playerStats.attackTimer = 0;

    if (playerStats.activeBuffs && playerStats.activeBuffs['God of Lightning']) {
        const pos = new THREE.Vector3(); camera.getWorldPosition(pos);
        const dir = new THREE.Vector3(); camera.getWorldDirection(dir);

        const boltGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
        const boltMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.rotation.set(Math.PI / 2, 0, 0);

        const pGroup = new THREE.Group(); pGroup.add(bolt);
        pGroup.position.copy(pos).add(dir.clone().multiplyScalar(2));
        pGroup.lookAt(pos.clone().add(dir));
        pGroup.velocity = dir.multiplyScalar(50); pGroup.life = 2.0; pGroup.dmg = playerStats.baseDamage * 3;
        pGroup.type = 'god_lightning_bolt';
        scene.add(pGroup); bullets.push(pGroup);
        return;
    }

    const wType = WEAPONS[playerStats.weapon].type;

    if (wType === 'melee') {
        playerStats.comboStep = playerStats.comboStep || 0;

        let slashColor = WEAPONS[playerStats.weapon].color;
        let slashAngleStart = 0;
        let slashAngleLength = Math.PI;

        if (playerStats.comboStep === 0) {
            slashAngleStart = -Math.PI / 4;
        } else if (playerStats.comboStep === 1) {
            slashAngleStart = Math.PI / 4;
        } else {
            slashAngleStart = -Math.PI;
            slashAngleLength = Math.PI * 2;
            slashColor = 0xffaa00;
        }

        const slash = new THREE.Mesh(new THREE.RingGeometry(playerStats.baseRange / 2, playerStats.baseRange / 2 + 0.5, 16, 1, slashAngleStart, slashAngleLength), new THREE.MeshBasicMaterial({ color: slashColor, side: THREE.DoubleSide, transparent: true }));
        slash.position.copy(player.position); slash.position.y += 2;

        if (playerStats.comboStep === 2) {
            slash.rotation.x = 0;
            slash.rotation.y = player.rotation.y;
        } else {
            slash.rotation.x = -Math.PI / 2;
            slash.rotation.z = player.rotation.y - Math.PI / 2;
        }

        scene.add(slash); setTimeout(() => scene.remove(slash), 150);

        const pDir = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion).normalize();
        enemies.forEach((e, i) => {
            if (e.position.distanceTo(player.position) < playerStats.baseRange) {
                const dir = new THREE.Vector3().subVectors(e.position, player.position).normalize();
                if (pDir.dot(dir) > 0 || playerStats.comboStep === 2) {
                    let damage = playerStats.baseDamage;
                    if (playerStats.comboStep === 2) damage *= 1.5;
                    if (playerStats.activeBuffs['Shadow Form']) damage *= 1.1;

                    if (playerStats.activeBuffs['Poison Mode']) e.userData.statuses.poison = 5;
                    if (playerStats.activeBuffs['Lightning Speed']) { e.userData.statuses.shock = 3; triggerChainLightning(e, damage * 0.5); }
                    applyDamage(e, damage);

                    if (playerStats.comboStep === 2) e.position.add(dir.multiplyScalar(4));
                    else e.position.add(dir.multiplyScalar(2));

                    if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(i, 1); }
                }
            }
        });

        playerStats.comboStep = (playerStats.comboStep + 1) % 3;
    } else if (wType === 'ranged') {
        const pos = new THREE.Vector3(); camera.getWorldPosition(pos);
        const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
        const proj = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        proj.rotation.set(Math.PI / 2, 0, 0);
        const pGroup = new THREE.Group(); pGroup.add(proj);
        pGroup.position.copy(pos).add(dir.clone().multiplyScalar(2));
        pGroup.lookAt(pos.clone().add(dir));
        let damage = playerStats.baseDamage;
        if (playerStats.activeBuffs['Shadow Form']) damage *= 1.1;
        pGroup.velocity = dir.multiplyScalar(60); pGroup.life = 1.5; pGroup.dmg = damage;
        pGroup.type = 'projectile'; scene.add(pGroup); bullets.push(pGroup);
    } else if (wType === 'magic') {
        const pos = new THREE.Vector3(); camera.getWorldPosition(pos);
        const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
        const proj = new THREE.Mesh(new THREE.SphereGeometry(0.4), new THREE.MeshBasicMaterial({ color: WEAPONS[playerStats.weapon].color }));
        proj.position.copy(pos).add(dir.clone().multiplyScalar(2));
        let damage = playerStats.baseDamage;
        if (playerStats.activeBuffs['Shadow Form']) damage *= 1.1;
        proj.velocity = dir.multiplyScalar(40); proj.life = 2; proj.dmg = damage;
        proj.type = 'projectile'; scene.add(proj); bullets.push(proj);
    }
}

function activateSkill(slot) {
    const type = playerStats.currentElement;
    let cdKey = 's1', maxCd = playerStats.maxCooldowns.s1;
    if (slot === 2) { cdKey = 's2'; maxCd = playerStats.maxCooldowns.s2; }
    if (slot === 3) {
        cdKey = 'ult'; maxCd = playerStats.maxCooldowns.ult;
        if (type !== 'Lightning' && !isAimingUlt) {
            isAimingUlt = true; aimReticle.visible = true;
            document.getElementById('aim-hint').style.display = 'block';
            return;
        } else if (type !== 'Lightning') {
            isAimingUlt = false; aimReticle.visible = false;
            document.getElementById('aim-hint').style.display = 'none';
            return;
        }
    }
    if (playerStats.cooldowns[cdKey] > 0) { notify("COOLDOWN!", 0xff0000); return; }
    executeSkill(slot, slot === 3 && type === 'Lightning' ? player.position : null);
}

function executeSkill(slot, targetPos) {
    const type = playerStats.currentElement;
    let cdKey = slot === 1 ? 's1' : (slot === 2 ? 's2' : 'ult');
    let maxCd = playerStats.maxCooldowns[cdKey];
    playerStats.cooldowns[cdKey] = maxCd;

    const pos = new THREE.Vector3(); camera.getWorldPosition(pos);
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const spawn = pos.clone().add(dir.multiplyScalar(3));
    const color = MONSTERS[type].color;

    if (slot === 1) { // Rapid
        if (type === 'Dark' && playerStats.weapon === 'Longsword') {
            notify("Shadow Form!", color);
            playerStats.activeBuffs['Shadow Form'] = 30.0;
            playerStats.activeTimers.s1 = 30.0;

            // change player material to shadow
            const shadowMat = new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.6, emissive: 0x220044 });
            player.traverse((child) => {
                if (child.isMesh && child.userData.isPlayerBody) {
                    if (!child.userData.originalMat) child.userData.originalMat = child.material;
                    child.material = shadowMat;
                }
            });
            return;
        }

        if (type === 'Wind') {
            const geo = new THREE.TorusGeometry(0.8, 0.1, 8, 16, Math.PI);
            const mat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.y = Math.PI / 2;
            const proj = new THREE.Group();
            proj.add(mesh);
            proj.position.copy(spawn);
            proj.lookAt(spawn.clone().add(dir));
            proj.velocity = dir.multiplyScalar(50);
            proj.life = 2; proj.dmg = 10;
            proj.type = 'projectile';
            proj.element = type;
            proj.isWindBlade = true;
            proj.bladeMesh = mesh;
            scene.add(proj); bullets.push(proj);
            notify("Wind Blade!", color);
        } else if (type === 'Earth') {
            if (!playerStats.earthArmor || playerStats.earthArmor <= 0) {
                playerStats.earthArmor = 100;

                const armorGeo = new THREE.BoxGeometry(1.6, 2.5, 1.2);
                const armorMat = new THREE.MeshStandardMaterial({ color: 0x885500, transparent: true, opacity: 0.7 });
                const armorMesh = new THREE.Mesh(armorGeo, armorMat);
                armorMesh.position.y = 2.0;
                player.add(armorMesh);
                player.userData.earthArmorMesh = armorMesh;

                notify("Earth Armor Active!", color);
            } else {
                notify("Armor Already Active!", color);
            }
        } else if (type === 'Lightning') {
            playerStats.activeBuffs['Lightning Speed'] = 20.0;
            notify("Lightning Speed Active!", color);
        } else {
            const proj = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial({ color: color }));
            proj.position.copy(spawn); proj.velocity = dir.multiplyScalar(40); proj.life = 2; proj.dmg = 10;
            proj.type = 'projectile';
            proj.element = type;
            scene.add(proj); bullets.push(proj);
            notify(`${type} Shot!`, color);
        }
    }
    else if (slot === 2) { // AOE or Fire Volley
        if (type === 'Dark' && playerStats.weapon === 'Longsword') {
            notify("Dark Crucifixion!", color);
            playerStats.activeTimers.s2 = 20.0;
            const sortedEnemies = [...enemies].sort((a, b) => a.position.distanceTo(player.position) - b.position.distanceTo(player.position));
            const targets = sortedEnemies.slice(0, 5);
            targets.forEach(e => {
                e.userData.statuses.root = 20.0;

                const crossGroup = new THREE.Group();
                const mat = new THREE.MeshStandardMaterial({ color: 0x220044, emissive: 0x110022 });
                const vBeam = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 1), mat);
                vBeam.position.y = 4;
                const hBeam = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 1), mat);
                hBeam.position.y = 5;
                crossGroup.add(vBeam); crossGroup.add(hBeam);

                const spikeMat = new THREE.MeshStandardMaterial({ color: 0x880000 });
                for (let i = 0; i < 3; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 3, 4), spikeMat);
                    spike.rotation.x = Math.PI / 2;
                    spike.position.set((Math.random() - 0.5) * 2, 3 + Math.random() * 3, 0);
                    crossGroup.add(spike);
                }

                crossGroup.position.copy(e.position);
                scene.add(crossGroup);

                const crucifix = new THREE.Object3D();
                crucifix.life = 20.0;
                crucifix.type = 'crucifix';
                crucifix.userData.target = e;
                crucifix.userData.mesh = crossGroup;
                crucifix.userData.dmgTimer = 0;
                crucifix.userData.healTimer = 0;
                scene.add(crucifix);
                bullets.push(crucifix);
            });
            return;
        }

        if (type === 'Fire') {
            notify("Fire Volley!", color);
            let count = 0;
            const shootInterval = setInterval(() => {
                if (count >= 5 || !isGameActive) {
                    clearInterval(shootInterval);
                    return;
                }
                const pPos = new THREE.Vector3(); camera.getWorldPosition(pPos);
                const pDir = new THREE.Vector3(); camera.getWorldDirection(pDir);
                pDir.x += (Math.random() - 0.5) * 0.1;
                pDir.y += (Math.random() - 0.5) * 0.1;
                pDir.z += (Math.random() - 0.5) * 0.1;
                pDir.normalize();
                const pSpawn = pPos.clone().add(pDir.clone().multiplyScalar(3));

                const proj = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial({ color: color }));
                proj.position.copy(pSpawn); proj.velocity = pDir.multiplyScalar(40); proj.life = 2; proj.dmg = 10;
                proj.type = 'projectile';
                proj.element = 'Fire';
                scene.add(proj); bullets.push(proj);
                count++;
            }, 100);
        } else if (type === 'Water') {
            notify("Tidal Wave!", color);
            const pDir = new THREE.Vector3(); camera.getWorldDirection(pDir);
            pDir.y = 0; pDir.normalize();

            const waveGeo = new THREE.BoxGeometry(10, 2, 2);
            const waveMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
            const wave = new THREE.Mesh(waveGeo, waveMat);

            const spawnPos = player.position.clone().add(pDir.clone().multiplyScalar(2));
            spawnPos.y = 1;
            wave.position.copy(spawnPos);
            wave.lookAt(spawnPos.clone().add(pDir));

            wave.velocity = pDir.multiplyScalar(20);
            wave.life = 2.0;
            wave.dmg = 30;
            wave.type = 'wave';
            wave.element = 'Water';
            wave.userData.hitEnemies = [];

            scene.add(wave); bullets.push(wave);
        } else if (type === 'Wind') {
            notify("Cyclone!", color);
            const pDir = new THREE.Vector3(); camera.getWorldDirection(pDir);
            pDir.y = 0; pDir.normalize();
            const spawnPos = player.position.clone().add(pDir.multiplyScalar(8));

            const tornadoGeo = new THREE.CylinderGeometry(4, 0.5, 8, 16);
            const tornadoMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6, wireframe: true });
            const tornado = new THREE.Mesh(tornadoGeo, tornadoMat);
            tornado.position.copy(spawnPos);
            tornado.position.y = 4;

            tornado.life = 5.0;
            tornado.dmg = 30;
            tornado.type = 'tornado';
            tornado.element = 'Wind';
            tornado.userData.hitEnemies = [];

            scene.add(tornado); bullets.push(tornado);
        } else if (type === 'Earth') {
            notify("Stone Spikes!", color);
            const sortedEnemies = [...enemies].sort((a, b) => a.position.distanceTo(player.position) - b.position.distanceTo(player.position));
            const targets = sortedEnemies.slice(0, 5);
            targets.forEach(e => {
                const spikeGeo = new THREE.ConeGeometry(1, 4, 8);
                const spikeMat = new THREE.MeshStandardMaterial({ color: 0x885500 });
                const spike = new THREE.Mesh(spikeGeo, spikeMat);
                spike.position.copy(e.position);
                spike.position.y = 2; // stick out of ground

                spike.life = 3.0; // 3 seconds
                spike.type = 'earth_spike';
                spike.userData.target = e;
                spike.userData.hitTimer = 0;
                spike.userData.hitsDone = 0;

                scene.add(spike); bullets.push(spike);
            });
        } else if (type === 'Lightning') {
            notify("Lightning Storm!", color);
            let strikeCount = 0;
            const stormInterval = setInterval(() => {
                if (strikeCount >= 10 || !isGameActive) {
                    clearInterval(stormInterval);
                    return;
                }
                const nearbyEnemies = enemies.filter(e => e.position.distanceTo(player.position) < 40);
                let targetPos = player.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30));
                if (nearbyEnemies.length > 0) {
                    const hitEnemy = nearbyEnemies[Math.floor(Math.random() * nearbyEnemies.length)];
                    targetPos = hitEnemy.position.clone();
                }
                createVerticalLightning(targetPos);
                createAOE(targetPos, 5, 30, color, 'Electrify', 4.0);
                strikeCount++;
            }, 300);
        } else {
            createAOE(player.position, 10, 30, color, 'Explosion', 1.0);
            notify(`${type} Burst!`, color);
        }
    }
    else if (slot === 3 && targetPos) { // ULTIMATE
        notify("ULTIMATE!", color);
        if (type === 'Dark' && playerStats.weapon === 'Longsword') {
            notify("Black Hole!", color);
            playerStats.activeTimers.ult = 10.0;

            const bhGeo = new THREE.SphereGeometry(6, 32, 32);
            const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const bh = new THREE.Mesh(bhGeo, bhMat);
            bh.position.copy(targetPos);
            bh.position.y = 6;

            const auraGeo = new THREE.SphereGeometry(7, 32, 32);
            const auraMat = new THREE.MeshBasicMaterial({ color: 0x8800ff, transparent: true, opacity: 0.5, side: THREE.BackSide });
            const aura = new THREE.Mesh(auraGeo, auraMat);
            bh.add(aura);

            bh.life = 10.0;
            bh.type = 'black_hole';
            bh.dmg = 50;
            scene.add(bh);
            bullets.push(bh);
            return;
        }

        if (type === 'Lightning') {
            playerStats.activeBuffs['God of Lightning'] = 60.0;
            playerStats.activeTimers.ult = 60.0;
            notify("God of Lightning Mode!", color);
            updatePlayerWeapon();
            if (!player.userData.godAura) {
                const auraGeo = new THREE.SphereGeometry(2, 16, 16);
                const auraMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.3, wireframe: true });
                const aura = new THREE.Mesh(auraGeo, auraMat);
                aura.position.y = 2.5;
                player.add(aura);
                player.userData.godAura = aura;
            }
        } else if (type === 'Fire') {
            const m = new THREE.Mesh(new THREE.SphereGeometry(4), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
            m.position.copy(targetPos).add(new THREE.Vector3(0, 50, 0));
            m.velocity = new THREE.Vector3(0, -30, 0); m.life = 5; m.type = 'meteor'; m.dmg = 200;
            scene.add(m); bullets.push(m);
        } else if (type === 'Water') {
            const sortedEnemies = [...enemies].sort((a, b) => a.position.distanceTo(targetPos) - b.position.distanceTo(targetPos));
            const targets = sortedEnemies.slice(0, 3);
            targets.forEach(e => {
                e.userData.statuses.waterPrison = 5;
                const prison = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.5 }));
                prison.position.y = 2.5;
                prison.userData.isWaterPrison = true;
                e.add(prison);
            });
        } else if (type === 'Wind') {
            const bigTornadoGeo = new THREE.CylinderGeometry(12, 2, 30, 32);
            const bigTornadoMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5, wireframe: true });
            const bigTornado = new THREE.Mesh(bigTornadoGeo, bigTornadoMat);
            bigTornado.position.copy(targetPos);
            bigTornado.position.y = 15;
            bigTornado.life = 3.0;
            bigTornado.type = 'ult_tornado';
            bigTornado.element = 'Wind';
            scene.add(bigTornado); bullets.push(bigTornado);
        } else if (type === 'Earth') {
            if (allies.some(a => a.userData.isGolem)) {
                notify("Golem is already active!", color);
                return;
            }
            const golemGroup = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color: 0x885500 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), mat); body.position.y = 4; golemGroup.add(body);
            const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), mat); head.position.y = 6.75; golemGroup.add(head);

            const lArm = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), mat); lArm.position.set(-2, 4, 0); golemGroup.add(lArm);
            const rArm = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), mat); rArm.position.set(2, 4, 0); golemGroup.add(rArm);

            const lLeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), mat); lLeg.position.set(-1, 1, 0); golemGroup.add(lLeg);
            const rLeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), mat); rLeg.position.set(1, 1, 0); golemGroup.add(rLeg);

            golemGroup.position.copy(targetPos);
            golemGroup.position.y = 0; // ensure it spawns on ground
            golemGroup.userData = {
                hp: 200, maxHp: 200, dmg: 10, isGolem: true, lastAttack: 0,
                lArm: lArm, rArm: rArm, body: body, walkTimer: 0
            };

            // Health Bar
            const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.5), new THREE.MeshBasicMaterial({ color: 0x000000 }));
            hpBg.position.y = 8.5; golemGroup.add(hpBg);
            const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.5), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            hpFill.position.z = 0.02; hpFill.position.x = -2.5; hpBg.add(hpFill);
            golemGroup.userData.hpBar = hpFill; golemGroup.userData.hpBarBg = hpBg;

            scene.add(golemGroup); allies.push(golemGroup);
        }
        // Add other Ultimate logic here...
    }
}

function createAOE(pos, range, damage, color, effect, duration) {
    const circle = new THREE.Mesh(new THREE.RingGeometry(0.1, range, 32), new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 }));
    circle.position.copy(pos); circle.position.y = 0.5; circle.rotation.x = -Math.PI / 2;
    scene.add(circle);
    let s = 0;
    const int = setInterval(() => {
        s += 0.1; circle.scale.set(s, s, s);
        if (s >= 1) {
            clearInterval(int); scene.remove(circle);
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (e.position.distanceTo(pos) < range) {
                    applyDamage(e, damage);
                    if (effect === 'Freeze') e.userData.statuses.freeze = duration;
                    if (effect === 'Electrify') e.userData.statuses.electrified = duration;
                    if (effect === 'Knockback') {
                        const pushDir = new THREE.Vector3().subVectors(e.position, pos).normalize();
                        pushDir.y = 0;
                        e.position.add(pushDir.multiplyScalar(8));
                    }
                    if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(i, 1); }
                }
            }
        }
    }, 20);
}

// ==========================================
// 7. ANIMATION & UPDATE LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now(); const delta = (time - lastTime) / 1000; lastTime = time;

    if (isGameActive && player) {
        // Cooldowns
        if (playerStats.cooldowns.s1 > 0) playerStats.cooldowns.s1 -= delta;
        if (playerStats.cooldowns.s2 > 0) playerStats.cooldowns.s2 -= delta;
        if (playerStats.cooldowns.ult > 0) playerStats.cooldowns.ult -= delta;

        if (playerStats.activeTimers.s1 > 0) playerStats.activeTimers.s1 -= delta;
        if (playerStats.activeTimers.s2 > 0) playerStats.activeTimers.s2 -= delta;
        if (playerStats.activeTimers.ult > 0) playerStats.activeTimers.ult -= delta;
        if (playerStats.cooldowns.heal > 0) playerStats.cooldowns.heal -= delta;

        // Buffs Timer
        if (playerStats.activeBuffs['Healing']) {
            if (!playerStats.healTickTimer) playerStats.healTickTimer = 0;
            playerStats.healTickTimer += delta;
            if (playerStats.healTickTimer >= 1.0) {
                playerStats.healTickTimer -= 1.0;
                playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 2);
                updateHUD();
            }
            playerStats.activeBuffs['Healing'] -= delta;
            if (playerStats.activeBuffs['Healing'] <= 0) delete playerStats.activeBuffs['Healing'];
        }
        if (playerStats.activeBuffs['Poison Mode']) { playerStats.activeBuffs['Poison Mode'] -= delta; if (playerStats.activeBuffs['Poison Mode'] <= 0) delete playerStats.activeBuffs['Poison Mode']; }
        if (playerStats.activeBuffs['Lightning Speed']) { playerStats.activeBuffs['Lightning Speed'] -= delta; if (playerStats.activeBuffs['Lightning Speed'] <= 0) delete playerStats.activeBuffs['Lightning Speed']; }
        if (playerStats.activeBuffs['Shadow Form']) {
            playerStats.activeBuffs['Shadow Form'] -= delta;
            if (playerStats.activeBuffs['Shadow Form'] <= 0) {
                delete playerStats.activeBuffs['Shadow Form'];
                player.traverse(child => {
                    if (child.isMesh && child.userData.isPlayerBody && child.userData.origMat) {
                        child.material = child.userData.origMat;
                    }
                });
            }
        }
        if (playerStats.activeBuffs['God of Lightning']) {
            playerStats.activeBuffs['God of Lightning'] -= delta;
            if (playerStats.activeBuffs['God of Lightning'] <= 0) {
                delete playerStats.activeBuffs['God of Lightning'];
                updatePlayerWeapon();
                if (player.userData.godAura) {
                    player.remove(player.userData.godAura);
                    player.userData.godAura = null;
                }
            }
        }

        updateHUD();

        // Player Movement
        let speedMult = playerStats.activeBuffs['Lightning Speed'] ? 1.1 : 1.0;
        if (playerStats.activeBuffs['Shadow Form']) speedMult *= 1.1;
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);
        const speed = 15 * speedMult * delta;
        if (keys.w) player.position.add(fwd.clone().multiplyScalar(speed));
        if (keys.s) player.position.add(fwd.clone().multiplyScalar(-speed));
        if (keys.a) player.position.add(right.clone().multiplyScalar(-speed));
        if (keys.d) player.position.add(right.clone().multiplyScalar(speed));

        // Melee Attack Animation
        if (playerStats.isAttacking) {
            const wType = WEAPONS[playerStats.weapon].type;
            if (wType === 'melee') {
                playerStats.attackTimer += delta * playerStats.baseSpeed * speedMult * 1.5;
                const step = playerStats.comboStep === 0 ? 2 : playerStats.comboStep - 1;

                if (step === 0) {
                    player.userData.rArm.rotation.y = -Math.PI / 2 + Math.sin(playerStats.attackTimer) * Math.PI;
                    player.userData.rArm.rotation.x = -Math.PI / 4;
                    player.userData.rArm.rotation.z = Math.PI / 8;
                } else if (step === 1) {
                    player.userData.rArm.rotation.y = Math.PI / 2 - Math.sin(playerStats.attackTimer) * Math.PI;
                    player.userData.rArm.rotation.x = -Math.PI / 4;
                    player.userData.rArm.rotation.z = -Math.PI / 8;
                } else {
                    player.userData.rArm.rotation.y = playerStats.attackTimer * 2;
                    player.userData.rArm.rotation.x = -Math.PI / 4;
                    player.userData.rArm.rotation.z = Math.PI / 4;
                }

                if (playerStats.attackTimer > Math.PI) {
                    playerStats.isAttacking = false;
                    player.userData.rArm.rotation.set(0, 0, 0);
                }
            } else {
                playerStats.attackTimer += delta * playerStats.baseSpeed * speedMult;
                player.userData.rArm.rotation.y = -Math.PI / 4 + Math.sin(playerStats.attackTimer) * Math.PI / 2;
                if (playerStats.attackTimer > Math.PI) { playerStats.isAttacking = false; player.userData.rArm.rotation.set(0, 0, 0); }
            }
        } else {
            // Idle Arm Sway
            const sway = Math.sin(time * 0.002) * 0.1;
            player.userData.rArm.rotation.z = sway;
            player.userData.lArm.rotation.z = -sway;
            player.userData.rArm.rotation.x = Math.sin(time * 0.001) * 0.05;
        }

        // Update Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i]; b.life -= delta;
            if (b.type === 'projectile') {
                if (b.isWindBlade && b.bladeMesh) b.bladeMesh.rotation.z -= 20 * delta;
                b.position.add(b.velocity.clone().multiplyScalar(delta));
                if (b.isEnemy) {
                    let hit = false;
                    if (b.position.distanceTo(player.position) < 2 && b.position.y >= 0 && b.position.y <= 4.5) {
                        let dmg = 2;
                        if (playerStats.earthArmor > 0) {
                            playerStats.earthArmor -= dmg;
                            notify(`Armor took ${dmg} dmg! (${Math.max(0, playerStats.earthArmor)}/100)`, 0x885500);
                            if (playerStats.earthArmor <= 0) {
                                notify("Earth Armor Broken!", 0xff0000);
                                if (player.userData.earthArmorMesh) { player.remove(player.userData.earthArmorMesh); player.userData.earthArmorMesh = null; }
                            }
                        } else {
                            playerStats.hp -= dmg; document.getElementById('hp-bar').style.width = (playerStats.hp / playerStats.maxHp * 100) + '%';
                            const flash = document.getElementById('damage-flash'); flash.style.opacity = 1; setTimeout(() => { flash.style.opacity = 0; }, 100);
                            if (playerStats.hp <= 0) { document.exitPointerLock(); alert("GAME OVER!"); location.reload(); }
                        }
                        hit = true;
                    }
                    if (!hit) {
                        for (let aIdx = allies.length - 1; aIdx >= 0; aIdx--) {
                            const ally = allies[aIdx];
                            if (b.position.distanceTo(ally.position) < 3) {
                                ally.userData.hp -= b.dmg;
                                if (ally.userData.hpBar) ally.userData.hpBar.scale.x = Math.max(0, ally.userData.hp / ally.userData.maxHp);
                                if (ally.userData.hp <= 0) { createExplosion(ally.position, 0x885500); allies.splice(aIdx, 1); scene.remove(ally); }
                                hit = true;
                                break;
                            }
                        }
                    }
                    if (hit) {
                        const explosionColor = b.material ? b.material.color : 0xffffff;
                        scene.remove(b); bullets.splice(i, 1); createExplosion(b.position, explosionColor);
                    }
                } else {
                    for (let idx = enemies.length - 1; idx >= 0; idx--) {
                        const e = enemies[idx];
                        const dx = b.position.x - e.position.x;
                        const dz = b.position.z - e.position.z;
                        if (Math.sqrt(dx * dx + dz * dz) < 2 && b.position.y >= 0 && b.position.y <= 4.5) {
                            applyDamage(e, b.dmg);
                            if (playerStats.activeBuffs['Poison Mode']) e.userData.statuses.poison = 5;
                            if (playerStats.activeBuffs['Lightning Speed']) { e.userData.statuses.shock = 3; triggerChainLightning(e, b.dmg * 0.5); }
                            if (b.element === 'Fire') e.userData.statuses.burn = 3;
                            if (b.element === 'Water') e.userData.statuses.slow = 3;
                            if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); }
                            const explosionColor = b.material ? b.material.color : (b.bladeMesh ? b.bladeMesh.material.color : 0xffffff);
                            scene.remove(b); bullets.splice(i, 1); createExplosion(b.position, explosionColor);
                            break;
                        }
                    }
                }
            } else if (b.type === 'wave') {
                b.position.add(b.velocity.clone().multiplyScalar(delta));
                for (let idx = enemies.length - 1; idx >= 0; idx--) {
                    const e = enemies[idx];
                    if (b.userData.hitEnemies.includes(e.uuid)) continue;

                    const dx = e.position.x - b.position.x;
                    const dz = e.position.z - b.position.z;
                    if (Math.sqrt(dx * dx + dz * dz) < 6 && e.position.y <= 4.5) {
                        applyDamage(e, b.dmg);
                        b.userData.hitEnemies.push(e.uuid);
                        const pushDir = b.velocity.clone().normalize();
                        e.position.add(pushDir.multiplyScalar(10));
                        if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); }
                    }
                }
            } else if (b.type === 'tornado') {
                b.rotation.y += 15 * delta;
                for (let idx = enemies.length - 1; idx >= 0; idx--) {
                    const e = enemies[idx];
                    const dx = e.position.x - b.position.x;
                    const dz = e.position.z - b.position.z;
                    const dist2D = Math.sqrt(dx * dx + dz * dz);

                    if (dist2D < 15) {
                        const pullDir = new THREE.Vector3(b.position.x - e.position.x, 0, b.position.z - e.position.z).normalize();
                        e.position.add(pullDir.multiplyScalar(8 * delta));

                        if (dist2D < 4 && !b.userData.hitEnemies.includes(e.uuid)) {
                            applyDamage(e, b.dmg);
                            b.userData.hitEnemies.push(e.uuid);
                            if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); }
                        }
                    }
                }
            } else if (b.type === 'ult_tornado') {
                b.rotation.y += 20 * delta;
                for (let idx = enemies.length - 1; idx >= 0; idx--) {
                    const e = enemies[idx];
                    const dx = e.position.x - b.position.x;
                    const dz = e.position.z - b.position.z;
                    const dist2D = Math.sqrt(dx * dx + dz * dz);

                    if (dist2D < 20) {
                        e.userData.statuses.lifted = 0.1;
                        e.userData.statuses.root = 0.1;
                        const pullDir = new THREE.Vector3(b.position.x - e.position.x, 0, b.position.z - e.position.z).normalize();
                        if (dist2D > 2) e.position.add(pullDir.multiplyScalar(25 * delta));
                        if (e.position.y < 15) e.position.y += 15 * delta;
                    }
                }
            } else if (b.type === 'earth_spike') {
                if (b.userData.target && b.userData.target.parent) {
                    b.userData.hitTimer += delta;
                    if (b.userData.hitTimer > 0.3 && b.userData.hitsDone < 10) {
                        b.userData.hitTimer = 0;
                        b.userData.hitsDone++;
                        applyDamage(b.userData.target, 5); // 5 dmg * 10 hits = 50 total damage per spike
                        if (b.userData.target.userData.hp <= 0) {
                            const idx = enemies.indexOf(b.userData.target);
                            if (idx > -1) { shatterEnemy(b.userData.target); enemies.splice(idx, 1); }
                        }
                    }
                }
            } else if (b.type === 'god_lightning_bolt') {
                b.position.add(b.velocity.clone().multiplyScalar(delta));
                let hit = false;
                for (let idx = enemies.length - 1; idx >= 0; idx--) {
                    const e = enemies[idx];
                    if (b.position.distanceTo(e.position) < 3) { hit = true; break; }
                }
                if (b.position.y <= 0) hit = true;
                if (hit) {
                    createAOE(b.position, 15, b.dmg, 0xffff00, 'Electrify', 4.0);
                    createExplosion(b.position, 0xffff00);
                    scene.remove(b); bullets.splice(i, 1);
                    continue;
                }
            } else if (b.type === 'crucifix') {
                const targetAlive = b.userData.target && b.userData.target.parent;
                if (targetAlive) {
                    if (b.life > 10.0) { // Deal damage for first 10 seconds
                        b.userData.dmgTimer += delta;
                        if (b.userData.dmgTimer >= 1.0) {
                            b.userData.dmgTimer -= 1.0;
                            applyDamage(b.userData.target, 10);
                            if (b.userData.target.userData.hp <= 0) {
                                const idx = enemies.indexOf(b.userData.target);
                                if (idx > -1) { shatterEnemy(b.userData.target); enemies.splice(idx, 1); }
                            }
                        }
                    }
                    b.userData.target.userData.statuses.root = 0.5; // Always keep rooted while cross is active
                }
                if (b.life > 15.0) { // Heal for first 5 seconds
                    b.userData.healTimer += delta;
                    if (b.userData.healTimer >= 1.0) {
                        b.userData.healTimer -= 1.0;
                        playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 2);
                    }
                }
                if (b.life <= 0) {
                    scene.remove(b.userData.mesh);
                }
            } else if (b.type === 'black_hole') {
                b.rotation.y += delta;
                if (b.children[0]) {
                    b.children[0].rotation.x += delta * 2;
                    b.children[0].rotation.y -= delta * 2;
                }

                for (let idx = enemies.length - 1; idx >= 0; idx--) {
                    const e = enemies[idx];
                    const dist = e.position.distanceTo(b.position);

                    if (dist < 40) {
                        const pullDir = new THREE.Vector3().subVectors(b.position, e.position);
                        pullDir.y = 0;
                        pullDir.normalize();
                        const pullStrength = (40 - dist) / 40 * 20;
                        e.position.add(pullDir.multiplyScalar(pullStrength * delta));

                        if (dist < 8) {
                            if (!e.userData.bhDmgTimer) e.userData.bhDmgTimer = 0;
                            e.userData.bhDmgTimer += delta;
                            if (e.userData.bhDmgTimer >= 1.0) {
                                e.userData.bhDmgTimer -= 1.0;
                                applyDamage(e, b.dmg);
                                if (e.userData.hp <= 0) {
                                    shatterEnemy(e); enemies.splice(idx, 1);
                                }
                            }
                        }
                    }
                }

                if (b.life <= 0) {
                    createExplosion(b.position, 0x8800ff);
                    scene.remove(b); bullets.splice(i, 1);
                    continue;
                }
            } else if (b.type === 'meteor') {
                b.position.add(b.velocity.clone().multiplyScalar(delta));
                if (b.position.y <= 0) {
                    createAOE(b.position, 25, b.dmg, 0xff4400, 'Explosion', 1);
                    createExplosion(b.position, 0xff4400);
                    scene.remove(b); bullets.splice(i, 1);
                    continue;
                }
            }
            if (b.life <= 0) { scene.remove(b); bullets.splice(i, 1); }
        }

        // Enemy Logic (Timed waves every 2 minutes in each zone)
        enemySpawnTimer += delta;
        if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
            enemySpawnTimer = 0;
            // Spawn multiple groups per zone for more density
            for (let i = 0; i < 2; i++) {
                spawnEnemy('A');
                spawnEnemy('B');
                spawnEnemy('C');
            }
            if (Math.random() < 0.5) spawnBoss('A');
            if (Math.random() < 0.5) spawnBoss('B');
            if (Math.random() < 0.5) spawnBoss('C');
            notify("LARGE WAVE SPAWNED!", 0xffffff);
        }
        enemies.forEach((e, idx) => {
            if (e.userData.statuses.freeze > 0) { e.userData.statuses.freeze -= delta; return; }
            if (e.userData.statuses.waterPrison > 0) {
                e.userData.statuses.waterPrison -= delta;
                e.userData.hp -= 10 * delta;
                if (e.userData.hpBar) e.userData.hpBar.scale.x = Math.max(0, e.userData.hp / e.userData.maxHp);
                if (e.userData.statuses.waterPrison <= 0) {
                    for (let j = e.children.length - 1; j >= 0; j--) {
                        if (e.children[j].userData && e.children[j].userData.isWaterPrison) {
                            e.remove(e.children[j]);
                        }
                    }
                }
                if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); return; }
                return; // Prevent movement and attack
            }

            if (e.userData.statuses.electrified > 0) {
                e.userData.statuses.electrified -= delta;
                e.userData.hp -= 20 * delta;
                if (Math.random() < 0.1) {
                    e.children.forEach(child => {
                        if (child.isMesh && child.material && child.material.emissive) {
                            const oldEmissive = child.material.emissive.getHex();
                            child.material.emissive.setHex(0xffff00);
                            child.material.emissiveIntensity = 1.0;
                            setTimeout(() => { if (child && child.material) { child.material.emissive.setHex(oldEmissive); child.material.emissiveIntensity = 0.0; } }, 100);
                        }
                    });
                }
                if (e.userData.hpBar) e.userData.hpBar.scale.x = Math.max(0, e.userData.hp / e.userData.maxHp);
                if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); return; }
                return; // Prevent movement and attack
            }

            if (e.userData.statuses.lifted > 0) {
                e.userData.statuses.lifted -= delta;
            } else if (e.position.y > 0) {
                e.position.y -= 40 * delta;
                e.userData.statuses.root = 0.1;
                if (e.position.y <= 0) {
                    e.position.y = 0;
                    let hits = 20;
                    let dmgPerHit = 20;
                    applyDamage(e, hits * dmgPerHit);
                    createExplosion(e.position, 0xffffff);
                    if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); return; }
                }
            }

            if (e.userData.statuses.root > 0) { e.userData.statuses.root -= delta; }
            else if (!e.userData.canAbsorb) {
                let currentSpeed = 3;
                if (e.userData.statuses.slow > 0) { e.userData.statuses.slow -= delta; currentSpeed = 1.0; }

                let targetPos = null;
                let minDistToTarget = Infinity;
                let targetObj = null;

                if (!playerStats.activeBuffs['Shadow Form']) {
                    targetPos = player.position;
                    minDistToTarget = e.position.distanceTo(player.position);
                    targetObj = player;
                }

                allies.forEach(ally => {
                    const d = e.position.distanceTo(ally.position);
                    if (d < minDistToTarget) {
                        minDistToTarget = d;
                        targetPos = ally.position;
                        targetObj = ally;
                    }
                });

                e.userData.currentTarget = targetObj;

                if (targetObj && (minDistToTarget < 35 || e.userData.isAggro)) {
                    let attackRange = 4.5;
                    if (e.userData.isBoss) {
                        attackRange = e.userData.attackType === 'ranged' ? 40 : 4.5;
                    } else if (e.userData.weaponType === 'Bow') {
                        attackRange = 40;
                    }

                    if (minDistToTarget > attackRange - 0.5) {
                        const dir = new THREE.Vector3().subVectors(targetPos, e.position).normalize();
                        e.position.add(dir.multiplyScalar(currentSpeed * delta));
                    }
                    e.lookAt(targetPos.x, e.position.y, targetPos.z);
                    if (e.userData.isBoss) {
                        e.userData.walkTimer = (e.userData.walkTimer || 0) + delta * 10;
                        e.userData.lArm.rotation.x = Math.sin(e.userData.walkTimer) * 0.5;
                        e.userData.rArm.rotation.x = -Math.sin(e.userData.walkTimer) * 0.5;
                    }
                } else if (e.userData.spawnPoint) {
                    if (e.userData.wanderWait > 0) {
                        e.userData.wanderWait -= delta;
                        if (e.userData.isBoss) {
                            e.userData.lArm.rotation.x = 0;
                            e.userData.rArm.rotation.x = 0;
                        }
                    } else {
                        const distToWander = e.position.distanceTo(e.userData.wanderTarget);
                        if (distToWander < 1) {
                            e.userData.wanderWait = 1 + Math.random() * 3;
                            const sx = e.userData.spawnPoint.x;
                            const sz = e.userData.spawnPoint.z;
                            e.userData.wanderTarget.set(sx + (Math.random() - 0.5) * 20, 0, sz + (Math.random() - 0.5) * 20);
                        } else {
                            const dir = new THREE.Vector3().subVectors(e.userData.wanderTarget, e.position).normalize();
                            e.position.add(dir.multiplyScalar(currentSpeed * 0.5 * delta)); // Move slower while wandering
                            e.lookAt(e.userData.wanderTarget.x, e.position.y, e.userData.wanderTarget.z);
                            if (e.userData.isBoss) {
                                e.userData.walkTimer = (e.userData.walkTimer || 0) + delta * 5;
                                e.userData.lArm.rotation.x = Math.sin(e.userData.walkTimer) * 0.5;
                                e.userData.rArm.rotation.x = -Math.sin(e.userData.walkTimer) * 0.5;
                            }
                        }
                    }
                }
            }

            if (e.userData.statuses.poison > 0) {
                e.userData.statuses.poison -= delta;
                e.userData.hp -= 10 * delta;
                if (e.userData.hpBar) e.userData.hpBar.scale.x = Math.max(0, e.userData.hp / e.userData.maxHp);
                if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); return; }
            }
            if (e.userData.statuses.shock > 0) {
                e.userData.statuses.shock -= delta;
                e.userData.hp -= 15 * delta;
                if (Math.random() < 0.05) {
                    e.children.forEach(child => {
                        if (child.isMesh && child.material && child.material.emissive) {
                            const oldEmissive = child.material.emissive.getHex();
                            child.material.emissive.setHex(0xffff00);
                            child.material.emissiveIntensity = 1.0;
                            setTimeout(() => { if (child && child.material) { child.material.emissive.setHex(oldEmissive); child.material.emissiveIntensity = 0.0; } }, 100);
                        }
                    });
                }
                if (e.userData.hpBar) e.userData.hpBar.scale.x = Math.max(0, e.userData.hp / e.userData.maxHp);
                if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); return; }
            }
            if (e.userData.statuses.burn > 0) {
                e.userData.statuses.burn -= delta;
                e.userData.hp -= 15 * delta; // Burn damage over time
                if (e.userData.hpBar) e.userData.hpBar.scale.x = Math.max(0, e.userData.hp / e.userData.maxHp);
                if (e.userData.hp <= 0) { shatterEnemy(e); enemies.splice(idx, 1); return; }
            }

            if (e.userData.hpBarBg) e.userData.hpBarBg.lookAt(camera.position);

            // Enemy Attack
            const targetObj = e.userData.currentTarget;
            if (targetObj) {
                const dist = e.position.distanceTo(targetObj.position);
                if (e.userData.isBoss) {
                    if (dist < 4.5 && !e.userData.canAbsorb) {
                        const now = Date.now();
                        if (!e.userData.lastAttack || now - e.userData.lastAttack > 1500) {
                            e.userData.lastAttack = now;
                            e.userData.attackType = 'melee';
                            enemyAttack(e, targetObj);
                        }
                    } else if (dist < 40 && !e.userData.canAbsorb) {
                        const now = Date.now();
                        if (!e.userData.lastAttack || now - e.userData.lastAttack > 3000) {
                            e.userData.lastAttack = now;
                            e.userData.attackType = 'ranged';
                            enemyAttack(e, targetObj);
                        }
                    }
                } else {
                    const attackRange = e.userData.weaponType === 'Bow' ? 40 : 4.5;
                    const attackCD = e.userData.weaponType === 'Bow' ? 3000 : 1500;
                    if (dist < attackRange && !e.userData.canAbsorb) {
                        const now = Date.now();
                        if (!e.userData.lastAttack || now - e.userData.lastAttack > attackCD) {
                            e.userData.lastAttack = now; enemyAttack(e, targetObj);
                        }
                    }
                }
            }
            if (e.userData.isAttacking) {
                e.userData.attackTimer += delta * 10;
                if (e.userData.isBoss) {
                    if (e.userData.attackType === 'melee') {
                        e.userData.lArm.rotation.x = -Math.sin(e.userData.attackTimer) * 2;
                        e.userData.rArm.rotation.x = -Math.sin(e.userData.attackTimer) * 2;
                    } else {
                        e.userData.body.rotation.x = Math.sin(e.userData.attackTimer) * 0.5;
                    }
                    if (e.userData.attackTimer > Math.PI) {
                        e.userData.isAttacking = false;
                        e.userData.lArm.rotation.x = 0;
                        e.userData.rArm.rotation.x = 0;
                        e.userData.body.rotation.x = 0;
                    }
                } else {
                    const t = e.userData.attackTimer;

                    if (e.userData.swordPivot) e.userData.swordPivot.rotation.x = Math.sin(t) * 2;
                    if (e.userData.rArm) e.userData.rArm.rotation.x = -Math.sin(t) * 1.5;

                    if (t > Math.PI) {
                        e.userData.isAttacking = false;
                        if (e.userData.swordPivot) {
                            e.userData.swordPivot.rotation.set(0, 0, 0);
                            const scale = e.userData.sizeScale || 1;
                            e.userData.swordPivot.position.set(0, -0.4 * scale, 0);
                        }
                        if (e.userData.rArm) e.userData.rArm.rotation.set(0, 0, 0);
                        if (e.userData.lArm) e.userData.lArm.rotation.set(0, 0, 0);
                        if (e.userData.skull) e.userData.skull.rotation.set(0, 0, 0);
                        if (e.userData.spine) e.userData.spine.rotation.set(0, 0, 0);
                    }
                }
            }
        });

        // Allies Logic (Golem)
        for (let i = allies.length - 1; i >= 0; i--) {
            const ally = allies[i];
            if (ally.userData.isGolem) {
                if (ally.userData.hpBarBg) ally.userData.hpBarBg.lookAt(camera.position);

                let nearest = null;
                let minDist = Infinity;
                enemies.forEach(e => {
                    const d = ally.position.distanceTo(e.position);
                    if (d < minDist) { minDist = d; nearest = e; }
                });

                if (nearest) {
                    const dir = new THREE.Vector3().subVectors(nearest.position, ally.position);
                    dir.y = 0;
                    ally.lookAt(nearest.position.x, ally.position.y, nearest.position.z);

                    if (ally.userData.isAttacking) {
                        ally.userData.attackTimer += delta * 5;
                        if (ally.userData.attackType === 'melee') {
                            ally.userData.lArm.rotation.x = -Math.sin(ally.userData.attackTimer) * 2;
                            ally.userData.rArm.rotation.x = -Math.sin(ally.userData.attackTimer) * 2;
                        } else if (ally.userData.attackType === 'ranged') {
                            ally.userData.body.rotation.x = Math.sin(ally.userData.attackTimer) * 0.5;
                        }

                        if (ally.userData.attackTimer > Math.PI) {
                            ally.userData.isAttacking = false;
                            ally.userData.lArm.rotation.x = 0;
                            ally.userData.rArm.rotation.x = 0;
                            ally.userData.body.rotation.x = 0;

                            if (ally.userData.attackType === 'melee' && minDist < 6) {
                                applyDamage(nearest, ally.userData.dmg);
                                createExplosion(nearest.position, 0x885500);
                                if (nearest.userData.hp <= 0) { shatterEnemy(nearest); enemies.splice(enemies.indexOf(nearest), 1); }
                            } else if (ally.userData.attackType === 'ranged') {
                                const projGroup = new THREE.Group();
                                const proj = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x885500 }));
                                projGroup.add(proj);
                                const spawnPos = ally.position.clone(); spawnPos.y = 4;
                                projGroup.position.copy(spawnPos);
                                projGroup.velocity = dir.normalize().multiplyScalar(40);
                                projGroup.life = 2; projGroup.dmg = ally.userData.dmg; projGroup.type = 'projectile';
                                projGroup.element = 'Earth';
                                scene.add(projGroup); bullets.push(projGroup);
                            }
                        }
                    } else if (minDist < 6) {
                        const now = Date.now();
                        if (now - ally.userData.lastAttack > 1500) {
                            ally.userData.lastAttack = now;
                            ally.userData.isAttacking = true;
                            ally.userData.attackTimer = 0;
                            ally.userData.attackType = 'melee';
                        }
                    } else if (minDist < 40) {
                        const now = Date.now();
                        if (now - ally.userData.lastAttack > 2500) {
                            ally.userData.lastAttack = now;
                            ally.userData.isAttacking = true;
                            ally.userData.attackTimer = 0;
                            ally.userData.attackType = 'ranged';
                        } else {
                            dir.normalize();
                            ally.position.add(dir.multiplyScalar(4 * delta));
                            ally.userData.walkTimer = (ally.userData.walkTimer || 0) + delta * 10;
                            ally.userData.lArm.rotation.x = Math.sin(ally.userData.walkTimer) * 0.5;
                            ally.userData.rArm.rotation.x = -Math.sin(ally.userData.walkTimer) * 0.5;
                        }
                    } else {
                        dir.normalize();
                        ally.position.add(dir.multiplyScalar(6 * delta));
                        ally.userData.walkTimer = (ally.userData.walkTimer || 0) + delta * 10;
                        ally.userData.lArm.rotation.x = Math.sin(ally.userData.walkTimer) * 0.5;
                        ally.userData.rArm.rotation.x = -Math.sin(ally.userData.walkTimer) * 0.5;
                    }
                } else {
                    ally.userData.lArm.rotation.x = 0;
                    ally.userData.rArm.rotation.x = 0;
                }
            }
        }

        // Dropped Weapons
        for (let i = droppedWeapons.length - 1; i >= 0; i--) {
            const w = droppedWeapons[i];
            if (w.userData.life) {
                w.userData.life -= delta;
                if (w.userData.life <= 0) {
                    scene.remove(w);
                    droppedWeapons.splice(i, 1);
                    continue;
                }
            }
            if (w.position.y > 0.1) {
                w.userData.velocity.y -= 20 * delta;
                w.position.add(w.userData.velocity.clone().multiplyScalar(delta));
                w.rotation.x += w.userData.angularVelocity.x * delta * 5;
                w.rotation.y += w.userData.angularVelocity.y * delta * 5;
                w.rotation.z += w.userData.angularVelocity.z * delta * 5;
                if (w.position.y <= 0.1) {
                    w.position.y = 0.1;
                    w.userData.velocity.set(0, 0, 0);
                    w.rotation.x = Math.PI / 2;
                }
            }
        }

        // Debris & Particles
        for (let i = boneDebris.length - 1; i >= 0; i--) {
            const b = boneDebris[i];
            if (b.userData.target) {
                const dir = new THREE.Vector3().subVectors(player.position, b.position).normalize();
                b.position.add(dir.multiplyScalar(b.userData.speed)); b.userData.speed += delta;
                if (b.position.distanceTo(player.position) < 1) { collectDebris(b.userData.type, b.userData.level); scene.remove(b); boneDebris.splice(i, 1); }
            } else {
                b.userData.velocity.y -= 20 * delta; b.position.add(b.userData.velocity.clone().multiplyScalar(delta));
                if (b.position.y < 0.2) { b.position.y = 0.2; b.userData.velocity.y *= -0.5; b.userData.velocity.x *= 0.5; b.userData.velocity.z *= 0.5; }
            }
        }
        document.getElementById('absorb-prompt').style.display = boneDebris.some(b => b.position.distanceTo(player.position) < 15) ? 'block' : 'none';

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            if (p.mesh.userData.velocity) {
                p.mesh.position.add(p.mesh.userData.velocity.clone().multiplyScalar(delta));
                p.mesh.userData.velocity.y -= 10 * delta;
            }
            p.life -= delta; if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); }
        }
    }
    renderer.render(scene, camera);
}

// ==========================================
// 8. HELPER FUNCTIONS
// ==========================================
function updateHUD() {
    if (!player) return;
    document.getElementById('hp-bar').style.width = (playerStats.hp / playerStats.maxHp * 100) + '%';

    const buffsList = [];
    if (playerStats.activeBuffs['Healing']) buffsList.push(`💚 Healing: ${Math.ceil(playerStats.activeBuffs['Healing'])}s`);
    if (playerStats.activeBuffs['Poison Mode']) buffsList.push(`Poison Mode: ${Math.ceil(playerStats.activeBuffs['Poison Mode'])}s`);
    if (playerStats.activeBuffs['Lightning Speed']) buffsList.push(`⚡ Lgt Speed: ${Math.ceil(playerStats.activeBuffs['Lightning Speed'])}s`);
    if (playerStats.activeBuffs['God of Lightning']) buffsList.push(`⚡ GOD MODE: ${Math.ceil(playerStats.activeBuffs['God of Lightning'])}s`);
    if (playerStats.activeBuffs['Shadow Form']) buffsList.push(`🌑 Shadow Form: ${Math.ceil(playerStats.activeBuffs['Shadow Form'])}s`);
    const buffEl = document.getElementById('active-buffs-list');
    if (buffEl) buffEl.innerHTML = buffsList.length > 0 ? buffsList.join('<br>') : '- None -';

    const type = playerStats.currentElement;
    const info = MONSTERS[type] || { symbol: '⚔️', color: 0xffffff, skills: ['Rapid', 'AOE', 'ULT'] };

    const bladeIcon = document.getElementById('icon-blade');
    if (bladeIcon) { bladeIcon.innerText = info.symbol; bladeIcon.style.borderColor = '#' + info.color.toString(16); bladeIcon.style.color = '#' + info.color.toString(16); }
    document.getElementById('name-s1').innerText = (type === 'Dark' && playerStats.weapon === 'Longsword') ? 'Shadow Form' : info.skills[0];
    document.getElementById('icon-s1').style.borderColor = '#' + info.color.toString(16);
    document.getElementById('cd-s1').style.height = (playerStats.cooldowns.s1 / playerStats.maxCooldowns.s1 * 100) + '%';
    const actS1 = document.getElementById('act-s1');
    if (actS1) {
        if (playerStats.activeTimers.s1 > 0) {
            actS1.innerText = Math.ceil(playerStats.activeTimers.s1) + 's';
            actS1.style.color = '#00ffaa'; // Active buff color
        } else if (playerStats.cooldowns.s1 > 0) {
            actS1.innerText = Math.ceil(playerStats.cooldowns.s1) + 's';
            actS1.style.color = '#ffaa00'; // Cooldown color
        } else {
            actS1.innerText = '';
        }
    }

    document.getElementById('name-s2').innerText = (type === 'Dark' && playerStats.weapon === 'Longsword') ? 'Crucifixion' : info.skills[1];
    document.getElementById('icon-s2').style.borderColor = '#' + info.color.toString(16);
    document.getElementById('cd-s2').style.height = (playerStats.cooldowns.s2 / playerStats.maxCooldowns.s2 * 100) + '%';
    const actS2 = document.getElementById('act-s2');
    if (actS2) {
        if (playerStats.activeTimers.s2 > 0) {
            actS2.innerText = Math.ceil(playerStats.activeTimers.s2) + 's';
            actS2.style.color = '#00ffaa';
        } else if (playerStats.cooldowns.s2 > 0) {
            actS2.innerText = Math.ceil(playerStats.cooldowns.s2) + 's';
            actS2.style.color = '#ffaa00';
        } else {
            actS2.innerText = '';
        }
    }

    document.getElementById('name-ult').innerText = (type === 'Dark' && playerStats.weapon === 'Longsword') ? 'Black Hole' : info.skills[2];
    document.getElementById('cd-ult').style.height = (playerStats.cooldowns.ult / playerStats.maxCooldowns.ult * 100) + '%';
    const actUlt = document.getElementById('act-ult');
    if (actUlt) {
        if (playerStats.activeTimers.ult > 0) {
            actUlt.innerText = Math.ceil(playerStats.activeTimers.ult) + 's';
            actUlt.style.color = '#00ffaa';
        } else if (playerStats.cooldowns.ult > 0) {
            actUlt.innerText = Math.ceil(playerStats.cooldowns.ult) + 's';
            actUlt.style.color = '#ffaa00';
        } else {
            actUlt.innerText = '';
        }
    }

    const cdHeal = document.getElementById('cd-heal');
    if (cdHeal) {
        cdHeal.style.height = (playerStats.cooldowns.heal / playerStats.maxCooldowns.heal * 100) + '%';
    }
    const actHeal = document.getElementById('act-heal');
    if (actHeal) {
        if (playerStats.activeBuffs['Healing']) {
            actHeal.innerText = Math.ceil(playerStats.activeBuffs['Healing']) + 's';
            actHeal.style.color = '#00ffaa';
        } else if (playerStats.cooldowns.heal > 0) {
            actHeal.innerText = Math.ceil(playerStats.cooldowns.heal) + 's';
            actHeal.style.color = '#ffaa00';
        } else {
            actHeal.innerText = '';
        }
    }
}

function notify(msg, color) {
    const el = document.createElement('div'); el.className = 'notify-msg'; el.innerText = msg;
    el.style.color = '#' + (color ? color.toString(16) : 'ffffff');
    const area = document.getElementById('notification-area'); if (area) area.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function selectElement(el) {
    playerStats.currentElement = el;
    playerStats.hp = playerStats.maxHp;
    playerStats.maxCooldowns.s1 = (el === 'Dark' && playerStats.weapon === 'Longsword') ? 50 : 0.5;
    if (playerStats.cooldowns.s1 > playerStats.maxCooldowns.s1) {
        playerStats.cooldowns.s1 = playerStats.maxCooldowns.s1;
    }
    playerStats.maxCooldowns.s2 = (el === 'Dark' && playerStats.weapon === 'Longsword') ? 10 : 8;
    if (playerStats.cooldowns.s2 > playerStats.maxCooldowns.s2) {
        playerStats.cooldowns.s2 = playerStats.maxCooldowns.s2;
    }
    playerStats.maxCooldowns.ult = (el === 'Dark' && playerStats.weapon === 'Longsword') ? 20 : 30;
    if (playerStats.cooldowns.ult > playerStats.maxCooldowns.ult) {
        playerStats.cooldowns.ult = playerStats.maxCooldowns.ult;
    }
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').style.display = 'block';
    renderer.domElement.requestPointerLock();
    updateHUD();

    // Initial spawn so the player doesn't wait 10 seconds
    for (let i = 0; i < 2; i++) {
        spawnEnemy('A');
        spawnEnemy('B');
        spawnEnemy('C');
    }
    spawnBoss('A');
}
function toggleFusionMenu() { isMenuOpen = !isMenuOpen; const m = document.getElementById('fusion-menu'); if (isMenuOpen) { document.exitPointerLock(); m.classList.remove('hidden'); renderInventory(); } else { m.classList.add('hidden'); renderer.domElement.requestPointerLock(); } }
function renderInventory() { const list = document.getElementById('inventory-list'); list.innerHTML = ''; for (let [key, val] of Object.entries(playerStats.inventory)) { if (val > 0) { const d = document.createElement('div'); d.className = 'inv-item'; d.innerHTML = `${key} x${val}`; list.appendChild(d); } } }
function attemptFusion() { notify("Fusion System In Progress...", 0xaaaaaa); }

function enemyAttack(enemy, target = player) {
    enemy.userData.isAttacking = true; enemy.userData.attackTimer = 0;
    const info = MONSTERS[enemy.userData.type];

    let isRanged = false;
    let baseDmg = 10;
    if (enemy.userData.isBoss) {
        if (enemy.userData.attackType === 'ranged') {
            isRanged = true;
            baseDmg = 10;
        } else {
            baseDmg = 5;
        }
    } else {
        if (enemy.userData.weaponType === 'Bow') {
            isRanged = true;
            baseDmg = 8;
        } else if (enemy.userData.weaponType === 'Hammer') {
            baseDmg = 10;
        } else {
            baseDmg = 5;
        }
    }

    if (isRanged) {
        const projGroup = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: info.color }));
        const spawnPos = enemy.position.clone(); spawnPos.y = 4;
        projGroup.position.copy(spawnPos);
        const dir = new THREE.Vector3().subVectors(target.position, spawnPos).normalize();
        projGroup.velocity = dir.multiplyScalar(30);
        projGroup.life = 3;
        projGroup.dmg = baseDmg;
        projGroup.type = 'projectile';
        projGroup.isEnemy = true;
        scene.add(projGroup); bullets.push(projGroup);
    } else {
        const slashGeo = new THREE.RingGeometry(2, 2.5, 8, 1, -Math.PI / 3, Math.PI / 1.5);
        const slashMat = new THREE.MeshBasicMaterial({ color: info.color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const slash = new THREE.Mesh(slashGeo, slashMat);
        slash.position.copy(enemy.position); slash.position.y = 2.5; slash.lookAt(target.position);
        scene.add(slash); setTimeout(() => scene.remove(slash), 200);
        if (target.position.distanceTo(enemy.position) < 4.5) {
            const dmgMul = enemy.userData.dmgMultiplier || 1;
            let dmg = Math.round(baseDmg * dmgMul);
            if (enemy.userData.isBoss) dmg = baseDmg; // Fixed damage for Boss

            if (target === player) {
                dmg = 2;
                if (playerStats.earthArmor > 0) {
                    playerStats.earthArmor -= dmg;
                    notify(`Armor took ${dmg} dmg! (${Math.max(0, playerStats.earthArmor)}/100)`, 0x885500);
                    if (playerStats.earthArmor <= 0) {
                        notify("Earth Armor Broken!", 0xff0000);
                        if (player.userData.earthArmorMesh) {
                            player.remove(player.userData.earthArmorMesh);
                            player.userData.earthArmorMesh = null;
                        }
                    }
                } else {
                    playerStats.hp -= dmg; updateHUD(); takeDamageEffect();
                    if (playerStats.hp <= 0) { document.exitPointerLock(); alert("GAME OVER!"); location.reload(); }
                }
            } else if (target.userData && target.userData.isGolem) {
                target.userData.hp -= dmg;
                if (target.userData.hpBar) target.userData.hpBar.scale.x = Math.max(0, target.userData.hp / target.userData.maxHp);
                if (target.userData.hp <= 0) {
                    createExplosion(target.position, 0x885500);
                    const idx = allies.indexOf(target);
                    if (idx > -1) allies.splice(idx, 1);
                    scene.remove(target);
                }
            }
        }
    }
}

function takeDamageEffect() { const flash = document.getElementById('damage-flash'); flash.style.opacity = 1; setTimeout(() => { flash.style.opacity = 0; }, 100); }
function absorbDebris() { let count = 0; boneDebris.forEach(b => { if (!b.userData.target && b.position.distanceTo(player.position) < 15) { b.userData.target = player; b.userData.speed = 1; count++; } }); if (count > 0) notify(`Absorbed ${count} fragments!`, 0x00ff00); }
function collectDebris(type, enemyLevel) { if (!playerStats.inventory[type]) playerStats.inventory[type] = 0; playerStats.inventory[type]++; notify(`+1 ${type} Fragment`, MONSTERS[type] ? MONSTERS[type].color : 0xffffff); const expGain = 5 * (enemyLevel || 1); playerStats.exp += expGain; if (playerStats.exp >= 100) { playerStats.level++; playerStats.exp = 0; playerStats.maxHp += 20; playerStats.hp += 20; notify(`LEVEL UP!`, 0x00ff00); } updateHUD(); }
function createExplosion(pos, color) { for (let i = 0; i < 8; i++) { const g = new THREE.BoxGeometry(0.4, 0.4, 0.4); const m = new THREE.MeshBasicMaterial({ color: color }); const mesh = new THREE.Mesh(g, m); mesh.position.copy(pos); mesh.position.x += (Math.random() - 0.5) * 2; mesh.position.y += Math.random() * 2; mesh.position.z += (Math.random() - 0.5) * 2; mesh.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 10, (Math.random() - 0.5) * 10), life: 1.0 }; scene.add(mesh); particles.push({ mesh: mesh, life: 1.0 }); } }

function triggerChainLightning(startEnemy, damage) {
    let currentTarget = startEnemy;
    let hitTargets = [startEnemy];
    let count = 0;
    const interval = setInterval(() => {
        if (count >= 3 || !isGameActive || !currentTarget) { clearInterval(interval); return; }
        let nextTarget = null;
        let minDist = Infinity;
        enemies.forEach(e => {
            if (!hitTargets.includes(e) && e.position) {
                let dist = currentTarget.position.distanceTo(e.position);
                if (dist < 15 && dist < minDist) { minDist = dist; nextTarget = e; }
            }
        });
        if (nextTarget) {
            createLightningArc(currentTarget.position, nextTarget.position);
            nextTarget.userData.statuses.shock = 3;
            applyDamage(nextTarget, damage);
            hitTargets.push(nextTarget);
            currentTarget = nextTarget;
            if (nextTarget.userData.hp <= 0) {
                const idx = enemies.indexOf(nextTarget);
                if (idx > -1) { shatterEnemy(nextTarget); enemies.splice(idx, 1); }
            }
        } else { clearInterval(interval); }
        count++;
    }, 150);
}

function createLightningArc(pos1, pos2) {
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const points = [];
    points.push(pos1.clone().add(new THREE.Vector3(0, 2, 0)));
    const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    mid.x += (Math.random() - 0.5) * 4; mid.y += 2 + (Math.random() - 0.5) * 4; mid.z += (Math.random() - 0.5) * 4;
    points.push(mid);
    points.push(pos2.clone().add(new THREE.Vector3(0, 2, 0)));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    setTimeout(() => scene.remove(line), 150);
}

function createVerticalLightning(pos) {
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const points = [];
    points.push(pos.clone().add(new THREE.Vector3(0, 30, 0)));
    const mid1 = pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, 20, (Math.random() - 0.5) * 6));
    const mid2 = pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, 10, (Math.random() - 0.5) * 6));
    points.push(mid1, mid2);
    points.push(pos.clone());
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    setTimeout(() => scene.remove(line), 200);
}

// Event Handlers
function activateHeal() {
    if (playerStats.cooldowns.heal > 0) { notify("HEAL ON COOLDOWN!", 0xff0000); return; }
    playerStats.activeBuffs['Healing'] = 10.0;
    playerStats.cooldowns.heal = 15.0;
    notify("Healing Activated!", 0x00ff00);
}

function onKeyDown(e) { const k = e.key.toLowerCase(); if (keys.hasOwnProperty(k)) keys[k] = true; if (k === 'e') absorbDebris(); if (k === 'q') activateSkill(2); if (k === 'r') activateSkill(3); if (k === 'g') activateHeal(); if (k === 'tab') { e.preventDefault(); toggleFusionMenu(); } }
function onKeyUp(e) { const k = e.key.toLowerCase(); if (keys.hasOwnProperty(k)) keys[k] = false; }
function onMouseDown(e) { if (!isGameActive) return; if (e.button === 0) { if (isAimingUlt) { executeSkill(3, aimReticle.position); isAimingUlt = false; aimReticle.visible = false; document.getElementById('aim-hint').style.display = 'none'; } else { performBasicAttack(); } } if (e.button === 2) { if (isAimingUlt) { isAimingUlt = false; aimReticle.visible = false; document.getElementById('aim-hint').style.display = 'none'; notify("CANCELLED", 0xffffff); } else { activateSkill(1); } } }
function onMouseMove(e) { if (!isGameActive) return; player.rotation.y -= e.movementX * 0.002; cameraPivot.rotation.x = Math.max(-1, Math.min(1, cameraPivot.rotation.x - e.movementY * 0.002)); if (isAimingUlt) { raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); const intersects = raycaster.intersectObjects(scene.children); const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion).multiplyScalar(15); aimReticle.position.copy(player.position).add(forward); aimReticle.position.y = 0.5; } }
function onWindowResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

// Start Game
init();
