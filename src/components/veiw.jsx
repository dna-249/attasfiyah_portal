import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const WeeklyReportView = () => {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const lower = days.map((items) => items.slice(0, 3).toLowerCase());

  const [response, setResponse] = useState(null);
  const [increase, setIncrease] = useState(0);
  const { id } = useParams();

  // --- STATES ---
  const [teacherData, setTeacherData] = useState(
    lower.map((day) => ({
      day,
      date: '',
      remark: '',
      total: '',
      tajweed: '',
      hifz: '',
      tajError: '',
      hifzError: '',
      toV: '',
      fromV: '',
      chapter: ''
    }))
  );

  const [teacherComments, setTeacherComments] = useState({
    week: '',
    term: '',
    comment: '',
    name: '',
    signature: ''
  });

  const [mgmtData, setMgmtData] = useState({
    hodComment: ''
  });

  const [parentData, setParentData] = useState({ name: '', comment: '', date: '' });
  const [status, setStatus] = useState({ teacher: 'idle', mgmt: 'idle', parent: 'idle' });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://portal-database-seven.vercel.app/student/${id}`);
        if (!res.data) {
          throw new Error('No data received from API.');
        }
        setResponse(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    if (id) fetchData();
  }, [id]);

  // --- SAFE ACADEMIC TERM EXTRACTOR ---
  const activeYear = response?.session || '2026';
  const activeTerm = response?.term || 'thirdTerm';

  const getNestedTermData = () => {
    if (!response?.academicYears) return {};
    const ay = response.academicYears[0];
    if (!ay) return {};
    const yearContainer = ay['0'] || ay;
    const termContainer = yearContainer?.[activeYear] || ay?.[activeYear];
    return termContainer?.[activeTerm] || {};
  };

  const currentTermData = getNestedTermData();

  // --- HELPER FUNCTIONS ---
  const getGradeAndRemark = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 75) return { Grade: 'A', Remark: 'EXCELLENT' };
    if (numScore >= 70) return { Grade: 'B', Remark: 'VERY GOOD' };
    if (numScore >= 60) return { Grade: 'C', Remark: 'GOOD' };
    if (numScore >= 50) return { Grade: 'D', Remark: 'PASS' };
    if (numScore >= 1) return { Grade: 'F', Remark: 'FAIL' };
    return { Grade: '--', Remark: '--' };
  };

  const totalScore = (hifz, hifzError, tajweed, tajError) => {
    const cal = (parseInt(hifz) || 0) + (parseInt(tajweed) || 0);
    const calErr = (parseInt(hifzError) || 0) + (parseInt(tajError) || 0);

    if (hifz || hifzError || tajError || tajweed) {
      return { total: cal - calErr };
    }
    return { total: '--' };
  };

  // --- PAGINATION LOGIC ---
  const maxRecords = Math.max(
    currentTermData?.sat?.length || 0,
    currentTermData?.sun?.length || 0,
    currentTermData?.mon?.length || 0,
    1
  );

  const move = () => {
    if (maxRecords <= 1) return;
    if (increase >= maxRecords - 1) {
      setIncrease(0);
    } else {
      setIncrease((prev) => prev + 1);
    }
  };

  const back = () => {
    if (maxRecords <= 1) return;
    if (increase === 0) {
      setIncrease(maxRecords - 1);
    } else {
      setIncrease((prev) => prev - 1);
    }
  };

  // --- DATA SOURCE CREATORS ---
  const managementFunc = () => {
    const newScoreObj = currentTermData?.newScore?.[increase];
    const preScoreObj = currentTermData?.preScore?.[increase];
    const newStartObj = currentTermData?.newStarting?.[increase];
    const newStopObj = currentTermData?.newStopping?.[increase];
    const preStartObj = currentTermData?.prevStarting?.[increase];
    const preStopObj = currentTermData?.preStopping?.[increase];

    const newScoreVal = typeof newScoreObj === 'object' ? (newScoreObj?.newScore || '') : (newScoreObj || '');
    const preScoreVal = typeof preScoreObj === 'object' ? (preScoreObj?.preScore || '') : (preScoreObj || '');

    const nScore = getGradeAndRemark(newScoreVal);
    const pScore = getGradeAndRemark(preScoreVal);

    return {
      newHifz: {
        starting: typeof newStartObj === 'object' ? (newStartObj?.newStarting || '') : (newStartObj || ''),
        stopping: typeof newStopObj === 'object' ? (newStopObj?.newStopping || '') : (newStopObj || ''),
        score: newScoreVal,
        grade: nScore.Grade,
        remark: nScore.Remark
      },
      prevHifz: {
        starting: typeof preStartObj === 'object' ? (preStartObj?.prevStarting || '') : (preStartObj || ''),
        stopping: typeof preStopObj === 'object' ? (preStopObj?.preStopping || '') : (preStopObj || ''),
        score: preScoreVal,
        grade: pScore.Grade,
        remark: pScore.Remark
      }
    };
  };

  const createDataSource = (daily, field) => {
    const dayArray = currentTermData?.[daily] || [];
    const dayRecord = dayArray[increase] || {};

    const { total } = totalScore(
      dayRecord.hifz,
      dayRecord.hifzError,
      dayRecord.tajweed,
      dayRecord.tajError
    );
    const { Remark } = getGradeAndRemark(total);

    const values = {
      date: dayRecord.date || '',
      remark: Remark,
      total: total,
      tajweed: dayRecord.tajweed || '',
      hifz: dayRecord.hifz || '',
      tajError: dayRecord.tajError || '',
      hifzError: dayRecord.hifzError || '',
      toV: dayRecord.toV || '',
      fromV: dayRecord.fromV || '',
      chapter: dayRecord.chapter || ''
    };

    return values[field] || '';
  };

  // --- SUBMIT HANDLER ---
  const submitToBackend = async (section) => {
    setStatus((prev) => ({ ...prev, [section]: 'loading' }));

    try {
      const res = await axios.put(
        `https://portal-database-seven.vercel.app/student/push/${id}/day`,
        {
          parentName: parentData.name,
          parentComment: parentData.comment,
          parentDate: parentData.date
        }
      );

      if (res.status === 200 || res.status === 204) {
        setStatus((prev) => ({ ...prev, [section]: 'success' }));
        setTimeout(() => setStatus((prev) => ({ ...prev, [section]: 'idle' })), 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus((prev) => ({ ...prev, [section]: 'error' }));
      setTimeout(() => setStatus((prev) => ({ ...prev, [section]: 'idle' })), 5000);
    }
  };

  // --- UI COMPONENTS ---
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

  const inputClass =
    'w-full h-full bg-transparent text-center focus:bg-blue-50 outline-none transition-all';
  const underlineInput =
    'border-b border-dotted border-black px-2 focus:bg-blue-50 outline-none';

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white text-[11px] leading-tight text-black font-sans">
      {/* --- TEACHER SECTION --- */}
      <section className="mb-10 border-b-2 border-gray-300 pb-8">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-4 tracking-tighter">
          TEACHER'S WEEKLY REPORT
        </h1>

        <div className="flex justify-between mb-4 font-bold text-[12px]">
          <div>
            Week{' '}
            <input
              className={underlineInput}
              value={teacherComments.week || currentTermData?.weeks?.[increase]?.weeks || ''}
              onChange={(e) => setTeacherComments({ ...teacherComments, week: e.target.value })}
            />{' '}
            الأسبوع
          </div>
          <div
            style={{ paddingRight: '50px' }}
            className="cursor-pointer hover:text-blue-600"
            onClick={back}
          >
            <FaArrowAltCircleLeft size={18} />
          </div>
          <div
            style={{ paddingRight: '50px' }}
            className="cursor-pointer hover:text-blue-600"
            onClick={move}
          >
            <FaArrowAltCircleRight size={18} />
          </div>
          <div>
            Term{' '}
            <input
              className={underlineInput}
              value={teacherComments.term || currentTermData?.terms?.[increase]?.terms || ''}
              onChange={(e) => setTeacherComments({ ...teacherComments, term: e.target.value })}
            />{' '}
            الفترة
          </div>
        </div>

        <table className="w-full border-collapse border border-black mb-4">
          <thead className="bg-gray-100 uppercase text-[9px]">
            <tr className="h-12">
              <th className="border border-black p-1">التاريخ<br />Date</th>
              <th className="border border-black p-1">التقدير<br />Remark</th>
              <th className="border border-black p-1 w-12">مجموع<br />Total (100)</th>
              <th className="border border-black p-1">درجة التجويد<br />Tajweed (30)</th>
              <th className="border border-black p-1">درجة الحفظ<br />Hifz (70)</th>
              <th className="border border-black p-1">أخطاء تجويدية<br />Tajweed Rule</th>
              <th className="border border-black p-1">أخطاء حفظية<br />Hifz Point</th>
              <th className="border border-black p-1">إلى آية<br />To Verse</th>
              <th className="border border-black p-1">من آية<br />From Verse</th>
              <th className="border border-black p-1">سورة<br />Chapters</th>
              <th className="border border-black p-1 bg-gray-200 uppercase">Days<br />الأيام</th>
            </tr>
          </thead>
          <tbody>
            {teacherData.map((row, idx) => (
              <tr key={idx} className="h-8">
                {[
                  'date',
                  'remark',
                  'total',
                  'tajweed',
                  'hifz',
                  'tajError',
                  'hifzError',
                  'toV',
                  'fromV',
                  'chapter'
                ].map((field) => (
                  <td key={field} className="border border-black">
                    <input
                      type={field === 'date' ? 'date' : 'text'}
                      className={inputClass}
                      value={createDataSource(row.day, field)}
                      onChange={(e) => {
                        const updated = [...teacherData];
                        updated[idx][field] = e.target.value;
                        setTeacherData(updated);
                      }}
                    />
                  </td>
                ))}
                <td className="border border-black bg-gray-50 font-bold text-center">
                  {row.day.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-y-4 mb-4">
          <div className="col-span-2">
            Teacher's Comments:{' '}
            <input
              className="w-3/4 border-b border-black outline-none"
              value={teacherComments.comment || currentTermData?.teacherComment?.[increase]?.teacherComment || ''}
              onChange={(e) =>
                setTeacherComments({ ...teacherComments, comment: e.target.value })
              }
            />{' '}
            ملاحظات المعلم
          </div>
          <div>
            Signature:{' '}
            <input
              className={underlineInput}
              value={teacherComments.signature || currentTermData?.teacherSign?.[increase]?.teacherSign || ''}
              onChange={(e) =>
                setTeacherComments({ ...teacherComments, signature: e.target.value })
              }
            />{' '}
            التوقيع
          </div>
          <div className="text-right">
            Teacher's Name:{' '}
            <input
              className={underlineInput}
              value={teacherComments.name || currentTermData?.teacherName?.[increase]?.teacherName || ''}
              onChange={(e) => setTeacherComments({ ...teacherComments, name: e.target.value })}
            />{' '}
            اسم المعلم
          </div>
        </div>
      </section>

      {/* --- MANAGEMENT SECTION --- */}
      <section className="mb-10 border-b-2 border-gray-300 pb-8">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-4 uppercase">
          Management Weekly Report
        </h2>
        <table className="w-full border-collapse border border-black text-center mb-4">
          <thead className="bg-gray-100 h-10 uppercase text-[9px]">
            <tr>
              <th className="border border-black p-1">التطبيق<br />Remark</th>
              <th className="border border-black p-1">الدرجة<br />Grade</th>
              <th className="border border-black p-1">النتيجة<br />Score</th>
              <th className="border border-black p-1">الإنتهاء<br />Stopping</th>
              <th className="border border-black p-1">الإبتداء<br />Starting</th>
              <th className="border border-black p-1 bg-gray-200 w-40 font-bold">الموضوع<br />Topic</th>
            </tr>
          </thead>
          <tbody>
            {[
              { l: 'الحفظ الجديد New Hifz', k: 'newHifz' },
              { l: 'الحفظ السابق Prev Hifz', k: 'prevHifz' }
            ].map((topic) => (
              <tr key={topic.k} className="h-12">
                {['remark', 'grade', 'score', 'stopping', 'starting'].map((field) => (
                  <td key={field} className="border border-black">
                    <input
                      className={inputClass}
                      readOnly
                      value={managementFunc()[topic.k][field] || ''}
                    />
                  </td>
                ))}
                <td className="border border-black font-bold bg-gray-50 text-[10px]">
                  {topic.l}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-4 font-bold">
          Qur'an HOD's Comment:{' '}
          <input
            className="w-3/4 border-b border-black outline-none font-normal"
            value={
              mgmtData.hodComment ||
              currentTermData?.hodComment?.[increase]?.hodComment ||
              ''
            }
            onChange={(e) => setMgmtData({ ...mgmtData, hodComment: e.target.value })}
          />{' '}
          ملاحظات رئيس القسم
        </div>
      </section>

      {/* --- PARENT SECTION --- */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-4 uppercase">
          Parent/Guardian's Weekly Report
        </h2>
        <p className="mb-4 leading-relaxed text-[12px] italic text-gray-800">
          I,{' '}
          <input
            className={underlineInput}
            value={
              parentData.name ||
              currentTermData?.parentName?.[increase]?.parentName ||
              ''
            }
            onChange={(e) => setParentData({ ...parentData, name: e.target.value })}
          />{' '}
          the Parent/Guardian of the above named pupil/ward hereby certified that, I listened,
          observed and supervised my child's/ward's progress for this week in comparison with
          the school report and Allah is my witness.
        </p>
        <div className="space-y-4 mb-4">
          <div className="font-bold">
            Parent/Guardian's Comment:{' '}
            <input
              className="w-2/3 border-b border-black outline-none font-normal"
              value={
                parentData.comment ||
                currentTermData?.parentComment?.[increase]?.parentComment ||
                ''
              }
              onChange={(e) => setParentData({ ...parentData, comment: e.target.value })}
            />
          </div>
          <div className="font-bold">
            Sign/Date:{' '}
            <input
              className={underlineInput}
              type="date"
              value={
                parentData.date ||
                currentTermData?.parentDate?.[increase]?.parentDate ||
                ''
              }
              onChange={(e) => setParentData({ ...parentData, date: e.target.value })}
            />
          </div>
        </div>

        <SubmitButton
          section="parent"
          label="Submit Parent Report"
          onClick={() => submitToBackend('parent')}
        />
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

export default WeeklyReportView;