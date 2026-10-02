// ============ ПЕРЕМЕННЫЕ ============
let selectedOption = "";
let selectedCategory = "";
let musicPlaying = false;

// ============ ДАТА ОТНОШЕНИЙ (13 января 2025) ============
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

    const surpriseBlock = document.getElementById("surpriseBlock");
    surpriseBlock.classList.remove("hidden");
    document.getElementById("surpriseText").textContent = random;
    fireConfetti();
}

function closeSurprise() {
    document.getElementById("surpriseBlock").classList.add("hidden");
    document.getElementById("categoriesBlock").classList.remove("hidden");
}

// ============ КОНФЕТТИ ============
function fireConfetti() {
    const end = Date.now() + 3000;
    const colors = ['#d6336c', '#ff9a9e', '#fecfef', '#ffd93d', '#ff9a3d'];

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());

    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ff69b4', '#ff1493'],
            shapes: ['circle'],
            scalar: 1.5
        });
    }, 500);
}

// ============ ОТПРАВКА ============
function sendChoice() {
    const comment = document.getElementById("comment").value;
    if (comment.trim() === "") {
        alert("Пожалуйста, напиши, что именно ты хочешь 😊");
        return;
    }

    // Формируем сообщение
    const message = 
        `💕 Новый выбор!\n\n` +
        `📌 Категория: ${selectedCategory}\n` +
        `✅ Выбор: ${selectedOption}\n` +
        `💬 Комментарий: ${comment}`;

    // Отправляем в Telegram через свой сервер
    sendToTelegram(message);

    fireConfetti();
    showToast(`Отправлено: ${selectedCategory} → ${selectedOption} 💌`);
    document.getElementById("comment").value = "";
}

// ============ ОТПРАВКА В TELEGRAM (через сервер Vercel) ============
function sendToTelegram(message) {
    // Отправляем на свой сервер, а он перешлёт в Telegram
    // Токен и Chat ID хранятся в настройках Vercel (безопасно)
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

// ============ СМЕНА ФОНА ПО ВРЕМЕНИ СУТОК ============
function updateBackground() {
    const hour = new Date().getHours();
    const body = document.getElementById("mainBody");
    const nightSky = document.getElementById("nightSky");

    body.classList.remove("morning", "day", "evening", "night");

    if (hour >= 6 && hour < 12) {
        body.classList.add("morning");
    } else if (hour >= 12 && hour < 18) {
        body.classList.add("day");
    } else if (hour >= 18 && hour < 22) {
        body.classList.add("evening");
    } else {
        body.classList.add("night");
        if (nightSky) nightSky.classList.remove("hidden");
    }

    if (nightSky && hour >= 6 && hour < 22) {
        nightSky.classList.add("hidden");
    }
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