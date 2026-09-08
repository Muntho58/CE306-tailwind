(function () {
  "use strict";

  // ---------- ค่าคงที่ระดับความยาก ----------
  const LEVELS = [
    {
      label: "ง่าย",
      playerMaxHp: 50,
      playerAtkMin: 6,
      playerAtkMax: 10,
      skillDmgMin: 14,
      skillDmgMax: 20,
      skillUses: 3,
      enemyMaxHp: 40,
      enemyAtkMin: 4,
      enemyAtkMax: 8,
    },
    {
      label: "ปานกลาง",
      playerMaxHp: 50,
      playerAtkMin: 6,
      playerAtkMax: 10,
      skillDmgMin: 14,
      skillDmgMax: 20,
      skillUses: 2,
      enemyMaxHp: 60,
      enemyAtkMin: 6,
      enemyAtkMax: 12,
    },
    {
      label: "ยาก",
      playerMaxHp: 50,
      playerAtkMin: 6,
      playerAtkMax: 10,
      skillDmgMin: 14,
      skillDmgMax: 20,
      skillUses: 1,
      enemyMaxHp: 85,
      enemyAtkMin: 8,
      enemyAtkMax: 16,
    },
  ];

  // ---------- สถานะเกม ----------
  let levelIndex = 0;
  let playerHp = 0;
  let playerMaxHp = 0;
  let enemyHp = 0;
  let enemyMaxHp = 0;
  let skillUsesLeft = 0;
  let turn = 1;
  let isDefending = false;
  let gameState = "playing"; // "playing" | "won" | "lost"
  let inputLocked = false; // ล็อกปุ่มระหว่างเทิร์นอสูรกำลังทำงาน

  // ---------- อ้างอิง DOM ----------
  const levelOutputEl = document.getElementById("level-output");
  const turnOutputEl = document.getElementById("turn-output");
  const statusEl = document.getElementById("status-message");
  const playerHpBarEl = document.getElementById("player-hp-bar");
  const playerHpOutputEl = document.getElementById("player-hp-output");
  const enemyHpBarEl = document.getElementById("enemy-hp-bar");
  const enemyHpOutputEl = document.getElementById("enemy-hp-output");
  const skillUsesOutputEl = document.getElementById("skill-uses-output");
  const battleLogEl = document.getElementById("battle-log");
  const attackBtn = document.getElementById("attack-btn");
  const defendBtn = document.getElementById("defend-btn");
  const skillBtn = document.getElementById("skill-btn");
  const restartBtn = document.getElementById("restart-btn");
  const levelBtn = document.getElementById("level-btn");
  const howToPlayBtn = document.getElementById("how-to-play-btn");
  const closeDialogBtn = document.getElementById("close-dialog-btn");
  const dialogEl = document.getElementById("how-to-play-dialog");

  // ---------- ตัวช่วย ----------
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function addLog(message) {
    const li = document.createElement("li");
    li.textContent = message;
    battleLogEl.appendChild(li);
    battleLogEl.scrollTop = battleLogEl.scrollHeight;
  }

  function hpBarClass(current, max) {
    const percent = (current / max) * 100;
    const base = "h-full rounded-full transition-all duration-300 motion-reduce:transition-none";
    if (percent > 50) return base + " bg-emerald-500";
    if (percent > 20) return base + " bg-amber-500";
    return base + " bg-rose-600";
  }

  function updateHpDisplay() {
    const playerPercent = Math.max(0, (playerHp / playerMaxHp) * 100);
    const enemyPercent = Math.max(0, (enemyHp / enemyMaxHp) * 100);

    playerHpBarEl.style.width = playerPercent + "%";
    playerHpBarEl.className = hpBarClass(Math.max(playerHp, 0), playerMaxHp);
    playerHpOutputEl.textContent = Math.max(playerHp, 0) + " / " + playerMaxHp;

    enemyHpBarEl.style.width = enemyPercent + "%";
    enemyHpBarEl.className = hpBarClass(Math.max(enemyHp, 0), enemyMaxHp);
    enemyHpOutputEl.textContent = Math.max(enemyHp, 0) + " / " + enemyMaxHp;
  }

  function updateStatsDisplay() {
    levelOutputEl.textContent = LEVELS[levelIndex].label;
    turnOutputEl.textContent = String(turn);
    skillUsesOutputEl.textContent = String(skillUsesLeft);
  }

  function setStatus(message, tone) {
    statusEl.textContent = message;

    let toneClass;
    if (tone === "win") {
      toneClass =
        "mb-4 rounded-md border-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-center text-sm font-600 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-200 forced-colors:border-[Highlight]";
    } else if (tone === "lose") {
      toneClass =
        "mb-4 rounded-md border-2 border-rose-600 bg-rose-50 px-4 py-3 text-center text-sm font-600 text-rose-900 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-200 forced-colors:border-[Highlight]";
    } else {
      toneClass =
        "mb-4 rounded-md border-2 border-amber-500 bg-amber-50 px-4 py-3 text-center text-sm font-600 text-amber-900 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200 forced-colors:border-[Highlight]";
    }
    statusEl.className = toneClass;
  }

  function setButtonsDisabled(disabled) {
    attackBtn.disabled = disabled;
    defendBtn.disabled = disabled;
    skillBtn.disabled = disabled || skillUsesLeft <= 0 || gameState !== "playing";
  }

  // ---------- เริ่ม/รีสตาร์ทเกม ----------
  function startGame() {
    const level = LEVELS[levelIndex];
    playerMaxHp = level.playerMaxHp;
    playerHp = level.playerMaxHp;
    enemyMaxHp = level.enemyMaxHp;
    enemyHp = level.enemyMaxHp;
    skillUsesLeft = level.skillUses;
    turn = 1;
    isDefending = false;
    gameState = "playing";
    inputLocked = false;

    battleLogEl.innerHTML = "";
    addLog("การประลองเริ่มต้นขึ้น! ระดับความยาก: " + level.label);

    updateHpDisplay();
    updateStatsDisplay();
    setStatus("เลือกท่าต่อสู้ของเจ้าได้เลย นักรบ!", "playing");
    setButtonsDisabled(false);
  }

  // ---------- จบเกม ----------
  function winGame() {
    gameState = "won";
    setButtonsDisabled(true);
    addLog("🎉 อสูรพ่ายแพ้แล้ว!");
    setStatus("🎉 ชนะแล้ว! เจ้าปราบอสูรผู้พิทักษ์ประตูไฟได้สำเร็จ ใช้เวลา " + turn + " เทิร์น", "win");
  }

  function loseGame() {
    gameState = "lost";
    setButtonsDisabled(true);
    addLog("💀 นักรบล้มลงกับพื้น...");
    setStatus("💀 พ่ายแพ้แล้ว! ลองใหม่อีกครั้งเพื่อล้างแค้น", "lose");
  }

  // ---------- เทิร์นของอสูร ----------
  function enemyTurn() {
    if (gameState !== "playing") return;

    let dmg = randomInt(LEVELS[levelIndex].enemyAtkMin, LEVELS[levelIndex].enemyAtkMax);
    if (isDefending) {
      dmg = Math.round(dmg / 2);
      addLog("🛡️ เจ้าใช้โล่ป้องกัน ลดความเสียหายลงครึ่งหนึ่ง!");
    }
    isDefending = false;

    playerHp -= dmg;
    addLog("🐉 อสูรโจมตีเจ้า สร้างความเสียหาย " + dmg + " หน่วย");
    updateHpDisplay();

    if (playerHp <= 0) {
      loseGame();
      return;
    }

    turn += 1;
    updateStatsDisplay();
    setStatus("เลือกท่าต่อสู้ของเจ้าได้เลย นักรบ!", "playing");
    setButtonsDisabled(false);
    inputLocked = false;
  }

  // ---------- เทิร์นของผู้เล่น ----------
  function playerAction(action) {
    if (gameState !== "playing" || inputLocked) return;

    if (action === "attack") {
      const dmg = randomInt(LEVELS[levelIndex].playerAtkMin, LEVELS[levelIndex].playerAtkMax);
      enemyHp -= dmg;
      addLog("🗡️ เจ้าโจมตีอสูร สร้างความเสียหาย " + dmg + " หน่วย");
    } else if (action === "defend") {
      isDefending = true;
      addLog("🛡️ เจ้ายกโล่ตั้งท่าป้องกัน");
    } else if (action === "skill") {
      if (skillUsesLeft <= 0) return;
      skillUsesLeft -= 1;
      const dmg = randomInt(LEVELS[levelIndex].skillDmgMin, LEVELS[levelIndex].skillDmgMax);
      enemyHp -= dmg;
      addLog("🔥 เจ้าปล่อยท่าไม้ตาย! สร้างความเสียหาย " + dmg + " หน่วย");
    } else {
      return;
    }

    updateHpDisplay();
    updateStatsDisplay();

    if (enemyHp <= 0) {
      winGame();
      return;
    }

    inputLocked = true;
    setButtonsDisabled(true);
    setStatus("อสูรกำลังเตรียมโต้กลับ...", "playing");

    setTimeout(enemyTurn, 700);
  }

  // ---------- ปุ่มท่าต่อสู้ ----------
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      playerAction(btn.getAttribute("data-action"));
    });
  });

  // ---------- คีย์บอร์ด ----------
  const KEY_ACTION_MAP = {
    "1": "attack",
    "2": "defend",
    "3": "skill",
  };

  document.addEventListener("keydown", (e) => {
    const action = KEY_ACTION_MAP[e.key];
    if (!action) return;
    e.preventDefault();
    playerAction(action);
  });

  // ---------- ปุ่มเริ่มใหม่ ----------
  restartBtn.addEventListener("click", () => {
    startGame();
  });

  // ---------- ปุ่มเพิ่มระดับความยาก ----------
  levelBtn.addEventListener("click", () => {
    levelIndex = (levelIndex + 1) % LEVELS.length;
    startGame();
  });

  // ---------- Dialog วิธีเล่น ----------
  howToPlayBtn.addEventListener("click", () => {
    dialogEl.showModal();
  });
  closeDialogBtn.addEventListener("click", () => {
    dialogEl.close();
  });

  // ---------- เริ่มเกมครั้งแรก ----------
  startGame();
})();