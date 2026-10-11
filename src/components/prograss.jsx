import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const WeeklyReport = () => {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [day, setDay] = useState('')
  const [items, setItems] = useState('')
  
  // 1. FIXED: useParams is a hook and must be called with ()
  const { id } = useParams(); 

  // --- STATES ---

  const option = () =>{
    return(<div>
        <select name="" id="" onChange={(e)=>setItems(e.target.value)}>
      {days.map((t) => (
          <option value={t.slice(0,3).toLocaleLowerCase()}>{t}</option>
      ))}
      </select>
    </div>)
  }
  const [teacherData, setTeacherData] = useState([{
      day:option(), date: '', remark: '', total: '', tajweed: '', 
      hifz: '', tajError: '', hifzError: '', toV: '', fromV: '', chapter: '' 
    }]
  );
  
  const [teacherComments, setTeacherComments] = useState({ week: '', term: '', comment: '', name: '', signature: '' });
  
  const [mgmtData, setMgmtData] = useState({
    newHifz: { starting: '', stopping: '', score: '', grade: '', remark: '' },
    prevHifz: { starting: '', stopping: '', score: '', grade: '', remark: '' },
    hodComment: ''
  });

  const [parentData, setParentData] = useState({ name: '', comment: '', date: '' });
  const [status, setStatus] = useState({ teacher: 'idle', mgmt: 'idle', parent: 'idle' });
  useEffect(()=>{
    async function fech(params) {
      await axios.get(
        `https://portal-database-seven.vercel.app/student/${id}`)
    };fech()
    
  },[id])

  // --- POST HANDLER ---a
  const submitToBackend = async (section) => {
    setStatus(prev => ({ ...prev, [section]: 'loading' }));
    
    try {
      // 2. FIXED: Accessing teacherData as an array and combining with single state objects
      const payload = {
        // We send the entire array of daily records
         ...teacherData, 
        // Metadata from teacherComments
        week: teacherComments.week,
        term: teacherComments.term,
        teacherComment: teacherComments.comment,
        teacherName: teacherComments.name,
        teacherSign: teacherComments.signature,
        // Management data
        management: mgmtData,
        // Parent data
        parent: parentData
      };

      const response = await axios.put(
        `https://portal-database-seven.vercel.app/student/push/${id}/${items}`, 
       {
          date:teacherData[0]?.date,
          tajweed:teacherData[0]?.tajweed,
          hifz:teacherData[0]?.hifz,
          tajError:teacherData[0]?.tajError,
          hifzError:teacherData[0]?.hifzError,
          toV:teacherData[0]?.toV,
          fromV:teacherData[0]?.fromV,
          chapter:teacherData[0]?.chapter,
          weeks:teacherData[0]?.week,
          terms:teacherData[0]?.term, 
          teacherComment:teacherComments.comment,
          teacherName:teacherComments.name, 
          teacherSign:teacherComments.signature , 
          newStarting: mgmtData.newHifz.starting,
          newStopping: mgmtData.newHifz.stopping,
          newScore: mgmtData.newHifz.score,
          hodComment: mgmtData.hodComment,
          prevStarting: mgmtData.prevHifz.starting,
          preStopping: mgmtData.prevHifz.stopping, 
          preScore: mgmtData.prevHifz.score,
        
        }
      );
      
      // 3. FIXED: Axios uses response.status (Fetch uses response.ok)
      if (response.status === 200 || response.status === 204) {
        setStatus(prev => ({ ...prev, [section]: 'success' }));
        setTimeout(() => setStatus(prev => ({ ...prev, [section]: 'idle' })), 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus(prev => ({ ...prev, [section]: 'error' }));
      setTimeout(() => setStatus(prev => ({ ...prev, [section]: 'idle' })), 5000);
    }
  };

  // --- UI COMPONENTS ---z
  const StatusMessage = ({ type }) => {
    if (type === 'idle') return null;
    const config = {
      loading: { text: 'Saving changes...', color: 'text-blue-600', icon: '🔄' },
      success: { text: 'Report saved successfully!', color: 'text-green-600', icon: '✅' },
      error: { text: 'Failed to save. Try again.', color: 'text-red-600', icon: '❌' }
    };
    return (
      <div className={`flex items-center gap-2 font-bold text-[12px] ${config[type].color}`}>
        <span>{config[type].icon}</span> {config[type].text}
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
        <StatusMessage type={status[section]} />
      </div>
    );
  };

  const inputClass = "w-full h-full bg-transparent text-center focus:bg-blue-50 outline-none transition-all";
  const underlineInput = "border-b border-dotted border-black px-2 focus:bg-blue-50 outline-none";

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white text-[11px] leading-tight text-black font-sans">
      
      {/* --- TEACHER SECTION --- */}
      <section className="mb-10 border-b-2 border-gray-300 pb-8">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-4 tracking-tighter">TEACHER'S WEEKLY REPORT</h1>
        
        <div className="flex justify-between mb-4 font-bold text-[12px]">
          <div>Week <input className={underlineInput} value={teacherComments.week} onChange={e => setTeacherComments({...teacherComments, week: e.target.value})} /> الأسبوع</div>
          <div>Term <input className={underlineInput} value={teacherComments.term} onChange={e => setTeacherComments({...teacherComments, term: e.target.value})} /> الفترة</div>
        </div>

        <table className="w-full border-collapse border border-black mb-4">
          <thead className="bg-gray-100 uppercase text-[9px]">
            <tr className="h-12">
              <th className="border border-black p-1">التاريخ<br/>Date</th>
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
            {teacherData.map((row, idx) => (
              <tr key={idx} className="h-8">
                {['date', 'tajweed', 'hifz', 'tajError', 'hifzError', 'toV', 'fromV', 'chapter'].map((field) => (
                  <td key={field} className="border border-black">
                    <input 
                      type={field === "date" ? "date" : "text"} 
                      className={inputClass} 
                      value={row[field]} 
                      onChange={(e) => {
                        const updated = [...teacherData];
                        updated[idx][field] = e.target.value;
                        setTeacherData(updated);
                      }} 
                    />
                  </td>
                ))}
                <td  className= "border border-black bg-gray-50 font-bold text-center">{row.day}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-y-4 mb-4">
          <div className="col-span-2">Teacher's Comments: <input className="w-3/4 border-b border-black outline-none" value={teacherComments.comment} onChange={e => setTeacherComments({...teacherComments, comment: e.target.value})} /> ملاحظات المعلم</div>
          <div>Signature: <input className={underlineInput} value={teacherComments.signature} onChange={e => setTeacherComments({...teacherComments, signature: e.target.value})} /> التوقيع</div>
          <div className="text-right">Teacher's Name: <input className={underlineInput} value={teacherComments.name} onChange={e => setTeacherComments({...teacherComments, name: e.target.value})} /> اسم المعلم</div>
        </div>
        
        <SubmitButton section="teacher" label="Submit Teacher Report" onClick={() => submitToBackend('teacher', 'teacher-report', { teacherData, teacherComments })} />
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
                    <input className={inputClass} value={mgmtData[topic.k][field]} onChange={e => setMgmtData({...mgmtData, [topic.k]: {...mgmtData[topic.k], [field]: e.target.value}})} />
                  </td>
                ))}
                <td className="border border-black font-bold bg-gray-50 text-[10px]">{topic.l}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mb-4 font-bold">
          Qur'an HOD's Comment: <input className="w-3/4 border-b border-black outline-none font-normal" value={mgmtData.hodComment} onChange={e => setMgmtData({...mgmtData, hodComment: e.target.value})} /> ملاحظات رئيس القسم
        </div>
        
        <SubmitButton section="mgmt" label="Submit Management Report" onClick={() => submitToBackend('mgmt', 'management-report', mgmtData)} />
      </section>

      {/* --- PARENT SECTION --- */}
      {/* <section className="mb-6">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-4 uppercase">Parent/Guardian's Weekly Report</h2>
        <p className="mb-4 leading-relaxed text-[12px] italic text-gray-800">
          I, <input className={underlineInput} value={parentData.name} onChange={e => setParentData({...parentData, name: e.target.value})} /> the Parent/Guardian of the above named pupil/ward hereby certified that, I listened, observed and supervised my child's/ward's progress for this week in comparison with the school report and Allah is my witness.
        </p>
        <div className="space-y-4 mb-4">
          <div className="font-bold">Parent/Guardian's Comment: <input className="w-2/3 border-b border-black outline-none font-normal" value={parentData.comment} onChange={e => setParentData({...parentData, comment: e.target.value})} /></div>
          <div className="font-bold">Sign/Date: <input className={underlineInput} type="date" value={parentData.date} onChange={e => setParentData({...parentData, date: e.target.value})} /></div>
        </div>

        <SubmitButton section="parent" label="Submit Parent Report" onClick={() => submitToBackend('parent', 'parent-report', parentData)} />
      </section> */}

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

export default WeeklyReport;