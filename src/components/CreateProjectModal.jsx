import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import '../styles/CreateProjectModal.css';

function CreateProjectModal({ onClose, onCreate }) {
    const [projectName, setProjectName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (projectName.trim()) {
            onCreate(projectName.trim());
            setProjectName('');
        }
    };

    return (
        <div className="create-project-overlay" onClick={onClose}>
            <div
                className="create-project-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="create-project-header">
                    <h2>Create New Project</h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        title="Close"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="create-project-content">
                        <div className="form-group">
                            <label>Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Enter project name"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="create-project-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="create-btn">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateProjectModal;

