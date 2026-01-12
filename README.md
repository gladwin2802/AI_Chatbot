# AI Chatbot

A modern, feature-rich chatbot interface that works with any OpenAI-compatible API. Chat with AI models while having full control over your conversations and context management.

## Live Demo

Check out the live demo: [https://chatbyai.netlify.app/](https://chatbyai.netlify.app/)

## What Can You Do?

### Have Conversations Your Way
- **Multiple Chats**: Create and manage as many separate conversations as you need. Each chat is saved automatically so you can switch between them anytime.
- **Name Your Chats**: Give each conversation a meaningful title so you can easily find what you're looking for later.
- **Dark & Light Modes**: Choose the theme that's comfortable for your eyes.

### Share Files and Code
- **Attach Files**: Upload text files, code files, documents, and more directly into your messages. The AI can read and analyze them.
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
- **System Message**: Set custom instructions that the AI will follow in every conversation. For example, "You are a helpful coding assistant" or "Always respond in a friendly, casual tone."
- **Temperature Control**: Adjust how creative or precise the AI's responses are. Lower values give consistent, focused answers. Higher values give more creative, varied responses.
- **Token Limits**: Set how long the AI's responses can be.

### Never Lose Your Work
- **Auto-Save**: Every message, file attachment, and setting is automatically saved in your browser. Close the tab and come back anytime - your conversations will be waiting.
- **Conversation Titles**: The first message in each chat automatically becomes the title, but you can rename it anytime.

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

All settings are accessible through the Settings panel:

- **Base URL**: Your API endpoint base URL
- **API Key**: Authentication key (stored securely in browser)
- **Model**: AI model selection with search capability
- **Temperature**: Response creativity (0-2, default 0.7)
- **Max Output Tokens**: Maximum length of AI responses (100-32000+)
- **Max Context Tokens**: Maximum tokens for conversation history (1000-128000+)
- **System Message**: Custom instructions for AI behavior (optional)

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

1. **Use Context Strategies Wisely**: If you're having a long conversation, switch to Sliding Window or Summarization mode to avoid hitting token limits.

2. **Monitor Token Usage**: Keep an eye on the token counters at the bottom. When they turn yellow or red, consider adjusting your context strategy.

3. **Organize Your Chats**: Use descriptive titles for your conversations so you can easily find them later.

4. **Experiment with Temperature**: Try different temperature settings for different tasks. Use lower values (0.2-0.5) for factual questions, higher values (0.8-1.5) for creative writing.

5. **System Messages**: Set a system message that matches your use case. It's applied to every message and helps the AI stay on track.
