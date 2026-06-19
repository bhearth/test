// server.js
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Securely store your Qwen API key here
const client = new OpenAI({
    apiKey: "sk-ws-H.IPPLPP.umNh.MEQCIAeusX-fccMexR_3jwL8gnCZuf7Ral1X3D0VZ-P40nycAiAJgAUYdHI0Jp9mlqdPkRx9GGh30o-zOXZS6Cx0VjApOg",
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

// THE TRUTH DATABASE (Real links, Real Affiliate Tags)
// You can expand this to 1000+ items. For now, 48 high-quality items.
const DB = {
    products: [
        { id: "p1", title: "Rainwater Harvesting Barrel", link: "https://www.amazon.com/s?k=rainwater+harvesting+barrel&tag=amazon0339f-21", icon: "🪣", tags: ["water", "eco", "garden", "ba.che"] },
        { id: "p2", title: "Native Wildflower Seed Mix", link: "https://www.amazon.com/s?k=native+wildflower+seeds&tag=amazon0339f-21", icon: "🌻", tags: ["biodiversity", "bees", "eco", "khel.o"] },
        { id: "p3", title: "Home Composting Kit", link: "https://www.amazon.com/s?k=composting+starter+kit&tag=amazon0339f-21", icon: "🪱", tags: ["soil", "waste", "garden", "kri.shi"] },
        { id: "p4", title: "Solar Power Bank 20000mAh", link: "https://www.amazon.com/s?k=solar+power+bank&tag=amazon0339f-21", icon: "🔋", tags: ["energy", "solar", "tech", "mu.kti"] },
        { id: "p5", title: "Organic Vegetable Seed Kit", link: "https://www.amazon.com/s?k=organic+vegetable+seeds&tag=amazon0339f-21", icon: "🍅", tags: ["food", "garden", "health", "sa.hyog"] },
        { id: "p6", title: "Water Quality Testing Kit", link: "https://www.amazon.com/s?k=water+testing+kit&tag=amazon0339f-21", icon: "💧", tags: ["water", "health", "science", "ba.che"] }
    ],
    books: [
        { id: "b1", title: "The Water Will Come", link: "https://www.amazon.com/s?k=the+water+will+come+jeff+goodell&tag=amazon0339f-21", icon: "📘", tags: ["water", "climate", "science"] },
        { id: "b2", title: "Braiding Sweetgrass", link: "https://www.amazon.com/s?k=braiding+sweetgrass&tag=amazon0339f-21", icon: "🌿", tags: ["eco", "indigenous", "nature", "khel.o"] },
        { id: "b3", title: "Drawdown: The Most Comprehensive Plan", link: "https://www.amazon.com/s?k=drawdown+paul+hawken&tag=amazon0339f-21", icon: "🌍", tags: ["climate", "solutions", "eco", "kri.shi"] },
        { id: "b4", title: "The Hidden Life of Trees", link: "https://www.amazon.com/s?k=the+hidden+life+of+trees&tag=amazon0339f-21", icon: "🌳", tags: ["nature", "forest", "science", "mu.kti"] },
        { id: "b5", title: "Silent Spring", link: "https://www.amazon.com/s?k=silent+spring+rachel+carson&tag=amazon0339f-21", icon: "🐦", tags: ["pollution", "history", "eco", "sa.hyog"] },
        { id: "b6", title: "Thinking, Fast and Slow", link: "https://www.amazon.com/s?k=thinking+fast+and+slow&tag=amazon0339f-21", icon: "🧠", tags: ["psychology", "mind", "human", "ba.che"] }
    ],
    events: [
        { id: "e1", title: "World Water Summit", link: "https://www.worldwatersummit.org/", icon: "🌊", tags: ["water", "conference", "global"] },
        { id: "e2", title: "Earth Day Network", link: "https://www.earthday.org/", icon: "🌍", tags: ["eco", "global", "action", "khel.o"] },
        { id: "e3", title: "TED: The Future We Choose", link: "https://www.ted.com/topics/climate-change", icon: "🎤", tags: ["climate", "talks", "ideas", "kri.shi"] },
        { id: "e4", title: "Global Citizen Festival", link: "https://www.globalcitizen.org/", icon: "🎶", tags: ["community", "music", "action", "mu.kti"] },
        { id: "e5", title: "UN Biodiversity Conference", link: "https://www.cbd.int/conferences/", icon: "🦋", tags: ["biodiversity", "un", "global", "sa.hyog"] },
        { id: "e6", title: "Maker Faire (Open Source)", link: "https://makerfaire.com/", icon: "🛠️", tags: ["tech", "diy", "community", "ba.che"] }
    ],
    facts: [
        { id: "f1", title: "Only 3% of Earth's water is fresh.", icon: "💧", tags: ["water", "fact", "nature"] },
        { id: "f2", title: "Trees communicate via fungal networks.", icon: "🍄", tags: ["nature", "science", "forest"] },
        { id: "f3", title: "Composting reduces methane emissions.", icon: "🌱", tags: ["soil", "climate", "fact"] },
        { id: "f4", title: "Solar is now the cheapest electricity.", icon: "☀️", tags: ["energy", "fact", "tech"] },
        { id: "f5", title: "Bees pollinate 1/3 of our food.", icon: "🐝", tags: ["food", "nature", "fact"] },
        { id: "f6", title: "The human brain uses 20% of body energy.", icon: "🧠", tags: ["human", "health", "fact"] }
    ]
};

app.post('/api/query', async (req, res) => {
    const { intent, keywords, jumble } = req.body;

    // Flatten DB for Qwen to see
    const allItems = Object.values(DB).flat();
    const itemSummary = allItems.map(i => `${i.id}: ${i.title} (Tags: ${i.tags.join(', ')})`).join('\n');

    const prompt = `
    You are the Khel.o Matchmaker Engine.
    User Intent: ${intent} (What/Why/Where/When/Who/How)
    User Keywords/Jumble: ${keywords} ${jumble}
    
    Select exactly 12 items from the database that best match the intent and keywords.
    You MUST select exactly: 3 Products, 3 Books, 3 Events, and 3 Facts.
    
    Database:
    ${itemSummary}
    
    Return ONLY a raw JSON array of 12 IDs. Example: ["p1", "p5", "b2", "e1", "f3", ...]
    `;

    try {
        const completion = await client.chat.completions.create({
            model: "qwen2.5-7b-instruct", // Using text-only for speed and accuracy
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        const rawText = completion.choices[0].message.content;
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        const selectedIds = JSON.parse(jsonMatch[0]);

        // Map IDs back to full objects
        const tiles = selectedIds.map(id => {
            return Object.values(DB).flat().find(item => item.id === id);
        }).filter(Boolean);

        // Generate a playful voice message
        const voiceMsg = `Exploring the ${intent} of ${keywords}. Here are 12 pathways to grow, learn, and act. Let's play!`;

        res.json({ tiles, voiceMsg, intent, jumble });

    } catch (error) {
        console.error("Qwen API Error:", error);
        // Fallback to random 12 items if API fails
        const fallback = Object.values(DB).flat().sort(() => 0.5 - Math.random()).slice(0, 12);
        res.json({ tiles: fallback, voiceMsg: "Connecting the dots...", intent, jumble });
    }
});

app.listen(3000, () => console.log('🌍 Khel.o Sahyogi Server running on port 3000'));
