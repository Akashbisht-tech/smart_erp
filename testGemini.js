require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function testGemini() {
    try {
        const response = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: "Say hello to my Smart ERP project in one sentence."
        });

        console.log("Gemini Response:");
        console.log(response.output_text);

    } catch (error) {
        console.error("Gemini Error:");
        console.error(error.message);
    }
}

testGemini();