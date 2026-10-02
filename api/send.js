exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Метод не разрешён' }) };
    }

    try {
        const { message } = JSON.parse(event.body);

        if (!message) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Нет сообщения' }) };
        }

        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Нет переменных окружения' }) };
        }

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: data.description }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

    } catch (error) {
        console.error('Ошибка:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Внутренняя ошибка' }) };
    }
};
