let currentTopic = '';

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
}

function switchContent(contentId) {
    document.querySelectorAll('.content-view').forEach(c => c.classList.remove('active-content'));
    document.getElementById(contentId).classList.add('active-content');
}

document.getElementById('btn-login')?.addEventListener('click', () => {
    switchView('app-layout');
    switchContent('practice-list-view');
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
    switchView('login-view');
});

function openEditor(topic) {
    currentTopic = topic;
    document.getElementById('current-topic-display').innerText = topic;
    document.getElementById('essay-input').value = '';
    document.getElementById('word-count').innerText = '0';
    switchContent('editor-view');
}

function backToPractice() {
    switchContent('practice-list-view');
}

document.getElementById('essay-input')?.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    document.getElementById('word-count').innerText = count;
});

document.getElementById('btn-submit')?.addEventListener('click', async () => {
    const essay = document.getElementById('essay-input').value.trim();
    if (!essay) return alert('Пожалуйста, напишите эссе.');

    switchContent('loading-view');

    try {
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: currentTopic, essay })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка проверки');

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

        switchContent('results-view');
    } catch (err) {
        alert(`Ошибка API: ${err.message}`);
        switchContent('editor-view');
    }
});