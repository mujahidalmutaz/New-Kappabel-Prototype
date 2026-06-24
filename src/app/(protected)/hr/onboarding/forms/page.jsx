'use client'
import { useState } from 'react'
import { useMasterFormStore } from '@/store/masterFormStore'
import { useT }               from '@/store/languageStore'
import { PageHeader, SectionCard, ActionButton, EmptyState, BRAND_GRADIENT } from '@/components/ui'
import { FIELD_TYPES, newField } from '@/utils/formBuilderUtils'

// ── Constants ─────────────────────────────────────────────────────────────────
const FORM_TYPES = [
  { value: 'field',    label: '📝 Configurable Field', desc: 'Form isian bebas dengan field Text, Dropdown, Date, dll.' },
  { value: 'evaluasi', label: '📊 Form Evaluasi',      desc: 'Tabel evaluasi per topik dengan nilai dan kesimpulan. Diisi oleh SME/instruktur setelah tiap materi selesai.' },
  { value: 'summary',  label: '📋 Form Summary',       desc: 'Ringkasan otomatis seluruh task onboarding yang sudah diselesaikan. Tidak perlu konfigurasi field.' },
]

const EVAL_METHODS = [
  { value: 'nilai',     label: 'Nilai (A / B / C / D / E)', desc: 'A=85–100, B=70–84, C=60–69, D=40–59, E=<40. Lulus jika nilai ≥ 60.' },
  { value: 'observasi', label: 'Observasi (+  /  0  /  −)',  desc: '(+) Mampu, (0) Butuh pengarahan, (−) Perlu pelatihan ulang.' },
]

const KESIMPULAN_OPTS = ['Lulus', 'Mengulang', 'Tidak Lulus']

const EMPTY_FORM = {
  name: '', description: '', active: true,
  formType: 'field',
  fields: [],
  evalMethod: 'nilai',
  evalTopics: [],   // for evaluasi type: pre-defined topic rows
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formTypeBadge(ft) {
  const map = {
    field:    'bg-blue-50 text-blue-700 border-blue-200',
    evaluasi: 'bg-amber-50 text-amber-700 border-amber-200',
    summary:  'bg-teal-50 text-teal-700 border-teal-200',
  }
  const labels = { field: 'Configurable', evaluasi: 'Evaluasi', summary: 'Summary' }
  return { cls: map[ft] ?? 'bg-gray-100 text-gray-500 border-gray-200', label: labels[ft] ?? ft }
}

function newTopic() {
  return { id: `t_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, label: '', section: '' }
}

// ── Field editor (for "field" type) ──────────────────────────────────────────
function FieldEditor({ fields, onChange }) {
  const add  = () => onChange([...fields, newField()])
  const del  = (id) => onChange(fields.filter(f => f.id !== id))
  const upd  = (id, key, val) => onChange(fields.map(f => f.id === id ? { ...f, [key]: val } : f))
  const move = (idx, dir) => {
    const arr = [...fields]; const swp = idx + dir
    if (swp < 0 || swp >= arr.length) return
    ;[arr[idx], arr[swp]] = [arr[swp], arr[idx]]; onChange(arr)
  }
  return (
    <div>
      <div className='flex items-center justify-between mb-3'>
        <span className='text-sm font-bold text-gray-700'>Fields</span>
        <button onClick={add} className='text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold transition'>+ Tambah Field</button>
      </div>
      {fields.length === 0 && (
        <div className='text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl'>
          Belum ada field. Klik "+ Tambah Field" untuk mulai.
        </div>
      )}
      <div className='space-y-2'>
        {fields.map((f, idx) => (
          <div key={f.id} className='flex items-start gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5 shadow-sm'>
            <div className='flex flex-col gap-0.5 pt-1'>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▲</button>
              <button onClick={() => move(idx, 1)} disabled={idx === fields.length - 1} className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▼</button>
            </div>
            <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-2'>
              <div className='md:col-span-2'>
                <label className='block text-[10px] text-gray-400 mb-0.5'>Label</label>
                <input value={f.label} onChange={e => upd(f.id, 'label', e.target.value)} placeholder='Nama field…'
                  className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-[10px] text-gray-400 mb-0.5'>Tipe</label>
                <select value={f.type} onChange={e => upd(f.id, 'type', e.target.value)}
                  className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className='flex items-end gap-3 pb-0.5'>
                <label className='flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer'>
                  <input type='checkbox' checked={!!f.required} onChange={e => upd(f.id, 'required', e.target.checked)} className='w-3.5 h-3.5 accent-red-600' />Wajib
                </label>
                <button onClick={() => del(f.id)} className='ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none'>✕</button>
              </div>
              {(f.type === 'dropdown' || f.type === 'radio') && (
                <div className='md:col-span-4'>
                  <label className='block text-[10px] text-gray-400 mb-0.5'>Opsi (pisah koma)</label>
                  <input value={f.options || ''} onChange={e => upd(f.id, 'options', e.target.value)}
                    placeholder='Contoh: Setuju, Tidak Setuju, Abstain'
                    className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              )}
              {f.type === 'text' && (
                <div className='md:col-span-4'>
                  <label className='block text-[10px] text-gray-400 mb-0.5'>Placeholder (opsional)</label>
                  <input value={f.placeholder || ''} onChange={e => upd(f.id, 'placeholder', e.target.value)}
                    placeholder='Teks petunjuk pengisian…'
                    className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Evaluasi editor (for "evaluasi" type) ─────────────────────────────────────
function EvaluasiEditor({ draft, setDraft }) {
  const topics = draft.evalTopics ?? []
  const method = draft.evalMethod ?? 'nilai'
  const addTopic = () => setDraft(d => ({ ...d, evalTopics: [...(d.evalTopics ?? []), newTopic()] }))
  const delTopic = (id) => setDraft(d => ({ ...d, evalTopics: d.evalTopics.filter(t => t.id !== id) }))
  const updTopic = (id, key, val) => setDraft(d => ({ ...d, evalTopics: d.evalTopics.map(t => t.id === id ? { ...t, [key]: val } : t) }))

  return (
    <div className='space-y-6'>
      {/* Eval method */}
      <div>
        <label className='block text-xs font-semibold text-gray-700 mb-2'>Metode Evaluasi</label>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {EVAL_METHODS.map(m => (
            <label key={m.value} onClick={() => setDraft(d => ({ ...d, evalMethod: m.value }))}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${method === m.value ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type='radio' checked={method === m.value} onChange={() => {}} className='mt-0.5 accent-red-600' />
              <div>
                <p className='text-sm font-semibold text-gray-800'>{m.label}</p>
                <p className='text-xs text-gray-400 mt-0.5'>{m.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Topic rows */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <div>
            <span className='text-sm font-bold text-gray-700'>Topik / Materi</span>
            <p className='text-xs text-gray-400 mt-0.5'>Pre-define topik yang akan dievaluasi. Kosongkan jika topik mengikuti task onboarding otomatis.</p>
          </div>
          <button onClick={addTopic} className='text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold transition'>+ Tambah Topik</button>
        </div>

        {topics.length === 0 ? (
          <div className='text-center py-6 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl'>
            Topik akan diisi otomatis dari task onboarding saat form digunakan.<br />
            Atau tambahkan topik manual di sini.
          </div>
        ) : (
          <div className='overflow-x-auto rounded-xl border border-gray-200'>
            <table className='w-full text-sm'>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  {['No', 'Materi / Topik', 'Bagian (Section)', ''].map((h, i) => (
                    <th key={i} className='text-left px-3 py-2 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topics.map((tp, idx) => (
                  <tr key={tp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className='px-3 py-1.5 text-center text-gray-400 text-xs w-8'>{idx + 1}</td>
                    <td className='px-2 py-1.5'>
                      <input value={tp.label} onChange={e => updTopic(tp.id, 'label', e.target.value)}
                        placeholder='Nama materi / topik…'
                        className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400' />
                    </td>
                    <td className='px-2 py-1.5 w-40'>
                      <input value={tp.section} onChange={e => updTopic(tp.id, 'section', e.target.value)}
                        placeholder='Dept / Bagian…'
                        className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400' />
                    </td>
                    <td className='px-2 py-1.5 w-8 text-center'>
                      <button onClick={() => delTopic(tp.id)} className='text-red-400 hover:text-red-600 font-bold text-sm'>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MasterFormPage() {
  const { forms, addForm, updateForm, deleteForm } = useMasterFormStore()

  const [editId, setEditId] = useState(null)
  const [draft,  setDraft ] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')

  const openNew   = () => { setDraft({ ...EMPTY_FORM }); setEditId('new') }
  const openEdit  = (f) => { setDraft(JSON.parse(JSON.stringify(f))); setEditId(f.id) }
  const closeForm = () => { setEditId(null); setDraft(EMPTY_FORM) }

  const handleSave = () => {
    if (!draft.name.trim()) return
    if (editId === 'new') addForm(draft)
    else updateForm(editId, draft)
    closeForm()
  }

  const filtered = forms.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Editor view ──────────────────────────────────────────────────────────────
  if (editId !== null) {
    const ft = draft.formType || 'field'
    return (
      <div className='pb-10'>
        <PageHeader
          title={editId === 'new' ? '+ Buat Form Baru' : `Edit: ${draft.name}`}
          subtitle='Buat form yang dapat digunakan di task onboarding.'
          actions={
            <div className='flex gap-2'>
              <button onClick={closeForm} className='px-4 py-2 text-sm text-gray-500 hover:text-gray-700'>Batal</button>
              <button onClick={handleSave} disabled={!draft.name.trim()}
                className='px-5 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-40 transition'
                style={{ background: BRAND_GRADIENT }}>
                Simpan Form
              </button>
            </div>
          }
        />

        <SectionCard>
          {/* Meta */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='md:col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Form <span className='text-red-500'>*</span></label>
              <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                placeholder='Contoh: Form Evaluasi Orientasi Karyawan Baru'
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
              <select value={draft.active ? 'active' : 'inactive'} onChange={e => setDraft(d => ({ ...d, active: e.target.value === 'active' }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 bg-white'>
                <option value='active'>Aktif</option>
                <option value='inactive'>Non-aktif</option>
              </select>
            </div>
            <div className='md:col-span-3'>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea value={draft.description || ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                placeholder='Deskripsi singkat penggunaan form ini…' rows={2}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </div>
          </div>

          {/* Form type selector */}
          <div className='mb-6'>
            <label className='block text-xs font-semibold text-gray-600 mb-2'>Tipe Form</label>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              {FORM_TYPES.map(opt => (
                <label key={opt.value} onClick={() => setDraft(d => ({ ...d, formType: opt.value }))}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${ft === opt.value ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type='radio' checked={ft === opt.value} onChange={() => {}} className='mt-0.5 accent-red-600 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>{opt.label}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className='border-gray-100 mb-5' />

          {/* Type-specific editor */}
          {ft === 'field' && (
            <FieldEditor fields={draft.fields ?? []} onChange={fields => setDraft(d => ({ ...d, fields }))} />
          )}
          {ft === 'evaluasi' && (
            <EvaluasiEditor draft={draft} setDraft={setDraft} />
          )}
          {ft === 'summary' && (
            <div className='rounded-xl bg-teal-50 border border-teal-200 px-5 py-4 text-sm text-teal-800'>
              <p className='font-semibold mb-1'>📋 Form Summary — Tidak perlu konfigurasi tambahan</p>
              <p className='text-xs text-teal-600'>Form ini akan otomatis menampilkan ringkasan semua task onboarding yang sudah diselesaikan, lengkap dengan tanggal, materi, mentor, dan status completion.</p>
            </div>
          )}
        </SectionCard>
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className='pb-10'>
      <PageHeader
        title='Master Form'
        subtitle='Library form yang dapat digunakan di task onboarding (type: Configurable Form).'
        actions={<ActionButton icon='+' onClick={openNew}>Buat Form Baru</ActionButton>}
      />

      <div className='mb-4'>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder='Cari form…'
          className='w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400' />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title='Belum ada form'
          description='Buat form pertama untuk digunakan di task onboarding.'
          action={<ActionButton icon='+' onClick={openNew}>Buat Form Baru</ActionButton>}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map(f => {
            const { cls, label: ftLabel } = formTypeBadge(f.formType ?? 'field')
            const fieldCount = f.formType === 'evaluasi'
              ? (f.evalTopics ?? []).length
              : (f.fields ?? []).length
            return (
              <div key={f.id} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{ftLabel}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${f.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{f.active ? 'Aktif' : 'Non-aktif'}</span>
                    </div>
                    <h3 className='text-sm font-bold text-gray-800 leading-snug'>{f.name}</h3>
                    {f.description && <p className='text-xs text-gray-400 mt-0.5 line-clamp-2'>{f.description}</p>}
                  </div>
                </div>

                {/* Preview */}
                {f.formType === 'field' && (
                  <div className='flex flex-wrap gap-1'>
                    {(f.fields ?? []).length === 0
                      ? <span className='text-xs text-gray-300 italic'>Belum ada field</span>
                      : (f.fields ?? []).slice(0, 5).map(fld => (
                          <span key={fld.id} className='text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600'>{fld.label || fld.type}{fld.required ? ' *' : ''}</span>
                        ))
                    }
                    {(f.fields ?? []).length > 5 && <span className='text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400'>+{(f.fields ?? []).length - 5} lagi</span>}
                  </div>
                )}
                {f.formType === 'evaluasi' && (
                  <div className='text-xs text-gray-500'>
                    <span className='font-medium'>{EVAL_METHODS.find(m => m.value === (f.evalMethod ?? 'nilai'))?.label}</span>
                    {(f.evalTopics ?? []).length > 0 && <span className='ml-2 text-gray-400'>· {f.evalTopics.length} topik pre-defined</span>}
                    {(f.evalTopics ?? []).length === 0 && <span className='ml-2 text-gray-400'>· Topik dari task onboarding</span>}
                  </div>
                )}
                {f.formType === 'summary' && (
                  <p className='text-xs text-gray-400 italic'>Ringkasan otomatis dari data onboarding.</p>
                )}

                <div className='flex items-center gap-2 mt-auto pt-1 border-t border-gray-50'>
                  {f.formType !== 'summary' && (
                    <span className='text-[10px] text-gray-300'>{fieldCount} {f.formType === 'evaluasi' ? 'topik' : 'field'}{fieldCount !== 1 ? 's' : ''}</span>
                  )}
                  <div className='ml-auto flex gap-2'>
                    <button onClick={() => openEdit(f)} className='text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition'>Edit</button>
                    <button onClick={() => { if (confirm(`Hapus form "${f.name}"?`)) deleteForm(f.id) }}
                      className='text-xs px-3 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition'>Hapus</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
