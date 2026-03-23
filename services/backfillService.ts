import { ClassDataMap, ActivityLogData, ActivityLogEntry } from '../types';
import { saveClassesToFirestore, saveActivityLogToFirestore } from './firebaseService';

export const performAttendanceBackfill = async (
  currentClasses: ClassDataMap,
  currentLog: ActivityLogData
) => {
  const newClasses = { ...currentClasses };
  const newLog = { ...currentLog };
  
  // Helper to format date as DD/MM
  const formatDate = (day: number, month: number) => {
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  };

  const backfillDates: { date: string; justification?: string }[] = [
    { date: '05/02' },
    { date: '06/02', justification: 'Carnaval' },
    { date: '09/02', justification: 'Carnaval' },
    { date: '12/02', justification: 'Recesso de Carnaval' },
    { date: '13/02', justification: 'Recesso de Carnaval' },
  ];

  // Generate Mon, Thu, Fri from Feb 16 to March 23
  const startDate = new Date(2026, 1, 16); // Feb 16, 2026
  const endDate = new Date(2026, 2, 23);   // Mar 23, 2026
  
  let curr = new Date(startDate);
  while (curr <= endDate) {
    const dayOfWeek = curr.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    if (dayOfWeek === 1 || dayOfWeek === 4 || dayOfWeek === 5) {
      backfillDates.push({ date: formatDate(curr.getDate(), curr.getMonth() + 1) });
    }
    curr.setDate(curr.getDate() + 1);
  }

  // Update Students Attendance
  Object.keys(newClasses).forEach(classId => {
    const cls = newClasses[classId];
    cls.students.forEach(student => {
      backfillDates.forEach(item => {
        // Only set if not already set to avoid overwriting manual changes
        if (!student.attendance[item.date]) {
          student.attendance[item.date] = 'P';
        }
      });
    });
  });

  // Update Activity Log
  backfillDates.forEach(item => {
    const existingEntry = newLog.log.find(entry => entry.date === item.date);
    const activityText = item.justification 
      ? `Justificativa: ${item.justification}` 
      : 'Aula de Xadrez - Presença realizada para todos os alunos.';

    if (existingEntry) {
      if (!existingEntry.activities.includes(activityText)) {
        existingEntry.activities.push(activityText);
      }
    } else {
      newLog.log.push({
        date: item.date,
        classes: Object.keys(newClasses),
        activities: [activityText]
      });
    }
  });

  // Sort log by date (simple DD/MM sort might need more logic if spanning years, but here it's Feb/Mar)
  newLog.log.sort((a, b) => {
    const [dayA, monthA] = a.date.split('/').map(Number);
    const [dayB, monthB] = b.date.split('/').map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  // Save to Firestore
  await saveClassesToFirestore(newClasses);
  await saveActivityLogToFirestore(newLog);
  
  return { newClasses, newLog };
};
