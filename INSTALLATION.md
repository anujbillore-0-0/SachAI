

# sachAI Installation Guide

This guide will walk you through setting up the sachAI project on your local machine.

### Prerequisites

  - Python 3.11 or higher
  - `pip` for package installation
  - `git` for cloning the repository

### Step 1: Clone the Repository

Clone the project from GitHub and navigate into the project directory.

```bash
git clone <your-repository-url>
cd sachAI
```

### Step 2: Set up the Python Environment

Create a virtual environment and install the required packages.

```bash
# Create and activate a virtual environment
python -m venv venv
# On Windows:
# venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure API Keys

The application requires API keys for the language model and a search provider.

1.  Create a file named `.env` in the root directory of your project.

2.  Add your API keys to the file in the following format (do not use quotes).

    ```
    GROQ_API_KEY=your_groq_api_key
    TAVILY_API_KEY=your_tavily_api_key
    ```

      * Find your Groq API key on the [Groq console](https://console.groq.com/keys).
      * Find your Tavily API key on the [Tavily dashboard](https://www.google.com/search?q=https://tavily.com/dashboard).

### Step 4: Run the Application

Start the Streamlit web application.

```bash
flask run
```

The application will launch in your web browser. You can now use it to fact-check statements.


## Run Extension

### Step 1: Install New Dependencies
The new API requires fastapi and uvicorn. Install them using pip:

pip install fastapi "uvicorn[standard]"

### Step 2: Run the API Backend
```bash
cd SachAI
python api.py
```

You should see output indicating the server is running, typically on http://127.0.0.1:8000. Keep this terminal window open.

### Step 3: Load the Browser Extension
Open Google Chrome and navigate to chrome://extensions.

In the top-right corner, toggle on "Developer mode".

A new set of buttons will appear. Click on "Load unpacked".

A file dialog will open. Navigate to your sachAI project and select the extension folder.

The "sachAI: AI Fact-Checker" extension will now appear in your list of extensions.

### Step 4: Use the Extension
Click the jigsaw puzzle icon in your Chrome toolbar to see your extensions.

Pin the sachAI extension to your toolbar for easy access.

Click the sachAI icon. A popup will appear.

Paste or type the text you want to fact-check into the text area and click the "Fact-Check" button.

The results will be displayed in the popup window.

Note: For the extension to work, the Python API backend from Step 2 must be running locally.
