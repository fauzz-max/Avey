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
            return res.status(500).json({ error: 'GEMINI_API_KEY не задан в переменной окружения Render.' });
        }

        if (!essay || essay.trim().split(/\s+/).length < 10) {
            return res.status(400).json({ error: 'Эссе слишком короткое. Напишите хотя бы 10 слов.' });
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are an official, strict IELTS Writing examiner. Evaluate the submitted Task 2 essay based on official IELTS descriptors.
        
        Topic: "${topic}"
        Essay: "${essay}"

        CRITICAL EVALUATION INSTRUCTIONS:
        1. Dynamically evaluate the essay based strictly on its actual quality. Do NOT default to average scores like 6.5 unless earned.
        2. Assign scores from 1.0 to 9.0 (in increments of 0.5) for each criterion.
        3. Overall score must be the average of the 4 individual criteria, rounded to the nearest half-band.

        Return JSON matching EXACTLY this structure (do not change field names):
        {
            "overallScore": number,
            "taskAchievement": number,
            "coherence": number,
            "lexicalResource": number,
            "grammar": number,
            "feedback": "string containing detailed feedback, noting strengths, grammar mistakes, and specific improvements"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const data = JSON.parse(responseText);
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));