// ============ ПЕРЕМЕННЫЕ ============
let selectedOption = "";
let selectedCategory = "";
let musicPlaying = false;

// ============ ИГРА ============
let gameAttempts = 3;
let vladPosition = 0;
let gameCells = [];

// 20 иконок для игры
const gameIcons = [
    "🐱", "🍕", "🎮", "🌸", "🍩",
    "🎸", "🚀", "🍓", "🌈", "🦊",
    "🐼", "🍔", "⚽", "🎨", "🍦",
    "🌙", "🎁", "☕", "🎵", "🐻"
];
const VLAD_ICON = "🤴";

// ============ ДАТА ОТНОШЕНИЙ ============
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

// ============ КАТЕГОРИИ / ПОДМЕНЮ ============
function showSubMenu(category) {
    selectedCategory = category;
    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("gameBlock").classList.add("hidden");

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

    const surpriseBlock = document.getElementById("surpriseBlock");
    surpriseBlock.classList.remove("hidden");
    document.getElementById("surpriseText").textContent = random;
    fireSparkles();
}

function closeSurprise() {
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

// ============ ИГРА "НАЙДИ ВЛАДА" ============
function startGame() {
    gameAttempts = 3;
    vladPosition = Math.floor(Math.random() * 20);

    document.getElementById("categoriesBlock").classList.add("hidden");
    document.getElementById("subMenuBlock").classList.add("hidden");
    document.getElementById("resultBlock").classList.add("hidden");
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("winBlock").classList.add("hidden");
    document.getElementById("loseBlock").classList.add("hidden");

    const gameBlock = document.getElementById("gameBlock");
    gameBlock.classList.remove("hidden");
    document.getElementById("attemptsLeft").textContent = "3";

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
        // Нашли Влада!
        cell.textContent = VLAD_ICON;
        cell.classList.add("found");
        gameCells[index].clicked = true;
        triggerWin();
    } else {
        // Не нашли
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

        // ТРИ ЭФФЕКТА
        fireSparkles();
        fireRainbowWave();
        setTimeout(() => fireHeartParticles(), 300);

        // В Telegram
        const attemptsUsed = 3 - gameAttempts;
        const message = `🎉 <b>Светлана нашла тебя!</b>\n\nПопыток использовано: ${attemptsUsed} из 3\nОна кликнула на позицию ${vladPosition + 1} 💕`;
        sendToTelegram(message);

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    }, 400);
}

function triggerLose() {
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("loseBlock").classList.remove("hidden");

    // Показать где был Влад
    const vladCell = gameCells[vladPosition].element;
    vladCell.textContent = VLAD_ICON;
    vladCell.classList.add("found");

    // В Telegram
    const message = `😢 <b>Светлана не нашла тебя</b>\n\nИспользовала все 3 попытки. Ты был на позиции ${vladPosition + 1}.`;
    sendToTelegram(message);

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function closeGame() {
    document.getElementById("gameBlock").classList.add("hidden");
    document.getElementById("winBlock").classList.add("hidden");
    document.getElementById("loseBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

// ============ ЭФФЕКТ 1: ИСКРЫ ============
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
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        spark.style.setProperty("--tx", tx + "px");
        spark.style.setProperty("--ty", ty + "px");

        spark.style.animationDelay = (Math.random() * 0.3) + "s";

        container.appendChild(spark);
        setTimeout(() => spark.remove(), 2000);
    }
}

// ============ ЭФФЕКТ 2: РАДУЖНАЯ ВОЛНА ============
function fireRainbowWave() {
    const wave = document.createElement("div");
    wave.className = "rainbow-wave";
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 2200);
}

// ============ ЭФФЕКТ 3: СЕРДЦЕ ИЗ ЧАСТИЦ ============
function fireHeartParticles() {
    const container = document.getElementById("particlesContainer");
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Формула сердца
    for (let i = 0; i < 80; i++) {
        const t = (i / 80) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

        const scale = 12;
        const targetX = x * scale;
        const targetY = y * scale;

        const particle = document.createElement("div");
        particle.className = "heart-particle";
        particle.style.left = centerX + "px";
        particle.style.top = centerY + "px";
        particle.style.setProperty("--tx", targetX + "px");
        particle.style.setProperty("--ty", targetY + "px");
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
});
