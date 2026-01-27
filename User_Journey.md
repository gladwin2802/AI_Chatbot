# AI Chatbot - User Journey

## Table of Contents

- [Overview](#overview)
- [Prerequisite](#prerequisite)
- [Main Flow (Current Implementation)](#main-flow-current-implementation)
  - [First Time Setup](#first-time-setup)
  - [Project Management](#project-management)
  - [Conversation Management](#conversation-management)
  - [Chat Interface](#chat-interface)
  - [Context Management](#context-management)
  - [File Management](#file-management)
  - [Settings Management](#settings-management)
  - [Theme Management](#theme-management)
  - [Sidebar Management](#sidebar-management)
- [Secondary Flow](#secondary-flow)
  - [Message Navigation](#message-navigation)
  - [Model Selection](#model-selection)
  - [Token Limit Handling](#token-limit-handling)
  - [Error Handling](#error-handling)
  - [Auto-Save](#auto-save)

---

## Overview

AI Chatbot is a React Vite Application tool that provides a project-based chatbot interface for interacting with OpenAI-compatible APIs. Users can organize their work into projects, manage multiple conversations, share files, and configure context management strategies for optimal AI interactions.

## Prerequisite

Users must have access to an OpenAI-compatible API endpoint with a valid API key. The application requires initial configuration of Base URL and API Key in the Settings panel.

## Main Flow (Current Implementation)

### First Time Setup

On first launch, the application opens with Settings modal displayed.

#### Configure Base URL

- Enter the OpenAI-compatible API endpoint base URL (e.g., `https://api.openai.com/v1`)

#### Configure API Key

- Enter the API key for authentication

#### Select Model

- Available models are automatically fetched from the endpoint
- Model can be selected from dropdown with search capability

#### Configure Global Settings (Optional)

- Set Temperature (0-2) for response creativity
- Set Max Output Tokens (response length limit)
- Set Max Context Tokens (conversation history limit)
- Set System Message (optional global instruction)
- Click **Get Started** to save settings and proceed

### Project Management

#### Create New Project

- Click **"New Project"** button in sidebar
- Enter project name
- Project is created and selected

#### Configure Project Settings (Optional)

- Click **Project Settings** button in header
- Set System Instruction for the project (overrides global system message)
- Upload Project Files (automatically included in all conversations within project)
  - Supported file types: `.txt`, `.json`, `.csv`, `.md`, `.xml`, `.yaml`, `.yml`, `.log`, `.js`, `.jsx`, `.ts`, `.tsx`, `.py`, `.java`, `.c`, `.cpp`, `.html`, `.css`
  - Files are displayed with name and size
  - Remove files if needed
- Save project settings

#### Select Project

- Click on project from sidebar
- Project is selected and conversations list is displayed

#### Delete Project

- Click delete button on project item
- Project and all its conversations are deleted

### Conversation Management

#### Create New Conversation

- With a project selected, click **"New Chat"** button
- New conversation is created and selected
- Conversation title is auto-generated from first message

#### Rename Conversation

**From Header:**
- Click edit icon on conversation title in header
- Enter new title
- Save or cancel

**From Sidebar:**
- Click edit icon on conversation item
- Enter new title
- Save or cancel

#### Select Conversation

- Click on conversation from sidebar
- Conversation messages are loaded and displayed

#### Delete Conversation

- Click delete icon on conversation item in sidebar
- Conversation is deleted

### Chat Interface

#### Send Message

- Type message in input area
- Attach files (optional)
- Click send button or press Enter
- Message is sent to AI
- Response is displayed in chat area

#### Attach Files to Message

- Click attach file button
- Select one or more text files
- Files are attached and displayed as chips
- Preview file content by clicking on file chip
- Remove file by clicking remove button
- File content is included in message context

#### View Message History

- Scroll through conversation messages
- Use message navigator (appears on scroll)
- Click on message dots to navigate to specific message
- Scroll to bottom button appears when not at bottom

#### Token Management

- View token counters at bottom of chat area
  - System tokens (system message)
  - Input tokens (current message and attachments)
  - Context tokens (conversation history)
- Token counters show color coding (green/yellow/red) based on usage percentage
- Warning banner appears when context limit approaches 80%

### Context Management

#### Access Context Settings

- Click context settings button in input area
- Context Settings modal opens

#### Select Context Strategy

**Full History**
- All conversation messages are included
- Message Selection option available
  - Select specific messages to include
  - Click **"Select Messages"** button
  - Message selector opens
  - Select/deselect messages
  - Messages are highlighted based on selection
  - Token count updates dynamically

**Sliding Window**
- Only recent N messages are included
- Configure window size
  - Use slider or input to set number of messages
  - Token count updates based on window size

**Summarization**
- Previous conversation is summarized
- Choose summarization mode
  - **Auto-Summarization**: Automatically summarizes when sending messages
  - **Manual Summarization**: Click ✨ button in input area to manually summarize

**Last Message**
- Only the current message is sent (no history)

#### View Context Status

- Current history token count
- Usage percentage
- Total messages count
- Color-coded status indicators

### File Management

#### Project Files

- Upload files in Project Settings
- Files are automatically included in all conversations within project
- View file list in Project Settings modal
- Remove files from project

#### Message Attachments

- Attach files to individual messages
- Preview file content before sending
- View file name, size, and token count
- Remove attachments before sending

#### File Preview

- Click on attached file chip
- File preview modal opens
- View full file content
- Copy file content to clipboard
- Close preview

### Settings Management

#### Global Settings

- Access Settings from sidebar footer
- Configure Base URL
- Configure API Key
- Select Model
  - Search models by name
  - View model information (max context, max output, provider)
- Set Temperature (0-2)
- Set Max Output Tokens
- Set Max Context Tokens
- Set System Message (optional)
- Save settings

#### Project Settings

- Access from Project Settings button in header
- Configure System Instruction (project-specific)
- Upload/remove Project Files
- Save project settings

### Theme Management

#### Toggle Theme

- Click theme toggle button in header
- Switch between Dark and Light mode
- Theme preference is saved

### Sidebar Management

#### Toggle Sidebar

- Click sidebar toggle button in header
- Sidebar opens/closes
- Sidebar state is preserved

## Secondary Flow

### Message Navigation

When conversation has multiple messages:

- Message navigator appears on scroll
- Shows dots representing each message
  - User messages shown as single dot
  - AI messages shown as double dots
- Click on dot to navigate to that message
- Message is highlighted briefly
- Scroll arrows appear when navigator is scrollable
  - Top arrow appears when not at top
  - Bottom arrow appears when not at bottom
- Navigator auto-hides after 2 seconds (unless hovered)

### Model Selection

#### Inline Model Selector

- Model selector appears in input area
- Click to open dropdown
- Search models by typing
- Select model from list
- Model information displayed
- Model selection saved automatically

### Token Limit Handling

#### Input Token Limit

If input tokens exceed limit:

- Input area is disabled
- Warning message displayed
- Attach file button is disabled
- Send button is disabled

#### Context Token Limit

If context tokens exceed limit:

- Warning banner appears
- Alert shown when trying to send message
- Suggestions provided to resolve issue

#### File Size Limits

- Maximum file size: 5MB per file
- Alert shown if file exceeds limit
- File not attached

#### Supported File Types

- Only text files are supported
- Alert shown for unsupported file types
- File not attached

### Error Handling

#### API Errors

- Error messages displayed in chat
- Error message shown as assistant message with error styling
- Network errors handled gracefully

#### Model Loading Errors

- Error message displayed in model selector
- Failed to load models message shown

#### Settings Validation

- Required fields validated on save
- Alert shown if Base URL or API Key missing

### Auto-Save

- All data is automatically saved to browser LocalStorage
- Projects, conversations, messages, settings, and files are persisted
- Data persists across browser sessions
- No manual save required
