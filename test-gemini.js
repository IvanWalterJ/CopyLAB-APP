const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const apiKey = "AIzaSyCyj0M2T_BGBUE3xT0FcxXImvCe2avoTMs";
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hola, responde en JSON: {\"status\": \"ok\"}");
        console.log("RESPONSE:", result.response.text());
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

test();
