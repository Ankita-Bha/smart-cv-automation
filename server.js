// server.js – Express backend for CV Builder
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' })); // limit LaTeX size

// Helper to compile LaTeX to PDF using pdflatex
function compileLatex(latexSource, callback) {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const texPath = path.join(tmpDir, 'input.tex');
    fs.writeFileSync(texPath, latexSource);
    const cmd = `pdflatex -interaction=nonstopmode -output-directory=${tmpDir} ${texPath}`;
    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) return callback(error, null);
        const pdfPath = path.join(tmpDir, 'input.pdf');
        if (!fs.existsSync(pdfPath)) return callback(new Error('PDF not generated'), null);
        const pdfData = fs.readFileSync(pdfPath);
        callback(null, pdfData);
    });
}

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

// Chat endpoint – placeholder suggestion (no external LLM required)
app.post('/chat', (req, res) => {
    const { cvLatex, jobDescription } = req.body;
    if (!cvLatex || !jobDescription) return res.status(400).json({ error: 'Missing fields' });
    const suggestion = 'Consider highlighting your most relevant experience and tailoring the skills section to the job description.';
    res.json({ suggestion });
});

// Cover letter generation – fill placeholders and compile
app.post('/cover-letter', (req, res) => {
    const { templateData } = req.body; // expects keys matching placeholders in template
    const templatePath = path.join(__dirname, 'latex', 'cover_letter_template.tex');
    if (!fs.existsSync(templatePath)) return res.status(500).json({ error: 'Template not found' });
    let tex = fs.readFileSync(templatePath, 'utf8');
    for (const [key, value] of Object.entries(templateData)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        tex = tex.replace(placeholder, value);
    }
    compileLatex(tex, (err, pdf) => {
        if (err) return res.status(500).json({ error: err.message });
        res.set('Content-Type', 'application/pdf');
        res.send(pdf);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CV Builder backend listening on port ${PORT}`));
