const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const askGemini = async (question) => {
    try {
        const response = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: question
        });

        return response.output_text;
    } catch (error) {
        console.error("Gemini Service Error:", error.message);
        throw new Error("AI service failed");
    }
};

module.exports = {
    askGemini
};