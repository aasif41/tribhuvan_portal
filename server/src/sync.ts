import prisma from './config/database';
import { syncAllEnrollments } from './utils/enrollmentSync';

async function main() {
  console.log('Migrating old program names...');
  
  const oldProgram = 'BSC CS';
  const newProgram = 'B.Sc (Hons.) Computer Science';

  // Update subjects
  const subjectRes = await prisma.subject.updateMany({
    where: { program: oldProgram },
    data: { program: newProgram }
  });
  console.log(`Updated ${subjectRes.count} subjects.`);

  // Update students
  const studentRes = await prisma.student.updateMany({
    where: { program: oldProgram },
    data: { program: newProgram }
  });
  console.log(`Updated ${studentRes.count} students.`);

  console.log('Starting global enrollment sync...');
  await syncAllEnrollments();
  console.log('Finished global enrollment sync!');
}

main().catch(console.error);
