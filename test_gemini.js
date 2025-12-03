const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI("AIzaSyCvCl-cjAZ-vmgnQHON1mzCEM2c8gQL1sg");
    try {
        console.log("Testing gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        try {
            const result = await modelPro.generateContent("Hello");
            console.log("Success with gemini-pro!");
            console.log(result.response.text());
        } catch (e) {
            console.log("Failed gemini-pro:", e.message);
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();
