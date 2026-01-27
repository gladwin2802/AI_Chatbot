import { useState, useRef, useEffect } from 'react';
import { IoClose, IoDocumentTextOutline, IoCloseCircle } from 'react-icons/io5';
import '../styles/ProjectSettingsModal.css';

function ProjectSettingsModal({ project, onClose, onSave }) {
    const [systemInstruction, setSystemInstruction] = useState(project?.systemInstruction || '');
    const [projectFiles, setProjectFiles] = useState(project?.files || []);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (project) {
            setSystemInstruction(project.systemInstruction || '');
            setProjectFiles(project.files || []);
        }
    }, [project]);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        const textFileExtensions = [
            ".txt", ".json", ".csv", ".md", ".xml", ".yaml", ".yml", ".log",
            ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".html", ".css",
            ".sql", ".ipynb",
            ".rb", ".go", ".rs", ".php", ".swift", ".kt", ".scala", ".r", ".m", ".pl", ".lua", ".vb", ".cs", ".fs", ".dart", ".elm", ".clj", ".hs", ".erl", ".ex", ".exs",
            ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd",
            ".ini", ".conf", ".config", ".properties", ".env", ".toml",
            ".sass", ".scss", ".less", ".styl", ".vue", ".svelte",
            ".tsv", ".rst", ".tex",
            ".gradle", ".cmake", ".makefile", ".mk",
            ".gitignore", ".dockerfile", ".dockerignore", ".editorconfig", ".eslintrc", ".prettierrc", ".babelrc",
            ".h", ".hpp", ".hxx", ".cc", ".cxx",
            ".sqlite", ".db"
        ];

        for (const file of files) {
            const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

            if (!textFileExtensions.includes(fileExtension)) {
                alert(`File "${file.name}" is not a supported text file. Only text files are allowed.`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
                continue;
            }

            try {
                const content = await file.text();
                setProjectFiles(prev => [...prev, {
                    name: file.name,
                    content: content,
                    size: file.size
                }]);
            } catch (error) {
                alert(`Error reading file "${file.name}": ${error.message}`);
            }
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index) => {
        setProjectFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleSave = () => {
        onSave({
            systemInstruction,
            files: projectFiles
        });
    };

    return (
        <div className="project-settings-overlay" onClick={onClose}>
            <div
                className="project-settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="project-settings-header">
                    <h2>Project Settings</h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        title="Close"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="project-settings-content">
                    <div className="form-group">
                        <label>System Instruction</label>
                        <textarea
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            placeholder="Enter system instruction for this project..."
                            rows={6}
                            className="system-instruction-textarea"
                        />
                        <div className="form-help">
                            This instruction will be used for all conversations in this project
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Project Files</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".txt,.json,.csv,.md,.xml,.yaml,.yml,.log,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.sql,.ipynb,.rb,.go,.rs,.php,.swift,.kt,.scala,.r,.m,.pl,.lua,.vb,.cs,.fs,.dart,.elm,.clj,.hs,.erl,.ex,.exs,.sh,.bash,.zsh,.fish,.ps1,.bat,.cmd,.ini,.conf,.config,.properties,.env,.toml,.sass,.scss,.less,.styl,.vue,.svelte,.tsv,.rst,.tex,.gradle,.cmake,.makefile,.mk,.gitignore,.dockerfile,.dockerignore,.editorconfig,.eslintrc,.prettierrc,.babelrc,.h,.hpp,.hxx,.cc,.cxx,.sqlite,.db"
                            style={{ display: "none" }}
                            multiple
                        />
                        <button
                            type="button"
                            className="upload-files-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <IoDocumentTextOutline size={18} />
                            Upload Files
                        </button>
                        {projectFiles.length > 0 && (
                            <div className="project-files-list">
                                {projectFiles.map((file, index) => (
                                    <div key={index} className="project-file-item">
                                        <IoDocumentTextOutline size={16} />
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                        <button
                                            className="remove-file-btn"
                                            onClick={() => removeFile(index)}
                                            title="Remove file"
                                        >
                                            <IoCloseCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="project-settings-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="save-btn"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProjectSettingsModal;

