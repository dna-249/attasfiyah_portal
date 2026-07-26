import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [filterText, setFilterText] = useState(''); // State for student filter
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const primaryColor = '#0047AB'; // Dark Blue
    const accentGreen = '#10b981';  // Green

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

    // Auto-select the first student in the filtered list if the current selection is filtered out
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
            <div className="admin-dashboard-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
                <p style={{ fontSize: '1.2rem', color: primaryColor, marginTop: '15px', fontWeight: '600' }}>Loading Dashboard...</p>
                <style>{`
                    .spinner { width: 50px; height: 50px; border: 5px solid #e0e7ff; border-top-color: ${primaryColor}; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
                 <div className="dashboard-card" style={{ borderTop: '5px solid #ef4444' }}>
                     <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Data Error ❌</h2>
                     <p style={{ color: '#4b5563' }}>{error}</p>
                     <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6b7280' }}>Check the API status: <code>https://portal-database.vercel.app/student</code></p>
                 </div>
            </div>
        );
    }
    
    return (
        <div className="admin-dashboard-container">
            <style>{`
                .admin-dashboard-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #f4f7f6;
                    padding: 2rem 1rem;
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .dashboard-card {
                    width: 100%;
                    max-width: 750px;
                    background-color: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                    padding: 40px;
                    border: 1px solid #eaeaea;
                }
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .dashboard-header h1 {
                    font-size: 2rem;
                    color: ${primaryColor};
                    margin: 15px 0 5px;
                    font-weight: 700;
                }
                .dashboard-header p {
                    color: #6b7280;
                    font-size: 1.1rem;
                }
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #f3f4f6;
                    padding-bottom: 8px;
                }
                .action-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .btn {
                    padding: 14px 20px;
                    font-size: 1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
                }
                .btn-primary { background-color: ${primaryColor}; }
                .btn-primary:hover { background-color: #003685; }
                .btn-success { background-color: ${accentGreen}; }
                .btn-success:hover { background-color: #059669; }
                
                .lookup-section {
                    background-color: #f9fafb;
                    padding: 25px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }
                .form-group {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .input-field, .select-field {
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus, .select-field:focus {
                    border-color: ${primaryColor};
                }
                .input-field {
                    flex: 1;
                }
                .select-field {
                    flex: 2;
                    background-color: white;
                    cursor: pointer;
                }
                .student-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                .logout-btn {
                    margin-top: 30px;
                    width: 100%;
                    padding: 12px;
                    background: #fef2f2;
                    color: #ef4444;
                    font-weight: 600;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .logout-btn:hover {
                    background: #fee2e2;
                }

                /* Responsive adjustments */
                @media (max-width: 600px) {
                    .dashboard-card { padding: 25px 20px; }
                    .action-grid, .student-actions-grid { grid-template-columns: 1fr; }
                    .form-group { flex-direction: column; }
                    .input-field, .select-field { width: 100%; }
                }
            `}</style>

            <div className="dashboard-card">
                <div className="dashboard-header">
                    <img src="/aiiflogo.png" alt="Logo" style={{ margin: 'auto', display: 'block' }} width={90} height={90} />
                    <h1>Welcome, Administrator</h1>
                    <p>Manage students, track progress, and update records.</p>
                </div>

                {/* --- General Administrative Tasks --- */}
                <h3 className="section-title">General Tasks</h3>
                <div className="action-grid">
                    <button className="btn btn-success" onClick={() => navigate('/signup')}>
                        ➕ Register New Student
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/entry')}>
                        📝 Data Entry Page
                    </button>
                </div>

                {/* --- Student Specific Tasks --- */}
                <div className="lookup-section">
                    <h3 className="section-title" style={{ borderBottom: 'none', marginBottom: '10px' }}>
                        Student Management
                    </h3>
                    
                    {/* Search & Select Form */}
                    <form onSubmit={handleViewReport}>
                        <div className="form-group">
                            <input 
                                type="text" 
                                className="input-field"
                                placeholder="🔍 Filter by name..." 
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            <select
                                className="select-field"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="" disabled>--- Select a Student ---</option>
                                {filteredStudents.map(student => (
                                    <option key={student._id} value={student._id}>
                                        {student.studentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {filteredStudents.length === 0 && (
                            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '-10px', marginBottom: '15px' }}>
                                No students found matching "{filterText}"
                            </p>
                        )}

                        {/* Selected Student Actions */}
                        <div className="student-actions-grid">
                            <button type="submit" className="btn btn-primary" disabled={!selectedStudentId}>
                                📊 View Full Report
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-success" 
                                onClick={() => navigate(`/progress/${selectedStudentId}`)}
                                disabled={!selectedStudentId}
                            >
                                ✏️ Insert Progress
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={() => navigate(`/veiw/${selectedStudentId}`)}
                                disabled={!selectedStudentId}
                            >
                                👁️ View Progress
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-success" 
                                onClick={() => navigate(`/edit/${selectedStudentId}`)}
                                disabled={!selectedStudentId}
                            >
                                ⚙️ Edit Progress
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- Logout --- */}
                <button className="logout-btn" onClick={() => navigate('/')}>
                    🔒 Secure Logout
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;