const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Groq API Key — এখানে আপনার আসল key পেস্ট করুন
const GROQ_API_KEY = 'gsk_your_real_api_key_here'; // ← ⚠️ এখানে আপনার আসল key পেস্ট করুন

async function getBotResponse(userMessage, language) {
    try {
        const systemPrompt = language === 'en'
            ? `You are Master Chat, a friendly, helpful, and professional AI assistant created by Kafi AI Developer (Jonayed Al Kafi). You can answer any question, explain concepts, write code, and help with learning. Always respond in a conversational, human-like manner with appropriate emojis. Format code blocks properly. Ask follow-up questions. Be warm, engaging, and remember previous messages in this chat.`
            : `আপনি Master Chat, একজন বন্ধুত্বপূর্ণ, সহায়ক, এবং পেশাদার AI সহকারী, যার নির্মাতা Kafi AI Developer (Jonayed Al Kafi)। আপনি যেকোনো প্রশ্নের উত্তর দিতে পারেন, ধারণা ব্যাখ্যা করতে পারেন, কোড লিখতে পারেন, এবং শেখার কাজে সাহায্য করতে পারেন। সবসময় কথোপকথনের ধরনে, মানুষের মতো উত্তর দিন এবং উপযুক্ত ইমোজি ব্যবহার করুন। কোড ব্লক গুলো সুন্দরভাবে ফরম্যাট করুন। বিষয়ের সাথে সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন। আন্তরিক, আকর্ষক হোন, এবং এই চ্যাটের আগের বার্তাগুলো মনে রাখুন।`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Full Error:', error);
        return language === 'en'
            ? 'Sorry, I could not process your message right now. Please try again later. 🙏'
            : 'দুঃখিত, আমি এখন আপনার বার্তা প্রক্রিয়া করতে পারিনি। অনুগ্রহ করে পরে আবার চেষ্টা করুন। 🙏';
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message, language = 'bn' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const botResponse = await getBotResponse(message, language);

        res.json({
            success: true,
            response: botResponse
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
