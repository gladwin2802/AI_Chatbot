import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import Settings from "./components/Settings";
import CreateProjectModal from "./components/CreateProjectModal";
import NavigationDemo from "./components/NavigationDemo";
import {
    loadConversations,
    saveConversations,
    loadSettings,
    loadTheme,
    saveTheme,
    loadProjects,
    saveProjects,
    loadCurrentProject,
    saveCurrentProject,
} from "./utils/storage";
import "./styles/App.css";

function App() {
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(loadSettings());
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useState(loadTheme());
    const [isConfigured, setIsConfigured] = useState(false);
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showNavigationDemo, setShowNavigationDemo] = useState(false);
    const [skipDemo, setSkipDemo] = useState(false);
    const [projectSettingsButtonRef, setProjectSettingsButtonRef] = useState(null);

    useEffect(() => {
        const loadedSettings = loadSettings();
        const configured = loadedSettings.baseUrl && loadedSettings.apiKey;
        setIsConfigured(configured);
        if (!configured) {
            setShowSettings(true);
        }
    }, []);

    useEffect(() => {
        const loadedProjects = loadProjects();
        setProjects(loadedProjects);

        const currentProjectId = loadCurrentProject();
        if (currentProjectId) {
            const project = loadedProjects.find(p => p.id === currentProjectId);
            if (project) {
                setCurrentProject(project);
            } else {
                saveCurrentProject(null);
            }
        }

        const loaded = loadConversations();
        setConversations(loaded);

        if (currentProjectId) {
            const projectConversations = loaded.filter(c => c.projectId === currentProjectId);
            if (projectConversations.length > 0) {
                setCurrentConversationId(projectConversations[0].id);
            }
        }
    }, []);

    useEffect(() => {
        if (conversations.length > 0) {
            saveConversations(conversations);
        }
    }, [conversations]);

    useEffect(() => {
        if (projects.length > 0) {
            saveProjects(projects);
        }
    }, [projects]);

    useEffect(() => {
        if (currentProject) {
            const currentConv = conversations.find(c => c.id === currentConversationId);
            if (currentConv && currentConv.projectId === currentProject.id) {
                return;
            }

            const projectConversations = conversations.filter(c => c.projectId === currentProject.id);
            if (projectConversations.length > 0) {
                setCurrentConversationId(projectConversations[0].id);
            } else {
                const newConv = {
                    id: Date.now().toString(),
                    title: "New Chat",
                    messages: [],
                    createdAt: new Date().toISOString(),
                    projectId: currentProject.id,
                };
                setConversations((prev) => [newConv, ...prev]);
                setCurrentConversationId(newConv.id);
            }
        } else {
            setCurrentConversationId(null);
        }
    }, [currentProject?.id]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        saveTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const createNewConversation = () => {
        if (!currentProject) return;
        const newConv = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: [],
            createdAt: new Date().toISOString(),
            projectId: currentProject.id,
        };
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
    };

    const handleCreateProject = (projectName) => {
        const newProject = {
            id: Date.now().toString(),
            name: projectName,
            systemInstruction: "",
            files: [],
            createdAt: new Date().toISOString(),
        };
        setProjects((prev) => [...prev, newProject]);
        setCurrentProject(newProject);
        saveCurrentProject(newProject.id);
        setShowCreateProjectModal(false);

        const newConv = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: [],
            createdAt: new Date().toISOString(),
            projectId: newProject.id,
        };
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);

        if (!skipDemo) {
            setTimeout(() => {
                setShowNavigationDemo(true);
            }, 100);
        }
    };

    const handleSelectProject = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setCurrentProject(project);
            saveCurrentProject(projectId);

            const projectConversations = conversations.filter(c => c.projectId === projectId);
            if (projectConversations.length > 0) {
                const firstProjectConv = projectConversations[0];
                setCurrentConversationId(firstProjectConv.id);
            } else {
                const newConv = {
                    id: Date.now().toString(),
                    title: "New Chat",
                    messages: [],
                    createdAt: new Date().toISOString(),
                    projectId: projectId,
                };
                setConversations((prev) => [newConv, ...prev]);
                setCurrentConversationId(newConv.id);
            }
        }
    };

    const handleBackToProjects = () => {
        setCurrentProject(null);
        saveCurrentProject(null);
        setCurrentConversationId(null);
    };

    const handleUpdateProject = (projectId, updates) => {
        setProjects((prev) =>
            prev.map((p) =>
                p.id === projectId ? { ...p, ...updates } : p
            )
        );
        if (currentProject?.id === projectId) {
            setCurrentProject((prev) => ({ ...prev, ...updates }));
        }
    };

    const handleDeleteProject = (projectId) => {
        if (window.confirm('Are you sure you want to delete this project? All chats in this project will also be deleted.')) {
            setProjects((prev) => prev.filter(p => p.id !== projectId));
            
            setConversations((prev) => prev.filter(c => c.projectId !== projectId));
            
            if (currentProject?.id === projectId) {
                setCurrentProject(null);
                saveCurrentProject(null);
                setCurrentConversationId(null);
            }
        }
    };

    const deleteConversation = (id) => {
        if (!currentProject) return;
        setConversations((prev) => {
            const filtered = prev.filter((c) => c.id !== id);
            if (currentConversationId === id) {
                const relevantConversations = filtered.filter(c => c.projectId === currentProject.id);

                if (relevantConversations.length > 0) {
                    setCurrentConversationId(relevantConversations[0].id);
                } else {
                    const newConv = {
                        id: Date.now().toString(),
                        title: "New Chat",
                        messages: [],
                        createdAt: new Date().toISOString(),
                        projectId: currentProject.id,
                    };
                    setCurrentConversationId(newConv.id);
                    return [newConv, ...filtered];
                }
            }
            return filtered;
        });
    };

    const updateConversation = (id, updates) => {
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === id ? { ...conv, ...updates } : conv
            )
        );
    };

    const getCurrentConversation = () => {
        if (!currentConversationId || !currentProject) return null;

        const conv = conversations.find((c) => c.id === currentConversationId);
        if (!conv) return null;

        return conv.projectId === currentProject.id ? conv : null;
    };

    const currentConversation = getCurrentConversation();

    return (
        <div className="app" data-theme={theme}>
            {!isConfigured ? (
                <div className="setup-screen">
                    <div className="setup-content">
                        <h1>Welcome to AI Chatbot</h1>
                        <p>Configure your API settings to get started</p>
                    </div>
                </div>
            ) : (
                <>
                    <Sidebar
                        conversations={conversations}
                        currentConversationId={currentConversationId}
                        onSelectConversation={(id) => {
                            if (!currentProject) return;
                            const conv = conversations.find(c => c.id === id);
                            if (conv && conv.projectId === currentProject.id) {
                                setCurrentConversationId(id);
                            }
                        }}
                        onNewConversation={createNewConversation}
                        onDeleteConversation={deleteConversation}
                        onUpdateConversation={updateConversation}
                        onOpenSettings={() => setShowSettings(true)}
                        isOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen(!sidebarOpen)}
                        projects={projects}
                        currentProject={currentProject}
                        onCreateProject={() => setShowCreateProjectModal(true)}
                        onSelectProject={handleSelectProject}
                        onBackToProjects={handleBackToProjects}
                        onDeleteProject={handleDeleteProject}
                    />

                    <ChatArea
                        conversation={currentConversation}
                        onUpdateConversation={updateConversation}
                        settings={settings}
                        onUpdateSettings={setSettings}
                        sidebarOpen={sidebarOpen}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        currentProject={currentProject}
                        onUpdateProject={handleUpdateProject}
                        onProjectSettingsButtonRef={setProjectSettingsButtonRef}
                    />
                </>
            )}

            {showCreateProjectModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateProjectModal(false)}
                    onCreate={handleCreateProject}
                />
            )}

            {showNavigationDemo && currentProject && (
                <NavigationDemo
                    onClose={() => setShowNavigationDemo(false)}
                    onSkip={() => setSkipDemo(true)}
                    settingsButtonRef={projectSettingsButtonRef}
                />
            )}

            {showSettings && (
                <Settings
                    settings={settings}
                    onClose={() => {
                        if (isConfigured) {
                            setShowSettings(false);
                        }
                    }}
                    onSave={(newSettings) => {
                        setSettings(newSettings);
                        const configured =
                            newSettings.baseUrl && newSettings.apiKey;
                        setIsConfigured(configured);
                        if (configured) {
                            setShowSettings(false);
                        }
                    }}
                    isRequired={!isConfigured}
                />
            )}
        </div>
    );
}

export default App;
