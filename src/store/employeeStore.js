import { create } from 'zustand'

// ─── Action & Reason LOV ──────────────────────────────────────────────────────
export const HISTORY_ACTIONS = [
  'Hire',
  'Transfer',
  'Promotion',
  'Demotion',
  'Salary Change',
  'Leave of Absence',
  'Return from Leave',
  'Data Change',
  'Termination',
]

export const HISTORY_REASONS = {
  'Hire':              ['New Hire', 'Rehire', 'Conversion from Contract', 'Acquisition'],
  'Transfer':          ['Internal Transfer', 'Interdepartmental Transfer', 'Intercompany Transfer', 'Relocation'],
  'Promotion':         ['Performance-Based', 'Merit Promotion', 'Acting Assignment'],
  'Demotion':          ['Performance Issue', 'Disciplinary Action', 'Voluntary Demotion'],
  'Salary Change':     ['Annual Review', 'Market Adjustment', 'Promotion', 'Merit Increase', 'Correction'],
  'Leave of Absence':  ['Maternity/Paternity Leave', 'Medical Leave', 'Personal Leave', 'Study Leave', 'Unpaid Leave'],
  'Return from Leave': ['Return from Maternity/Paternity', 'Return from Medical Leave', 'Return from Personal Leave', 'Return from Study Leave'],
  'Data Change':       ['Name Change', 'Address Change', 'Personal Data Update', 'Legal Data Change', 'Contract Renewal'],
  'Termination':       ['Resignation', 'End of Contract', 'Retirement', 'Layoff / Redundancy', 'Dismissal', 'Mutual Agreement', 'Death'],
}

export const ACTION_COLOR = {
  'Hire':              'bg-green-100 text-green-700',
  'Transfer':          'bg-blue-100 text-blue-700',
  'Promotion':         'bg-red-100 text-red-700',
  'Demotion':          'bg-orange-100 text-orange-700',
  'Salary Change':     'bg-cyan-100 text-cyan-700',
  'Leave of Absence':  'bg-yellow-100 text-yellow-700',
  'Return from Leave': 'bg-teal-100 text-teal-700',
  'Data Change':       'bg-gray-100 text-gray-600',
  'Termination':       'bg-red-100 text-red-700',
}

// ─── Structure IDs (aligned with structureStore seed data) ───────────────────
// Division: 1=Technology Group, 2=Operations Group, 3=Finance Group
// Company:  1=PT Nusantara Teknologi (NTK), 2=PT Nusantara Finance (NFC), 3=Philippines Inc (PHL)
// BUnit:    1=Software Engineering, 2=Infrastructure, 3=Accounting, 4=HR (NTK), 5=HR (NFC)
//           6=Product Engineering (PHL), 7=Quality Assurance (PHL), 8=HR (PHL)
// Dept:     1=Frontend, 2=Backend, 3=DevOps, 4=Procurement, 5=HR Ops (NTK), 6=HR Ops (NFC)
//           7=Web Development (PHL), 8=Mobile Development (PHL), 9=QA & Testing (PHL), 10=HR Ops (PHL)
// Position: 1=Junior SE(PC10), 2=SE(PC20), 3=Senior SE(PC30), 4=Eng Mgr(PC53),
//           5=IT Support(PC15), 6=Finance Analyst(PC20), 7=Finance Mgr(PC54),
//           22=HR Manager NTK(PC53), 23=HR Officer NTK(PC20),
//           24=HR Manager NFC(PC53), 25=HR Officer NFC(PC20),
//           26=Jr Web Dev(PC10), 27=Web Dev(PC20), 28=Sr Web Dev(PC30), 29=Eng Mgr PHL(PC53)
//           30=Mobile Dev(PC20), 31=Sr Mobile Dev(PC30), 32=QA Eng(PC15), 33=Sr QA Eng(PC25)
//           34=QA Lead(PC40), 35=HR Mgr PHL(PC53), 36=HR Officer PHL(PC20)

const SEED_EMPLOYEES = [
  {
    id: 1, nik: 'EMP001', status: 'Active', photo: null,
    // Employment
    companyId: 1, divisionId: 1, businessUnitId: 1, departmentId: 1,
    positionId: 2, gradeId: 20, employmentType: 'Permanent',
    managerId: 2, joinDate: '2022-03-01', endDate: '', role: 'employee',
    // Bio
    name: 'Budi Santoso', gender: 'Male', birthPlace: 'Jakarta',
    birthDate: '1995-06-15', nationality: 'Indonesian', religion: 'Islam',
    maritalStatus: 'Married', ktp: '3174012345678901', npwp: '12.345.678.9-012.345', bpjs: '',
    phone: '08123456789', email: 'budi@company.com', personalEmail: 'budi.santoso@gmail.com',
    address: 'Jl. Sudirman No. 10, Jakarta Selatan', city: 'Jakarta', country: 'Indonesia',
    // Dependents
    dependents: [
      { id: 1, name: 'Siti Rahayu',  relationship: 'Spouse', birthDate: '1997-03-20', gender: 'Female' },
      { id: 2, name: 'Budi Jr.',     relationship: 'Child',  birthDate: '2020-11-05', gender: 'Male'   },
    ],
    // Profile
    education: [
      { id: 1, level: 'S1', institution: 'Universitas Indonesia', major: 'Teknik Informatika', graduationYear: '2018' },
    ],
    certifications: [
      { id: 1, name: 'AWS Certified Developer', issuer: 'Amazon', issueYear: '2021', expiryYear: '2024' },
    ],
    skills: [
      { id: 1, name: 'React.js', level: 'Advanced' },
      { id: 2, name: 'Node.js',  level: 'Intermediate' },
    ],
    history: [
      { id:1, effectiveDate:'2022-03-01', effectiveSeq:1, action:'Hire',       reason:'New Hire',           companyId:1, departmentId:1, positionId:2, gradeId:20, note:'' },
      { id:2, effectiveDate:'2023-07-01', effectiveSeq:1, action:'Promotion',  reason:'Performance-Based',  companyId:1, departmentId:1, positionId:2, gradeId:20, note:'Naik grade dari PC15 ke PC20' },
    ],
  },
  {
    id: 2, nik: 'EMP002', status: 'Active', photo: null,
    companyId: 1, divisionId: 1, businessUnitId: 1, departmentId: 2,
    positionId: 4, gradeId: 53, employmentType: 'Permanent',
    managerId: 28, joinDate: '2020-01-15', endDate: '', role: 'manager',
    name: 'Dewi Rahayu', gender: 'Female', birthPlace: 'Bandung',
    birthDate: '1988-09-22', nationality: 'Indonesian', religion: 'Islam',
    maritalStatus: 'Married', ktp: '3273019876543210', npwp: '98.765.432.1-098.765', bpjs: '',
    phone: '08234567890', email: 'dewi@company.com', personalEmail: 'dewirahayu@gmail.com',
    address: 'Jl. Gatot Subroto No. 45, Bandung', city: 'Bandung', country: 'Indonesia',
    dependents: [
      { id: 1, name: 'Rudi Santoso', relationship: 'Spouse', birthDate: '1986-05-11', gender: 'Male' },
    ],
    education: [
      { id: 1, level: 'S2', institution: 'Institut Teknologi Bandung', major: 'Manajemen Teknologi', graduationYear: '2013' },
      { id: 2, level: 'S1', institution: 'Institut Teknologi Bandung', major: 'Teknik Informatika',  graduationYear: '2011' },
    ],
    certifications: [
      { id: 1, name: 'PMP', issuer: 'PMI', issueYear: '2019', expiryYear: '2025' },
    ],
    skills: [
      { id: 1, name: 'Project Management', level: 'Expert'        },
      { id: 2, name: 'Java',               level: 'Advanced'      },
      { id: 3, name: 'Leadership',         level: 'Advanced'      },
    ],
    history: [
      { id:1, effectiveDate:'2020-01-15', effectiveSeq:1, action:'Hire',      reason:'New Hire',          companyId:1, departmentId:2, positionId:3, gradeId:30, note:'' },
      { id:2, effectiveDate:'2021-04-01', effectiveSeq:1, action:'Promotion', reason:'Merit Promotion',   companyId:1, departmentId:2, positionId:4, gradeId:53, note:'Promoted to Engineering Manager' },
    ],
  },
  {
    id: 3, nik: 'EMP003', status: 'Active', photo: null,
    companyId: 1, divisionId: 1, businessUnitId: 1, departmentId: 2,
    positionId: 1, gradeId: 20, employmentType: 'Permanent',
    managerId: 2, joinDate: '2021-07-01', endDate: '', role: 'hr',
    name: 'Rina Marlina', gender: 'Female', birthPlace: 'Surabaya',
    birthDate: '1992-04-10', nationality: 'Indonesian', religion: 'Kristen',
    maritalStatus: 'Single', ktp: '3578015566778899', npwp: '', bpjs: '',
    phone: '08345678901', email: 'rina@company.com', personalEmail: 'rinamarlina@gmail.com',
    address: 'Jl. Pemuda No. 88, Surabaya', city: 'Surabaya', country: 'Indonesia',
    dependents: [],
    education: [
      { id: 1, level: 'S1', institution: 'Universitas Airlangga', major: 'Psikologi', graduationYear: '2015' },
    ],
    certifications: [],
    skills: [
      { id: 1, name: 'Recruitment',    level: 'Advanced'      },
      { id: 2, name: 'HRIS',           level: 'Intermediate'  },
    ],
    history: [
      { id:1, effectiveDate:'2021-07-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:1, gradeId:20, note:'' },
    ],
  },
  {
    id: 4, nik: 'EMP004', status: 'Active', photo: null,
    companyId: 1, divisionId: 2, businessUnitId: 2, departmentId: 3,
    positionId: 5, gradeId: 30, employmentType: 'Permanent',
    managerId: 10, joinDate: '2019-05-10', endDate: '', role: 'superadmin',
    name: 'Ahmad Fauzi', gender: 'Male', birthPlace: 'Medan',
    birthDate: '1990-12-30', nationality: 'Indonesian', religion: 'Islam',
    maritalStatus: 'Married', ktp: '1271013012900001', npwp: '55.443.221.0-055.000', bpjs: '',
    phone: '08456789012', email: 'ahmad@company.com', personalEmail: 'ahmadfauzi@gmail.com',
    address: 'Jl. Diponegoro No. 22, Medan', city: 'Medan', country: 'Indonesia',
    dependents: [
      { id: 1, name: 'Fatimah',  relationship: 'Spouse', birthDate: '1993-07-07', gender: 'Female' },
      { id: 2, name: 'Fauzan',   relationship: 'Child',  birthDate: '2018-02-14', gender: 'Male'   },
    ],
    education: [
      { id: 1, level: 'S1', institution: 'Universitas Sumatera Utara', major: 'Teknik Informatika', graduationYear: '2013' },
    ],
    certifications: [
      { id: 1, name: 'CCNA', issuer: 'Cisco', issueYear: '2020', expiryYear: '2026' },
    ],
    skills: [
      { id: 1, name: 'Linux Administration', level: 'Expert'        },
      { id: 2, name: 'Networking',           level: 'Advanced'      },
    ],
    history: [
      { id:1, effectiveDate:'2019-05-10', effectiveSeq:1, action:'Hire',     reason:'New Hire',          companyId:1, departmentId:3, positionId:5, gradeId:25, note:'' },
      { id:2, effectiveDate:'2021-01-01', effectiveSeq:1, action:'Transfer', reason:'Internal Transfer', companyId:1, departmentId:3, positionId:5, gradeId:30, note:'Pindah ke Infrastructure BU' },
    ],
  },
  {
    id: 5, nik: 'EMP005', status: 'Active', photo: null,
    companyId: 2, divisionId: 3, businessUnitId: 3, departmentId: 4,
    positionId: 6, gradeId: 15, employmentType: 'Contract',
    managerId: 41, joinDate: '2023-02-14', endDate: '2025-02-13', role: 'employee',
    name: 'Sari Indah', gender: 'Female', birthPlace: 'Yogyakarta',
    birthDate: '1998-08-17', nationality: 'Indonesian', religion: 'Katolik',
    maritalStatus: 'Single', ktp: '3471018708980001', npwp: '', bpjs: '',
    phone: '08567890123', email: 'sari@company.com', personalEmail: 'sariindah@gmail.com',
    address: 'Jl. Malioboro No. 5, Yogyakarta', city: 'Yogyakarta', country: 'Indonesia',
    dependents: [],
    education: [
      { id: 1, level: 'S1', institution: 'Universitas Gadjah Mada', major: 'Akuntansi', graduationYear: '2021' },
    ],
    certifications: [],
    skills: [
      { id: 1, name: 'Excel / Spreadsheet', level: 'Advanced'      },
      { id: 2, name: 'SAP FI',              level: 'Beginner'      },
    ],
    history: [
      { id:1, effectiveDate:'2023-02-14', effectiveSeq:1, action:'Hire',        reason:'New Hire',        companyId:2, departmentId:4, positionId:6,  gradeId:15, note:'' },
      { id:2, effectiveDate:'2025-02-13', effectiveSeq:1, action:'Termination', reason:'End of Contract', companyId:2, departmentId:4, positionId:6,  gradeId:15, note:'Kontrak tidak diperpanjang' },
    ],
  },

  // ── Director → CEO Level ─────────────────────────────────────────────────────
  {
    id:6, nik:'EMP006', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:1,
    positionId:21, gradeId:72, employmentType:'Permanent',
    managerId:null, joinDate:'2015-01-01', endDate:'', role:'superadmin',
    name:'Hendra Kusuma',    gender:'Male',   birthPlace:'Jakarta',
    birthDate:'1972-04-10',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3174011004720001', npwp:'11.222.333.4-011.000', bpjs: '',
    phone:'08111000001', email:'hendra@company.com', personalEmail:'hendra.kusuma@gmail.com',
    address:'Jl. Menteng Raya No. 5, Jakarta Pusat', city: 'Jakarta', country: 'Indonesia',
    dependents:[
      { id:1, name:'Sri Kusuma',   relationship:'Spouse', birthDate:'1975-08-20', gender:'Female' },
      { id:2, name:'Kevin Kusuma', relationship:'Child',  birthDate:'2001-03-15', gender:'Male'   },
      { id:3, name:'Karin Kusuma', relationship:'Child',  birthDate:'2004-11-22', gender:'Female' },
    ],
    education:[
      { id:1, level:'S2', institution:'INSEAD', major:'Executive MBA', graduationYear:'2005' },
      { id:2, level:'S1', institution:'Universitas Indonesia', major:'Teknik Elektro', graduationYear:'1995' },
    ],
    certifications:[
      { id:1, name:'Certified Board Director', issuer:'IICD', issueYear:'2018', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Corporate Strategy',   level:'Expert' },
      { id:2, name:'Business Development', level:'Expert' },
      { id:3, name:'Leadership',           level:'Expert' },
    ],
    history:[
      { id:1, effectiveDate:'2015-01-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',           companyId:1, departmentId:1, positionId:16, gradeId:67, note:'Bergabung sebagai SVP Engineering' },
      { id:2, effectiveDate:'2018-06-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based',   companyId:1, departmentId:1, positionId:18, gradeId:70, note:'Diangkat menjadi CTO' },
      { id:3, effectiveDate:'2021-01-01', effectiveSeq:1, action:'Promotion', reason:'Merit Promotion',     companyId:1, departmentId:1, positionId:21, gradeId:72, note:'Diangkat menjadi President Director / CEO' },
    ],
  },
  {
    id:7, nik:'EMP007', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:1,
    positionId:18, gradeId:70, employmentType:'Permanent',
    managerId:6, joinDate:'2017-03-01', endDate:'', role:'superadmin',
    name:'Rizky Pratama',    gender:'Male',   birthPlace:'Bandung',
    birthDate:'1978-07-25',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3273010707780001', npwp:'22.333.444.5-022.000', bpjs: '',
    phone:'08111000002', email:'rizky@company.com', personalEmail:'rizky.pratama@gmail.com',
    address:'Jl. Dago No. 88, Bandung', city: 'Bandung', country: 'Indonesia',
    dependents:[
      { id:1, name:'Maya Pratama', relationship:'Spouse', birthDate:'1980-02-14', gender:'Female' },
    ],
    education:[
      { id:1, level:'S2', institution:'Massachusetts Institute of Technology', major:'Computer Science', graduationYear:'2004' },
      { id:2, level:'S1', institution:'Institut Teknologi Bandung', major:'Teknik Informatika', graduationYear:'2001' },
    ],
    certifications:[
      { id:1, name:'AWS Solutions Architect Professional', issuer:'Amazon', issueYear:'2022', expiryYear:'2025' },
      { id:2, name:'TOGAF 9 Certified', issuer:'The Open Group', issueYear:'2019', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Enterprise Architecture', level:'Expert' },
      { id:2, name:'Cloud Strategy',          level:'Expert' },
      { id:3, name:'Digital Transformation',  level:'Expert' },
    ],
    history:[
      { id:1, effectiveDate:'2017-03-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',         companyId:1, departmentId:1, positionId:13, gradeId:64, note:'Bergabung sebagai VP Engineering' },
      { id:2, effectiveDate:'2020-01-01', effectiveSeq:1, action:'Promotion', reason:'Merit Promotion',   companyId:1, departmentId:1, positionId:18, gradeId:70, note:'Diangkat menjadi Chief Technology Officer' },
    ],
  },
  {
    id:8, nik:'EMP008', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:19, gradeId:70, employmentType:'Permanent',
    managerId:36, joinDate:'2016-08-01', endDate:'', role:'superadmin',
    name:'Sandra Wijaya',    gender:'Female', birthPlace:'Surabaya',
    birthDate:'1980-11-03',  nationality:'Indonesian', religion:'Kristen',
    maritalStatus:'Married', ktp:'3578010311800001', npwp:'33.444.555.6-033.000', bpjs: '',
    phone:'08111000003', email:'sandra@company.com', personalEmail:'sandra.wijaya@gmail.com',
    address:'Jl. Raya Darmo No. 12, Surabaya', city: 'Surabaya', country: 'Indonesia',
    dependents:[
      { id:1, name:'Budi Wijaya',  relationship:'Spouse', birthDate:'1978-05-17', gender:'Male'   },
      { id:2, name:'Clara Wijaya', relationship:'Child',  birthDate:'2008-09-01', gender:'Female' },
    ],
    education:[
      { id:1, level:'S2', institution:'Universitas Gadjah Mada', major:'Akuntansi Manajemen', graduationYear:'2007' },
      { id:2, level:'S1', institution:'Universitas Airlangga',   major:'Akuntansi', graduationYear:'2003' },
    ],
    certifications:[
      { id:1, name:'Chartered Financial Analyst (CFA)',        issuer:'CFA Institute', issueYear:'2012', expiryYear:'' },
      { id:2, name:'Certified Public Accountant (CPA)',        issuer:'IAPI',          issueYear:'2010', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Financial Planning & Analysis', level:'Expert' },
      { id:2, name:'Corporate Finance',             level:'Expert' },
      { id:3, name:'Risk Management',               level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2016-08-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',         companyId:2, departmentId:4, positionId:15, gradeId:65, note:'Bergabung sebagai VP Finance' },
      { id:2, effectiveDate:'2019-07-01', effectiveSeq:1, action:'Promotion', reason:'Merit Promotion',   companyId:2, departmentId:4, positionId:19, gradeId:70, note:'Diangkat menjadi Chief Financial Officer' },
    ],
  },
  {
    id:9, nik:'EMP009', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:20, gradeId:71, employmentType:'Permanent',
    managerId:6, joinDate:'2018-05-01', endDate:'', role:'hr',
    name:'Kartika Sari',     gender:'Female', birthPlace:'Yogyakarta',
    birthDate:'1982-03-28',  nationality:'Indonesian', religion:'Katolik',
    maritalStatus:'Married', ktp:'3471012803820001', npwp:'44.555.666.7-044.000', bpjs: '',
    phone:'08111000004', email:'kartika@company.com', personalEmail:'kartika.sari@gmail.com',
    address:'Jl. Malioboro No. 99, Yogyakarta', city: 'Yogyakarta', country: 'Indonesia',
    dependents:[
      { id:1, name:'Doni Saputra', relationship:'Spouse', birthDate:'1980-12-05', gender:'Male' },
    ],
    education:[
      { id:1, level:'S2', institution:'Universitas Indonesia', major:'Manajemen SDM', graduationYear:'2008' },
      { id:2, level:'S1', institution:'Universitas Gadjah Mada', major:'Psikologi', graduationYear:'2005' },
    ],
    certifications:[
      { id:1, name:'SHRM Senior Certified Professional', issuer:'SHRM', issueYear:'2015', expiryYear:'' },
      { id:2, name:'Certified Human Resources Professional', issuer:'BNSP', issueYear:'2017', expiryYear:'2027' },
    ],
    skills:[
      { id:1, name:'Talent Management',      level:'Expert'   },
      { id:2, name:'Organizational Design',  level:'Expert'   },
      { id:3, name:'Industrial Relations',   level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2018-05-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',          companyId:1, departmentId:2, positionId:14, gradeId:64, note:'Bergabung sebagai VP HR' },
      { id:2, effectiveDate:'2022-01-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based',  companyId:1, departmentId:2, positionId:20, gradeId:71, note:'Diangkat menjadi CHRO' },
    ],
  },
  {
    id:10, nik:'EMP010', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:2, departmentId:3,
    positionId:10, gradeId:61, employmentType:'Permanent',
    managerId:7, joinDate:'2019-02-01', endDate:'', role:'manager',
    name:'Fajar Nugroho',    gender:'Male',   birthPlace:'Semarang',
    birthDate:'1984-09-12',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3374011209840001', npwp:'55.666.777.8-055.000', bpjs: '',
    phone:'08111000005', email:'fajar@company.com', personalEmail:'fajar.nugroho@gmail.com',
    address:'Jl. Pemuda No. 33, Semarang', city: 'Semarang', country: 'Indonesia',
    dependents:[
      { id:1, name:'Retno Nugroho', relationship:'Spouse', birthDate:'1986-06-10', gender:'Female' },
      { id:2, name:'Aldi Nugroho',  relationship:'Child',  birthDate:'2012-04-20', gender:'Male'   },
    ],
    education:[
      { id:1, level:'S2', institution:'Universitas Diponegoro', major:'Teknik Informatika', graduationYear:'2010' },
      { id:2, level:'S1', institution:'Universitas Diponegoro', major:'Teknik Komputer',    graduationYear:'2007' },
    ],
    certifications:[
      { id:1, name:'ITIL 4 Managing Professional', issuer:'AXELOS', issueYear:'2021', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'IT Infrastructure', level:'Expert'   },
      { id:2, name:'Cybersecurity',     level:'Advanced' },
      { id:3, name:'IT Governance',     level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2019-02-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',          companyId:1, departmentId:3, positionId:5,  gradeId:35, note:'' },
      { id:2, effectiveDate:'2021-06-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based',  companyId:1, departmentId:3, positionId:10, gradeId:61, note:'Diangkat menjadi GM IT' },
    ],
  },
  {
    id:11, nik:'EMP011', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:12, gradeId:62, employmentType:'Permanent',
    managerId:37, joinDate:'2017-10-01', endDate:'', role:'manager',
    name:'Anggita Putri',    gender:'Female', birthPlace:'Medan',
    birthDate:'1986-01-15',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'1271011501860001', npwp:'66.777.888.9-066.000', bpjs: '',
    phone:'08111000006', email:'anggita@company.com', personalEmail:'anggita.putri@gmail.com',
    address:'Jl. Imam Bonjol No. 44, Medan', city: 'Medan', country: 'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S2', institution:'Universitas Sumatera Utara', major:'Manajemen Keuangan', graduationYear:'2012' },
      { id:2, level:'S1', institution:'Universitas Sumatera Utara', major:'Akuntansi',          graduationYear:'2009' },
    ],
    certifications:[
      { id:1, name:'Chartered Accountant (CA)', issuer:'ICAI',  issueYear:'2014', expiryYear:'' },
      { id:2, name:'Brevet C Pajak',            issuer:'BNSP',  issueYear:'2016', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Financial Reporting', level:'Expert'   },
      { id:2, name:'Tax Management',      level:'Advanced' },
      { id:3, name:'Treasury',            level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2017-10-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',           companyId:2, departmentId:4, positionId:7,  gradeId:54, note:'' },
      { id:2, effectiveDate:'2020-04-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based',   companyId:2, departmentId:4, positionId:12, gradeId:62, note:'Diangkat menjadi GM Finance' },
    ],
  },
  // ── HR Team — PT Nusantara Teknologi ────────────────────────────────────────
  {
    id:12, nik:'EMP012', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:22, gradeId:53, employmentType:'Permanent',
    managerId:9, joinDate:'2019-08-01', endDate:'', role:'hr',
    name:'Bagas Pratiwi', gender:'Male', birthPlace:'Solo',
    birthDate:'1986-05-20', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3372012005860001', npwp:'77.888.999.0-077.000', bpjs: '',
    phone:'08211000001', email:'bagas@company.com', personalEmail:'bagas.pratiwi@gmail.com',
    address:'Jl. Slamet Riyadi No. 55, Solo', city: 'Solo', country: 'Indonesia',
    dependents:[
      { id:1, name:'Wulan Pratiwi', relationship:'Spouse', birthDate:'1988-11-12', gender:'Female' },
      { id:2, name:'Nadia Pratiwi', relationship:'Child',  birthDate:'2015-03-08', gender:'Female' },
    ],
    education:[
      { id:1, level:'S2', institution:'Universitas Sebelas Maret', major:'Manajemen SDM',     graduationYear:'2012' },
      { id:2, level:'S1', institution:'Universitas Sebelas Maret', major:'Psikologi Industri', graduationYear:'2009' },
    ],
    certifications:[
      { id:1, name:'Certified Human Resources Professional', issuer:'BNSP', issueYear:'2020', expiryYear:'2030' },
    ],
    skills:[
      { id:1, name:'HR Generalist',    level:'Expert'    },
      { id:2, name:'Talent Acquisition', level:'Advanced' },
      { id:3, name:'HRIS',             level:'Advanced'  },
    ],
    history:[
      { id:1, effectiveDate:'2019-08-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',          companyId:1, departmentId:5, positionId:23, gradeId:40, note:'' },
      { id:2, effectiveDate:'2022-03-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based',  companyId:1, departmentId:5, positionId:22, gradeId:53, note:'Diangkat menjadi HR Manager NTK' },
    ],
  },
  {
    id:13, nik:'EMP013', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:23, gradeId:20, employmentType:'Permanent',
    managerId:12, joinDate:'2021-04-01', endDate:'', role:'hr',
    name:'Desi Kurniawati', gender:'Female', birthPlace:'Purwokerto',
    birthDate:'1994-02-18', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single', ktp:'3302011802940001', npwp:'', bpjs: '',
    phone:'08211000002', email:'desi@company.com', personalEmail:'desi.kurniawati@gmail.com',
    address:'Jl. Jenderal Sudirman No. 12, Purwokerto', city: 'Purwokerto', country: 'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Jenderal Soedirman', major:'Psikologi', graduationYear:'2016' },
    ],
    certifications:[
      { id:1, name:'Certified Recruitment Specialist', issuer:'HRDNC', issueYear:'2022', expiryYear:'2025' },
    ],
    skills:[
      { id:1, name:'Rekrutmen & Seleksi', level:'Advanced'    },
      { id:2, name:'Onboarding',          level:'Advanced'    },
      { id:3, name:'Payroll Administration', level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2021-04-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:5, positionId:23, gradeId:20, note:'' },
    ],
  },
  {
    id:14, nik:'EMP014', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:23, gradeId:15, employmentType:'Permanent',
    managerId:12, joinDate:'2023-01-16', endDate:'', role:'hr',
    name:'Faisal Rahman', gender:'Male', birthPlace:'Bogor',
    birthDate:'1997-09-05', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single', ktp:'3201010509970001', npwp:'', bpjs: '',
    phone:'08211000003', email:'faisal@company.com', personalEmail:'faisal.rahman@gmail.com',
    address:'Jl. Pajajaran No. 77, Bogor', city: 'Bogor', country: 'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Institut Pertanian Bogor', major:'Manajemen', graduationYear:'2019' },
    ],
    certifications:[],
    skills:[
      { id:1, name:'HR Administration',  level:'Intermediate' },
      { id:2, name:'Microsoft Office',   level:'Advanced'     },
      { id:3, name:'Employee Relations', level:'Beginner'     },
    ],
    history:[
      { id:1, effectiveDate:'2023-01-16', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:5, positionId:23, gradeId:15, note:'' },
    ],
  },
  // ── HR Team — PT Nusantara Finance ──────────────────────────────────────────
  {
    id:15, nik:'EMP015', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:5, departmentId:6,
    positionId:24, gradeId:53, employmentType:'Permanent',
    managerId:36, joinDate:'2020-06-01', endDate:'', role:'hr',
    name:'Yuliani Suharto', gender:'Female', birthPlace:'Malang',
    birthDate:'1985-07-14', nationality:'Indonesian', religion:'Kristen',
    maritalStatus:'Married', ktp:'3573011407850001', npwp:'88.999.000.1-088.000', bpjs: '',
    phone:'08211000004', email:'yuliani@company.com', personalEmail:'yuliani.suharto@gmail.com',
    address:'Jl. Ijen Bulevar No. 22, Malang', city: 'Malang', country: 'Indonesia',
    dependents:[
      { id:1, name:'Benny Suharto',  relationship:'Spouse', birthDate:'1983-04-25', gender:'Male'   },
      { id:2, name:'Alicia Suharto', relationship:'Child',  birthDate:'2011-08-30', gender:'Female' },
    ],
    education:[
      { id:1, level:'S2', institution:'Universitas Brawijaya', major:'Manajemen SDM', graduationYear:'2011' },
      { id:2, level:'S1', institution:'Universitas Brawijaya', major:'Psikologi',     graduationYear:'2008' },
    ],
    certifications:[
      { id:1, name:'Certified HR Professional', issuer:'BNSP',  issueYear:'2018', expiryYear:'2028' },
      { id:2, name:'Mediator Hubungan Industrial', issuer:'Kemnaker', issueYear:'2019', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Industrial Relations', level:'Expert'   },
      { id:2, name:'Compensation & Benefits', level:'Advanced' },
      { id:3, name:'HR Generalist',        level:'Expert'   },
    ],
    history:[
      { id:1, effectiveDate:'2020-06-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:6, positionId:24, gradeId:53, note:'Bergabung sebagai HR Manager NFC' },
    ],
  },
  // ── HR Team — PT Nusantara Finance (id 16 below) ───────────────────────────
  {
    id:16, nik:'EMP016', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:5, departmentId:6,
    positionId:25, gradeId:20, employmentType:'Permanent',
    managerId:2, joinDate:'2022-09-01', endDate:'', role:'hr',
    name:'Hendri Wijaksono', gender:'Male', birthPlace:'Surabaya',
    birthDate:'1993-11-23', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single', ktp:'3578012311930001', npwp:'', bpjs: '',
    phone:'08211000005', email:'hendri@company.com', personalEmail:'hendri.wijaksono@gmail.com',
    address:'Jl. Raya Gubeng No. 9, Surabaya', city: 'Surabaya', country: 'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Airlangga', major:'Manajemen', graduationYear:'2016' },
    ],
    certifications:[],
    skills:[
      { id:1, name:'Rekrutmen',            level:'Intermediate' },
      { id:2, name:'Payroll Administration', level:'Advanced'   },
      { id:3, name:'HRIS',                 level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2022-09-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:6, positionId:25, gradeId:20, note:'' },
    ],
  },

  // ── Philippines, Inc. ────────────────────────────────────────────────────────
  // Company 3 | Division 1 (Technology Group)
  // BU 6=Product Engineering, BU 7=Quality Assurance, BU 8=Human Resources
  // Dept 7=Web Dev, 8=Mobile Dev, 9=QA & Testing, 10=HR Operations
  // Pos: 26=Jr Web Dev(PC10), 27=Web Dev(PC20), 28=Sr Web Dev(PC30), 29=Eng Mgr(PC53)
  //      30=Mobile Dev(PC20), 31=Sr Mobile Dev(PC30), 32=QA Eng(PC15), 33=Sr QA Eng(PC25)
  //      34=QA Lead(PC40), 35=HR Mgr(PC53), 36=HR Officer(PC20)
  {
    id:17, nik:'PHIL001', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:29, gradeId:53, employmentType:'Permanent',
    managerId:45, joinDate:'2020-08-01', endDate:'', role:'manager',
    name:'Juan dela Cruz',   gender:'Male',   birthPlace:'Manila',
    birthDate:'1983-04-15',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Married', ktp:'34-1234567-1', npwp:'123-456-789-001', bpjs:'11-1234567-8',
    phone:'09151234501', email:'juan@company.com', personalEmail:'juan.delacruz@gmail.com',
    address:'Unit 5A Salcedo Village, Makati City', city:'Makati', country:'Philippines',
    dependents:[
      { id:1, name:'Maria dela Cruz', relationship:'Spouse', birthDate:'1985-07-22', gender:'Female' },
      { id:2, name:'Luis dela Cruz',  relationship:'Child',  birthDate:'2012-11-10', gender:'Male'   },
    ],
    education:[
      { id:1, level:'S2', institution:'Ateneo de Manila University', major:'Computer Science', graduationYear:'2008' },
      { id:2, level:'S1', institution:'De La Salle University',      major:'Information Technology', graduationYear:'2006' },
    ],
    certifications:[
      { id:1, name:'PMP', issuer:'PMI', issueYear:'2018', expiryYear:'2024' },
      { id:2, name:'AWS Solutions Architect', issuer:'Amazon', issueYear:'2021', expiryYear:'2024' },
    ],
    skills:[
      { id:1, name:'Engineering Leadership', level:'Expert'   },
      { id:2, name:'System Architecture',    level:'Expert'   },
      { id:3, name:'Agile / Scrum',          level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2020-08-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',         companyId:3, departmentId:7, positionId:28, gradeId:30, note:'Joined as Senior Web Developer' },
      { id:2, effectiveDate:'2022-01-01', effectiveSeq:1, action:'Promotion', reason:'Merit Promotion',   companyId:3, departmentId:7, positionId:29, gradeId:53, note:'Promoted to Engineering Manager' },
    ],
  },
  {
    id:18, nik:'PHIL002', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:27, gradeId:20, employmentType:'Permanent',
    managerId:17, joinDate:'2021-03-15', endDate:'', role:'employee',
    name:'Maria Santos',     gender:'Female', birthPlace:'Quezon City',
    birthDate:'1994-09-08',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Single',  ktp:'34-2345678-2', npwp:'123-456-789-002', bpjs:'11-2345678-9',
    phone:'09151234502', email:'maria.santos@company.com', personalEmail:'mariasantos@gmail.com',
    address:'789 Katipunan Ave, Quezon City', city:'Quezon City', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'University of the Philippines Diliman', major:'Computer Science', graduationYear:'2016' },
    ],
    certifications:[
      { id:1, name:'Oracle Certified Associate', issuer:'Oracle', issueYear:'2020', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'React.js',    level:'Advanced'     },
      { id:2, name:'TypeScript',  level:'Advanced'     },
      { id:3, name:'Node.js',     level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2021-03-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:7, positionId:27, gradeId:20, note:'' },
    ],
  },
  {
    id:19, nik:'PHIL003', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:26, gradeId:10, employmentType:'Permanent',
    managerId:17, joinDate:'2023-06-01', endDate:'', role:'employee',
    name:'Jose Reyes',       gender:'Male',   birthPlace:'Cebu City',
    birthDate:'1999-02-20',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Single',  ktp:'34-3456789-3', npwp:'123-456-789-003', bpjs:'11-3456789-0',
    phone:'09151234503', email:'jose.reyes@company.com', personalEmail:'josereyes@gmail.com',
    address:'12 Colon Street, Cebu City', city:'Cebu City', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Cebu Institute of Technology University', major:'Information Technology', graduationYear:'2022' },
    ],
    certifications:[],
    skills:[
      { id:1, name:'HTML / CSS',  level:'Advanced'     },
      { id:2, name:'JavaScript',  level:'Intermediate' },
      { id:3, name:'React.js',    level:'Beginner'     },
    ],
    history:[
      { id:1, effectiveDate:'2023-06-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:7, positionId:26, gradeId:10, note:'' },
    ],
  },
  {
    id:20, nik:'PHIL004', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:28, gradeId:30, employmentType:'Permanent',
    managerId:17, joinDate:'2019-09-01', endDate:'', role:'employee',
    name:'Ana Gonzales',     gender:'Female', birthPlace:'Taguig',
    birthDate:'1990-05-12',  nationality:'Filipino', religion:'Kristen',
    maritalStatus:'Married', ktp:'34-4567890-4', npwp:'123-456-789-004', bpjs:'11-4567890-1',
    phone:'09151234504', email:'ana.gonzales@company.com', personalEmail:'anagonzales@gmail.com',
    address:'30 Bonifacio High Street, Taguig City', city:'Taguig', country:'Philippines',
    dependents:[
      { id:1, name:'Marco Gonzales', relationship:'Spouse', birthDate:'1988-03-18', gender:'Male' },
    ],
    education:[
      { id:1, level:'S1', institution:'Mapúa University', major:'Computer Engineering', graduationYear:'2012' },
    ],
    certifications:[
      { id:1, name:'Google Cloud Professional Developer', issuer:'Google', issueYear:'2022', expiryYear:'2025' },
    ],
    skills:[
      { id:1, name:'Vue.js',      level:'Expert'       },
      { id:2, name:'React.js',    level:'Advanced'     },
      { id:3, name:'GraphQL',     level:'Advanced'     },
      { id:4, name:'Python',      level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2019-09-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',         companyId:3, departmentId:7, positionId:27, gradeId:20, note:'' },
      { id:2, effectiveDate:'2022-07-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based', companyId:3, departmentId:7, positionId:28, gradeId:30, note:'Promoted to Senior Web Developer' },
    ],
  },
  {
    id:21, nik:'PHIL005', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:8,
    positionId:30, gradeId:20, employmentType:'Permanent',
    managerId:17, joinDate:'2022-01-15', endDate:'', role:'employee',
    name:'Ramon Villanueva', gender:'Male',   birthPlace:'Davao City',
    birthDate:'1993-11-03',  nationality:'Filipino', religion:'Islam',
    maritalStatus:'Single',  ktp:'34-5678901-5', npwp:'123-456-789-005', bpjs:'11-5678901-2',
    phone:'09151234505', email:'ramon.villanueva@company.com', personalEmail:'ramonvillanueva@gmail.com',
    address:'45 JP Laurel Ave, Davao City', city:'Davao City', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Ateneo de Davao University', major:'Information Technology', graduationYear:'2016' },
    ],
    certifications:[
      { id:1, name:'Flutter Certified Developer', issuer:'Google', issueYear:'2021', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Flutter',     level:'Advanced'     },
      { id:2, name:'Dart',        level:'Advanced'     },
      { id:3, name:'Swift',       level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2022-01-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:8, positionId:30, gradeId:20, note:'' },
    ],
  },
  {
    id:22, nik:'PHIL006', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:8,
    positionId:31, gradeId:30, employmentType:'Permanent',
    managerId:17, joinDate:'2020-05-01', endDate:'', role:'employee',
    name:'Liza Manalo',      gender:'Female', birthPlace:'Pasig',
    birthDate:'1989-07-30',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Married', ktp:'34-6789012-6', npwp:'123-456-789-006', bpjs:'11-6789012-3',
    phone:'09151234506', email:'liza.manalo@company.com', personalEmail:'lizamanalo@gmail.com',
    address:'22 Ortigas Ave, Pasig City', city:'Pasig', country:'Philippines',
    dependents:[
      { id:1, name:'Carlo Manalo',  relationship:'Spouse', birthDate:'1987-01-14', gender:'Male'   },
      { id:2, name:'Sofia Manalo',  relationship:'Child',  birthDate:'2018-05-09', gender:'Female' },
    ],
    education:[
      { id:1, level:'S1', institution:'De La Salle University', major:'Computer Science', graduationYear:'2011' },
    ],
    certifications:[
      { id:1, name:'Android Developer Expert', issuer:'Google', issueYear:'2020', expiryYear:'' },
      { id:2, name:'iOS Developer Certification', issuer:'Apple', issueYear:'2019', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Kotlin',      level:'Expert'   },
      { id:2, name:'Swift',       level:'Expert'   },
      { id:3, name:'React Native',level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2020-05-01', effectiveSeq:1, action:'Hire',      reason:'New Hire',         companyId:3, departmentId:8, positionId:30, gradeId:20, note:'' },
      { id:2, effectiveDate:'2023-02-01', effectiveSeq:1, action:'Promotion', reason:'Performance-Based', companyId:3, departmentId:8, positionId:31, gradeId:30, note:'Promoted to Senior Mobile Developer' },
    ],
  },
  {
    id:23, nik:'PHIL007', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:7, departmentId:9,
    positionId:34, gradeId:40, employmentType:'Permanent',
    managerId:48, joinDate:'2021-07-01', endDate:'', role:'manager',
    name:'Michael Torres',   gender:'Male',   birthPlace:'Mandaluyong',
    birthDate:'1987-03-25',  nationality:'Filipino', religion:'Kristen',
    maritalStatus:'Married', ktp:'34-7890123-7', npwp:'123-456-789-007', bpjs:'11-7890123-4',
    phone:'09151234507', email:'michael.torres@company.com', personalEmail:'michaeltorres@gmail.com',
    address:'15 Shaw Blvd, Mandaluyong City', city:'Mandaluyong', country:'Philippines',
    dependents:[
      { id:1, name:'Jenny Torres', relationship:'Spouse', birthDate:'1989-09-17', gender:'Female' },
    ],
    education:[
      { id:1, level:'S1', institution:'Polytechnic University of the Philippines', major:'Computer Engineering', graduationYear:'2010' },
    ],
    certifications:[
      { id:1, name:'ISTQB Certified Tester Advanced Level', issuer:'ISTQB', issueYear:'2019', expiryYear:'' },
      { id:2, name:'Certified Agile Tester', issuer:'iSQI', issueYear:'2021', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Test Automation',    level:'Expert'   },
      { id:2, name:'Selenium / Cypress', level:'Expert'   },
      { id:3, name:'API Testing',        level:'Advanced' },
      { id:4, name:'QA Leadership',      level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2021-07-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:9, positionId:34, gradeId:40, note:'Joined as QA Lead' },
    ],
  },
  {
    id:24, nik:'PHIL008', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:7, departmentId:9,
    positionId:32, gradeId:15, employmentType:'Permanent',
    managerId:23, joinDate:'2023-10-01', endDate:'', role:'employee',
    name:'Grace Ocampo',     gender:'Female', birthPlace:'Makati',
    birthDate:'1998-06-14',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Single',  ktp:'34-8901234-8', npwp:'123-456-789-008', bpjs:'11-8901234-5',
    phone:'09151234508', email:'grace.ocampo@company.com', personalEmail:'graceocampo@gmail.com',
    address:'88 Ayala Ave, Makati City', city:'Makati', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Adamson University', major:'Information Technology', graduationYear:'2022' },
    ],
    certifications:[
      { id:1, name:'ISTQB Foundation Level', issuer:'ISTQB', issueYear:'2023', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'Manual Testing',  level:'Advanced'     },
      { id:2, name:'Test Case Writing', level:'Advanced'   },
      { id:3, name:'Postman / API',   level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2023-10-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:9, positionId:32, gradeId:15, note:'' },
    ],
  },
  {
    id:25, nik:'PHIL009', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:8, departmentId:10,
    positionId:35, gradeId:53, employmentType:'Permanent',
    managerId:46, joinDate:'2020-10-01', endDate:'', role:'hr',
    name:'Paolo Cruz',       gender:'Male',   birthPlace:'Pasay',
    birthDate:'1985-12-01',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Married', ktp:'34-9012345-9', npwp:'123-456-789-009', bpjs:'11-9012345-6',
    phone:'09151234509', email:'paolo.cruz@company.com', personalEmail:'paolocruz@gmail.com',
    address:'55 Roxas Blvd, Pasay City', city:'Pasay', country:'Philippines',
    dependents:[
      { id:1, name:'Carla Cruz',  relationship:'Spouse', birthDate:'1987-04-30', gender:'Female' },
      { id:2, name:'Nico Cruz',   relationship:'Child',  birthDate:'2015-08-19', gender:'Male'   },
    ],
    education:[
      { id:1, level:'S2', institution:'University of Santo Tomas', major:'Human Resources Management', graduationYear:'2011' },
      { id:2, level:'S1', institution:'University of Santo Tomas', major:'Psychology', graduationYear:'2008' },
    ],
    certifications:[
      { id:1, name:'Chartered Institute of Personnel and Development', issuer:'CIPD', issueYear:'2016', expiryYear:'' },
    ],
    skills:[
      { id:1, name:'HR Operations',     level:'Expert'   },
      { id:2, name:'Talent Acquisition', level:'Expert'  },
      { id:3, name:'Labor Relations',   level:'Advanced' },
    ],
    history:[
      { id:1, effectiveDate:'2020-10-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:10, positionId:35, gradeId:53, note:'Joined as HR Manager Philippines' },
    ],
  },
  {
    id:26, nik:'PHIL010', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:8, departmentId:10,
    positionId:36, gradeId:20, employmentType:'Permanent',
    managerId:25, joinDate:'2022-04-01', endDate:'', role:'hr',
    name:'Michelle Ramos',   gender:'Female', birthPlace:'Quezon City',
    birthDate:'1995-08-22',  nationality:'Filipino', religion:'Kristen',
    maritalStatus:'Single',  ktp:'34-0123456-0', npwp:'123-456-789-010', bpjs:'11-0123456-7',
    phone:'09151234510', email:'michelle.ramos@company.com', personalEmail:'michelleramos@gmail.com',
    address:'10 Commonwealth Ave, Quezon City', city:'Quezon City', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Philippine Normal University', major:'Psychology', graduationYear:'2017' },
    ],
    certifications:[
      { id:1, name:'Certified HR Associate', issuer:'PMAP', issueYear:'2022', expiryYear:'2025' },
    ],
    skills:[
      { id:1, name:'HR Administration',   level:'Advanced'     },
      { id:2, name:'Recruitment & Selection', level:'Advanced' },
      { id:3, name:'HRIS',                level:'Intermediate' },
    ],
    history:[
      { id:1, effectiveDate:'2022-04-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:10, positionId:36, gradeId:20, note:'' },
    ],
  },

  // ── NTK — Full org hierarchy (id:27–35) ──────────────────────────────────────
  // Chain: CEO(6) → CTO(7) → SVP Eng(27) → VP Eng(28) → Sr Mgr Eng(29)
  //        Eng Mgr(2) → Asst Eng Mgr(30) → Sr Tech Sup(31) → Tech Sup(32) → Sr SE(33) → Jr Staff(34) → Clerk(35)
  {
    id:27, nik:'EMP027', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:1,
    positionId:16, gradeId:67, employmentType:'Permanent',
    managerId:7, joinDate:'2018-01-15', endDate:'', role:'manager',
    name:'Wawan Setiawan',   gender:'Male',   birthPlace:'Bandung',
    birthDate:'1981-03-10',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3273011003810001', npwp:'12.111.222.3-012.000', bpjs:'',
    phone:'08211001001', email:'wawan@company.com', personalEmail:'wawan.setiawan@gmail.com',
    address:'Jl. Cihampelas No. 30, Bandung', city:'Bandung', country:'Indonesia',
    dependents:[{ id:1, name:'Rina Setiawan', relationship:'Spouse', birthDate:'1983-07-15', gender:'Female' }],
    education:[
      { id:1, level:'S2', institution:'Institut Teknologi Bandung', major:'Teknik Informatika', graduationYear:'2007' },
      { id:2, level:'S1', institution:'Institut Teknologi Bandung', major:'Teknik Elektro', graduationYear:'2004' },
    ],
    certifications:[{ id:1, name:'AWS Solutions Architect Professional', issuer:'Amazon', issueYear:'2020', expiryYear:'2023' }],
    skills:[{ id:1, name:'Software Architecture', level:'Expert' }, { id:2, name:'Cloud Strategy', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2018-01-15', effectiveSeq:1, action:'Hire',      reason:'New Hire',        companyId:1, departmentId:1, positionId:13, gradeId:64, note:'Bergabung sebagai VP Engineering' },
      { id:2, effectiveDate:'2021-07-01', effectiveSeq:1, action:'Promotion', reason:'Merit Promotion',  companyId:1, departmentId:1, positionId:16, gradeId:67, note:'Diangkat menjadi SVP Engineering' },
    ],
  },
  {
    id:28, nik:'EMP028', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:1,
    positionId:13, gradeId:64, employmentType:'Permanent',
    managerId:27, joinDate:'2019-04-01', endDate:'', role:'manager',
    name:'Anita Wulandari',  gender:'Female', birthPlace:'Surabaya',
    birthDate:'1984-11-28',  nationality:'Indonesian', religion:'Kristen',
    maritalStatus:'Married', ktp:'3578012811840001', npwp:'23.222.333.4-023.000', bpjs:'',
    phone:'08211001002', email:'anita@company.com', personalEmail:'anita.wulandari@gmail.com',
    address:'Jl. Raya Darmo No. 45, Surabaya', city:'Surabaya', country:'Indonesia',
    dependents:[{ id:1, name:'Ricky Wulandari', relationship:'Spouse', birthDate:'1982-04-18', gender:'Male' }],
    education:[
      { id:1, level:'S2', institution:'Universitas Airlangga', major:'Sistem Informasi', graduationYear:'2010' },
      { id:2, level:'S1', institution:'Institut Teknologi Sepuluh Nopember', major:'Teknik Informatika', graduationYear:'2007' },
    ],
    certifications:[{ id:1, name:'PMP', issuer:'PMI', issueYear:'2018', expiryYear:'2024' }],
    skills:[{ id:1, name:'Engineering Leadership', level:'Expert' }, { id:2, name:'System Design', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2019-04-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:1, positionId:13, gradeId:64, note:'Bergabung sebagai VP Engineering' },
    ],
  },
  {
    id:29, nik:'EMP029', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:8, gradeId:58, employmentType:'Permanent',
    managerId:28, joinDate:'2020-02-15', endDate:'', role:'manager',
    name:'Bimo Saputra',     gender:'Male',   birthPlace:'Semarang',
    birthDate:'1987-06-12',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3374011206870001', npwp:'34.333.444.5-034.000', bpjs:'',
    phone:'08211001003', email:'bimo@company.com', personalEmail:'bimo.saputra@gmail.com',
    address:'Jl. Pemuda No. 77, Semarang', city:'Semarang', country:'Indonesia',
    dependents:[{ id:1, name:'Dewi Saputra', relationship:'Spouse', birthDate:'1989-02-20', gender:'Female' }],
    education:[
      { id:1, level:'S2', institution:'Universitas Diponegoro', major:'Teknik Informatika', graduationYear:'2013' },
      { id:2, level:'S1', institution:'Universitas Diponegoro', major:'Teknik Komputer', graduationYear:'2010' },
    ],
    certifications:[{ id:1, name:'Certified Scrum Master', issuer:'Scrum Alliance', issueYear:'2019', expiryYear:'' }],
    skills:[{ id:1, name:'Backend Development', level:'Expert' }, { id:2, name:'Team Management', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2020-02-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:8, gradeId:58, note:'Bergabung sebagai Senior Manager Engineering' },
    ],
  },
  {
    id:30, nik:'EMP030', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:37, gradeId:51, employmentType:'Permanent',
    managerId:2, joinDate:'2021-05-01', endDate:'', role:'manager',
    name:'Reza Firmansyah',  gender:'Male',   birthPlace:'Jakarta',
    birthDate:'1990-08-25',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3174012508900001', npwp:'45.444.555.6-045.000', bpjs:'',
    phone:'08211001004', email:'reza@company.com', personalEmail:'reza.firmansyah@gmail.com',
    address:'Jl. Kemanggisan No. 18, Jakarta Barat', city:'Jakarta', country:'Indonesia',
    dependents:[{ id:1, name:'Citra Firmansyah', relationship:'Spouse', birthDate:'1992-11-03', gender:'Female' }],
    education:[
      { id:1, level:'S1', institution:'Universitas Bina Nusantara', major:'Teknik Informatika', graduationYear:'2013' },
    ],
    certifications:[{ id:1, name:'Google Cloud Professional Developer', issuer:'Google', issueYear:'2021', expiryYear:'2024' }],
    skills:[{ id:1, name:'Java / Spring Boot', level:'Expert' }, { id:2, name:'Microservices', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2021-05-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:37, gradeId:51, note:'Bergabung sebagai Associate Engineering Manager' },
    ],
  },
  {
    id:31, nik:'EMP031', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:38, gradeId:46, employmentType:'Permanent',
    managerId:30, joinDate:'2021-09-01', endDate:'', role:'employee',
    name:'Tika Rahmawati',   gender:'Female', birthPlace:'Bogor',
    birthDate:'1992-03-17',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3201011703920001', npwp:'', bpjs:'',
    phone:'08211001005', email:'tika@company.com', personalEmail:'tika.rahmawati@gmail.com',
    address:'Jl. Pajajaran No. 55, Bogor', city:'Bogor', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Institut Pertanian Bogor', major:'Ilmu Komputer', graduationYear:'2015' },
    ],
    certifications:[{ id:1, name:'AWS Developer Associate', issuer:'Amazon', issueYear:'2022', expiryYear:'2025' }],
    skills:[{ id:1, name:'Python', level:'Advanced' }, { id:2, name:'Node.js', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2021-09-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:38, gradeId:46, note:'' },
    ],
  },
  {
    id:32, nik:'EMP032', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:39, gradeId:42, employmentType:'Permanent',
    managerId:31, joinDate:'2022-03-15', endDate:'', role:'employee',
    name:'Hendro Cahyo',     gender:'Male',   birthPlace:'Malang',
    birthDate:'1994-07-22',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3573012207940001', npwp:'', bpjs:'',
    phone:'08211001006', email:'hendro@company.com', personalEmail:'hendro.cahyo@gmail.com',
    address:'Jl. Ijen No. 10, Malang', city:'Malang', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Brawijaya', major:'Teknik Informatika', graduationYear:'2016' },
    ],
    certifications:[],
    skills:[{ id:1, name:'React.js', level:'Advanced' }, { id:2, name:'TypeScript', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2022-03-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:39, gradeId:42, note:'' },
    ],
  },
  {
    id:33, nik:'EMP033', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:3, gradeId:30, employmentType:'Permanent',
    managerId:32, joinDate:'2022-08-01', endDate:'', role:'employee',
    name:'Yuni Purnamasari', gender:'Female', birthPlace:'Yogyakarta',
    birthDate:'1996-01-14',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3471011401960001', npwp:'', bpjs:'',
    phone:'08211001007', email:'yuni@company.com', personalEmail:'yuni.purnamasari@gmail.com',
    address:'Jl. Kaliurang No. 25, Yogyakarta', city:'Yogyakarta', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Gadjah Mada', major:'Teknik Informatika', graduationYear:'2018' },
    ],
    certifications:[],
    skills:[{ id:1, name:'PHP / Laravel', level:'Advanced' }, { id:2, name:'MySQL', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2022-08-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:3, gradeId:30, note:'' },
    ],
  },
  {
    id:34, nik:'EMP034', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:1, departmentId:2,
    positionId:40, gradeId:7, employmentType:'Permanent',
    managerId:33, joinDate:'2023-07-01', endDate:'', role:'employee',
    name:'Arif Budiman',     gender:'Male',   birthPlace:'Bekasi',
    birthDate:'1999-04-30',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3216013004990001', npwp:'', bpjs:'',
    phone:'08211001008', email:'arif@company.com', personalEmail:'arif.budiman@gmail.com',
    address:'Jl. Kalimalang No. 12, Bekasi', city:'Bekasi', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Islam Indonesia', major:'Teknik Informatika', graduationYear:'2022' },
    ],
    certifications:[],
    skills:[{ id:1, name:'JavaScript', level:'Intermediate' }, { id:2, name:'React.js', level:'Beginner' }],
    history:[
      { id:1, effectiveDate:'2023-07-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:2, positionId:40, gradeId:7, note:'' },
    ],
  },
  {
    id:35, nik:'EMP035', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:2, departmentId:3,
    positionId:41, gradeId:5, employmentType:'Permanent',
    managerId:34, joinDate:'2024-01-15', endDate:'', role:'employee',
    name:'Siti Kholifah',    gender:'Female', birthPlace:'Purwokerto',
    birthDate:'2001-09-05',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3302010509010001', npwp:'', bpjs:'',
    phone:'08211001009', email:'siti.k@company.com', personalEmail:'siti.kholifah@gmail.com',
    address:'Jl. Jenderal Soedirman No. 40, Purwokerto', city:'Purwokerto', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'D3', institution:'Politeknik Negeri Semarang', major:'Teknik Komputer', graduationYear:'2023' },
    ],
    certifications:[],
    skills:[{ id:1, name:'Microsoft Office', level:'Intermediate' }, { id:2, name:'Data Entry', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2024-01-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:3, positionId:41, gradeId:5, note:'' },
    ],
  },

  // ── NFC — Full org hierarchy (id:36–43) ──────────────────────────────────────
  // Chain: CEO(36) → CFO(8) → VP Finance(37) → GM Finance(11) → Sr Finance Mgr(38)
  //        → Finance Assoc Mgr(39) → Sr Finance Officer(40) → Finance Officer(41)
  //        → Finance Analyst(5) → Finance Staff(42) → Jr Finance Staff(43)
  //        CEO(36) → HR Mgr NFC(15)
  {
    id:36, nik:'EMP036', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:42, gradeId:72, employmentType:'Permanent',
    managerId:null, joinDate:'2014-03-01', endDate:'', role:'superadmin',
    name:'Robert Santoso',   gender:'Male',   birthPlace:'Jakarta',
    birthDate:'1970-05-15',  nationality:'Indonesian', religion:'Katolik',
    maritalStatus:'Married', ktp:'3174011505700001', npwp:'11.100.200.3-011.000', bpjs:'',
    phone:'08222001001', email:'robert@company.com', personalEmail:'robert.santoso@gmail.com',
    address:'Jl. Thamrin No. 10, Jakarta Pusat', city:'Jakarta', country:'Indonesia',
    dependents:[
      { id:1, name:'Linda Santoso', relationship:'Spouse', birthDate:'1973-09-22', gender:'Female' },
      { id:2, name:'Kevin Santoso', relationship:'Child',  birthDate:'2000-04-10', gender:'Male'   },
    ],
    education:[
      { id:1, level:'S2', institution:'Universitas Indonesia', major:'Manajemen Keuangan', graduationYear:'1997' },
      { id:2, level:'S1', institution:'Universitas Indonesia', major:'Akuntansi', graduationYear:'1994' },
    ],
    certifications:[{ id:1, name:'Chartered Financial Analyst (CFA)', issuer:'CFA Institute', issueYear:'2005', expiryYear:'' }],
    skills:[{ id:1, name:'Financial Strategy', level:'Expert' }, { id:2, name:'Corporate Governance', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2014-03-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:42, gradeId:72, note:'Bergabung sebagai President Director NFC' },
    ],
  },
  {
    id:37, nik:'EMP037', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:15, gradeId:65, employmentType:'Permanent',
    managerId:8, joinDate:'2017-06-01', endDate:'', role:'manager',
    name:'Lena Wahyuni',     gender:'Female', birthPlace:'Bandung',
    birthDate:'1982-02-19',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'3273011902820001', npwp:'23.200.300.4-023.000', bpjs:'',
    phone:'08222001002', email:'lena@company.com', personalEmail:'lena.wahyuni@gmail.com',
    address:'Jl. Buah Batu No. 30, Bandung', city:'Bandung', country:'Indonesia',
    dependents:[{ id:1, name:'Dedy Wahyuni', relationship:'Spouse', birthDate:'1980-06-15', gender:'Male' }],
    education:[
      { id:1, level:'S2', institution:'Universitas Padjadjaran', major:'Manajemen Keuangan', graduationYear:'2008' },
      { id:2, level:'S1', institution:'Universitas Padjadjaran', major:'Akuntansi', graduationYear:'2005' },
    ],
    certifications:[{ id:1, name:'Certified Public Accountant (CPA)', issuer:'IAPI', issueYear:'2011', expiryYear:'' }],
    skills:[{ id:1, name:'Financial Analysis', level:'Expert' }, { id:2, name:'Budgeting', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2017-06-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:15, gradeId:65, note:'Bergabung sebagai VP Finance' },
    ],
  },
  {
    id:38, nik:'EMP038', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:43, gradeId:57, employmentType:'Permanent',
    managerId:11, joinDate:'2018-09-01', endDate:'', role:'manager',
    name:'Priyanka Dewi',    gender:'Female', birthPlace:'Surabaya',
    birthDate:'1985-10-07',  nationality:'Indonesian', religion:'Hindu',
    maritalStatus:'Married', ktp:'3578011007850001', npwp:'34.300.400.5-034.000', bpjs:'',
    phone:'08222001003', email:'priyanka@company.com', personalEmail:'priyanka.dewi@gmail.com',
    address:'Jl. Embong Malang No. 15, Surabaya', city:'Surabaya', country:'Indonesia',
    dependents:[{ id:1, name:'Arjun Dewi', relationship:'Spouse', birthDate:'1983-03-25', gender:'Male' }],
    education:[
      { id:1, level:'S2', institution:'Universitas Airlangga', major:'Akuntansi', graduationYear:'2010' },
      { id:2, level:'S1', institution:'Universitas Airlangga', major:'Manajemen', graduationYear:'2007' },
    ],
    certifications:[{ id:1, name:'Brevet AB Pajak', issuer:'BNSP', issueYear:'2014', expiryYear:'' }],
    skills:[{ id:1, name:'Financial Reporting', level:'Expert' }, { id:2, name:'Tax Management', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2018-09-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:43, gradeId:57, note:'Bergabung sebagai Senior Finance Manager' },
    ],
  },
  {
    id:39, nik:'EMP039', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:44, gradeId:51, employmentType:'Permanent',
    managerId:38, joinDate:'2020-07-01', endDate:'', role:'manager',
    name:'Dimas Ardianto',   gender:'Male',   birthPlace:'Solo',
    birthDate:'1989-12-03',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3372010312890001', npwp:'45.400.500.6-045.000', bpjs:'',
    phone:'08222001004', email:'dimas@company.com', personalEmail:'dimas.ardianto@gmail.com',
    address:'Jl. Slamet Riyadi No. 25, Solo', city:'Solo', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Sebelas Maret', major:'Akuntansi', graduationYear:'2012' },
    ],
    certifications:[{ id:1, name:'Brevet A Pajak', issuer:'BNSP', issueYear:'2016', expiryYear:'' }],
    skills:[{ id:1, name:'Cost Accounting', level:'Advanced' }, { id:2, name:'Financial Modeling', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2020-07-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:44, gradeId:51, note:'Bergabung sebagai Finance Associate Manager' },
    ],
  },
  {
    id:40, nik:'EMP040', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:45, gradeId:46, employmentType:'Permanent',
    managerId:39, joinDate:'2021-02-15', endDate:'', role:'employee',
    name:'Clara Natalia',    gender:'Female', birthPlace:'Medan',
    birthDate:'1991-06-18',  nationality:'Indonesian', religion:'Kristen',
    maritalStatus:'Single',  ktp:'1271011806910001', npwp:'', bpjs:'',
    phone:'08222001005', email:'clara@company.com', personalEmail:'clara.natalia@gmail.com',
    address:'Jl. Imam Bonjol No. 20, Medan', city:'Medan', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Sumatera Utara', major:'Akuntansi', graduationYear:'2014' },
    ],
    certifications:[],
    skills:[{ id:1, name:'Accounts Payable/Receivable', level:'Advanced' }, { id:2, name:'SAP FI', level:'Intermediate' }],
    history:[
      { id:1, effectiveDate:'2021-02-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:45, gradeId:46, note:'' },
    ],
  },
  {
    id:41, nik:'EMP041', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:46, gradeId:41, employmentType:'Permanent',
    managerId:40, joinDate:'2022-01-03', endDate:'', role:'employee',
    name:'Kevin Simanjuntak', gender:'Male',   birthPlace:'Pematangsiantar',
    birthDate:'1994-09-15',  nationality:'Indonesian', religion:'Kristen',
    maritalStatus:'Single',  ktp:'1275011509940001', npwp:'', bpjs:'',
    phone:'08222001006', email:'kevin@company.com', personalEmail:'kevin.simanjuntak@gmail.com',
    address:'Jl. Merdeka No. 8, Pematangsiantar', city:'Pematangsiantar', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas HKBP Nommensen', major:'Akuntansi', graduationYear:'2017' },
    ],
    certifications:[],
    skills:[{ id:1, name:'Excel / Spreadsheet', level:'Advanced' }, { id:2, name:'Cash Management', level:'Intermediate' }],
    history:[
      { id:1, effectiveDate:'2022-01-03', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:46, gradeId:41, note:'' },
    ],
  },
  {
    id:42, nik:'EMP042', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:47, gradeId:13, employmentType:'Permanent',
    managerId:41, joinDate:'2023-03-01', endDate:'', role:'employee',
    name:'Putri Anggraeni',  gender:'Female', birthPlace:'Bandung',
    birthDate:'1997-11-20',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3273012011970001', npwp:'', bpjs:'',
    phone:'08222001007', email:'putri.a@company.com', personalEmail:'putri.anggraeni@gmail.com',
    address:'Jl. Cibiru No. 55, Bandung', city:'Bandung', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Universitas Padjadjaran', major:'Akuntansi', graduationYear:'2020' },
    ],
    certifications:[],
    skills:[{ id:1, name:'General Ledger', level:'Intermediate' }, { id:2, name:'SAP FI', level:'Beginner' }],
    history:[
      { id:1, effectiveDate:'2023-03-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:47, gradeId:13, note:'' },
    ],
  },
  {
    id:43, nik:'EMP043', status:'Active', photo:null,
    companyId:2, divisionId:3, businessUnitId:3, departmentId:4,
    positionId:48, gradeId:7, employmentType:'Permanent',
    managerId:42, joinDate:'2024-02-01', endDate:'', role:'employee',
    name:'Yoga Pratama',     gender:'Male',   birthPlace:'Bogor',
    birthDate:'2000-03-08',  nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single',  ktp:'3201010803000001', npwp:'', bpjs:'',
    phone:'08222001008', email:'yoga@company.com', personalEmail:'yoga.pratama@gmail.com',
    address:'Jl. Cibinong No. 12, Bogor', city:'Bogor', country:'Indonesia',
    dependents:[],
    education:[
      { id:1, level:'D3', institution:'Politeknik Keuangan Negara STAN', major:'Akuntansi', graduationYear:'2023' },
    ],
    certifications:[],
    skills:[{ id:1, name:'Data Entry', level:'Advanced' }, { id:2, name:'Microsoft Excel', level:'Intermediate' }],
    history:[
      { id:1, effectiveDate:'2024-02-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:2, departmentId:4, positionId:48, gradeId:7, note:'' },
    ],
  },

  // ── Philippines, Inc. — Full org hierarchy (id:44–50) ────────────────────────
  // Chain: CEO(44) → CTO(45) → Eng Mgr(17) → Assoc Eng Mgr(47) → Jr Staff(49) → Clerk(50)
  //        CEO(44) → CTO(45) → QA Supervisor(48) → QA Lead(23) → QA Eng(24)
  //        CEO(44) → SVP HR(46) → HR Mgr(25) → HR Officer(26)
  {
    id:44, nik:'PHIL011', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:49, gradeId:72, employmentType:'Permanent',
    managerId:null, joinDate:'2016-01-15', endDate:'', role:'superadmin',
    name:'Carlos Reyes',     gender:'Male',   birthPlace:'Manila',
    birthDate:'1970-07-20',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Married', ktp:'34-1100001-1', npwp:'100-200-300-001', bpjs:'12-1100001-1',
    phone:'09171001001', email:'carlos@company.com', personalEmail:'carlos.reyes@gmail.com',
    address:'Penthouse, BGC, Taguig City', city:'Taguig', country:'Philippines',
    dependents:[
      { id:1, name:'Isabella Reyes', relationship:'Spouse', birthDate:'1973-03-14', gender:'Female' },
      { id:2, name:'Marco Reyes',    relationship:'Child',  birthDate:'2000-08-10', gender:'Male'   },
    ],
    education:[
      { id:1, level:'S2', institution:'Asian Institute of Management', major:'Business Administration', graduationYear:'1997' },
      { id:2, level:'S1', institution:'De La Salle University', major:'Computer Science', graduationYear:'1993' },
    ],
    certifications:[{ id:1, name:'Certified Information Systems Manager', issuer:'ISACA', issueYear:'2008', expiryYear:'' }],
    skills:[{ id:1, name:'Corporate Strategy', level:'Expert' }, { id:2, name:'Business Development', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2016-01-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:7, positionId:49, gradeId:72, note:'Joined as President Director / CEO' },
    ],
  },
  {
    id:45, nik:'PHIL012', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:50, gradeId:70, employmentType:'Permanent',
    managerId:44, joinDate:'2017-05-01', endDate:'', role:'manager',
    name:'Jennifer Lim',     gender:'Female', birthPlace:'Cebu City',
    birthDate:'1975-04-12',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Married', ktp:'34-1100002-2', npwp:'100-200-300-002', bpjs:'12-1100002-2',
    phone:'09171001002', email:'jennifer@company.com', personalEmail:'jennifer.lim@gmail.com',
    address:'12 Ayala Ave, Makati City', city:'Makati', country:'Philippines',
    dependents:[{ id:1, name:'Stanley Lim', relationship:'Spouse', birthDate:'1973-08-22', gender:'Male' }],
    education:[
      { id:1, level:'S2', institution:'Ateneo de Manila University', major:'Information Systems', graduationYear:'2001' },
      { id:2, level:'S1', institution:'University of the Philippines', major:'Computer Science', graduationYear:'1997' },
    ],
    certifications:[
      { id:1, name:'AWS Solutions Architect Professional', issuer:'Amazon', issueYear:'2019', expiryYear:'2022' },
      { id:2, name:'TOGAF 9 Certified', issuer:'The Open Group', issueYear:'2017', expiryYear:'' },
    ],
    skills:[{ id:1, name:'Enterprise Architecture', level:'Expert' }, { id:2, name:'Cloud Strategy', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2017-05-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:7, positionId:50, gradeId:70, note:'Joined as Chief Technology Officer' },
    ],
  },
  {
    id:46, nik:'PHIL013', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:8, departmentId:10,
    positionId:51, gradeId:67, employmentType:'Permanent',
    managerId:44, joinDate:'2018-08-01', endDate:'', role:'hr',
    name:'Rose Santos',      gender:'Female', birthPlace:'Davao City',
    birthDate:'1978-11-30',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Married', ktp:'34-1100003-3', npwp:'100-200-300-003', bpjs:'12-1100003-3',
    phone:'09171001003', email:'rose@company.com', personalEmail:'rose.santos@gmail.com',
    address:'55 Burgos Circle, BGC, Taguig City', city:'Taguig', country:'Philippines',
    dependents:[{ id:1, name:'Paul Santos', relationship:'Spouse', birthDate:'1976-04-08', gender:'Male' }],
    education:[
      { id:1, level:'S2', institution:'University of the Philippines', major:'Human Resources', graduationYear:'2004' },
      { id:2, level:'S1', institution:'Ateneo de Davao University', major:'Psychology', graduationYear:'2001' },
    ],
    certifications:[{ id:1, name:'SHRM Senior Certified Professional', issuer:'SHRM', issueYear:'2012', expiryYear:'' }],
    skills:[{ id:1, name:'HR Strategy', level:'Expert' }, { id:2, name:'Organizational Development', level:'Expert' }],
    history:[
      { id:1, effectiveDate:'2018-08-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:10, positionId:51, gradeId:67, note:'Joined as SVP Human Resources' },
    ],
  },
  {
    id:47, nik:'PHIL014', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:52, gradeId:51, employmentType:'Permanent',
    managerId:17, joinDate:'2021-10-01', endDate:'', role:'manager',
    name:'Marco Dela Cruz',  gender:'Male',   birthPlace:'Laguna',
    birthDate:'1988-09-14',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Single',  ktp:'34-1100004-4', npwp:'100-200-300-004', bpjs:'12-1100004-4',
    phone:'09171001004', email:'marco.delacruz@company.com', personalEmail:'marco.delacruz@gmail.com',
    address:'30 Real St, Sta Cruz, Laguna', city:'Laguna', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Laguna State Polytechnic University', major:'Computer Engineering', graduationYear:'2011' },
    ],
    certifications:[{ id:1, name:'Certified Scrum Master', issuer:'Scrum Alliance', issueYear:'2020', expiryYear:'' }],
    skills:[{ id:1, name:'React.js', level:'Expert' }, { id:2, name:'Node.js', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2021-10-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:7, positionId:52, gradeId:51, note:'Joined as Associate Engineering Manager' },
    ],
  },
  {
    id:48, nik:'PHIL015', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:7, departmentId:9,
    positionId:53, gradeId:42, employmentType:'Permanent',
    managerId:45, joinDate:'2019-11-01', endDate:'', role:'manager',
    name:'Angelo Bautista',  gender:'Male',   birthPlace:'Cavite',
    birthDate:'1986-05-28',  nationality:'Filipino', religion:'Kristen',
    maritalStatus:'Married', ktp:'34-1100005-5', npwp:'100-200-300-005', bpjs:'12-1100005-5',
    phone:'09171001005', email:'angelo.bautista@company.com', personalEmail:'angelobautista@gmail.com',
    address:'15 Noveleta St, Cavite City', city:'Cavite', country:'Philippines',
    dependents:[{ id:1, name:'Diana Bautista', relationship:'Spouse', birthDate:'1988-09-12', gender:'Female' }],
    education:[
      { id:1, level:'S1', institution:'Cavite State University', major:'Computer Science', graduationYear:'2009' },
    ],
    certifications:[{ id:1, name:'ISTQB Certified Tester Advanced Level', issuer:'ISTQB', issueYear:'2018', expiryYear:'' }],
    skills:[{ id:1, name:'Test Automation', level:'Expert' }, { id:2, name:'QA Leadership', level:'Advanced' }],
    history:[
      { id:1, effectiveDate:'2019-11-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:9, positionId:53, gradeId:42, note:'Joined as QA Supervisor' },
    ],
  },
  {
    id:49, nik:'PHIL016', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:7,
    positionId:54, gradeId:7, employmentType:'Permanent',
    managerId:47, joinDate:'2024-04-01', endDate:'', role:'employee',
    name:'Sophia Mendoza',   gender:'Female', birthPlace:'Batangas',
    birthDate:'2001-02-15',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Single',  ktp:'34-1100006-6', npwp:'100-200-300-006', bpjs:'12-1100006-6',
    phone:'09171001006', email:'sophia.mendoza@company.com', personalEmail:'sophiamendoza@gmail.com',
    address:'8 P. Burgos St, Batangas City', city:'Batangas', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'S1', institution:'Batangas State University', major:'Information Technology', graduationYear:'2023' },
    ],
    certifications:[],
    skills:[{ id:1, name:'JavaScript', level:'Beginner' }, { id:2, name:'HTML / CSS', level:'Intermediate' }],
    history:[
      { id:1, effectiveDate:'2024-04-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:7, positionId:54, gradeId:7, note:'' },
    ],
  },
  {
    id:50, nik:'PHIL017', status:'Active', photo:null,
    companyId:3, divisionId:1, businessUnitId:6, departmentId:8,
    positionId:55, gradeId:5, employmentType:'Permanent',
    managerId:49, joinDate:'2024-06-01', endDate:'', role:'employee',
    name:'Luis Garcia',      gender:'Male',   birthPlace:'Rizal',
    birthDate:'2002-07-22',  nationality:'Filipino', religion:'Katolik',
    maritalStatus:'Single',  ktp:'34-1100007-7', npwp:'100-200-300-007', bpjs:'12-1100007-7',
    phone:'09171001007', email:'luis.garcia@company.com', personalEmail:'luisgarcia@gmail.com',
    address:'5 Ortigas Ave Ext, Antipolo, Rizal', city:'Antipolo', country:'Philippines',
    dependents:[],
    education:[
      { id:1, level:'SMA', institution:'Rizal High School', major:'General', graduationYear:'2021' },
    ],
    certifications:[],
    skills:[{ id:1, name:'Data Entry', level:'Beginner' }, { id:2, name:'Microsoft Office', level:'Intermediate' }],
    history:[
      { id:1, effectiveDate:'2024-06-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:3, departmentId:8, positionId:55, gradeId:5, note:'' },
    ],
  },
  // ── Demo users for HR / Organization Development roles ───────────────────────
  {
    id:51, nik:'EMP051', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:23, gradeId:20, employmentType:'Permanent',
    managerId:12, joinDate:'2023-02-01', endDate:'', role:'hr_officer',
    name:'Nadia Pratiwi', gender:'Female', birthPlace:'Jakarta',
    birthDate:'1994-08-12', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Single', ktp:'', npwp:'', bpjs:'',
    phone:'0812000051', email:'nadia.hro@company.com', personalEmail:'',
    address:'Jakarta', city:'Jakarta', country:'Indonesia',
    dependents:[], education:[], certifications:[], skills:[],
    history:[{ id:1, effectiveDate:'2023-02-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:5, positionId:23, gradeId:20, note:'' }],
  },
  {
    id:52, nik:'EMP052', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:22, gradeId:53, employmentType:'Permanent',
    managerId:9, joinDate:'2021-09-01', endDate:'', role:'hr_manager',
    name:'Bambang Wijaya', gender:'Male', birthPlace:'Semarang',
    birthDate:'1986-03-25', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'', npwp:'', bpjs:'',
    phone:'0812000052', email:'bambang.hrm@company.com', personalEmail:'',
    address:'Jakarta', city:'Jakarta', country:'Indonesia',
    dependents:[], education:[], certifications:[], skills:[],
    history:[{ id:1, effectiveDate:'2021-09-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:5, positionId:22, gradeId:53, note:'' }],
  },
  {
    id:53, nik:'EMP053', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:23, gradeId:20, employmentType:'Permanent',
    managerId:54, joinDate:'2023-05-15', endDate:'', role:'od_officer',
    name:'Citra Lestari', gender:'Female', birthPlace:'Bandung',
    birthDate:'1995-11-02', nationality:'Indonesian', religion:'Kristen',
    maritalStatus:'Single', ktp:'', npwp:'', bpjs:'',
    phone:'0812000053', email:'citra.odo@company.com', personalEmail:'',
    address:'Jakarta', city:'Jakarta', country:'Indonesia',
    dependents:[], education:[], certifications:[], skills:[],
    history:[{ id:1, effectiveDate:'2023-05-15', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:5, positionId:23, gradeId:20, note:'' }],
  },
  {
    id:54, nik:'EMP054', status:'Active', photo:null,
    companyId:1, divisionId:1, businessUnitId:4, departmentId:5,
    positionId:22, gradeId:53, employmentType:'Permanent',
    managerId:9, joinDate:'2020-07-01', endDate:'', role:'od_manager',
    name:'Surya Hidayat', gender:'Male', birthPlace:'Surabaya',
    birthDate:'1984-01-18', nationality:'Indonesian', religion:'Islam',
    maritalStatus:'Married', ktp:'', npwp:'', bpjs:'',
    phone:'0812000054', email:'surya.odm@company.com', personalEmail:'',
    address:'Jakarta', city:'Jakarta', country:'Indonesia',
    dependents:[], education:[], certifications:[], skills:[],
    history:[{ id:1, effectiveDate:'2020-07-01', effectiveSeq:1, action:'Hire', reason:'New Hire', companyId:1, departmentId:5, positionId:22, gradeId:53, note:'' }],
  },
]

let _empId     = 55   // after 54 seed employees
let _depId     = 10
let _eduId     = 10
let _certId    = 10
let _skillId   = 10
let _histId    = 20

export const useEmployeeStore = create((set, get) => ({
  // Demo seed employees (ids 1–50, used by login/demo flows). Imported employees
  // from the Excel upload (ids 200001+) are hydrated at runtime — see bottom of file.
  employees: SEED_EMPLOYEES.map(e => ({ ...e,
    dependents:     (e.dependents     || []).map(x=>({...x})),
    education:      (e.education      || []).map(x=>({...x})),
    certifications: (e.certifications || []).map(x=>({...x})),
    skills:         (e.skills         || []).map(x=>({...x})),
    history:        (e.history        || []).map(x=>({...x})),
  })),
  lastAddedEmpId: null,

  // ── Employee CRUD ──────────────────────────────────────────────
  addEmployee: (d) => set(s => {
    const id = _empId++
    return {
      lastAddedEmpId: id,
      employees: [...s.employees, {
        id, photo: null,
        dependents: [], education: [], certifications: [], skills: [],
        history: d.joinDate ? [{
          id: _histId++, effectiveDate: d.joinDate, effectiveSeq: 1,
          action: 'Hire', reason: 'New Hire',
          companyId: d.companyId||'', departmentId: d.departmentId||'',
          positionId: d.positionId||'', gradeId: d.gradeId||'', note: '',
        }] : [],
        ...d
      }],
    }
  }),
  updateEmployee: (id, d) => set(s => ({
    employees: s.employees.map(e => e.id === id ? { ...e, ...d } : e)
  })),
  deleteEmployee: (id)   => set(s => ({
    employees: s.employees.filter(e => e.id !== id)
  })),

  // ── Photo ──────────────────────────────────────────────────────
  setPhoto: (id, dataUrl) => set(s => ({
    employees: s.employees.map(e => e.id === id ? { ...e, photo: dataUrl } : e)
  })),

  // ── Dependents ─────────────────────────────────────────────────
  addDependent: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, dependents: [...e.dependents, { id: _depId++, ...d }] }
      : e)
  })),
  updateDependent: (empId, depId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, dependents: e.dependents.map(x => x.id === depId ? {...x,...d} : x) }
      : e)
  })),
  deleteDependent: (empId, depId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, dependents: e.dependents.filter(x => x.id !== depId) }
      : e)
  })),

  // ── Education ──────────────────────────────────────────────────
  addEducation: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, education: [...e.education, { id: _eduId++, ...d }] }
      : e)
  })),
  updateEducation: (empId, eduId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, education: e.education.map(x => x.id === eduId ? { ...x, ...d } : x) }
      : e)
  })),
  deleteEducation: (empId, eduId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, education: e.education.filter(x => x.id !== eduId) }
      : e)
  })),

  // ── Certifications ─────────────────────────────────────────────
  addCertification: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, certifications: [...e.certifications, { id: _certId++, ...d }] }
      : e)
  })),
  updateCertification: (empId, certId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, certifications: e.certifications.map(x => x.id === certId ? { ...x, ...d } : x) }
      : e)
  })),
  deleteCertification: (empId, certId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, certifications: e.certifications.filter(x => x.id !== certId) }
      : e)
  })),

  // ── Skills ─────────────────────────────────────────────────────
  addSkill: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, skills: [...e.skills, { id: _skillId++, ...d }] }
      : e)
  })),
  updateSkill: (empId, skillId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, skills: e.skills.map(x => x.id === skillId ? { ...x, ...d } : x) }
      : e)
  })),
  deleteSkill: (empId, skillId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, skills: e.skills.filter(x => x.id !== skillId) }
      : e)
  })),

  // ── History ────────────────────────────────────────────────────
  addHistory: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, history: [...(e.history||[]), { id: _histId++, ...d }]
            .sort((a,b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.effectiveSeq - b.effectiveSeq) }
      : e)
  })),
  updateHistory: (empId, histId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, history: e.history.map(h => h.id === histId ? {...h,...d} : h) }
      : e)
  })),
  deleteHistory: (empId, histId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, history: e.history.filter(h => h.id !== histId) }
      : e)
  })),
}))

// ─── Hydrate imported employees (from Excel upload) ───────────────────────────
// The dataset is large (~9.9 MB / 9,940 records), so it is served as a static
// asset from /public and fetched at runtime instead of being bundled into the JS.
// Appended once on the client, non-destructively, on top of the demo seed.
if (typeof window !== 'undefined' && !window.__kpbEmployeesLoaded) {
  window.__kpbEmployeesLoaded = true
  fetch('/data/importedEmployees.json')
    .then(r => r.json())
    .then(list => useEmployeeStore.setState(s => ({ employees: [...s.employees, ...list] })))
    .catch(() => { window.__kpbEmployeesLoaded = false })
}
