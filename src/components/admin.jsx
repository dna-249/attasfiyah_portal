import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [filterText, setFilterText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hostinger-inspired color palette
    const hostingerPurple = '#673DE6'; 
    const hostingerDark = '#2F3542';
    const hostingerBg = '#F4F5F7';
    const hostingerBorder = '#D5D9E0';

    // --- 1. Fetch Student List on Component Load ---
    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('https://portal-database-seven.vercel.app/student');
                setStudents(response.data);
                
                if (response.data.length > 0) {
                    setSelectedStudentId(response.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch student list:", err);
                setError("Failed to load student list for selection. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // --- 2. Filter Students ---
    const filteredStudents = students.filter(student => 
        student.studentName?.toLowerCase().includes(filterText.toLowerCase())
    );

    useEffect(() => {
        if (filteredStudents.length > 0 && !filteredStudents.find(s => s._id === selectedStudentId)) {
            setSelectedStudentId(filteredStudents[0]._id);
        } else if (filteredStudents.length === 0) {
            setSelectedStudentId('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterText, students]);

    // --- 3. Handle View Report Button Click ---
    const handleViewReport = (e) => {
        e.preventDefault();
        if (!selectedStudentId) {
            alert('Please select a student first.');
            return;
        }
        navigate(`/portal/${selectedStudentId}`);
    };

    // --- 4. Render Logic ---
    if (isLoading) {
        return (
            <div className="hpanel-loading">
                <div className="spinner"></div>
                <p>Loading Dashboard...</p>
                <style>{`
                    .hpanel-loading { height: 100vh; display: flex; flex-direction: column; alignItems: center; justify-content: center; background-color: ${hostingerBg}; font-family: 'Inter', sans-serif;}
                    .spinner { width: 40px; height: 40px; border: 4px solid #e0e7ff; border-top-color: ${hostingerPurple}; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;}
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="hpanel-layout">
            <style>{`
                /* Base Styles */
                .hpanel-layout {
                    min-height: 100vh;
                    background-color: ${hostingerBg};
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    color: ${hostingerDark};
                }
                
                /* Top Navigation */
                .hpanel-navbar {
                    background-color: #ffffff;
                    border-bottom: 1px solid ${hostingerBorder};
                    padding: 0 24px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .brand-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .brand-container img {
                    border-radius: 8px;
                }
                .brand-text {
                    font-size: 1.25rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }
                .nav-logout {
                    background: transparent;
                    border: 1px solid ${hostingerBorder};
                    color: ${hostingerDark};
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nav-logout:hover {
                    background-color: #f8f9fa;
                    border-color: #c0c4cc;
                }

                /* Main Content Area */
                .hpanel-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 40px 24px;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 32px;
                    letter-spacing: -0.5px;
                }

                /* Cards Grid */
                .hpanel-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 24px;
                }
                
                .hpanel-card {
                    background: #ffffff;
                    border: 1px solid ${hostingerBorder};
                    border-radius: 8px;
                    padding: 24px;
                    transition: box-shadow 0.2s;
                }
                .hpanel-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f0f2f5;
                }
                .card-icon {
                    width: 40px;
                    height: 40px;
                    background-color: #f4f2ff;
                    color: ${hostingerPurple};
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                .card-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                }
                .card-description {
                    color: #727b8a;
                    font-size: 0.9rem;
                    margin-bottom: 24px;
                    line-height: 1.5;
                }

                /* Buttons */
                .btn-hpanel {
                    width: 100%;
                    padding: 10px 16px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                }
                .btn-primary {
                    background-color: ${hostingerPurple};
                    color: #ffffff;
                    border: 1px solid ${hostingerPurple};
                }
                .btn-primary:hover {
                    background-color: #552fc4;
                    border-color: #552fc4;
                }
                .btn-secondary {
                    background-color: transparent;
                    color: ${hostingerPurple};
                    border: 1px solid ${hostingerPurple};
                }
                .btn-secondary:hover {
                    background-color: #f4f2ff;
                }
                
                /* Student Management Section */
                .management-card {
                    background: #ffffff;
                    border: 1px solid ${hostingerBorder};
                    border-radius: 8px;
                    padding: 32px;
                }
                .filters-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .hpanel-input, .hpanel-select {
                    padding: 10px 16px;
                    border: 1px solid ${hostingerBorder};
                    border-radius: 6px;
                    font-size: 0.95rem;
                    outline: none;
                    transition: border-color 0.2s;
                    color: ${hostingerDark};
                }
                .hpanel-input:focus, .hpanel-select:focus {
                    border-color: ${hostingerPurple};
                    box-shadow: 0 0 0 3px rgba(103, 61, 230, 0.1);
                }
                .hpanel-input {
                    flex: 1;
                }
                .hpanel-select {
                    flex: 2;
                    background-color: #fff;
                    cursor: pointer;
                }
                
                .actions-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding-top: 24px;
                    border-top: 1px solid #f0f2f5;
                }

                /* Error Alert */
                .alert-error {
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #ef4444;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .filters-row { flex-direction: column; }
                    .actions-row { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 480px) {
                    .actions-row { grid-template-columns: 1fr; }
                    .hpanel-navbar { padding: 0 16px; }
                    .hpanel-container { padding: 24px 16px; }
                }
            `}</style>

            {/* Top Navigation Bar */}
            <nav className="hpanel-navbar">
                <div className="brand-container">
                    <img src="/aiiflogo.png" alt="Logo" width={40} height={40} />
                    <span className="brand-text">Admin Panel</span>
                </div>
                <button className="nav-logout" onClick={() => navigate('/')}>
                    Log Out
                </button>
            </nav>

            {/* Main Content */}
            <main className="hpanel-container">
                <h1 className="page-title">Welcome back, Administrator 👋</h1>

                {error && (
                    <div className="alert-error">
                        <strong>Data Error:</strong> {error}
                    </div>
                )}

                {/* Top Services Cards */}
                <div className="hpanel-grid">
                    <div className="hpanel-card">
                        <div className="card-header">
                            <div className="card-icon">➕</div>
                            <div className="card-title">Registration</div>
                        </div>
                        <p className="card-description">Onboard new students into the system by setting up their primary profiles and credentials.</p>
                        <button className="btn-hpanel btn-primary" onClick={() => navigate('/signup')}>
                            Register New Student
                        </button>
                    </div>

                    <div className="hpanel-card">
                        <div className="card-header">
                            <div className="card-icon">📝</div>
                            <div className="card-title">Data Entry</div>
                        </div>
                        <p className="card-description">Access the general data entry portal to bulk update records, classes, and subjects.</p>
                        <button className="btn-hpanel btn-secondary" onClick={() => navigate('/entry')}>
                            Manage Data Entry
                        </button>
                    </div>
                </div>

                {/* Manage Students Section */}
                <div className="management-card">
                    <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '8px' }}>
                        <div className="card-icon" style={{ backgroundColor: '#fff', border: `1px solid ${hostingerBorder}` }}>🎓</div>
                        <div className="card-title" style={{ fontSize: '1.25rem' }}>Manage Student Records</div>
                    </div>
                    <p className="card-description" style={{ marginBottom: '24px' }}>Search for a specific student to view their dashboard or update their academic progress.</p>
                    
                    <form onSubmit={handleViewReport}>
                        <div className="filters-row">
                            <input 
                                type="text" 
                                className="hpanel-input"
                                placeholder="🔍 Filter by student name..." 
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            <select
                                className="hpanel-select"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="" disabled>Select a student...</option>
                                {filteredStudents.map(student => (
                                    <option key={student._id} value={student._id}>
                                        {student.studentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {filteredStudents.length === 0 && filterText && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '-16px', marginBottom: '20px' }}>
                                No students found matching "{filterText}"
                            </p>
                        )}

                        {/* Action Buttons for Selected Student */}
                        <div className="actions-row">
                            <button 
                                type="submit" 
                                className="btn-hpanel btn-primary" 
                                disabled={!selectedStudentId}
                            >
                                📊 Full Report
                            </button>
                            <button 
                                type="button" 
                                className="btn-hpanel btn-secondary" 
                                onClick={() => navigate(`/progress/${selectedStudentId}`)}
                                disabled={!selectedStudentId}
                            >
                                ✏️ Insert Progress
                            </button>
                            <button 
                                type="button" 
                                className="btn-hpanel btn-secondary" 
                                onClick={() => navigate(`/veiw/${selectedStudentId}`)}
                                disabled={!selectedStudentId}
                            >
                                👁️ View Progress
                            </button>
                            <button 
                                type="button" 
                                className="btn-hpanel btn-secondary" 
                                onClick={() => navigate(`/edit/${selectedStudentId}`)}
                                disabled={!selectedStudentId}
                            >
                                ⚙️ Edit Progress
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;