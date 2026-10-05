// ============ ДАННЫЕ ============

// Загородные дома
const houses = [
    {
        id: "house1",
        emoji: "🏠",
        name: "У Владислава",
        desc: "Уютный дом, мангал, места много"
    },
    {
        id: "house2",
        emoji: "🏡",
        name: "У друга",
        desc: "Большой дом с баней во дворе"
    },
    {
        id: "house3",
        emoji: "🏘️",
        name: "Снять загородный",
        desc: "Аренда дома на сутки, всё своё"
    }
];

// Кальянные
const hookahs = [
    {
        id: "hookah1",
        emoji: "💨",
        name: "Cloud Hookah",
        desc: "Топовая кальянка в центре"
    },
    {
        id: "hookah2",
        emoji: "🌫️",
        name: "Hookah Place",
        desc: "Уютная, много вкусов"
    },
    {
        id: "hookah3",
        emoji: "💨",
        name: "Smoke House",
        desc: "Своя атмосфера, кальян-мастера"
    }
];

// Сауны
const saunas = [
    {
        id: "sauna1",
        emoji: "🧖",
        name: "Русские бани",
        desc: "Настоящая русская баня с вениками"
    },
    {
        id: "sauna2",
        emoji: "🔥",
        name: "Финская сауна",
        desc: "Сухой пар, бассейн"
    },
    {
        id: "sauna3",
        emoji: "💦",
        name: "Хамам",
        desc: "Турецкая баня, расслабон"
    }
];

// ЧЁРНЫЙ СПИСОК
const blacklist = [
    {
        name: "Лучший друг (заглушка)",
        reason: "Опоздал на мою днюху в прошлом году на 2 часа",
        blocked: "Заблокирован до 11.10.2026"
    }
    // Добавляй сюда новых по аналогии:
    // {
    //     name: "Максим",
    //     reason: "Уснул на столе в прошлый раз",
    //     blocked: "Заблокирован пожизненно"
    // }
];

// ============ СОСТОЯНИЕ ============
let selectedHouse = null;
let selectedHookah = null;
let selectedSauna = null;

// ============ ЧАСТИЦЫ ============
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const particles = [];
const PARTICLE_COUNT = 80;

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.7 + 0.1,
        color: Math.random() > 0.5 ? "#b026ff" : "#ff0080"
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        // Движение
        p.x += p.speedX;
        p.y += p.speedY;

        // Отскок от краёв
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Рисуем
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 15;
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

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(176, 38, 255, ${0.15 * (1 - distance / 120)})`;
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
        card.onclick = () => selectOption(type, item.id, card);

        card.innerHTML = `
            <span class="option-emoji">${item.emoji}</span>
            <div class="option-name">${item.name}</div>
            <div class="option-desc">${item.desc}</div>
        `;

        container.appendChild(card);
    });
}

// ============ ВЫБОР ============
function selectOption(type, id, card) {
    // Снимаем выделение с других в этой категории
    const category = card.parentElement;
    category.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));

    // Выделяем выбранное
    card.classList.add("selected");

    // Запоминаем
    if (type === "house") selectedHouse = id;
    if (type === "hookah") selectedHookah = id;
    if (type === "sauna") selectedSauna = id;

    if (navigator.vibrate) navigator.vibrate(30);
}

// ============ РЕНДЕР ЧЁРНОГО СПИСКА ============
function renderBlacklist() {
    const container = document.getElementById("blacklistContainer");
    container.innerHTML = "";

    blacklist.forEach(item => {
        const div = document.createElement("div");
        div.className = "blacklist-item";
        div.innerHTML = `
            <div class="blacklist-name">${item.name}</div>
            <div class="blacklist-reason">${item.reason}</div>
            <div class="blacklist-blocked">🔒 ${item.blocked}</div>
        `;
        container.appendChild(div);
    });
}

// ============ ГОЛОСОВАНИЕ ============
function vote() {
    const nameInput = document.getElementById("voterName");
    const name = nameInput.value.trim();

    // Проверки
    if (name === "") {
        showToast("Введи своё имя 😊");
        nameInput.focus();
        return;
    }

    if (!selectedHouse) {
        showToast("Выбери загородный дом 🏠");
        return;
    }

    if (!selectedHookah) {
        showToast("Выбери кальянную 💨");
        return;
    }

    if (!selectedSauna) {
        showToast("Выбери сауну 🧖");
        return;
    }

    // Получаем названия
    const houseName = houses.find(h => h.id === selectedHouse).name;
    const hookahName = hookahs.find(h => h.id === selectedHookah).name;
    const saunaName = saunas.find(s => s.id === selectedSauna).name;

    // Формируем сообщение
    const message = 
        `🎉 <b>Новый голос за место днюхи!</b>\n\n` +
        `👤 Кто: <b>${name}</b>\n\n` +
        `🏠 Дом: <b>${houseName}</b>\n` +
        `💨 Кальянная: <b>${hookahName}</b>\n` +
        `🧖 Сауна: <b>${saunaName}</b>\n\n` +
        `📅 Голос от ${new Date().toLocaleString("ru-RU")}`;

    sendToTelegram(message);

    showToast(`Спасибо, ${name}! Голос учтён 🎉`);

    // Сброс (чтобы не голосовали дважды)
    setTimeout(() => {
        if (confirm("Хочешь проголосовать ещё раз? (Например, за другого друга)")) {
            // Оставляем как есть
        } else {
            nameInput.value = "";
            document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
            selectedHouse = null;
            selectedHookah = null;
            selectedSauna = null;
        }
    }, 500);
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
            console.log("✅ Отправлено в Telegram");
        } else {
            console.error("❌ Ошибка:", data.error);
        }
    })
    .catch(error => {
        console.error("❌ Ошибка отправки:", error);
    });
}

// ============ УВЕДОМЛЕНИЕ ============
function showToast(text) {
    // Убираем старое
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
});
