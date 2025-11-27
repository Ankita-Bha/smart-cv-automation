// app.js – handles LaTeX compilation, AI chat, and cover letter generation

const editor = document.getElementById('latex-editor');
const compileBtn = document.getElementById('compile-btn');
const chatBtn = document.getElementById('chat-btn');
const coverBtn = document.getElementById('cover-letter-btn');
const pdfPreview = document.getElementById('pdf-preview');

// Chat modal elements
const chatModal = document.getElementById('chat-modal');
const chatClose = document.getElementById('chat-close');
const jobDesc = document.getElementById('job-description');
const sendChat = document.getElementById('send-chat');
const chatResponse = document.getElementById('chat-response');

// Cover letter modal elements
const coverModal = document.getElementById('cover-modal');
const coverClose = document.getElementById('cover-close');
const companyInput = document.getElementById('company');
const positionInput = document.getElementById('position');
const skillsInput = document.getElementById('skills');
const generateCover = document.getElementById('generate-cover');

// Utility: show/hide modal
function showModal(modal) { modal.classList.add('visible'); modal.classList.remove('hidden'); }
function hideModal(modal) { modal.classList.remove('visible'); modal.classList.add('hidden'); }

// Compile LaTeX → PDF preview
async function compileLatex() {
    const latex = editor.value;
    try {
        const resp = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latex })
        });
        if (!resp.ok) throw new Error('Compile failed');
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        pdfPreview.src = url;
    } catch (e) {
        alert(e.message);
    }
}

// AI chat – get suggestions
async function getSuggestions() {
    const cvLatex = editor.value;
    const jobDescription = jobDesc.value;
    try {
        const resp = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cvLatex, jobDescription })
        });
        const data = await resp.json();
        chatResponse.textContent = data.suggestion || 'No suggestion returned.';
    } catch (e) {
        chatResponse.textContent = 'Error: ' + e.message;
    }
}

// Cover letter generation
async function generateCoverLetter() {
    const templateData = {
        company: companyInput.value,
        position: positionInput.value,
        skills: skillsInput.value
    };
    try {
        const resp = await fetch('http://localhost:3000/cover-letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateData })
        });
        if (!resp.ok) throw new Error('Cover letter generation failed');
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        // Open in new tab
        window.open(url, '_blank');
    } catch (e) {
        alert(e.message);
    }
}

// Event listeners
compileBtn.addEventListener('click', compileLatex);
chatBtn.addEventListener('click', () => showModal(chatModal));
coverBtn.addEventListener('click', () => showModal(coverModal));
chatClose.addEventListener('click', () => hideModal(chatModal));
coverClose.addEventListener('click', () => hideModal(coverModal));
sendChat.addEventListener('click', getSuggestions);
generateCover.addEventListener('click', generateCoverLetter);

// Optional: auto‑compile on typing (debounced)
let debounceTimer;
editor.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compileLatex, 1000);
});
