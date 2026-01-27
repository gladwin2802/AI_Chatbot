# AI Chatbot

A modern, project-based chatbot interface that works with any OpenAI-compatible API. Organize your work into projects, each with its own conversations, files, and system instructions. Chat with AI models while having full control over your conversations and context management.

## Live Demo

Check out the live demo: [https://chatbyai.netlify.app/](https://chatbyai.netlify.app/)

## What Can You Do?

### Project-Based Organization
- **Projects**: Organize your work into separate projects. Each project can have multiple conversations, its own system instructions, and project files that are automatically included in all conversations.
- **Project Settings**: Configure system instructions and upload files at the project level. These settings apply to all conversations within that project.
- **Multiple Conversations**: Create and manage as many separate conversations as you need within each project. Each chat is saved automatically so you can switch between them anytime.
- **Name Your Chats**: Give each conversation a meaningful title so you can easily find what you're looking for later.
- **Dark & Light Modes**: Choose the theme that's comfortable for your eyes.

### Share Files and Code
- **Project Files**: Upload files at the project level that are automatically included in every message within that project. Perfect for codebases, documentation, or reference materials.
- **Message Attachments**: Attach files directly to individual messages for one-time context.
- **Supported File Types**: Works with .txt, .json, .csv, .md, .xml, .yaml, .js, .jsx, .ts, .tsx, .py, .java, .c, .cpp, .html, .css, and more.
- **File Preview**: Click on any attached file to preview its contents before sending.

### Smart Context Management
The chatbot offers different ways to manage conversation history, giving you control over what the AI remembers:

- **Full History**: The AI sees your entire conversation. Perfect for when you want complete context.
- **Sliding Window**: The AI only sees the last few messages you choose (e.g., last 5 or 10 messages). Great for keeping conversations focused.
- **Summarization**: Older messages get summarized to save space while keeping the important details. Choose automatic or manual summarization.
- **Last Message Only**: The AI only sees your current message with no history. Useful for quick, independent questions.

### Smart Message Selection
When using Full History mode, you can manually pick and choose which specific messages the AI should see. This gives you precise control over what context matters.

### Track Your Usage
- **Token Counter**: See exactly how many tokens you're using in real-time. Tokens are units that AI models use to measure text length.
- **Visual Warnings**: Get color-coded alerts when you're approaching your limit so you never get caught by surprise.
- **Three Counters**: 
  - System tokens (from your custom instructions)
  - Input tokens (your current message and files)
  - Context tokens (conversation history)

### Easy Navigation
- **Message Navigator**: A handy sidebar that appears when you scroll, showing all messages as dots. Click any dot to jump to that message instantly.
- **Scroll to Bottom**: Quick button to jump back to the latest message.
- **Smooth Scrolling**: Navigate through long conversations effortlessly.

### Choose Your AI Model
- **Model Selection**: Switch between different AI models on the fly. Each model has different capabilities and token limits.
- **Model Search**: Quickly find the model you want with the built-in search feature.
- **Model Information**: See each model's maximum context length, output tokens, and provider at a glance.

### Customize AI Behavior
- **Project System Instructions**: Set custom instructions at the project level that apply to all conversations within that project. For example, "You are a helpful coding assistant" or "Always respond in a friendly, casual tone."
- **Global Settings**: Configure API settings, model selection, temperature, and token limits that apply across all projects.
- **Temperature Control**: Adjust how creative or precise the AI's responses are. Lower values give consistent, focused answers. Higher values give more creative, varied responses.
- **Token Limits**: Set how long the AI's responses can be.

### Never Lose Your Work
- **Auto-Save**: Every project, conversation, message, file attachment, and setting is automatically saved in your browser. Close the tab and come back anytime - everything will be waiting.
- **Conversation Titles**: The first message in each chat automatically becomes the title, but you can rename it anytime.
- **Project Persistence**: All projects and their settings are saved locally. Delete projects when you no longer need them.

## Technical Setup

### Requirements
- Node.js 18+ and npm
- An OpenAI-compatible API endpoint and API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI_Chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

### First Time Setup

When you first open the application, you'll be prompted to configure:

1. **Base URL**: Your OpenAI-compatible API endpoint (e.g., `https://api.openai.com/v1`)
2. **API Key**: Your authentication key for the API
3. **Model**: Choose from the available models on your endpoint

The app will automatically fetch and display all available models from your endpoint.

### Getting Started

1. **Create a Project**: Click "New Project" in the sidebar to create your first project
2. **Configure Project Settings**: Click the settings button in the header to add system instructions and upload project files
3. **Start Chatting**: Create a new chat within your project and start conversing with the AI
4. **Add More Projects**: Create separate projects for different tasks, codebases, or use cases

### Build for Production

```bash
npm run build
```

The optimized production build will be created in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- **React 19** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Markdown** - Render formatted AI responses
- **Highlight.js** - Syntax highlighting for code blocks
- **React Icons** - Beautiful iconography
- **LocalStorage API** - Client-side data persistence

## Configuration

### Global Settings

All global settings are accessible through the Settings panel:

- **Base URL**: Your API endpoint base URL
- **API Key**: Authentication key (stored securely in browser)
- **Model**: AI model selection with search capability
- **Temperature**: Response creativity (0-2, default 0.7)
- **Max Output Tokens**: Maximum length of AI responses (100-32000+)
- **Max Context Tokens**: Maximum tokens for conversation history (1000-128000+)

### Project Settings

Each project has its own settings accessible through the project settings button in the header:

- **System Instruction**: Custom instructions that apply to all conversations within the project
- **Project Files**: Upload files that are automatically included in every message within the project

Project settings override global system message settings. If a project has a system instruction, it will be used instead of the global system message.

## OpenAI-Compatible Endpoints

This chatbot works with any API that follows the OpenAI API format, including:
- OpenAI API
- Azure OpenAI Service
- Local LLM servers (like LM Studio, Ollama with OpenAI compatibility)
- Cloud providers offering OpenAI-compatible endpoints
- Self-hosted model servers

As long as the endpoint supports the `/v1/chat/completions` and `/v1/models` endpoints, it will work with this chatbot.

## Privacy & Data Storage

All conversations, settings, and API keys are stored locally in your browser using LocalStorage. No data is sent to any server except your configured API endpoint. Your API key never leaves your device except when making API calls.

## Tips for Best Experience

1. **Organize with Projects**: Create separate projects for different tasks or codebases. Each project can have its own system instructions and files.

2. **Use Project Files**: Upload codebases or reference documents at the project level so they're automatically included in all conversations within that project.

3. **Use Context Strategies Wisely**: If you're having a long conversation, switch to Sliding Window or Summarization mode to avoid hitting token limits.

4. **Monitor Token Usage**: Keep an eye on the token counters at the bottom. When they turn yellow or red, consider adjusting your context strategy.

5. **Organize Your Chats**: Use descriptive titles for your conversations so you can easily find them later.

6. **Experiment with Temperature**: Try different temperature settings for different tasks. Use lower values (0.2-0.5) for factual questions, higher values (0.8-1.5) for creative writing.

7. **Project System Instructions**: Set project-specific system instructions that match your use case. They're applied to every message in that project and help the AI stay on track.
