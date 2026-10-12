import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const Edit = () => {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const func = (id) => (id === 'Thursday' ? id.slice(0, 4).toLocaleLowerCase() : id.slice(0, 3).toLocaleLowerCase());

  const [response, setResponse] = useState(null);
  const [day, setDay] = useState('sat');
  const [increase, setIncrease] = useState(0);
  const [ids, setIds] = useState(0);

  const { id } = useParams(); 

  // --- SELECTOR STATES ---
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedTerm, setSelectedTerm] = useState('thirdTerm');

  // --- FORM OVERRIDE STATES ---
  const [teacherData, setTeacherData] = useState({});
  const [teacherComments, setTeacherComments] = useState({ week: '', term: '', comment: '', name: '', signature: '' });
  const [mgmtData, setMgmtData] = useState({ hodComment: '' });
  const [parentData, setParentData] = useState({ name: '', comment: '', date: '' });
  const [status, setStatus] = useState({ teacher: 'idle', mgmt: 'idle', parent: 'idle' });

  const getGradeAndRemark = (score) => {
    const num = parseFloat(score);
    if (num >= 75) return { Grade: "A", Remark: "EXCELLENT" };
    if (num >= 70) return { Grade: "B", Remark: "VERY GOOD" };
    if (num >= 60) return { Grade: "C", Remark: "GOOD" };
    if (num >= 50) return { Grade: "D", Remark: "PASS" };
    if (num >= 1) return { Grade: "F", Remark: "FAIL" };
    return { Grade: "--", Remark: "--" };
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://portal-database-seven.vercel.app/student/${id}`);
        const studentRecord = res.data?.student || res.data?.data || res.data;
        
        if (!studentRecord) throw new Error("No data received from API.");
        
        setResponse(studentRecord);

        
        const currentYearBlock = studentRecord?.academicYears?.[0] || {};
        const availableYears = Object.keys(currentYearBlock?.['0'] || currentYearBlock).filter(k => k !== '_id' && /^\d+$/.test(k));
        if (availableYears.length > 0) setSelectedYear(availableYears[availableYears.length - 1]);
        if (studentRecord?.term) setSelectedTerm(studentRecord.term);


      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Extract nested term data matching `academicYears[0]['0'][activeYear][activeTerm]`
  const getNestedTermData = () => {
    if (!response) return {};
    
    const ay0 = response?.academicYears?.[0];
    if (ay0) {
      if (ay0?.[selectedYear]?.[selectedTerm]) {
        return ay0?.[selectedYear]?.[selectedTerm];
      }
      if (ay0[selectedYear]?.[selectedTerm]) {
        return ay0[selectedYear][selectedTerm];
      }
    }
    
    return response?.[selectedYear]?.[selectedTerm] || {};
  };

  const currentTermData = getNestedTermData();
  console.log(currentTermData)

  const currentYearBlock = response?.academicYears?.[0] || {};
  const yearContainer = currentYearBlock?.['0'] || currentYearBlock;
  const availableYears = Object.keys(yearContainer).filter(k => k !== '_id' && /^\d+$/.test(k));

  const maxRecords = Math.max(
    currentTermData?.sat?.length || 0,
    currentTermData?.sun?.length || 0,
    currentTermData?.mon?.length || 0,
    1
  );

  const move = () => {
    setTeacherData({}); 
    if (increase >= maxRecords - 1) {
      setIncrease(0);
    } else {
      setIncrease(prev => prev + 1);
    }
  };

  const back = () => {
    setTeacherData({}); 
    if (increase === 0) {
      setIncrease(maxRecords - 1);
    } else {
      setIncrease(prev => prev - 1);
    }
  };

  const totalScore = (hifz, hifzError, tajweed, tajError) => {
    const cal = (parseInt(hifz) || 0) + (parseInt(tajweed) || 0);
    const calErr = (parseInt(hifzError) || 0) + (parseInt(tajError) || 0);
    
    if (hifz || hifzError || tajError || tajweed) {
      return { total: cal - calErr };
    }
    return { total: "--" };
  };

  const createDataSource = (dayKey, fieldKey) => {
    if (teacherData[dayKey]?.[fieldKey] !== undefined) {
      return teacherData[dayKey][fieldKey];
    }

    const dayArray = currentTermData?.[dayKey] || [];
    const record = dayArray[increase] || {};

    const { total } = totalScore(record.hifz, record.hifzError, record.tajweed, record.tajError);
    const { Remark } = getGradeAndRemark(total);

    if (fieldKey === 'total') return total;
    if (fieldKey === 'remark') return Remark;

    return record[fieldKey] !== undefined ? record[fieldKey] : '';
  };

  const managementFunc = () => {
    const daysList = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    const weekLogs = daysList.map(d => currentTermData?.[d]?.[increase]).filter(log => log && typeof log === 'object');
    
    const newHifzLogs = weekLogs.filter(log => log.hifz || log.chapter || log.fromV);
    let newStarting = '--', newStopping = '--', newScoreVal = 0;

    if (newHifzLogs.length > 0) {
      const first = newHifzLogs[0];
      const last = newHifzLogs[newHifzLogs.length - 1];
      newStarting = first.chapter ? `${first.chapter} (${first.fromV || '1'})` : (first.fromV || '--');
      newStopping = last.chapter ? `${last.chapter} (${last.toV || 'end'})` : (last.toV || '--');

      const totalHifz = newHifzLogs.reduce((acc, log) => {
        const { total } = totalScore(log.hifz, log.hifzError, log.tajweed, log.tajError);
        return acc + (parseFloat(total) || 0);
      }, 0);
      newScoreVal = (totalHifz / newHifzLogs.length).toFixed(0);
    }

    const preScoreObj = currentTermData?.preScore?.[increase];
    const preStartObj = currentTermData?.prevStarting?.[increase];
    const preStopObj = currentTermData?.preStopping?.[increase];

    const preScoreVal = typeof preScoreObj === 'object' ? (preScoreObj?.preScore || '') : (preScoreObj || '');
    const preStarting = typeof preStartObj === 'object' ? (preStartObj?.prevStarting || '') : (preStartObj || '');
    const preStopping = typeof preStopObj === 'object' ? (preStopObj?.preStopping || '') : (preStopObj || '');

    const nScore = getGradeAndRemark(newScoreVal);
    const pScore = getGradeAndRemark(preScoreVal);

    return {
      hodComment: currentTermData?.hodComment?.[increase]?.hodComment || '',
      newHifz: { 
        starting: newStarting, 
        stopping: newStopping, 
        score: newHifzLogs.length > 0 ? newScoreVal : '--', 
        grade: nScore.Grade, 
        remark: nScore.Remark 
      },
      prevHifz: { 
        starting: preStarting || '--', 
        stopping: preStopping || '--', 
        score: preScoreVal || '--', 
        grade: pScore.Grade, 
        remark: pScore.Remark 
      }
    };
  };

  // --- SUBMIT HANDLER ---
  const submitToBackend = async (section) => {
    setStatus(prev => ({ ...prev, [section]: 'loading' }));
    
    try {
      const activeDayData = {
        date: createDataSource(day, 'date'),
        tajweed: createDataSource(day, 'tajweed'),
        hifz: createDataSource(day, 'hifz'),
        tajError: createDataSource(day, 'tajError'),
        hifzError: createDataSource(day, 'hifzError'),
        toV: createDataSource(day, 'toV'),
        fromV: createDataSource(day, 'fromV'),
        chapter: createDataSource(day, 'chapter')
      };

      const mgmt = managementFunc();

      const response = await axios.put(
        `[https://portal-database-seven.vercel.app/student/edit/$](https://portal-database-seven.vercel.app/student/edit/$){id}/${day}/${increase}`, 
        {
          year: selectedYear,
          term: selectedTerm,
          ...activeDayData,
          weeks: teacherComments?.week || currentTermData?.weeks?.[increase]?.weeks || '',
          terms: teacherComments?.term || currentTermData?.terms?.[increase]?.terms || '', 
          teacherComment: teacherComments.comment || currentTermData?.teacherComment?.[increase]?.teacherComment || '',
          teacherName: teacherComments.name || currentTermData?.teacherName?.[increase]?.teacherName || '', 
          teacherSign: teacherComments.signature || currentTermData?.teacherSign?.[increase]?.teacherSign || '', 
          newStarting: mgmt.newHifz.starting,
          newStopping: mgmt.newHifz.stopping,
          newScore: mgmt.newHifz.score,
          hodComment: mgmtData.hodComment || mgmt.hodComment,
          prevStarting: mgmt.prevHifz.starting,
          preStopping: mgmt.prevHifz.stopping, 
          preScore: mgmt.prevHifz.score,
          parentName: parentData.name || currentTermData?.parentName?.[increase]?.parentName || '',
          parentComment: parentData.comment || currentTermData?.parentComment?.[increase]?.parentComment || '',
          parentDate: parentData.date || currentTermData?.parentDate?.[increase]?.parentDate || ''
        }
      );
      
      if (response.status === 200 || response.status === 204) {
        setStatus(prev => ({ ...prev, [section]: 'success' }));
        setTimeout(() => setStatus(prev => ({ ...prev, [section]: 'idle' })), 3000);
      }
    } catch (error) {
      console.error("Submission error details:", error.response?.data || error.message);
      setStatus(prev => ({ ...prev, [section]: 'error' }));
      setTimeout(() => setStatus(prev => ({ ...prev, [section]: 'idle' })), 5000);
    }
  };

  const StatusMessage = ({ type }) => {
  // Hide if status is idle or not provided
  if (!type || type === 'idle') return null;

  const config = {
    loading: { text: 'Saving changes...', colorClass: 'text-blue-600', textColor: '#2563eb', icon: '🔄' },
    success: { text: 'Report saved successfully!', colorClass: 'text-green-600', textColor: '#16a34a', icon: '✅' },
    error: { text: 'Failed to save. Try again.', colorClass: 'text-red-600', textColor: '#dc2626', icon: '❌' }
  };

  const current = config[type];

  // Fallback to null if an invalid type string is passed
  if (!current) return null;

  return (
    <div 
      className={`flex items-center gap-2 font-bold text-[12px] ${current.colorClass}`}
      style={{ color: current.textColor }}
    >
      <span>{current.icon}</span> 
      <span>{current.text}</span>
    </div>
  );
};

  const SubmitButton = ({ section, onClick, label }) => {
    const isIdle = status[section] === 'idle';
    return (
      <div className="flex items-center gap-4 mt-4 print:hidden">
        <button
          onClick={onClick}
          disabled={!isIdle}
          className={`px-6 py-2 rounded font-bold text-white transition-all ${
            !isIdle ? 'bg-gray-400' : 'bg-blue-800 hover:bg-blue-900'
          }`}
        >
          {status[section] === 'loading' ? 'Processing...' : label}
        </button>
        <StatusMessage type="{status[section]}"/>
      </div>
    );
  };

  const inputClass = "w-full h-full bg-transparent text-center focus:bg-blue-50 outline-none transition-all";
  const underlineInput = "border-b border-dotted border-black px-2 focus:bg-blue-50 outline-none";

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white text-[11px] leading-tight text-black font-sans">
      
      {/* --- YEAR & TERM SELECTOR BAR --- */}
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded mb-6 border border-gray-300 print:hidden">
        <div className="flex items-center gap-2 font-bold">
          <label>Academic Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => { setSelectedYear(e.target.value); setIncrease(0); setTeacherData({}); }}
            className="border border-gray-400 px-2 py-1 rounded bg-white outline-none cursor-pointer"
          >
            {availableYears.length > 0 ? (
              availableYears.map((yr) => <option key={yr} value={yr}>{yr}</option>)
            ) : (
              <option value="2026">2026</option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-2 font-bold">
          <label>Academic Term:</label>
          <select 
            value={selectedTerm} 
            onChange={(e) => { setSelectedTerm(e.target.value); setIncrease(0); setTeacherData({}); }}
            className="border border-gray-400 px-2 py-1 rounded bg-white outline-none cursor-pointer"
          >
            <option value="firstTerm">First Term</option>
            <option value="secondTerm">Second Term</option>
            <option value="thirdTerm">Third Term</option>
          </select>
        </div>
      </div>

      {/* --- TEACHER SECTION --- */}
      <section className="mb-10 border-b-2 border-gray-300 pb-8">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-4 tracking-tighter">
          TEACHER'S WEEKLY REPORT ({selectedYear} - {selectedTerm.toUpperCase()})
        </h1>
        
        <div className="flex justify-between mb-4 font-bold text-[12px]">
          <div>
            Week{' '}
            <input 
              className={underlineInput} 
              value={teacherComments.week || currentTermData?.weeks?.[increase]?.weeks || ''} 
              onChange={e => setTeacherComments({...teacherComments, week: e.target.value})} 
            />{' '}
            الأسبوع
          </div>
          <div className="cursor-pointer hover:text-blue-600 pr-12" onClick={back}> <FaArrowAltCircleLeft size={18} /> </div>
          <div className="cursor-pointer hover:text-blue-600 pr-12" onClick={move}>  <FaArrowAltCircleRight size={18} /> </div>
           <div>
            Term{' '}
            <input 
              className={underlineInput} 
              value={teacherComments.term || currentTermData?.terms?.[increase]?.terms || ''} 
              onChange={e => setTeacherComments({...teacherComments, term: e.target.value})} 
            />{' '}
            الفترة
          </div>
        </div>

        <table className="w-full border-collapse border border-black mb-4">
          <thead className="bg-gray-100 uppercase text-[9px]">
            <tr className="h-12">
              <th className="border border-black p-1">التاريخ<br/>Date</th>
              <th className="border border-black p-1">التقدير<br/>Remark</th>
              <th className="border border-black p-1 w-12">مجموع<br/>Total (100)</th>
              <th className="border border-black p-1">درجة التجويد<br/>Tajweed (30)</th>
              <th className="border border-black p-1">درجة الحفظ<br/>Hifz (70)</th>
              <th className="border border-black p-1">أخطاء تجويدية<br/>Tajweed Rule</th>
              <th className="border border-black p-1">أخطاء حفظية<br/>Hifz Point</th>
              <th className="border border-black p-1">إلى آية<br/>To Verse</th>
              <th className="border border-black p-1">من آية<br/>From Verse</th>
              <th className="border border-black p-1">سورة<br/>Chapters</th>
              <th className="border border-black p-1 bg-gray-200 uppercase">Days<br/>الأيام</th>
            </tr>
          </thead>
          <tbody>
            {days.map((dayName, idx) => {
              const dayKey = func(dayName);
              return (
                <tr key={dayKey} className="h-8">
                  {['date', 'remark', 'total', 'tajweed', 'hifz', 'tajError', 'hifzError', 'toV', 'fromV', 'chapter'].map((fieldKey) => (
                    <td key={fieldKey} className="border border-black">
                      <input 
                        type={fieldKey === "date" ? "date" : "text"} 
                        className={inputClass} 
                        value={createDataSource(dayKey, fieldKey)}
                        readOnly={fieldKey === 'remark' || fieldKey === 'total'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTeacherData(prev => ({
                            ...prev,
                            [dayKey]: {
                              ...prev[dayKey],
                              [fieldKey]: val
                            }
                          }));
                          setDay(dayKey);
                          setIds(idx);
                        }} 
                      />
                    </td>
                  ))}
                  <td 
                    onClick={() => setDay(dayKey)} 
                    className={`border border-black font-bold text-center cursor-pointer transition-all ${
                      day === dayKey ? "bg-blue-600 text-white" : "bg-gray-50 text-black hover:bg-gray-200"
                    }`}
                  >
                    {dayKey.toUpperCase()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-y-4 mb-4">
          <div className="col-span-2">
            Teacher's Comments:{' '}
            <input 
              className="w-3/4 border-b border-black outline-none" 
              value={teacherComments.comment || currentTermData?.teacherComment?.[increase]?.teacherComment || ''} 
              onChange={e => setTeacherComments({...teacherComments, comment: e.target.value})} 
            />{' '}
            ملاحظات المعلم
          </div>
          <div>
            Signature:{' '}
            <input 
              className={underlineInput} 
              value={teacherComments.signature || currentTermData?.teacherSign?.[increase]?.teacherSign || ''} 
              onChange={e => setTeacherComments({...teacherComments, signature: e.target.value})} 
            />{' '}
            التوقيع
          </div>
          <div className="text-right">
            Teacher's Name:{' '}
            <input 
              className={underlineInput} 
              value={teacherComments.name || currentTermData?.teacherName?.[increase]?.teacherName || ''} 
              onChange={e => setTeacherComments({...teacherComments, name: e.target.value})} 
            />{' '}
            اسم المعلم
          </div>
        </div>
         <SubmitButton section="teacher" label="Submit Teacher Report" onClick={() => submitToBackend('teacher')} />
      </section>


      {/* --- MANAGEMENT SECTION --- */}
      <section className="mb-10 border-b-2 border-gray-300 pb-8">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-4 uppercase">Management Weekly Report</h2>
        <table className="w-full border-collapse border border-black text-center mb-4">
          <thead className="bg-gray-100 h-10 uppercase text-[9px]">
            <tr>
              <th className="border border-black p-1">التطبيق<br/>Remark</th>
              <th className="border border-black p-1">الدرجة<br/>Grade</th>
              <th className="border border-black p-1">النتيجة<br/>Score</th>
              <th className="border border-black p-1">الإنتهاء<br/>Stopping</th>
              <th className="border border-black p-1">الإبتداء<br/>Starting</th>
              <th className="border border-black p-1 bg-gray-200 w-40 font-bold">الموضوع<br/>Topic</th>
            </tr>
          </thead>
          <tbody>
            {[{l:'الحفظ الجديد New Hifz', k:'newHifz'}, {l:'الحفظ السابق Prev Hifz', k:'prevHifz'}].map((topic) => (
              <tr key={topic.k} className="h-12">
                {['remark', 'grade', 'score', 'stopping', 'starting'].map(field => (
                  <td key={field} className="border border-black">
                    <input className={inputClass} readOnly value={managementFunc()[topic.k][field] || ''} />
                  </td>
                ))}
             <input className={inputClass} readOnly value={managementFunc()[topic.l][field] || ''} />
    </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mb-4 font-bold">
          Qur'an HOD's Comment:{' '}
          <input 
            className="w-3/4 border-b border-black outline-none font-normal" 
            value={mgmtData.hodComment || currentTermData?.hodComment?.[increase]?.hodComment || ''} 
            onChange={e => setMgmtData({...mgmtData, hodComment: e.target.value})} 
          />{' '}
          ملاحظات رئيس القسم
        </div>
        <SubmitButton section="mgmt" label="Submit Management Report" onClick={() => submitToBackend('mgmt')} />  </section>

      {/* --- PARENT SECTION --- */} 
      <section className="mb-6">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-4 uppercase">Parent/Guardian's Weekly Report</h2>
        <p className="mb-4 leading-relaxed text-[12px] italic text-gray-800">
          I,{' '}
          <input 
            className={underlineInput} 
            value={parentData.name || currentTermData?.parentName?.[increase]?.parentName || ''} 
            onChange={e => setParentData({...parentData, name: e.target.value})} 
          />{' '}
          the Parent/Guardian of the above named pupil/ward hereby certified that, I listened, observed and supervised my child's/ward's progress for this week in comparison with the school report and Allah is my witness.
        </p>
        <div className="space-y-4 mb-4">
          <div className="font-bold">
            Parent/Guardian's Comment:{' '}
            <input 
              className="w-2/3 border-b border-black outline-none font-normal" 
              value={parentData.comment || currentTermData?.parentComment?.[increase]?.parentComment || ''} 
              onChange={e => setParentData({...parentData, comment: e.target.value})} 
            />
          </div>
          <div className="font-bold">
            Sign/Date:{' '}
            <input 
              className={underlineInput} 
              type="date" 
              value={parentData.date || currentTermData?.parentDate?.[increase]?.parentDate || ''} 
              onChange={e => setParentData({...parentData, date: e.target.value})} 
            />
          </div>
        </div>
              
      <SubmitButton section="parent" label="Submit Parent Report" onClick={() => submitToBackend('parent')} />
      </section>

      {/* --- GRADING KEY --- */}
      <div className="flex w-full border border-black text-center font-bold text-[10px] uppercase mt-10 bg-gray-50">
        <div className="flex-1 border-r border-black p-2">70-100 EXCELLENT (A)</div>
        <div className="flex-1 border-r border-black p-2">60-69 VERY GOOD (B)</div>
        <div className="flex-1 border-r border-black p-2">50-59 GOOD (C)</div>
        <div className="flex-1 border-r border-black p-2">40-49 PASS (D)</div>
        <div className="flex-1 p-2">0-39 FAIL (F)</div>
      </div>
    </div>
  );
};

export default Edit;