<div align="center">

# 📄 Smart CV Automation

**Paste a job description and get a professionally typeset, AI-tailored CV and cover letter as LaTeX-compiled PDFs.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white)
![LaTeX](https://img.shields.io/badge/LaTeX-008080?style=flat-square&logo=latex&logoColor=white)
![Handlebars](https://img.shields.io/badge/Handlebars-F0772B?style=flat-square&logo=handlebarsdotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

</div>

---

## 📖 Overview

Smart CV Automation removes the tedium of tailoring your CV for every job application. You store your CV content once as structured JSON (`cv_data.json`); then for each application, you paste the job description and the app uses Google Gemini to rephrase your project, experience, and skills descriptions to align with the role — without inventing anything new. The tailored data is injected into LaTeX templates via Handlebars and compiled to pixel-perfect PDFs with `pdflatex`, producing both a CV and a matching cover letter in one click.

## ✨ Features

- **AI CV tailoring** — Gemini (`gemini-2.0-flash`) rewrites project/experience/skill descriptions to match the pasted job description, preserving your JSON structure and never fabricating experience
- **AI cover letter generation** — drafts a role-specific cover letter body from your CV data, injected into a dedicated LaTeX letter template
- **LaTeX-quality PDFs** — Handlebars templating (`latex/cv_template.tex`, `latex/cover_letter_template.tex`) compiled with `pdflatex`
- **LaTeX-safe output** — custom `escapeLatex` Handlebars helper plus sanitization of AI output (strips markdown fences and non-ASCII characters that break compilation)
- **In-browser preview and download** — tabbed CV / cover letter PDF previews rendered in iframes, with one-click download links
- **Raw compile endpoint** — `POST /compile` accepts arbitrary LaTeX and returns a PDF, useful for template debugging

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Backend | Node.js, Express 4 |
| AI | Google Gemini via `@google/generative-ai` (gemini-2.0-flash) |
| Templating | Handlebars 4 (LaTeX templates) |
| PDF Generation | `pdflatex` (MiKTeX / TeX Live) via `child_process` |
| Frontend | Vanilla HTML/CSS/JavaScript (`index.html`, `app.js`, `styles.css`) |
| Config | dotenv (`GEMINI_API_KEY`) |

## 📂 Project Structure

```text
smart-cv-automation/
├── server.js                       # Express server: /compile, /tailor-cv, /tailor-cover-letter
├── app.js                          # Frontend logic: calls API, renders PDF previews, tab switching
├── index.html                      # Single-page UI (job description input + PDF preview tabs)
├── styles.css                      # UI styling
├── cv_data.json                    # Your CV content as structured JSON (edit this!)
├── latex/
│   ├── cv_template.tex             # Handlebars-templated LaTeX CV
│   └── cover_letter_template.tex   # Handlebars-templated LaTeX cover letter
├── test_gemini.js                  # Standalone Gemini API smoke test
├── test_pdf_gen.js                 # Standalone LaTeX-to-PDF smoke test
├── tmp/                            # pdflatex working directory (generated)
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A LaTeX distribution with `pdflatex` on your PATH (MiKTeX or TeX Live on Windows, `texlive` on Linux, MacTeX on macOS)
- A Google Gemini API key

### Installation

```bash
git clone https://github.com/Ankita-Bha/smart-cv-automation.git
cd smart-cv-automation
npm install
```

### Usage

1. Create a `.env` file in the project root with your Gemini key (see Environment Variables below).
2. Replace the contents of `cv_data.json` with your own personal info, education, experience, projects, and skills.
3. Start the backend:

```bash
npm start        # Express API on http://localhost:3000
```

4. Open `index.html` in your browser, paste a job description, and click **Tailor & Generate**. Preview the tailored CV and cover letter in the tabs and download the PDFs.

You can verify your setup independently with `node test_gemini.js` (API key) and `node test_pdf_gen.js` (LaTeX toolchain).

## 🔐 Environment Variables

```bash
GEMINI_API_KEY=   # Google AI Studio API key used for CV/cover-letter tailoring
PORT=             # Optional, defaults to 3000
```

## 🔮 Future Improvements

- Serve the frontend from Express instead of opening `index.html` directly
- In-browser editor for `cv_data.json` so content updates don't require touching files
- Support multiple CV templates and a template picker
- Queue/cache LaTeX compilation and stream progress to the UI
- Fallback to OpenAI (dependency already present) when Gemini is unavailable

## 👤 Author

**Ankita Bhamidimarri** — [@Ankita-Bha](https://github.com/Ankita-Bha)

---

<div align="center">
<sub>⭐ If you found this project useful, consider giving it a star!</sub>
</div>
