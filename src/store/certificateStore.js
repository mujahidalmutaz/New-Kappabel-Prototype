import { create } from 'zustand'

export const THEMES = [
  { id:'navy',    label:'Navy Corporate',    primary:'#8B1A1A', accent:'#D7252B', bg:'#f0f4ff', border:'#8B1A1A', text:'#8B1A1A' },
  { id:'maroon',  label:'Maroon Prestige',   primary:'#7b1d1d', accent:'#b91c1c', bg:'#fff5f5', border:'#7b1d1d', text:'#7b1d1d' },
  { id:'forest',  label:'Forest Green',      primary:'#14532d', accent:'#166534', bg:'#f0fdf4', border:'#14532d', text:'#14532d' },
  { id:'gold',    label:'Gold Executive',    primary:'#78350f', accent:'#d97706', bg:'#fffbeb', border:'#92400e', text:'#78350f' },
  { id:'slate',   label:'Slate Modern',      primary:'#1e293b', accent:'#475569', bg:'#f8fafc', border:'#334155', text:'#1e293b' },
  { id:'purple',  label:'Royal Purple',      primary:'#4c1d95', accent:'#7c3aed', bg:'#f5f3ff', border:'#5b21b6', text:'#4c1d95' },
  { id:'teal',    label:'Teal Professional', primary:'#134e4a', accent:'#0f766e', bg:'#f0fdfa', border:'#115e59', text:'#134e4a' },
  { id:'crimson', label:'Crimson Premium',   primary:'#881337', accent:'#be123c', bg:'#fff1f2', border:'#9f1239', text:'#881337' },
]

const INIT_COURSE_SETTINGS = [
  { id:1, course:'K3 & Keselamatan Kerja',        templateId:1, min_score:70,  attendance_req:80,  validity_months:24, auto_generate:true,  approver:'HR Manager',       approver_title:'Human Resources Manager',        status:'Active' },
  { id:2, course:'Leadership Fundamentals Level 1',templateId:2, min_score:75,  attendance_req:100, validity_months:0,  auto_generate:true,  approver:'Head of L&D',      approver_title:'Head of Learning & Development',  status:'Active' },
  { id:3, course:'GCG Compliance Certification',   templateId:3, min_score:80,  attendance_req:100, validity_months:12, auto_generate:false, approver:'Compliance Manager',approver_title:'GCG & Compliance Manager',         status:'Active' },
  { id:4, course:'Excel Advanced for HR',          templateId:1, min_score:70,  attendance_req:80,  validity_months:0,  auto_generate:true,  approver:'HR Learning Admin', approver_title:'HR Learning Administrator',        status:'Active' },
  { id:5, course:'Pengenalan HCMS System',         templateId:1, min_score:70,  attendance_req:80,  validity_months:0,  auto_generate:true,  approver:'HR Manager',       approver_title:'Human Resources Manager',        status:'Active' },
]

const INIT_TEMPLATES = [
  { id:1, companyId:1, themeId:'navy',   fileName:'cert_nusantara_teknologi.rtf', uploadedAt:'2025-06-10', status:'Active', notes:'Template utama PT Nusantara Teknologi.', rtfContent: null },
  { id:2, companyId:2, themeId:'maroon', fileName:null,                           uploadedAt:null,         status:'Draft',  notes:'',                                       rtfContent: null },
]

export const useCertificateStore = create((set) => ({
  templates:      INIT_TEMPLATES,
  courseSettings: INIT_COURSE_SETTINGS,

  setTemplates:      (fn) => set(s => ({ templates:      typeof fn === 'function' ? fn(s.templates)      : fn })),
  setCourseSettings: (fn) => set(s => ({ courseSettings: typeof fn === 'function' ? fn(s.courseSettings) : fn })),

  updateTemplateRtf: (tplId, rtfContent) => set(s => ({
    templates: s.templates.map(t => t.id === tplId ? { ...t, rtfContent } : t),
  })),
}))
