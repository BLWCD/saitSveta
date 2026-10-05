// ============ ДАННЫЕ ============

const houses = [
    { id: "house1", emoji: "🏠", name: "У Владислава", desc: "Уютный дом, мангал, места много" },
    { id: "house2", emoji: "🏡", name: "У друга", desc: "Большой дом с баней во дворе" },
    { id: "house3", emoji: "🏘️", name: "Снять загородный", desc: "Аренда дома на сутки, всё своё" }
];

const hookahs = [
    { id: "hookah1", emoji: "💨", name: "Cloud Hookah", desc: "Топовая кальянка в центре" },
    { id: "hookah2", emoji: "🌫️", name: "Hookah Place", desc: "Уютная, много вкусов" },
    { id: "hookah3", emoji: "💨", name: "Smoke House", desc: "Своя атмосфера, кальян-мастера" }
];

const saunas = [
    { id: "sauna1", emoji: "🧖", name: "Русские бани", desc: "Настоящая русская баня с вениками" },
    { id: "sauna2", emoji: "🔥", name: "Финская сауна", desc: "Сухой пар, бассейн" },
    { id: "sauna3", emoji: "💦", name: "Хамам", desc: "Турецкая баня, расслабон" }
];

const blacklist = [
    {
        name: "Лучший друг (заглушка)",
        reason: "Опоздал на мою днюху в прошлом году на 2 часа",
        blocked: "Заблокирован до 11.10.2026"
    }
];

// ============ СОСТОЯНИЕ ============
// Выбрано может быть ТОЛЬКО ОДНО место
let selectedPlace = null; // { type: "house"|"hookah"|"sauna", id: "..." }

// ============ ЧАСТИЦЫ (серебристые) ============
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const particles = [];
const PARTICLE_COUNT = 70;

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        color: Math.random() > 0.5 ? "#cccccc" : "#888888"
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Соединения между близкими частицами
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 130) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(200, 200, 200, ${0.08 * (1 - distance / 130)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ============ РЕНДЕР ОПЦИЙ ============
function renderOptions(containerId, items, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "option-card";
        card.dataset.id = item.id;
        card.dataset.type = type;
        card.onclick = () => selectOption(type, item.id, card);

        card.innerHTML = `
            <span class="option-emoji">${item.emoji}</span>
            <div class="option-name">${item.name}</div>
            <div class="option-desc">${item.desc}</div>
        `;

        container.appendChild(card);
    });
}

// ============ ВЫБОР (только одно место) ============
function selectOption(type, id, card) {
    // Если кликнули на уже выбранную — снимаем выбор
    if (card.classList.contains("selected")) {
        card.classList.remove("selected");
        selectedPlace = null;
        updateSelectedInfo();
        if (navigator.vibrate) navigator.vibrate(20);
        return;
    }

    // Снимаем выделение со ВСЕХ карточек на странице
    document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));

    // Выделяем выбранную
    card.classList.add("selected");

    // Запоминаем
    selectedPlace = { type: type, id: id };

    updateSelectedInfo();

    if (navigator.vibrate) navigator.vibrate(30);
}

// ============ ИНФО О ВЫБОРЕ ============
function updateSelectedInfo() {
    const info = document.getElementById("selectedInfo");
    const p = info.querySelector("p");

    if (!selectedPlace) {
        info.classList.remove("active");
        p.textContent = "Ничего не выбрано";
        return;
    }

    let name = "";
    if (selectedPlace.type === "house") {
        name = houses.find(h => h.id === selectedPlace.id).name;
    } else if (selectedPlace.type === "hookah") {
        name = hookahs.find(h => h.id === selectedPlace.id).name;
    } else if (selectedPlace.type === "sauna") {
        name = saunas.find(s => s.id === selectedPlace.id).name;
    }

    const typeLabel = {
        "house": "🏠 Дом",
        "hookah": "💨 Кальянная",
        "sauna": "🧖 Сауна"
    }[selectedPlace.type];

    info.classList.add("active");
    p.textContent = `Выбрано: ${typeLabel} — ${name}`;
}

// ============ ЧЁРНЫЙ СПИСОК ============
function renderBlacklist() {
    const container = document.getElementById("blacklistContainer");
    container.innerHTML = "";

    blacklist.forEach(item => {
        const div = document.createElement("div");
        div.className = "blacklist-item";
        div.innerHTML = `
            <div class="blacklist-name">${item.name}</div>
            <div class="blacklist-reason">${item.reason}</div>
            <div class="blacklist-blocked">${item.blocked}</div>
        `;
        container.appendChild(div);
    });
}

// ============ ГОЛОСОВАНИЕ ============
function vote() {
    const nameInput = document.getElementById("voterName");
    const name = nameInput.value.trim();

    if (name === "") {
        showToast("Введи своё имя");
        nameInput.focus();
        return;
    }

    if (!selectedPlace) {
        showToast("Выбери одно место");
        return;
    }

    // Получаем название
    let placeName = "";
    let typeLabel = "";

    if (selectedPlace.type === "house") {
        placeName = houses.find(h => h.id === selectedPlace.id).name;
        typeLabel = "🏠 Загородный дом";
    } else if (selectedPlace.type === "hookah") {
        placeName = hookahs.find(h => h.id === selectedPlace.id).name;
        typeLabel = "💨 Кальянная";
    } else if (selectedPlace.type === "sauna") {
        placeName = saunas.find(s => s.id === selectedPlace.id).name;
        typeLabel = "🧖 Сауна";
    }

    const message = 
        `🎉 <b>Новый голос — Один вечер, одна ночь</b>\n\n` +
        `👤 Кто: <b>${name}</b>\n\n` +
        `${typeLabel}: <b>${placeName}</b>\n\n` +
        `📅 ${new Date().toLocaleString("ru-RU")}`;

    sendToTelegram(message);

    showToast(`Спасибо, ${name}! Голос учтён`);

    // Сброс через 2 секунды
    setTimeout(() => {
        nameInput.value = "";
        document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
        selectedPlace = null;
        updateSelectedInfo();
    }, 2000);
}

// ============ ОТПРАВКА В TELEGRAM ============
function sendToTelegram(message) {
    fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log("Отправлено в Telegram");
        } else {
            console.error("Ошибка:", data.error);
        }
    })
    .catch(error => {
        console.error("Ошибка отправки:", error);
    });
}

// ============ УВЕДОМЛЕНИЕ ============
function showToast(text) {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// ============ ЗАГРУЗКА ============
window.addEventListener("load", () => {
    renderOptions("houseOptions", houses, "house");
    renderOptions("hookahOptions", hookahs, "hookah");
    renderOptions("saunaOptions", saunas, "sauna");
    renderBlacklist();
    updateSelectedInfo();
});
