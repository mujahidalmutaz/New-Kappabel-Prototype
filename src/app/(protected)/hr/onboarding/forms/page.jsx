'use client'
import { useState } from 'react'
import { useMasterFormStore } from '@/store/masterFormStore'
import { useT }               from '@/store/languageStore'
import { PageHeader, SectionCard, ActionButton, EmptyState, BRAND_GRADIENT } from '@/components/ui'
import { FIELD_TYPES, newField } from '@/utils/formBuilderUtils'

const EMPTY_FORM = { name: '', description: '', active: true, fields: [] }

// ── Field type label helper ───────────────────────────────────────────────────
function fieldTypeLabel(type) {
  return FIELD_TYPES.find(t => t.value === type)?.label ?? type
}

// ── Inline form field editor ──────────────────────────────────────────────────
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
        <button onClick={add}
          className='text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold transition'>
          + Tambah Field
        </button>
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
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▲</button>
              <button onClick={() => move(idx, 1)} disabled={idx === fields.length - 1}
                className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▼</button>
            </div>
            <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-2'>
              <div className='md:col-span-2'>
                <label className='block text-[10px] text-gray-400 mb-0.5'>Label</label>
                <input value={f.label} onChange={e => upd(f.id, 'label', e.target.value)}
                  placeholder='Nama field…'
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
                  <input type='checkbox' checked={!!f.required} onChange={e => upd(f.id, 'required', e.target.checked)}
                    className='w-3.5 h-3.5 accent-red-600' />
                  Wajib
                </label>
                <button onClick={() => del(f.id)}
                  className='ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none'>✕</button>
              </div>
              {(f.type === 'dropdown' || f.type === 'radio') && (
                <div className='md:col-span-4'>
                  <label className='block text-[10px] text-gray-400 mb-0.5'>Opsi (pisah dengan koma)</label>
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

// ─────────────────────────────────────────────────────────────────────────────
export default function MasterFormPage() {
  const t = useT()
  const { forms, addForm, updateForm, deleteForm } = useMasterFormStore()

  const [editId, setEditId] = useState(null) // null = list, 'new' = new, number = edit
  const [draft,  setDraft ] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')

  const openNew  = () => { setDraft({ ...EMPTY_FORM, fields: [] }); setEditId('new') }
  const openEdit = (f) => { setDraft(JSON.parse(JSON.stringify(f))); setEditId(f.id) }
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

  // ── Form editor ─────────────────────────────────────────────────────────────
  if (editId !== null) {
    return (
      <div className='pb-10'>
        <PageHeader
          title={editId === 'new' ? '+ Buat Form Baru' : `Edit: ${draft.name}`}
          subtitle='Buat form isian yang dapat digunakan di task onboarding.'
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Form <span className='text-red-500'>*</span></label>
              <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                placeholder='Contoh: Form Evaluasi Probation'
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
            <div className='md:col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                placeholder='Deskripsi singkat penggunaan form ini…'
                rows={2}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </div>
          </div>

          <hr className='border-gray-100 mb-5' />

          {/* Field editor */}
          <FieldEditor
            fields={draft.fields ?? []}
            onChange={fields => setDraft(d => ({ ...d, fields }))}
          />
        </SectionCard>
      </div>
    )
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div className='pb-10'>
      <PageHeader
        title='Master Form'
        subtitle='Library form isian yang dapat digunakan di task onboarding (type: Configurable Form).'
        actions={<ActionButton icon='+' onClick={openNew}>Buat Form Baru</ActionButton>}
      />

      {/* Search */}
      <div className='mb-4'>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder='Cari form…'
          className='w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400' />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title='Belum ada form'
          description='Buat form isian pertama untuk digunakan di task onboarding.'
          action={<ActionButton icon='+' onClick={openNew}>Buat Form Baru</ActionButton>}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map(f => (
            <div key={f.id} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <h3 className='text-sm font-bold text-gray-800 leading-snug'>{f.name}</h3>
                  {f.description && <p className='text-xs text-gray-400 mt-0.5 line-clamp-2'>{f.description}</p>}
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${f.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  {f.active ? 'Aktif' : 'Non-aktif'}
                </span>
              </div>

              {/* Fields preview */}
              <div className='flex flex-wrap gap-1'>
                {(f.fields ?? []).length === 0
                  ? <span className='text-xs text-gray-300 italic'>Belum ada field</span>
                  : (f.fields ?? []).slice(0, 5).map(fld => (
                      <span key={fld.id} className='text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600'>
                        {fld.label || fieldTypeLabel(fld.type)}{fld.required ? ' *' : ''}
                      </span>
                    ))
                }
                {(f.fields ?? []).length > 5 && (
                  <span className='text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400'>
                    +{(f.fields ?? []).length - 5} lagi
                  </span>
                )}
              </div>

              <div className='flex items-center gap-2 mt-auto pt-1 border-t border-gray-50'>
                <span className='text-[10px] text-gray-300'>{(f.fields ?? []).length} field{(f.fields ?? []).length !== 1 ? 's' : ''}</span>
                <div className='ml-auto flex gap-2'>
                  <button onClick={() => openEdit(f)}
                    className='text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition'>Edit</button>
                  <button onClick={() => { if (confirm(`Hapus form "${f.name}"?`)) deleteForm(f.id) }}
                    className='text-xs px-3 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition'>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
