import express from "express";
import multer from "multer";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ✅ Allow both local and deployed frontend origins
app.use(
  cors({
    origin: ["http://localhost:5173", "https://final-hacky-frontend1.onrender.com"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors()); // ✅ Handle preflight

const upload = multer({
  dest: "media/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/process-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const myfile = await ai.files.upload({
      file: req.file.path,
      config: { mimeType: req.file.mimetype },
    });

    const fileName = myfile.name;
    console.log("Uploaded File Name:", fileName);

    const fetchedFile = await ai.files.get({ name: fileName });
    console.log("Fetched File:", fetchedFile);

    const result = await ai.models.generateContent({
      model: "models/gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: req.file.mimetype,
                fileUri: myfile.uri,
              },
            },
            {
              text: "Brutally criticize this resume. Do not use markdown in your response.",
            },
          ],
        },
      ],
    });

    const responseText =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    console.log("Gemini response:", responseText);

    res.json({
      questions: [
        "Tell me about a challenging project you worked on.",
        "How do you handle tight deadlines?",
        "Describe your problem-solving approach.",
        "What motivates you in your work?",
        "Where do you see yourself in 5 years?",
      ],
      feedback: responseText,
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({
      error: "Failed to process resume",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
