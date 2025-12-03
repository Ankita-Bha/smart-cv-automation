// app.js

const jobDescInput = document.getElementById('job-description');
const tailorBtn = document.getElementById('tailor-btn');
const loadingMsg = document.getElementById('loading-msg');
const pdfPreview = document.getElementById('pdf-preview');
const clPreview = document.getElementById('cl-preview');
const downloadCvBtn = document.getElementById('download-cv');
const downloadClBtn = document.getElementById('download-cl');

// Tab switching logic
function openTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    // Activate button
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
    if (btn) btn.classList.add('active');
}

// Tailor & Generate Logic
async function tailorCV() {
    const jobDescription = jobDescInput.value;
    if (!jobDescription) {
        alert('Please enter a Job Description first.');
        return;
    }

    loadingMsg.style.display = 'flex';
    tailorBtn.disabled = true;
    tailorBtn.textContent = "Processing...";

    try {
        // 1. Tailor CV
        const cvResp = await fetch('http://localhost:3000/tailor-cv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobDescription })
        });

        if (!cvResp.ok) {
            const errData = await cvResp.json().catch(() => ({}));
            throw new Error(errData.error || 'CV Tailoring failed');
        }
        const cvBlob = await cvResp.blob();
        const cvUrl = URL.createObjectURL(cvBlob);
        pdfPreview.src = cvUrl;

        // Setup Download Link
        downloadCvBtn.href = cvUrl;
        downloadCvBtn.style.display = 'inline-block';

        // 2. Generate Cover Letter
        const clResp = await fetch('http://localhost:3000/tailor-cover-letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobDescription })
        });

        if (!clResp.ok) {
            const errData = await clResp.json().catch(() => ({}));
            throw new Error(errData.error || 'Cover Letter Generation failed');
        }
        const clBlob = await clResp.blob();
        const clUrl = URL.createObjectURL(clBlob);
        clPreview.src = clUrl;

        // Setup Download Link
        downloadClBtn.href = clUrl;
        downloadClBtn.style.display = 'inline-block';

    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        loadingMsg.style.display = 'none';
        tailorBtn.disabled = false;
        tailorBtn.textContent = "Tailor & Generate";
    }
}

// Event Listeners
tailorBtn.addEventListener('click', tailorCV);

// Expose openTab to global scope for HTML onclick
window.openTab = openTab;
