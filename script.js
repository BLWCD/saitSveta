// ============ ПЕРЕМЕННЫЕ ============
let selectedOption = "";
let selectedCategory = "";
let musicPlaying = false;

// ============ ИГРА ============
let gameAttempts = 3;
let vladPosition = 0;
let gameCells = [];
let retryCount = 0;
const MAX_RETRIES = 3;

const gameIcons = [
    "🐱", "🍕", "🎮", "🌸", "🍩",
    "🎸", "🚀", "🍓", "🌈", "🦊",
    "🐼", "🍔", "⚽", "🎨", "🍦",
    "🌙", "🎁", "☕", "🎵", "🐻"
];
const VLAD_ICON = "🤴";

// ============ ДОЛГИ ============
const DEBT_PER_WIN = 10;

function getDebts() {
    const saved = localStorage.getItem("svetaDebts");
    return saved ? parseInt(saved) : 0;
}

function addDebt() {
    const current = getDebts();
    const newCount = current + 1;
    localStorage.setItem("svetaDebts", newCount);
    updateDebtDisplay();
    return newCount;
}

function updateDebtDisplay() {
    const count = getDebts();
    const el = document.getElementById("debtCount");
    if (el) el.textContent = count;
}

function showDebts() {
    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");

    const count = getDebts();
    document.getElementById("totalDebt").textContent = count;
    document.getElementById("totalMinutes").textContent = count * DEBT_PER_WIN;

    document.getElementById("debtBlock").classList.remove("hidden");
}

function closeDebts() {
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

// ============ ВИШЛИСТ ============
let currentWho = "";
let currentFilter = "all";

function getWishes() {
    const saved = localStorage.getItem("ourWishes");
    return saved ? JSON.parse(saved) : [];
}

function saveWishes(wishes) {
    localStorage.setItem("ourWishes", JSON.stringify(wishes));
}

function selectWho(who) {
    currentWho = who;

    // Подсветка активной кнопки
    document.getElementById("whoVlad").classList.toggle("active", who === "Владислав");
    document.getElementById("whoSveta").classList.toggle("active", who === "Светлана");

    if (navigator.vibrate) navigator.vibrate(30);
}

function showWishlist() {
    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");

    // По умолчанию — Светлана (для неё)
    if (!currentWho) {
        selectWho("Светлана");
    }

    renderWishes();
    document.getElementById("wishlistBlock").classList.remove("hidden");
}

function closeWishlist() {
    document.getElementById("wishlistBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    renderWishes();
    if (navigator.vibrate) navigator.vibrate(20);
}

function renderWishes() {
    const wishes = getWishes();
    const list = document.getElementById("wishList");
    list.innerHTML = "";

    let filtered = wishes;
    if (currentFilter !== "all") {
        filtered = wishes.filter(w => w.author === currentFilter);
    }

    if (filtered.length === 0) {
        let text = "Пока пусто. Добавь своё первое желание 💕";
        if (currentFilter === "Владислав") text = "Желаний от Владислава пока нет 🤴";
        if (currentFilter === "Светлана") text = "Желаний от Светланы пока нет 👸";
        list.innerHTML = `<div class="wish-empty">${text}</div>`;
        return;
    }

    filtered.forEach((wish) => {
        const originalIndex = wishes.indexOf(wish);
        const isVlad = wish.author === "Владислав";
        const authorClass = isVlad ? "vlad" : "sveta";
        const authorEmoji = isVlad ? "🤴" : "👸";

        const div = document.createElement("div");
        div.className = "wish-item " + authorClass;
        div.innerHTML = `
            <span class="wish-author ${authorClass}">${authorEmoji} ${wish.author}</span>
            <span class="wish-text">${escapeHtml(wish.text)}</span>
            <button class="wish-delete" onclick="deleteWish(${originalIndex})" title="Удалить">✕</button>
        `;
        list.appendChild(div);
    });
}

function addWish() {
    if (!currentWho) {
        showToast("Сначала выбери, чьё это желание 👆");
        return;
    }

    const input = document.getElementById("wishInput");
    const text = input.value.trim();

    if (text === "") {
        showToast("Напиши, что ты хочешь 💕");
        return;
    }

    const wishes = getWishes();
    wishes.push({
        author: currentWho,
        text: text,
        date: new Date().toISOString()
    });
    saveWishes(wishes);
    input.value = "";
    renderWishes();

    // Уведомление в Telegram
    const emoji = currentWho === "Владислав" ? "🤴" : "👸";
    const message = 
        `${emoji} <b>${currentWho} добавил(а) желание в общий вишлист!</b>\n\n` +
        `📝 ${text}\n\n` +
        `📊 Всего желаний: ${wishes.length}`;

    sendToTelegram(message);

    fireSparkles();
    showToast(`Добавлено от ${currentWho} 💕`);

    if (navigator.vibrate) navigator.vibrate(30);
}

function deleteWish(index) {
    const wishes = getWishes();
    if (index < 0 || index >= wishes.length) return;
    
    wishes.splice(index, 1);
    saveWishes(wishes);
    renderWishes();

    showToast("Удалено");
    if (navigator.vibrate) navigator.vibrate(20);
}

function sendWishlist() {
    const wishes = getWishes();

    if (wishes.length === 0) {
        showToast("Список пуст — нечего отправлять");
        return;
    }

    const vladWishes = wishes.filter(w => w.author === "Владислав");
    const svetaWishes = wishes.filter(w => w.author === "Светлана");

    let message = `💝 <b>ОБЩИЙ ВИШЛИСТ</b>\n\n`;

    if (svetaWishes.length > 0) {
        message += `👸 <b>Светлана хочет:</b>\n`;
        svetaWishes.forEach((w, i) => {
            message += `${i + 1}. ${w.text}\n`;
        });
        message += `\n`;
    }

    if (vladWishes.length > 0) {
        message += `🤴 <b>Владислав хочет:</b>\n`;
        vladWishes.forEach((w, i) => {
            message += `${i + 1}. ${w.text}\n`;
        });
        message += `\n`;
    }

    message += `📊 Всего: <b>${wishes.length}</b> желаний`;

    sendToTelegram(message);
    fireSparkles();
    showToast("Отправлено тебе в Telegram 💌");
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ============ ДАТА ============
const startDate = new Date(2025, 0, 13, 0, 0, 0);

// ============ МЕНЮ ============
const menuData = {
    "Посмотреть": ["Комедия", "Ужасы", "Мелодрама", "Боевик", "Фантастика", "Мультфильм", "Детектив", "Драма"],
    "Заказать": ["Пицца", "Роллы", "Бургеры", "Шаурма", "Суши", "Паста", "WOK", "Десерты"],
    "Погулять": [
        "Парк Швейцария",
        "Нижегородский Кремль",
        "Чкаловская лестница",
        "Верхневолжская набережная",
        "Большая Покровская",
        "Автозаводский парк",
        "Парк Дубки",
        "Сормовский парк"
    ],
    "Покататься": [
        "По городу",
        "На набережную",
        "В Кстово",
        "В Богородск",
        "В Семёнов",
        "В Дивеево",
        "В Городец",
        "В Чкаловск"
    ]
};

// ============ СЮРПРИЗЫ ============
const surprises = [
    "🎬 Вечер кино с попкорном и пледом дома",
    "🍕 Заказать пиццу и устроить пижамную вечеринку",
    "🚗 Поехать кататься по ночному городу",
    "🌳 Прогулка по парку Швейцария с мороженым",
    "☕ Зайти в уютную кофейню и поболтать",
    "🍣 Заказать роллы и посмотреть аниме",
    "🎡 Поехать в Сормовский парк на аттракционы",
    "🚶 Прогулка по Большой Покровской",
    "🌅 Встретить закат на набережной",
    "🏰 Поехать в Кремль",
    "🎂 Испечь вместе что-нибудь вкусное",
    "💆 День спа и релакса дома",
    "🛍️ Поехать в торговый центр",
    "🎮 Вечер настольных игр",
    "📸 Устроить фотосессию на закате"
];

// ============ СЧЁТЧИК ============
function updateCounter() {
    const now = new Date();
    const diff = now - startDate;
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const dEl = document.getElementById("daysCount");
    if (dEl) {
        dEl.textContent = days;
        document.getElementById("hoursCount").textContent = hours;
        document.getElementById("minutesCount").textContent = minutes;
        document.getElementById("secondsCount").textContent = seconds;
    }
}
setInterval(updateCounter, 1000);
updateCounter();
updateDebtDisplay();

// ============ МУЗЫКА ============
function toggleMusic() {
    const music = document.getElementById("bgMusic");
    const player = document.querySelector(".music-player");
    const btn = document.getElementById("musicBtn");

    if (musicPlaying) {
        music.pause();
        btn.textContent = "▶";
        player.classList.remove("playing");
        musicPlaying = false;
    } else {
        music.play().catch(() => showToast("Положи файл music.mp3 в папку сайта 🎵"));
        btn.textContent = "⏸";
        player.classList.add("playing");
        musicPlaying = true;
    }
}

function setVolume(value) {
    const music = document.getElementById("bgMusic");
    music.volume = value;
    localStorage.setItem("musicVolume", value);
    document.getElementById("volumeSlider").value = value;
}

function changeVolume(delta) {
    const music = document.getElementById("bgMusic");
    let v = music.volume + delta;
    if (v < 0) v = 0;
    if (v > 1) v = 1;
    music.volume = v;
    document.getElementById("volumeSlider").value = v;
    localStorage.setItem("musicVolume", v);
    showToast(`Громкость: ${Math.round(v * 100)}%`);
}

// ============ КАТЕГОРИИ ============
function showSubMenu(category) {
    selectedCategory = category;
    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");

    const subMenuBlock = document.getElementById("subMenuBlock");
    subMenuBlock.classList.remove("hidden");
    document.getElementById("subMenuTitle").textContent = category + ": выбери вариант";

    const list = document.getElementById("subMenuList");
    list.innerHTML = "";
    menuData[category].forEach(item => {
        const div = document.createElement("div");
        div.className = "sub-item";
        div.textContent = item;
        div.onclick = () => chooseOption(item);
        list.appendChild(div);
    });

    if (navigator.vibrate) navigator.vibrate(50);
}

function chooseOption(option) {
    selectedOption = option;
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");

    const resultBlock = document.getElementById("resultBlock");
    resultBlock.classList.remove("hidden");
    document.getElementById("chosenOption").textContent = selectedCategory + " → " + option;
    if (navigator.vibrate) navigator.vibrate(50);
}

function backToCategories() {
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

function changeChoice() {
    document.getElementById("resultBlock").classList.add("hidden");
    const subMenuBlock = document.getElementById("subMenuBlock");
    subMenuBlock.classList.remove("hidden");
    document.getElementById("subMenuTitle").textContent = selectedCategory + ": выбери вариант";

    const list = document.getElementById("subMenuList");
    list.innerHTML = "";
    menuData[selectedCategory].forEach(item => {
        const div = document.createElement("div");
        div.className = "sub-item";
        div.textContent = item;
        div.onclick = () => chooseOption(item);
        list.appendChild(div);
    });
    document.getElementById("comment").value = "";
}

function cancelAll() {
    selectedOption = "";
    selectedCategory = "";
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
    document.getElementById("comment").value = "";
    showToast("Выбор отменён 💕");
}

// ============ СЮРПРИЗ ============
function showSurprise() {
    const random = surprises[Math.floor(Math.random() * surprises.length)];
    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");

    const surpriseBlock = document.getElementById("surpriseBlock");
    surpriseBlock.classList.remove("hidden");
    document.getElementById("surpriseText").textContent = random;
    fireSparkles();
}

function closeSurprise() {
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

// ============ ИГРА ============
function startGame() {
    retryCount = 0;
    initGame();
}

function retryGame() {
    retryCount++;
    if (retryCount > MAX_RETRIES) {
        showToast(`⚠️ Лимит попыток превышен. Долг не будет начислен.`);
    }
    initGame();
}

function initGame() {
    gameAttempts = 3;
    vladPosition = Math.floor(Math.random() * 20);

    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("winBlock").classList.add("hidden");
    document.getElementById("loseBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");

    const gameBlock = document.getElementById("gameBlock");
    gameBlock.classList.remove("hidden");
    document.getElementById("attemptsLeft").textContent = "3";

    const retryInfo = document.getElementById("retryInfo");
    if (retryInfo) {
        if (retryCount > 0) {
            retryInfo.textContent = `🔄 Попыток перезапуска: ${retryCount} / ${MAX_RETRIES}`;
            retryInfo.classList.remove("hidden");
        } else {
            retryInfo.classList.add("hidden");
        }
    }

    updateDebtDisplay();
    buildGameGrid();

    if (navigator.vibrate) navigator.vibrate(50);
}

function buildGameGrid() {
    const grid = document.getElementById("gameGrid");
    grid.innerHTML = "";
    gameCells = [];

    gameIcons.forEach((icon, index) => {
        const cell = document.createElement("div");
        cell.className = "game-cell";
        cell.textContent = icon;
        cell.dataset.index = index;
        cell.onclick = () => clickCell(cell, index);
        grid.appendChild(cell);
        gameCells.push({ element: cell, icon: icon, clicked: false });
    });
}

function clickCell(cell, index) {
    if (cell.classList.contains("opened")) return;
    if (cell.classList.contains("found")) return;

    if (index === vladPosition) {
        cell.textContent = VLAD_ICON;
        cell.classList.add("found");
        gameCells[index].clicked = true;
        triggerWin();
    } else {
        cell.classList.add("opened");
        gameAttempts--;
        document.getElementById("attemptsLeft").textContent = gameAttempts;
        gameCells[index].clicked = true;

        if (navigator.vibrate) navigator.vibrate(30);

        if (gameAttempts <= 0) {
            setTimeout(() => triggerLose(), 500);
        }
    }
}

function triggerWin() {
    setTimeout(() => {
        document.getElementById("gameBlock").classList.add("hidden");
        document.getElementById("winBlock").classList.remove("hidden");

        fireSparkles();
        fireRainbowWave();
        setTimeout(() => fireHeartParticles(), 300);

        const isDebtValid = retryCount <= MAX_RETRIES;

        if (isDebtValid) {
            const totalDebts = addDebt();
            const attemptsUsed = 3 - gameAttempts;

            const message = 
                `🎉 <b>Светлана нашла тебя!</b>\n\n` +
                `🎯 Попыток использовано: ${attemptsUsed} из 3\n` +
                `🔄 Перезапусков: ${retryCount} из ${MAX_RETRIES}\n` +
                `💆 <b>Ты должен ей: ${DEBT_PER_WIN} минут массажа</b>\n` +
                `💰 Всего долгов: <b>${totalDebts}</b>\n` +
                `⏱ Общее время массажа: <b>${totalDebts * DEBT_PER_WIN} минут</b>`;

            sendToTelegram(message);

            const winDebtEl = document.getElementById("winDebt");
            if (winDebtEl) {
                winDebtEl.innerHTML = `💆 Ты должен: <b>${DEBT_PER_WIN} минут массажа</b><br>💰 Всего долгов: <b>${totalDebts}</b>`;
                winDebtEl.classList.remove("hidden");
                winDebtEl.style.color = "#0ca678";
            }
        } else {
            const message = 
                `⚠️ <b>Светлана нашла тебя, но долг не начислен</b>\n\n` +
                `🔄 Перезапусков: ${retryCount} (лимит ${MAX_RETRIES})\n` +
                `💆 Долг не начислен — слишком много попыток`;

            sendToTelegram(message);

            const winDebtEl = document.getElementById("winDebt");
            if (winDebtEl) {
                winDebtEl.innerHTML = `⚠️ Лимит перезапусков превышен<br>💆 <b>Долг не начислен</b>`;
                winDebtEl.classList.remove("hidden");
                winDebtEl.style.color = "#dc3545";
            }
        }

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    }, 400);
}

function triggerLose() {
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("loseBlock").classList.remove("hidden");

    const vladCell = gameCells[vladPosition].element;
    vladCell.textContent = VLAD_ICON;
    vladCell.classList.add("found");

    const message = 
        `😢 <b>Светлана не нашла тебя</b>\n\n` +
        `Использовала все 3 попытки.\n` +
        `Ты был на позиции ${vladPosition + 1}.\n` +
        `💆 Долг не начислен — попробует ещё!`;

    sendToTelegram(message);

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function closeGame() {
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("winBlock").classList.add("hidden");
    document.getElementById("loseBlock").classList.add("hidden");
    document.getElementById("debtBlock").classList.add("hidden");
    document.getElementById("wishlistBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

// ============ ЭФФЕКТЫ ============
function fireSparkles() {
    const container = document.getElementById("particlesContainer");
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 60; i++) {
        const spark = document.createElement("div");
        spark.className = "spark";
        spark.style.left = centerX + "px";
        spark.style.top = centerY + "px";

        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 400;
        spark.style.setProperty("--tx", (Math.cos(angle) * distance) + "px");
        spark.style.setProperty("--ty", (Math.sin(angle) * distance) + "px");
        spark.style.animationDelay = (Math.random() * 0.3) + "s";

        container.appendChild(spark);
        setTimeout(() => spark.remove(), 2000);
    }
}

function fireRainbowWave() {
    const wave = document.createElement("div");
    wave.className = "rainbow-wave";
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 2200);
}

function fireHeartParticles() {
    const container = document.getElementById("particlesContainer");
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 80; i++) {
        const t = (i / 80) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const scale = 12;

        const particle = document.createElement("div");
        particle.className = "heart-particle";
        particle.style.left = centerX + "px";
        particle.style.top = centerY + "px";
        particle.style.setProperty("--tx", (x * scale) + "px");
        particle.style.setProperty("--ty", (y * scale) + "px");
        particle.style.animationDelay = (i * 0.02) + "s";

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }
}

// ============ ОТПРАВКА ============
function sendChoice() {
    const comment = document.getElementById("comment").value;
    if (comment.trim() === "") {
        alert("Пожалуйста, напиши, что именно ты хочешь 😊");
        return;
    }

    const message = 
        `💕 <b>Новый выбор!</b>\n\n` +
        `📌 Категория: ${selectedCategory}\n` +
        `✅ Выбор: ${selectedOption}\n` +
        `💬 Комментарий: ${comment}`;

    sendToTelegram(message);
    fireSparkles();
    showToast(`Отправлено: ${selectedCategory} → ${selectedOption} 💌`);
    document.getElementById("comment").value = "";
}

function sendToTelegram(message) {
    fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log("✅ Сообщение отправлено в Telegram");
        } else {
            console.error("❌ Ошибка:", data.error);
        }
    })
    .catch(error => {
        console.error("❌ Ошибка отправки:", error);
    });
}

// ============ УВЕДОМЛЕНИЕ ============
function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: linear-gradient(135deg, #d6336c, #b02a56);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-size: 1rem;
        box-shadow: 0 10px 30px rgba(214, 51, 108, 0.5);
        z-index: 999999;
        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Segoe UI', sans-serif;
        max-width: 90%;
        text-align: center;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = "translateX(-50%) translateY(0)"; }, 100);
    setTimeout(() => {
        toast.style.transform = "translateX(-50%) translateY(-100px)";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ============ СМЕНА ФОНА ============
function updateBackground() {
    const hour = new Date().getHours();
    const body = document.getElementById("mainBody");
    const nightSky = document.getElementById("nightSky");

    body.classList.remove("morning", "day", "evening", "night");

    if (hour >= 6 && hour < 12) body.classList.add("morning");
    else if (hour >= 12 && hour < 18) body.classList.add("day");
    else if (hour >= 18 && hour < 22) body.classList.add("evening");
    else {
        body.classList.add("night");
        if (nightSky) nightSky.classList.remove("hidden");
    }

    if (nightSky && hour >= 6 && hour < 22) nightSky.classList.add("hidden");
}

updateBackground();
setInterval(updateBackground, 60000);

// ============ ЗАГРУЗКА ============
window.addEventListener("load", () => {
    const savedVolume = localStorage.getItem("musicVolume");
    if (savedVolume !== null) {
        const music = document.getElementById("bgMusic");
        music.volume = parseFloat(savedVolume);
        document.getElementById("volumeSlider").value = savedVolume;
    }
    updateDebtDisplay();
});
