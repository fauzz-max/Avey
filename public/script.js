let currentTopicText = '';

// Переключение основных экранов (Login / App)
function setScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Переключение вкладок в главном меню
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-tab]').forEach(btn => btn.classList.remove('active'));

    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    const activeBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Навешивание кликов на боковое меню
document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
    });
});

// Кнопки Авторизации / Выхода
document.getElementById('btn-login')?.addEventListener('click', () => {
    setScreen('app-screen');
    switchTab('practice');
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
    setScreen('auth-screen');
});

// Открытие редактора с выбранной темой
function startEssay(promptText) {
    currentTopicText = promptText;
    document.getElementById('prompt-text-display').innerText = promptText;
    document.getElementById('essay-text').value = '';
    document.getElementById('word-count-display').innerText = '0';
    switchTab('editor');
}

// Подсчет слов в режиме реального времени
document.getElementById('essay-text')?.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    document.getElementById('word-count-display').innerText = words;
});

// Отправка на бэкенд
document.getElementById('btn-submit')?.addEventListener('click', async () => {
    const essay = document.getElementById('essay-text').value.trim();

    if (!essay) {
        return alert('Пожалуйста, напишите текст эссе перед отправкой.');
    }

    switchTab('loading');

    try {
        const response = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: currentTopicText, essay })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка при генерации оценки');
        }

        // Заполнение результатов
        document.getElementById('res-overall').innerText = data.overallScore ?? '0.0';
        document.getElementById('res-ta').innerText = data.taskAchievement ?? '0.0';
        document.getElementById('res-cc').innerText = data.coherence ?? '0.0';
        document.getElementById('res-lr').innerText = data.lexicalResource ?? '0.0';
        document.getElementById('res-gr').innerText = data.grammar ?? '0.0';
        document.getElementById('res-feedback').innerText = data.feedback ?? 'Оценка завершена.';

        // Заполнение прогресс-баров (Band scale 0-9)
        document.getElementById('bar-ta').style.width = `${((data.taskAchievement || 0) / 9) * 100}%`;
        document.getElementById('bar-cc').style.width = `${((data.coherence || 0) / 9) * 100}%`;
        document.getElementById('bar-lr').style.width = `${((data.lexicalResource || 0) / 9) * 100}%`;
        document.getElementById('bar-gr').style.width = `${((data.grammar || 0) / 9) * 100}%`;

        switchTab('results');
    } catch (err) {
        alert(`Ошибка: ${err.message}`);
        switchTab('editor');
    }
});