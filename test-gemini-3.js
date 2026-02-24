const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const apiKey = "AIzaSyCyj0M2T_BGBUE3xT0FcxXImvCe2avoTMs";
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent("Hola, responde con la palabra 'LISTO'");
        console.log("RESPONSE:", result.response.text());
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

test();
