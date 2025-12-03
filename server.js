// server.js – Express backend for CV Builder
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to compile LaTeX to PDF using pdflatex
function compileLatex(latexSource, callback) {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const texPath = path.join(tmpDir, 'input.tex');
    fs.writeFileSync(texPath, latexSource);
    // Use -output-directory to keep things clean
    const cmd = `pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texPath}"`;
    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
            console.error("LaTeX Compilation Error:", error);
            console.error("STDOUT:", stdout);

            // Try to read the log file for more details
            const logPath = path.join(tmpDir, 'input.log');
            if (fs.existsSync(logPath)) {
                const logContent = fs.readFileSync(logPath, 'utf8');
                console.error("LaTeX Log (last 20 lines):", logContent.split('\n').slice(-20).join('\n'));
            }
            return callback(error, null);
        }
        const pdfPath = path.join(tmpDir, 'input.pdf');
        if (!fs.existsSync(pdfPath)) return callback(new Error('PDF not generated'), null);
        const pdfData = fs.readFileSync(pdfPath);
        callback(null, pdfData);
    });
}

// Helper to escape LaTeX special characters
Handlebars.registerHelper('escapeLatex', function (text) {
    if (typeof text !== 'string') return text;
    return text.replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
});

// Compile endpoint – receives LaTeX and returns PDF
app.post('/compile', (req, res) => {
    const { latex } = req.body;
    if (!latex) return res.status(400).json({ error: 'Missing latex field' });
    compileLatex(latex, (err, pdf) => {
        if (err) return res.status(500).json({ error: err.message });
        res.set('Content-Type', 'application/pdf');
        res.send(pdf);
    });
});

// Tailor CV endpoint
app.post('/tailor-cv', async (req, res) => {
    console.log("Received /tailor-cv request");
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'Missing jobDescription' });

    try {
        // 1. Load base data
        const cvDataPath = path.join(__dirname, 'cv_data.json');
        const cvData = JSON.parse(fs.readFileSync(cvDataPath, 'utf8'));
        console.log("Loaded CV Data");

        // 2. Prompt Gemini to tailor the data
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        You are an expert CV writer. I have a JSON object representing a CV and a Job Description.
        Your task is to modify the "projects" descriptions, "experience" descriptions, and "skills" to better align with the Job Description.
        Do NOT invent new experiences. Only rephrase existing ones to highlight relevant skills.
        Keep the JSON structure EXACTLY the same. Return ONLY the JSON string, no markdown formatting.

        CV Data: ${JSON.stringify(cvData)}
        Job Description: ${jobDescription}
        `;

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log("Gemini response received");

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Strip non-ASCII characters (emojis, etc.) that break pdflatex
        text = text.replace(/[^\x00-\x7F]/g, "");

        let tailoredData;
        try {
            tailoredData = JSON.parse(text);
            console.log("Parsed JSON successfully");
        } catch (e) {
            console.error("JSON Parse Error. Raw text:", text);
            throw new Error("Failed to parse AI response as JSON");
        }

        // 3. Load Template
        const templatePath = path.join(__dirname, 'latex', 'cv_template.tex');
        const templateSource = fs.readFileSync(templatePath, 'utf8');

        // 4. Compile with Handlebars
        const template = Handlebars.compile(templateSource);
        const latex = template(tailoredData);
        console.log("Generated LaTeX");

        // 5. Generate PDF
        console.log("Compiling PDF...");
        compileLatex(latex, (err, pdf) => {
            if (err) {
                console.error("PDF Compilation Failed:", err);
                return res.status(500).json({ error: err.message });
            }
            console.log("PDF Generated successfully");
            res.set('Content-Type', 'application/pdf');
            res.send(pdf);
        });

    } catch (error) {
        console.error("Error tailoring CV:", error);
        res.status(500).json({ error: error.message || 'Failed to tailor CV' });
    }
});

// Tailor Cover Letter endpoint
app.post('/tailor-cover-letter', async (req, res) => {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'Missing jobDescription' });

    try {
        // 1. Load base data
        const cvDataPath = path.join(__dirname, 'cv_data.json');
        const cvData = JSON.parse(fs.readFileSync(cvDataPath, 'utf8'));

        // 2. Prompt Gemini to write the cover letter body
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        You are an expert career coach. Write a professional cover letter body for ${cvData.personal_info.name} applying for a role described in the Job Description below.
        Use the candidate's background from the CV Data.
        The output must be in LaTeX format, using \\vspace{10pt} between paragraphs.
        Do NOT include the header, date, or signature (these are handled by the template).
        Do NOT wrap the output in any environment like document or letter. Just the paragraphs.
        
        CV Data: ${JSON.stringify(cvData)}
        Job Description: ${jobDescription}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let bodyText = response.text();

        // Clean up markdown code blocks if present
        bodyText = bodyText.replace(/```latex/g, '').replace(/```/g, '').trim();

        // Strip non-ASCII characters (emojis, etc.) that break pdflatex
        bodyText = bodyText.replace(/[^\x00-\x7F]/g, "");

        // 3. Load Template
        const templatePath = path.join(__dirname, 'latex', 'cover_letter_template.tex');
        const templateSource = fs.readFileSync(templatePath, 'utf8');

        // 4. Compile with Handlebars
        const template = Handlebars.compile(templateSource);
        const data = {
            personal_info: cvData.personal_info,
            body: bodyText
        };
        const latex = template(data);

        // 5. Generate PDF
        compileLatex(latex, (err, pdf) => {
            if (err) return res.status(500).json({ error: err.message });
            res.set('Content-Type', 'application/pdf');
            res.send(pdf);
        });

    } catch (error) {
        console.error("Error generating cover letter:", error);
        res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CV Builder backend listening on port ${PORT}`));
