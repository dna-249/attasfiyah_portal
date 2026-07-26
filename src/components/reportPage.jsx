import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import {useParams,useNavigate } from "react-router-dom"

// -------------------------------------------------------------------
// 1. DATA AND CALCULATION UTILITIES (Unchanged)
// -------------------------------------------------------------------

// Grading Scale (out of 100)
const getGradeAndRemark = (score) => {
    if (score >= 75) {
        return { Grade: "A", Remark: "EXCELLENT" };
    } else if (score >= 70) {
        return { Grade: "B", Remark: "VERY GOOD" };
    } else if (score >= 60) {
        return { Grade: "C", Remark: "GOOD" };
    } else if (score >= 50) {
        return { Grade: "D", Remark: "PASS" };
    } else if(score >= 1) {
        return { Grade: "F", Remark: "FAIL" };
    } else {
        return {Grade:"--",Remark:"--"}
    }
};

// Calculates Total, Grade, and Remark for a single subject
const calculateSubjectData = (subject) => {
    const CA1 = +subject.CA1 || 0;
    const CA2 = +subject.CA2 || 0;
    const Ass = +subject.Ass || 0;
    const Exam = +subject.Exam || 0;
    const Total = CA1 + CA2 + Ass + Exam; 
    const { Grade, Remark } = getGradeAndRemark(Total);

    return {
        ...subject,
        CA1, CA2, Ass, Exam, Total, Grade, Remark,
    };
};

// Calculates overall totals, average, and overall grade/remark

const calculateOverallData = (subjects) => {
    const initialTotals = {
        CA1_Total: 0, CA2_Total: 0, Ass_Total: 0, Exam_Total: 0, Overall_Total: 0,
    };


      let idx =[]
      
    const findLenght = (subject)=>{
        if (subject !== 0){
            idx.push(subject)
        } else return;
    }


    const sums = subjects.reduce((acc, subject) => {
        findLenght(subject.Total);
        acc.CA1_Total += subject.CA1;
        acc.CA2_Total += subject.CA2;
        acc.Ass_Total += subject.Ass;
        acc.Exam_Total += subject.Exam;

        acc.Overall_Total += subject.Total; 
        return acc;
    }, initialTotals);

    const subjectCount = idx.length;
    const avgScore = subjectCount > 0 
        ? (sums.Overall_Total / subjectCount).toFixed(2)
        : 0;
    
    const { Grade: overallGrade, Remark: overallRemark } = getGradeAndRemark(parseFloat(avgScore));

    return {
        ...sums,
        avgScore: parseFloat(avgScore),
        Overall_Total: sums.Overall_Total,
        overallGrade,
        overallRemark,
    };
};

// -------------------------------------------------------------------
// 2. REACT COMPONENT
// -------------------------------------------------------------------

const ReportPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [value,setValue] = useState(null) 

    const {id} = useParams()
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.get(`https://portal-database-seven.vercel.app/student/${id}`)
                
                if (!response.data) {
                    throw new Error("No data received from API.");
                }
                
                setValue(response.data); 
                console.log(response.data)
                
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load report data. Please check the API connection.");
                setValue({}); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]); 

    // --- Data Source for Calculations ---
    const createDataSource = (data) => {
        if (!data || Object.keys(data).length === 0) {
            return {
                subjects: [], behavior: {}, studentName: "N/A", class: "N/A",
            };
        }

        const terms = data?.term;
        const sessions= data?.session;
        const acad = data.academicYears?.[0]?.[`${sessions}`]?.[`${terms}`];
        
        return {
            school: data?.school, studentName: data?.studentName, class: data?.class,studentPhoto:data?.studentPhoto,
            term: data?.term, session: data?.session, admissionNo: data?.admissionNo,
            age: data?.age, sex: data?.sex, house: data?.house, noInClass: data?.noInClass,
            classHighest: data?.classHighest, classLowest: data?.classLowest, classPos: data?.classPos,
            headRemark: data?.headRemark, classTeacherRemark: data?.classTeacherRemark,
            
            subjects: [
                { name: "QUR'AN", CA1: acad?.QURAN?.[0]?.CA1, CA2: acad?.QURAN?.[0]?.CA2, Ass: acad?.QURAN?.[0]?.Ass, Exam: acad?.QURAN?.[0]?.Exam, Position: acad?.QURAN?.[0]?.Position || "N/A" },
                { name: "TAJWEED", CA1: acad?.TAJWEED?.[0]?.CA1, CA2: acad?.TAJWEED?.[0]?.CA2, Ass: acad?.TAJWEED?.[0]?.Ass, Exam: acad?.TAJWEED?.[0]?.Exam, Position: acad?.TAJWEED?.[0]?.Position || "N/A" },
                { name: "TAUHEED", CA1: acad?.TAUHEED?.[0]?.CA1, CA2: acad?.TAUHEED?.[0]?.CA2, Ass: acad?.TAUHEED?.[0]?.Ass, Exam: acad?.TAUHEED?.[0]?.Exam, Position: acad?.TAUHEED?.[0]?.Position || "N/A" },
                { name: "FIQH", CA1: acad?.FIQH?.[0]?.CA1, CA2: acad?.FIQH?.[0]?.CA2, Ass: acad?.FIQH?.[0]?.Ass, Exam: acad?.FIQH?.[0]?.Exam, Position: acad?.FIQH?.[0]?.Position || "N/A" },
                { name: "HADITH", CA1: acad?.HADITH?.[0]?.CA1, CA2: acad?.HADITH?.[0]?.CA2, Ass: acad?.HADITH?.[0]?.Ass, Exam: acad?.HADITH?.[0]?.Exam, Position: acad?.HADITH?.[0]?.Position || "N/A" },
                { name: "ARABIC", CA1: acad?.ARABIC?.[0]?.CA1, CA2: acad?.ARABIC?.[0]?.CA2, Ass: acad?.ARABIC?.[0]?.Ass, Exam: acad?.ARABIC?.[0]?.Exam, Position: acad?.ARABIC?.[0]?.Position || "N/A" },
                { name: "AZKHAR", CA1: acad?.AZKHAR?.[0]?.CA1, CA2: acad?.AZKHAR?.[0]?.CA2, Ass: acad?.AZKHAR?.[0]?.Ass, Exam: acad?.AZKHAR?.[0]?.Exam, Position: acad?.AZKHAR?.[0]?.Position || "N/A" },
                { name: "SIRAH", CA1: acad?.SIRAH?.[0]?.CA1, CA2: acad?.SIRAH?.[0]?.CA2, Ass: acad?.SIRAH?.[0]?.Ass, Exam: acad?.SIRAH?.[0]?.Exam, Position: acad?.SIRAH?.[0]?.Position || "N/A" },
                { name: "HURUF", CA1: acad?.HURUF?.[0]?.CA1, CA2: acad?.HURUF?.[0]?.CA2, Ass: acad?.HURUF?.[0]?.Ass, Exam: acad?.HURUF?.[0]?.Exam, Position: acad?.HURUF?.[0]?.Position || "N/A" },
            ],
            behavior: acad?.behavior || {
                moralEthics: acad?.moralEthics, punctuality: acad?.punctuality, handWriting: acad?.handWriting,
                honesty: acad?.honesty, fluency: acad?.fluency, selfControl:acad?.selfControl,
                responsibility: acad?.responsibility, initiative:acad?.initiative, politeness: acad?.politeness
            },
        };
    };

    // --- Calculated Data (UseMemo) ---
    const calculatedData = useMemo(() => {
        if (!value) return null; 

        const sourceData = createDataSource(value);
        if (!sourceData.subjects || sourceData.subjects.length === 0) {
            const emptyStats = calculateOverallData([]);
            return { ...sourceData, totalScore: 0, avgScore: 0, overallStats: emptyStats };
        }

        const automatedSubjects = sourceData.subjects.map(calculateSubjectData);
        const overallStats = calculateOverallData(automatedSubjects);

        return {
            ...sourceData,
            subjects: automatedSubjects,
            totalScore: overallStats.Overall_Total,
            avgScore: overallStats.avgScore,
            overallGrade: overallStats.overallGrade,
            overallRemark: overallStats.overallRemark,
            overallStats: overallStats,
        };
        
    }, [value]); 

    // --- Print and Download Handlers ---
    const handleDownloadPdf = () => {
        if (window.html2pdf) {
            const element = document.querySelector('.report-container');
            var opt = {
                margin: 0.2,
                filename: 'Sambo_Result_Report.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 5, media: 'print' },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            window.html2pdf().set(opt).from(element).save();
        } else {
            window.print();
        }
    };

    // --- Loading and Error States ---
    if (isLoading) {
        return (
            <div style={{display:"flex",justifyItems:"center",alignItems:"center",minHeight:"100vh"}} className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-xl font-semibold text-gray-700">
                    <svg style={{width:"32px", height:"32px"}} className="animate-spin -ml-1 mr-3 text-blue-600 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Report Data...
                </div>
            </div>
        );
    }

    if (error && !calculatedData) {
        return (
            <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-lg mx-auto mt-10">
                <h3 className="font-bold text-lg">Error Loading Data</h3>
                <p>{error}</p>
            </div>
        );
    }
    
    if (!calculatedData) return <div>No report data available.</div>;

    // --- Destructuring Data for JSX ---
    const { 
        studentName, class: studentClass, admissionNo, sex, // 'age' removed here
        totalScore, avgScore, subjects, behavior, term,
        headRemark, classTeacherRemark, overallStats,studentPhoto ,age
    } = calculatedData;
    
    // --- JSX Render ---
    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            
            <style jsx global>{`
                .report-container {
                    max-width: 8.5in;
                    margin: 0 auto;
                    background-color: white;
                    border: 1px solid #ccc;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .school-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 3px double #333;
                    padding-bottom: 10px;
                }
                .logo, .student-photo {
                    width: 70px;
                    height: 70px;
                    border: 1px solid #ddd;
                    object-fit: cover;
                    border-radius: 4px;
                    background: #eee;
                    flex-shrink: 0;
                }
                .school-info {
                    text-align: center; 
                    flex-grow: 1;
                    padding: 0 10px;
                }
                .school-name-en {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                    color: #004d40;
                }
                .report-title {
                    font-size: 1.1rem;
                    margin-top: 5px;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }
                .info-table td {
                    padding: 5px 10px;
                    border: none;
                }
                .info-table .label {
                    font-weight: 600;
                    /* Original width was 12.5% for 8 columns total (4 labels, 4 values) */
                    /* Now 6 columns (3 labels, 3 values) for 1st row, 4 (2 labels, 2 values) for 2nd row */
                    /* Re-adjusting for 3 sets of Label-Value pairs in a row (6 columns total): 16.66% label, 33.33% value */
                    width: 16.66%; 
                    color: #555;
                }
                .info-table .value{
                    font-weight: 400;
                    width: 33.33%; 
                    border-bottom: 1px dashed #ccc;
                }
                .grades-table th, .grades-table td {
                    border: 1px solid #ddd;
                    padding: 8px 5px;
                    text-align: center;
                }
                .grades-table th {
                    background-color: #e0f2f1;
                    color: #004d40;
                    font-weight: 700;
                }
                .main-header-row th:first-child {
                    background-color: #0047AB; /* Updated: Subject Header Bg Color */
                    color: white;
                }
                .behavior-table .main-header-row th {
                    background-color: #0047AB; /* New Rule: Behavior Header Bg Color */
                    color: white;
                }
                .total-row td {
                    font-weight: 700;
                    background-color: #f0f4c3;
                    color: #333;
                }
                .remarks-section {
                    margin-top: 30px;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
                .remarks-section p {
                    margin: 5px 0;
                }
                .signatures {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 30px;
                    text-align: center;
                }
                .signatures span {
                    display: block;
                    width: 40%;
                    border-top: 1px solid #000;
                    padding-top: 5px;
                    font-style: italic;
                    font-size: 0.85rem;
                }
                .print-download-btn {
                    padding: 10px 20px;
                    margin: 10px;
                    background-color: #004d40;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background-color 0.3s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .print-download-btn:hover {
                    background-color: #00695c;
                }
                @media print {
                    .print-download-btn {
                        display: none;
                    }
                    .report-container {
                        border: none;
                        box-shadow: none;
                    }
                }
                
                @media (max-width: 600px) {
                    .school-header {
                        align-items: flex-start;
                        padding: 5px;
                    }
                    .logo, .student-photo {
                        width: 50px;
                        height: 50px;
                        margin: 0;
                    }
                    .school-info {
                        padding: 0 5px;
                    }
                    .school-name-en {
                        font-size: 1rem;
                    }
                    .school-name-ar, .report-title {
                        font-size: 0.85rem;
                    }
                    
                    table {
                        font-size: 0.75rem;
                    }
                    .grades-table th, .grades-table td {
                        padding: 4px 2px;
                    }
                }
            `}</style>

            <div className="report-container">
                {/* School Header */}
                <div className="school-header">
                    
                    <div className="school-info">
                            <img src='/aiifheader.png'   style={{margin:'auto'}} height={1300} width={690} />    
                          <h3 className="report-title">STATEMENT OF RESULT</h3>
                    </div>
                    <img src={studentPhoto} alt="Student" width={140}height={100} style={{ border:"1px solid #ddd",borderRadius:"5px",padding:"5px"}} />
                </div>
                
                {/* Student Info Table - AGE column removed and TERM value field width increased */}
                <table className="info-table">
                    <tbody>
                        <tr>
                            <td className="label">NAME:</td>
                            <td className="value">{studentName}</td>
                            <td className="label">CLASS:</td>
                            <td className="value">{studentClass}</td>
                            <td className="label">TERM :</td>
                            <td className="value">{term}</td>
                        <td className="label">Age</td>
                            <td className="value">{age}</td>
                        </tr>
                        <tr>
                            <td className="label">ADMISSION:</td>
                            <td className="value">{admissionNo}</td>
                            <td className="label">SEX:</td>
                            <td className="value">{sex}</td>
                            
                            <td className="label">TOTAL SCORE:</td>
                            <td className="value">
                                <span style={{fontWeight: 'bold', color: '#004d40'}}>{totalScore}</span>
                            </td>
                            {/* AVG. SCORE row adjusted to take up full remaining space */
                            /* Note: The CSS adjusts width based on a 3-set structure per row */
                            /* For the 2nd row, since it only has 2 sets, it will naturally stretch/space out more */
                        }
                            {/* The below row contains 4 cells (2 label/value pairs) which will cause stretching */}
                            
                            <td className="label">AVG. SCORE:</td>
                            <td className="value">
                                <span style={{fontWeight: 'bold', color: '#004d40'}}>{avgScore}</span>
                            </td>
                            
                        </tr>
                    </tbody>
                </table>

                
                {/* Subject Grades Table (Updated Header Color) */}
                <table className="grades-table">
                    <thead>
                        <tr className="main-header-row">
                            <th rowSpan="2">SUBJECTS / المواد</th>
                            <th colSpan="3">C.A. (30% + Ass(10%))</th>
                            <th>EXAM (60%)</th>
                            <th rowSpan="2">TOTAL (100%)</th>
                            <th rowSpan="2">GRADE</th>
                            <th rowSpan="2">REMARK</th>
                        </tr>
                        <tr className="sub-header-row">
                            <th>CA. 1 (15%)</th>
                            <th>CA. 2 (15%)</th>
                            <th>ASS (10%)</th>
                            <th>Exam (60%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject, index) => ( 
                            <tr key={index}>
                                <td>{subject.name}</td>
                                <td>{subject.CA1}</td>
                                <td>{subject.CA2}</td>
                                <td>{subject.Ass}</td>
                                <td>{subject.Exam}</td>
                                <td>{subject.Total}</td>
                                <td>{subject.Grade}</td> 
                                <td>{subject.Remark}</td>
                            </tr>
                        ))}
                        {/* Total row: Uses dynamically calculated sums */}
                        <tr className="total-row">
                            <td>**TOTAL**</td>
                            <td>{overallStats.CA1_Total}</td>
                            <td>{overallStats.CA2_Total}</td>
                            <td>{overallStats.Ass_Total}</td>
                            <td>{overallStats.Exam_Total}</td>
                            <td>{overallStats.Overall_Total}</td>
                            <td>-</td> 
                            <td>{calculatedData.overallRemark}</td>
                        </tr>
                    </tbody>
                </table>
                
                {/* Behavior/Conduct Table (Updated Header Color) */}
                <table className="behavior-table grades-table">
                    <thead>
                        <tr className="main-header-row">
                            <th>BEHAVIOR</th>
                            <th>SCORE</th>
                            <th>SKILLS</th>
                            <th>SCORE</th>
                            <th>CONDUCT</th>
                            <th>SCORE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Moral Ethics</td><td>{behavior.moralEthics}</td>
                            <td>Hand Writing</td><td>{behavior.handWriting}</td>
                            <td>Punctuality</td><td>{behavior.punctuality}</td>
                        </tr>
                        <tr>
                            <td>Honesty</td><td>{behavior.honesty}</td>
                            <td>Fluency</td><td>{behavior.fluency}</td>
                            <td>Self Control</td><td>{behavior.selfControl}</td>
                        </tr>
                        <tr>
                            <td>Responsibility</td><td>{behavior.responsibility}</td>
                            <td>Initiative</td><td>{behavior.initiative}</td>
                            <td>Politeness</td><td>{behavior.politeness}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Remarks (Unchanged) */}
                <div className="remarks-section">
                    <p><strong>Class Teacher's Remark:</strong> {classTeacherRemark}</p>
                    <p><strong>Head of School's Remark:</strong> {headRemark}</p>
                    <div className="signatures">
                        <span>Signature & Stamp</span>
                        <span>Date</span>
                    </div>
                </div>
                
                {/* Action Buttons (Unchanged) */}
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}} className="print-button-container">
                    <button onClick={handleDownloadPdf} className="print-download-btn">
                        🖨️ Print / Download Report (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;