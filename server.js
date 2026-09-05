require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/evaluate', async (req, res) => {
    try {
        const { topic, essay } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY не установлен в Environment Variables на Render.' });
        }

        if (!essay || essay.trim().split(/\s+/).length < 10) {
            return res.status(400).json({ error: 'Эссе слишком короткое.' });
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are an official IELTS examiner. Evaluate this Task 2 essay.
        Topic: "${topic}"
        Essay: "${essay}"

        Return JSON matching this schema:
        {
            "overallScore": 6.5,
            "taskAchievement": 6.5,
            "coherence": 6.0,
            "lexicalResource": 6.5,
            "grammar": 6.5,
            "feedback": "Concise feedback paragraph explaining the strengths and weaknesses."
        }
        `;

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());

        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Ошибка обработки на сервере.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));