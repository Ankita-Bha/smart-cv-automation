# CV Builder

A web-based tool to edit CVs using LaTeX, generate PDFs, and use an AI assistant for tailoring CVs and generating cover letters.

## Features

- **Interactive Editor**: Edit your CV content easily using a JSON format.
- **PDF Generation**: Generate professional PDFs using LaTeX templates.
- **AI Assistant**: Tailor your CV to specific job descriptions using Gemini or OpenAI.
- **Cover Letter Generator**: Automatically generate cover letters based on your CV and the job description.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- A LaTeX distribution with `pdflatex` in your system PATH:
    - Windows: [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)
    - Linux: `sudo apt-get install texlive-full`
    - macOS: [MacTeX](https://www.tug.org/mactex/)

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory:
    ```bash
    cd cv-builder
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root directory.
2.  Add your API key for the AI assistant (Gemini is used by default, but code supports OpenAI structure):
    ```env
    GEMINI_API_KEY=your_api_key_here
    # or
    OPENAI_API_KEY=your_api_key_here
    ```

## Usage

1.  Start the server:
    ```bash
    npm start
    ```
2.  Open your browser and navigate to:
    ```
    http://localhost:3000
    ```
3.  Enter your job description, tailor your CV, and generate your PDF!

## Project Structure

- `app.js`: Frontend logic.
- `server.js`: Backend Express server.
- `latex/`: Contains LaTeX templates.
- `cv_data.json`: Default CV data.
