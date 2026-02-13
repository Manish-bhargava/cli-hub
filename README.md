# CLI-HUB 🚀

[cite_start]**CLI-HUB** is an AI-powered terminal productivity tool designed to transform your command-line interface into an intelligent workspace[cite: 4, 35]. [cite_start]By leveraging **Gemini AI**, it allows developers to execute complex operations using natural language, search the web, and manage files without leaving the terminal[cite: 37, 38].

---

## ✨ Key Features

* [cite_start]**Natural Language Processing**: Execute terminal commands and file system operations using plain English via Gemini AI integration[cite: 38].
* [cite_start]**Integrated Google Search**: Perform web searches directly from your terminal using the Google Search API[cite: 38].
* [cite_start]**Automated File Management**: Streamline workflows with AI-driven file system manipulations[cite: 38].
* [cite_start]**Secure Authentication**: Implements **OAuth 2.0 Device Flow** for secure, headless session management[cite: 5, 39].
* [cite_start]**Headless Ready**: Designed to work efficiently in remote or headless environments[cite: 39].

---

## 🛠️ Technical Stack

* [cite_start]**Runtime**: Node.js 
* [cite_start]**AI Model**: Gemini AI [cite: 38]
* [cite_start]**Auth Protocol**: OAuth 2.0 Device Flow [cite: 39]
* [cite_start]**APIs**: Google Search API [cite: 38]

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* A Gemini AI API Key
* Google Search API Credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/cli-hub.git](https://github.com/your-username/cli-hub.git)
   cd cli-hub
   
2. npm install
3.   **Set up Environment Variables**
     GEMINI_API_KEY=your_gemini_key_here
     GOOGLE_SEARCH_API_KEY=your_search_key_here
     GOOGLE_SEARCH_ID=your_custom_search_engine_id

### usage examples
Usage Examples
File Operations:
cli-hub "create a folder named 'src' and move all typescript files into it"

Web Search:
cli-hub "search for the latest Next.js 14 documentation"

System Tasks:
cli-hub "explain the contents of the current directory and find large files"


 
