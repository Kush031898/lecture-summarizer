const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function callGeminiWithRetry(model, input, retries = 3) {
    try {
        return await model.generateContent(input);
    } catch (error) {
        if (error.message.includes("503") && retries > 0) {
            console.log("Right now there is heavy traffic , but we are , retrying...");
            await new Promise(r => setTimeout(r, 5000));
            return callGeminiWithRetry(model, input, retries - 1);
        }
        throw error;
    }
}

exports.generateLectureSummary = async (filePath, mimeType, title) => {
    try {
        // Step 1
        console.log("Step 1: Uploading to Google AI Staging...");
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: title,
        });

        // Step 2
        console.log("Step 2: Processing video (polling)...");
        let file = await fileManager.getFile(uploadResult.file.name);

        while (file.state === "PROCESSING") {
            process.stdout.write(".");
            await new Promise((resolve) => setTimeout(resolve, 3000));
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === "FAILED") {
            throw new Error("Gemini Video Processing failed.");
        }

        // Step 3
        console.log("\nStep 3: Generating Summary...");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash" // or gemini-3-flash
        });

        const result = await callGeminiWithRetry(model, [
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri,
                },
            },
            {
                text: `You are an expert academic assistant. Summarize this lecture titled "${title}".
                       Provide the following three sections using EXACTLY these markdown headings:
                       # TRANSCRIPT
                       (Provide the transcript here)
                       # SUMMARY
                       (Provide the structured summary and bullet points here)
                       # QUIZ
                       (Provide a quiz of approx 12 hard questions here)`,
            },
        ]);

        const response = await result.response;
        const text = response.text();
        if (!text) throw new Error("AI returned an empty response.");
        return text;

    } catch (error) {
        console.error("AI Pipeline Error:", error.message);
        throw error;
    }
};