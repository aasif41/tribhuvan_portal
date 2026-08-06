"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Clean existing data
    await prisma.attendance.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.user.deleteMany();
    // Create Admin User
    const adminUser = await prisma.user.create({
        data: {
            firebaseUid: 'firebase-admin-001',
            email: 'admin@tribhuvancollege.ac.in',
            name: 'Dr. Rajesh Sharma',
            role: client_1.Role.ADMIN,
            status: client_1.ApprovalStatus.APPROVED,
            phone: '+91-8890786666',
        },
    });
    console.log('✅ Admin created:', adminUser.name);
    // Create Teacher Users
    const teacher1User = await prisma.user.create({
        data: {
            firebaseUid: 'firebase-teacher-001',
            email: 'anil.kumar@tribhuvancollege.ac.in',
            name: 'Prof. Anil Kumar',
            role: client_1.Role.TEACHER,
            status: client_1.ApprovalStatus.APPROVED,
            phone: '+91-9876543210',
        },
    });
    const teacher2User = await prisma.user.create({
        data: {
            firebaseUid: 'firebase-teacher-002',
            email: 'priya.singh@tribhuvancollege.ac.in',
            name: 'Dr. Priya Singh',
            role: client_1.Role.TEACHER,
            status: client_1.ApprovalStatus.APPROVED,
            phone: '+91-9876543211',
        },
    });
    const teacher1 = await prisma.teacher.create({
        data: {
            userId: teacher1User.id,
            employeeId: 'TCH-001',
            department: 'Computer Science & Engineering',
            designation: 'Associate Professor',
        },
    });
    const teacher2 = await prisma.teacher.create({
        data: {
            userId: teacher2User.id,
            employeeId: 'TCH-002',
            department: 'Computer Science & Engineering',
            designation: 'Assistant Professor',
        },
    });
    console.log('✅ Teachers created:', teacher1User.name, ',', teacher2User.name);
    // Create Student Users
    const student1User = await prisma.user.create({
        data: {
            firebaseUid: 'firebase-student-001',
            email: 'rahul.verma@tribhuvancollege.ac.in',
            name: 'Rahul Verma',
            role: client_1.Role.STUDENT,
            status: client_1.ApprovalStatus.APPROVED,
        },
    });
    const student2User = await prisma.user.create({
        data: {
            firebaseUid: 'firebase-student-002',
            email: 'sneha.patel@tribhuvancollege.ac.in',
            name: 'Sneha Patel',
            role: client_1.Role.STUDENT,
            status: client_1.ApprovalStatus.APPROVED,
        },
    });
    const student3User = await prisma.user.create({
        data: {
            firebaseUid: 'firebase-student-003',
            email: 'amit.sharma@tribhuvancollege.ac.in',
            name: 'Amit Sharma',
            role: client_1.Role.STUDENT,
            status: client_1.ApprovalStatus.APPROVED,
        },
    });
    const student1 = await prisma.student.create({
        data: {
            userId: student1User.id,
            rollNo: 'BTECH-CSE-2024-001',
            program: 'B.Tech Computer Science & Engineering',
            year: 2,
            semester: 3,
            section: 'A',
        },
    });
    const student2 = await prisma.student.create({
        data: {
            userId: student2User.id,
            rollNo: 'BTECH-CSE-2024-002',
            program: 'B.Tech Computer Science & Engineering',
            year: 2,
            semester: 3,
            section: 'A',
        },
    });
    const student3 = await prisma.student.create({
        data: {
            userId: student3User.id,
            rollNo: 'BTECH-CSE-2024-003',
            program: 'B.Tech Computer Science & Engineering',
            year: 2,
            semester: 3,
            section: 'A',
        },
    });
    console.log('✅ Students created:', student1User.name, ',', student2User.name, ',', student3User.name);
    // Create Subjects for B.Tech CSE Semester 3
    const subjects = await Promise.all([
        prisma.subject.create({
            data: {
                code: 'CSE-301',
                name: 'Data Structures & Algorithms',
                program: 'B.Tech Computer Science & Engineering',
                semester: 3,
                credits: 4,
                teacherId: teacher1.id,
            },
        }),
        prisma.subject.create({
            data: {
                code: 'CSE-302',
                name: 'Object Oriented Programming',
                program: 'B.Tech Computer Science & Engineering',
                semester: 3,
                credits: 4,
                teacherId: teacher1.id,
            },
        }),
        prisma.subject.create({
            data: {
                code: 'CSE-303',
                name: 'Database Management Systems',
                program: 'B.Tech Computer Science & Engineering',
                semester: 3,
                credits: 4,
                teacherId: teacher2.id,
            },
        }),
        prisma.subject.create({
            data: {
                code: 'CSE-304',
                name: 'Computer Networks',
                program: 'B.Tech Computer Science & Engineering',
                semester: 3,
                credits: 3,
                teacherId: teacher2.id,
            },
        }),
        prisma.subject.create({
            data: {
                code: 'CSE-305',
                name: 'Discrete Mathematics',
                program: 'B.Tech Computer Science & Engineering',
                semester: 3,
                credits: 3,
                teacherId: teacher1.id,
            },
        }),
    ]);
    console.log('✅ Subjects created:', subjects.length, 'subjects');
    // Enroll students in all subjects
    const enrollments = [];
    for (const student of [student1, student2, student3]) {
        for (const subject of subjects) {
            enrollments.push(prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    subjectId: subject.id,
                },
            }));
        }
    }
    await Promise.all(enrollments);
    console.log('✅ Enrollments created:', enrollments.length, 'enrollments');
    // Create Timetable Slots (Mon-Fri)
    const timetableData = [
        // Monday
        { day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'Room 301', subjectIndex: 0, teacherIndex: 0 },
        { day: 'Monday', startTime: '10:00', endTime: '11:00', room: 'Room 302', subjectIndex: 1, teacherIndex: 0 },
        { day: 'Monday', startTime: '11:30', endTime: '12:30', room: 'Room 303', subjectIndex: 2, teacherIndex: 1 },
        // Tuesday
        { day: 'Tuesday', startTime: '09:00', endTime: '10:00', room: 'Room 301', subjectIndex: 3, teacherIndex: 1 },
        { day: 'Tuesday', startTime: '10:00', endTime: '11:00', room: 'Room 302', subjectIndex: 4, teacherIndex: 0 },
        { day: 'Tuesday', startTime: '11:30', endTime: '12:30', room: 'Room 303', subjectIndex: 0, teacherIndex: 0 },
        // Wednesday
        { day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'Lab A', subjectIndex: 1, teacherIndex: 0 },
        { day: 'Wednesday', startTime: '10:00', endTime: '11:00', room: 'Lab B', subjectIndex: 2, teacherIndex: 1 },
        { day: 'Wednesday', startTime: '11:30', endTime: '12:30', room: 'Room 301', subjectIndex: 3, teacherIndex: 1 },
        // Thursday
        { day: 'Thursday', startTime: '09:00', endTime: '10:00', room: 'Room 302', subjectIndex: 4, teacherIndex: 0 },
        { day: 'Thursday', startTime: '10:00', endTime: '11:00', room: 'Room 303', subjectIndex: 0, teacherIndex: 0 },
        { day: 'Thursday', startTime: '11:30', endTime: '12:30', room: 'Room 301', subjectIndex: 1, teacherIndex: 0 },
        // Friday
        { day: 'Friday', startTime: '09:00', endTime: '10:00', room: 'Lab A', subjectIndex: 2, teacherIndex: 1 },
        { day: 'Friday', startTime: '10:00', endTime: '11:00', room: 'Room 302', subjectIndex: 3, teacherIndex: 1 },
        { day: 'Friday', startTime: '11:30', endTime: '12:30', room: 'Room 303', subjectIndex: 4, teacherIndex: 0 },
    ];
    const teachers = [teacher1, teacher2];
    for (const slot of timetableData) {
        await prisma.timetableSlot.create({
            data: {
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                room: slot.room,
                subjectId: subjects[slot.subjectIndex].id,
                teacherId: teachers[slot.teacherIndex].id,
                program: 'B.Tech Computer Science & Engineering',
                semester: 3,
                section: 'A',
            },
        });
    }
    console.log('✅ Timetable slots created:', timetableData.length, 'slots');
    // Create Attendance Records (last 5 days)
    const studentIds = [student1.id, student2.id, student3.id];
    const statuses = [
        client_1.AttendanceStatus.PRESENT,
        client_1.AttendanceStatus.PRESENT,
        client_1.AttendanceStatus.ABSENT,
        client_1.AttendanceStatus.PRESENT,
        client_1.AttendanceStatus.LATE,
    ];
    const today = new Date();
    let attendanceCount = 0;
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
        const date = new Date(today);
        date.setDate(today.getDate() - dayOffset);
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6)
            continue;
        for (const subject of subjects.slice(0, 3)) {
            for (let i = 0; i < studentIds.length; i++) {
                const statusIndex = (dayOffset + i) % statuses.length;
                await prisma.attendance.create({
                    data: {
                        date,
                        status: statuses[statusIndex],
                        studentId: studentIds[i],
                        subjectId: subject.id,
                        markedBy: subject.teacherId,
                    },
                });
                attendanceCount++;
            }
        }
    }
    console.log('✅ Attendance records created:', attendanceCount, 'records');
    // Create Announcements
    const announcements = [
        {
            title: 'Welcome to New Academic Session 2024-25',
            body: 'Dear students, welcome to the new academic session. Classes for all programs will commence from July 15, 2024. Please ensure your registration is complete before the start date.',
            category: 'general',
            postedBy: adminUser.id,
        },
        {
            title: 'Mid-Semester Examination Schedule',
            body: 'Mid-semester examinations for all B.Tech programs will be held from August 20-30, 2024. Detailed timetable will be shared by respective departments. Students with attendance below 75% will not be allowed to sit for exams.',
            category: 'exam',
            postedBy: adminUser.id,
        },
        {
            title: 'Annual Tech Fest - InnovateTribhuvan 2024',
            body: 'We are excited to announce InnovateTribhuvan 2024, our annual technical festival. Events include hackathon, paper presentation, robotics competition, and more. Register before August 10 to participate.',
            category: 'event',
            postedBy: teacher1User.id,
        },
        {
            title: 'Campus Placement Drive - TCS & Infosys',
            body: 'TCS and Infosys will be conducting campus placement drives on September 5-6, 2024. Eligible students (B.Tech final year with 60%+ aggregate) must register on the placement portal by August 25.',
            category: 'placement',
            postedBy: adminUser.id,
        },
    ];
    for (const announcement of announcements) {
        await prisma.announcement.create({ data: announcement });
    }
    console.log('✅ Announcements created:', announcements.length, 'announcements');
    console.log('\n🎉 Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map