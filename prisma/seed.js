// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── USERS ──────────────────────────────────
  console.log('   Creating users...')
  await prisma.user.createMany({
    data: [
      { username:'employee', password:'pass123', name:'Budi Santoso',  role:'employee',   dept:'Engineering', position:'Software Engineer',   email:'budi@company.com',  salary:12000000 },
      { username:'manager',  password:'pass123', name:'Dewi Rahayu',   role:'manager',    dept:'Engineering', position:'Engineering Manager',  email:'dewi@company.com',  salary:20000000 },
      { username:'hr',       password:'pass123', name:'Rina Marlina',  role:'hr',         dept:'HR',          position:'HR Specialist',        email:'rina@company.com',  salary:15000000 },
      { username:'admin',    password:'pass123', name:'Ahmad Fauzi',   role:'superadmin', dept:'IT',          position:'System Administrator', email:'ahmad@company.com', salary:18000000 },
    ],
    skipDuplicates: true,
  })

  // ─── EMPLOYEES ──────────────────────────────
  console.log('   Creating employees...')
  const employees = await Promise.all([
    prisma.employee.upsert({ where:{nik:'EMP001'}, update:{}, create:{ nik:'EMP001', name:'Budi Santoso',  dept:'Engineering', position:'Software Engineer',   role:'employee',   status:'Active', joinDate:'2022-03-01', email:'budi@company.com',  salary:12000000 }}),
    prisma.employee.upsert({ where:{nik:'EMP002'}, update:{}, create:{ nik:'EMP002', name:'Dewi Rahayu',   dept:'Engineering', position:'Engineering Manager', role:'manager',    status:'Active', joinDate:'2020-01-15', email:'dewi@company.com',  salary:20000000 }}),
    prisma.employee.upsert({ where:{nik:'EMP003'}, update:{}, create:{ nik:'EMP003', name:'Rina Marlina',  dept:'HR',          position:'HR Specialist',       role:'hr',         status:'Active', joinDate:'2021-07-01', email:'rina@company.com',  salary:15000000 }}),
    prisma.employee.upsert({ where:{nik:'EMP004'}, update:{}, create:{ nik:'EMP004', name:'Ahmad Fauzi',   dept:'IT',          position:'System Administrator',role:'superadmin', status:'Active', joinDate:'2019-05-10', email:'ahmad@company.com', salary:18000000 }}),
    prisma.employee.upsert({ where:{nik:'EMP005'}, update:{}, create:{ nik:'EMP005', name:'Sari Indah',    dept:'Finance',     position:'Finance Analyst',     role:'employee',   status:'Active', joinDate:'2023-02-14', email:'sari@company.com',  salary:11000000 }}),
  ])
  console.log(`   Created ${employees.length} employees`)

  // ─── LEAVE TYPES ────────────────────────────
  console.log('   Creating leave types...')
  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({ where:{name:'Cuti Tahunan'},    update:{}, create:{ name:'Cuti Tahunan',    maxDays:12, requireDoc:false, levels:'["Manager"]',        autoApprove:false, active:true }}),
    prisma.leaveType.upsert({ where:{name:'Cuti Sakit'},      update:{}, create:{ name:'Cuti Sakit',      maxDays:14, requireDoc:true,  levels:'["Manager"]',        autoApprove:false, active:true }}),
    prisma.leaveType.upsert({ where:{name:'Cuti Melahirkan'}, update:{}, create:{ name:'Cuti Melahirkan', maxDays:90, requireDoc:true,  levels:'["Manager","HR"]',   autoApprove:false, active:true }}),
    prisma.leaveType.upsert({ where:{name:'Cuti Penting'},    update:{}, create:{ name:'Cuti Penting',    maxDays:3,  requireDoc:false, levels:'["Manager"]',        autoApprove:false, active:true }}),
  ])

  // ─── LEAVES ─────────────────────────────────
  console.log('   Creating sample leaves...')
  const user1 = await prisma.user.findUnique({ where:{ username:'employee' }})
  const user5 = await prisma.user.findUnique({ where:{ username:'manager' }})
  if (user1 && leaveTypes[0]) {
    await prisma.leave.createMany({
      data: [
        { userId:user1.id, typeId:leaveTypes[0].id, typeName:'Cuti Tahunan', startDate:'2025-06-10', endDate:'2025-06-12', note:'Liburan keluarga',   status:'Approved' },
        { userId:user1.id, typeId:leaveTypes[3].id, typeName:'Cuti Penting', startDate:'2025-07-01', endDate:'2025-07-02', note:'Pernikahan saudara',  status:'Pending'  },
      ],
      skipDuplicates: true,
    })
  }

  // ─── HOLIDAYS ───────────────────────────────
  console.log('   Creating holidays...')
  await prisma.holiday.createMany({
    data: [
      { country:'ID', name:'Tahun Baru Masehi',    date:'2025-01-01', type:'National', recurring:true  },
      { country:'ID', name:'Isra Miraj',            date:'2025-01-27', type:'National', recurring:false },
      { country:'ID', name:'Tahun Baru Imlek',      date:'2025-01-29', type:'National', recurring:false },
      { country:'ID', name:'Hari Raya Nyepi',       date:'2025-03-29', type:'National', recurring:false },
      { country:'ID', name:'Idul Fitri (1)',         date:'2025-03-31', type:'National', recurring:false },
      { country:'ID', name:'Idul Fitri (2)',         date:'2025-04-01', type:'National', recurring:false },
      { country:'ID', name:'Wafat Isa Almasih',     date:'2025-04-18', type:'National', recurring:false },
      { country:'ID', name:'Hari Buruh',            date:'2025-05-01', type:'National', recurring:true  },
      { country:'ID', name:'Kenaikan Isa Almasih',  date:'2025-05-29', type:'National', recurring:false },
      { country:'ID', name:'Idul Adha',             date:'2025-06-06', type:'National', recurring:false },
      { country:'ID', name:'Tahun Baru Islam',      date:'2025-06-27', type:'National', recurring:false },
      { country:'ID', name:'Kemerdekaan RI',        date:'2025-08-17', type:'National', recurring:true  },
      { country:'ID', name:'Maulid Nabi',           date:'2025-09-05', type:'National', recurring:false },
      { country:'ID', name:'Hari Raya Natal',       date:'2025-12-25', type:'National', recurring:true  },
      { country:'SG', name:"New Year's Day",        date:'2025-01-01', type:'National', recurring:true  },
      { country:'SG', name:'Chinese New Year (1)',  date:'2025-01-29', type:'National', recurring:false },
      { country:'SG', name:'National Day',          date:'2025-08-09', type:'National', recurring:true  },
      { country:'SG', name:'Christmas Day',         date:'2025-12-25', type:'National', recurring:true  },
    ],
    skipDuplicates: true,
  })

  // ─── SHIFTS ─────────────────────────────────
  console.log('   Creating shifts...')
  await prisma.shift.createMany({
    data: [
      { name:'Morning Shift',   code:'MS', startTime:'07:00', endTime:'15:00', breakMins:60, color:'#3b82f6', type:'Regular', overnight:false },
      { name:'Afternoon Shift', code:'AS', startTime:'15:00', endTime:'23:00', breakMins:60, color:'#f59e0b', type:'Regular', overnight:false },
      { name:'Night Shift',     code:'NS', startTime:'23:00', endTime:'07:00', breakMins:60, color:'#8b5cf6', type:'Regular', overnight:true  },
      { name:'Normal Office',   code:'NO', startTime:'08:00', endTime:'17:00', breakMins:60, color:'#10b981', type:'Regular', overnight:false },
      { name:'Day Off',         code:'DO', startTime:'-',     endTime:'-',     breakMins:0,  color:'#e5e7eb', type:'Off',     overnight:false },
    ],
    skipDuplicates: true,
  })

  // ─── SHIFT PATTERNS ─────────────────────────
  console.log('   Creating shift patterns...')
  const noShift = await prisma.shift.findUnique({ where:{ code:'NO' }})
  const doShift = await prisma.shift.findUnique({ where:{ code:'DO' }})
  const msShift = await prisma.shift.findUnique({ where:{ code:'MS' }})

  const pattern1 = await prisma.shiftPattern.create({
    data: {
      name: '5 Days Normal Office',
      description: 'Senin-Jumat kerja, Sabtu-Minggu off',
      days: JSON.stringify({1:noShift?.id,2:noShift?.id,3:noShift?.id,4:noShift?.id,5:noShift?.id,6:doShift?.id,7:doShift?.id}),
    }
  })

  // ─── WORK SCHEDULE ──────────────────────────
  console.log('   Creating work schedules...')
  const ws1 = await prisma.workSchedule.create({
    data: {
      name: 'Office Schedule 2025',
      patternId: pattern1.id,
      effectiveDate: '2025-01-01',
      endDate: '2025-12-31',
      timezone: 'WIB (UTC+7)',
      active: true,
    }
  })

  // ─── SCHEDULE ASSIGNMENTS ───────────────────
  console.log('   Creating schedule assignments...')
  for (const emp of employees) {
    await prisma.scheduleAssignment.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        empId: emp.id,
        wsId: ws1.id,
        effectiveDate: '2025-01-01',
        endDate: '2025-12-31',
      }
    })
  }

  // ─── PAYROLL ────────────────────────────────
  console.log('   Creating payroll data...')
  for (const emp of employees) {
    await prisma.payroll.upsert({
      where: { empId: emp.id },
      update: {},
      create: {
        empId:      emp.id,
        month:      6,
        year:       2025,
        basic:      emp.salary,
        allowance:  Math.round(emp.salary * 0.2),
        overtime:   0,
        deduction:  Math.round(emp.salary * 0.05),
        bpjsHealth: Math.round(emp.salary * 0.01),
        bpjsTk:     Math.round(emp.salary * 0.02),
        pph21:      Math.round(emp.salary * 0.05),
        paid:       false,
      }
    })
  }

  console.log('\n✅ Seeding complete!')
  console.log('   Users:     4')
  console.log('   Employees: 5')
  console.log('   Holidays:  18')
  console.log('   Shifts:    5')
  console.log('   Patterns:  1')
  console.log('   Schedule:  1')
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })