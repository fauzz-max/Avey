let currentTopic = '';

// Переключение между Входом и Главным окном
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
}

// Переключение вкладок внутри приложения
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) selectedTab.classList.add('active-tab');

    // Подсветка кнопки в сайдбаре
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn'))
        .find(b => b.getAttribute('onclick')?.includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');
}

// Авторизация
document.getElementById('btn-login')?.addEventListener('click', () => {
    switchView('app-layout');
    switchTab('practice');
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
    switchView('login-view');
});

// Редактор
function openEditor(topic) {
    currentTopic = topic;
    document.getElementById('current-topic-display').innerText = topic;
    document.getElementById('essay-input').value = '';
    document.getElementById('word-count').innerText = '0';
    switchTab('editor');
}

document.getElementById('essay-input')?.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    document.getElementById('word-count').innerText = count;
});

// Отправка на API
document.getElementById('btn-submit')?.addEventListener('click', async () => {
    const essay = document.getElementById('essay-input').value.trim();
    if (!essay) return alert('Пожалуйста, введите текст эссе.');

    switchTab('loading');

    try {
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: currentTopic, essay })
        });

        // Защита от ошибок формата (Not Found / Text Error)
        const textResponse = await res.text();
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            throw new Error(`Ответ сервера не является JSON: ${textResponse}`);
        }

        if (!res.ok) throw new Error(data.error || 'Ошибка при оценке');

        // Отображение результатов
        document.getElementById('res-overall').innerText = data.overallScore;
        document.getElementById('res-ta').innerText = data.taskAchievement;
        document.getElementById('res-cc').innerText = data.coherence;
        document.getElementById('res-lr').innerText = data.lexicalResource;
        document.getElementById('res-gr').innerText = data.grammar;
        document.getElementById('res-feedback').innerText = data.feedback;

        const circle = document.querySelector('.score-circle');
        if (circle) circle.style.setProperty('--score-val', (data.overallScore / 9) * 10);

        document.getElementById('bar-ta').style.width = `${(data.taskAchievement / 9) * 100}%`;
        document.getElementById('bar-cc').style.width = `${(data.coherence / 9) * 100}%`;
        document.getElementById('bar-lr').style.width = `${(data.lexicalResource / 9) * 100}%`;
        document.getElementById('bar-gr').style.width = `${(data.grammar / 9) * 100}%`;

        switchTab('results');
    } catch (err) {
        alert(`Ошибка: ${err.message}`);
        switchTab('editor');
    }
});