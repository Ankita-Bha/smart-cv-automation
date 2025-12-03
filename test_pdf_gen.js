const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function compileLatex(latexSource) {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const texPath = path.join(tmpDir, 'test_input.tex');
    fs.writeFileSync(texPath, latexSource);

    console.log("Compiling LaTeX...");
    const cmd = `pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texPath}"`;

    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
            console.error("LaTeX Compilation Error:", error);
            console.error("STDOUT:", stdout);
            return;
        }
        console.log("Compilation Success!");
        const pdfPath = path.join(tmpDir, 'test_input.pdf');
        if (fs.existsSync(pdfPath)) {
            console.log("PDF generated at:", pdfPath);
            console.log("PDF Size:", fs.statSync(pdfPath).size, "bytes");
        } else {
            console.error("PDF file not found!");
        }
    });
}

const simpleLatex = `
\\documentclass{article}
\\begin{document}
Hello World! This is a test.
\\end{document}
`;

compileLatex(simpleLatex);
