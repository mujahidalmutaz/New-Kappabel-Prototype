'use client'
import { useState, useMemo }  from 'react'
import { useAuthStore }       from '@/store/authStore'
import { useEmployeeStore }   from '@/store/employeeStore'
import { useStructureStore }  from '@/store/structureStore'
import { useT }               from '@/store/languageStore'

const ROLES = ['employee','manager','hr','superadmin']

const ROLE_STYLE = {
  employee:   'bg-gray-100 text-gray-600',
  manager:    'bg-blue-100 text-blue-700',
  hr:         'bg-red-100 text-red-700',
  superadmin: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = { username:'', password:'', name:'', role:'employee', dept:'', position:'', email:'', employeeId:'' }

let _id = 10

// ── Employee LOV modal ────────────────────────────────────────────────────────
function EmployeeLOV({ employees, departments, positions, onSelect, onClose }) {
  const [search, setSearch] = useState('')

  const getDept = (id) => departments.find(d => d.id === id)?.name ?? '—'
  const getPos  = (id) => positions.find(p => p.id === id)?.name ?? '—'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return employees.filter(e =>
      !q ||
      String(e.id).includes(q) ||
      e.name.toLowerCase().includes(q) ||
      getDept(e.departmentId).toLowerCase().includes(q) ||
      getPos(e.positionId).toLowerCase().includes(q)
    )
  }, [search, employees])

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col'
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
          <h3 className='text-sm font-bold text-gray-800'>🔍 Pilih Karyawan</h3>
          <button onClick={onClose}
            className='w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-xs font-bold'>
            ✕
          </button>
        </div>

        {/* Search */}
        <div className='px-5 py-3 border-b border-gray-100'>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Cari nama, ID, department, jabatan…'
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400'
          />
        </div>

        {/* Table */}
        <div className='overflow-y-auto flex-1'>
          <table className='w-full text-sm'>
            <thead className='sticky top-0 bg-gray-50 z-10'>
              <tr>
                {['ID', 'Nama', 'Department', 'Jabatan'].map(h => (
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-100'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 py-10 text-center text-gray-400 text-sm'>
                    Tidak ada karyawan yang cocok.
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id}
                  onClick={() => onSelect(emp)}
                  className='border-t border-gray-50 hover:bg-red-50 cursor-pointer transition'>
                  <td className='px-4 py-2.5 text-gray-500 font-mono text-xs'>{emp.id}</td>
                  <td className='px-4 py-2.5 font-semibold text-gray-800'>{emp.name}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{getDept(emp.departmentId)}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{getPos(emp.positionId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className='px-5 py-3 border-t border-gray-100 text-xs text-gray-400'>
          {filtered.length} karyawan ditemukan
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const t = useT()
  const { userList, addUser, updateUser, deleteUser, currentUser } = useAuthStore()
  const { employees }                 = useEmployeeStore()
  const { departments, positions }    = useStructureStore()

  const [form,    setForm   ] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)
  const [lovOpen, setLovOpen] = useState(false)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const getDept = (id) => departments.find(d => d.id === id)?.name ?? ''
  const getPos  = (id) => positions.find(p => p.id === id)?.name ?? ''

  // Resolve employee name for display next to the ID field
  const linkedEmployee = form.employeeId
    ? employees.find(e => e.id === Number(form.employeeId))
    : null

  const handleSelectEmployee = (emp) => {
    setForm(f => ({
      ...f,
      employeeId: emp.id,
      name:       f.name || emp.name,
      dept:       f.dept || getDept(emp.departmentId),
      position:   f.position || getPos(emp.positionId),
    }))
    setLovOpen(false)
  }

  const handleSave = () => {
    if (!form.username || !form.name || (!editing && !form.password))
      return flash('Username, nama, dan password wajib diisi.', 'error')
    if (editing) {
      updateUser(editing, form)
      setEditing(null)
      flash('User diperbarui.')
    } else {
      if (userList.find(u => u.username === form.username))
        return flash('Username sudah digunakan.', 'error')
      addUser({ id: _id++, ...form })
      flash('User ditambahkan.')
    }
    setForm(EMPTY_FORM)
  }

  const handleEdit = (u) => {
    setEditing(u.id)
    setForm({
      username:   u.username,
      password:   u.password,
      name:       u.name,
      role:       u.role,
      dept:       u.dept       || '',
      position:   u.position   || '',
      email:      u.email      || '',
      employeeId: u.employeeId ?? '',
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>User Management</h1>
      <p className='text-gray-500 text-sm mb-6'>Kelola akun dan hak akses pengguna sistem.</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        {/* ── Form ── */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing ? '✏️ Edit User' : '➕ Tambah User'}</h2>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}

          <div className='flex flex-col gap-3'>
            {/* ── Employee ID (LOV) ── */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Employee ID</label>
              <div className='flex gap-2'>
                <div className='flex-1 flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 min-h-[38px]'>
                  {linkedEmployee ? (
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <span className='text-xs font-mono text-gray-400 flex-shrink-0'>#{linkedEmployee.id}</span>
                      <span className='text-sm font-semibold text-gray-700 truncate'>{linkedEmployee.name}</span>
                    </div>
                  ) : (
                    <span className='text-sm text-gray-400'>
                      {form.employeeId ? `ID: ${form.employeeId}` : '— Belum terhubung —'}
                    </span>
                  )}
                  {form.employeeId && (
                    <button onClick={() => setForm(f => ({ ...f, employeeId: '' }))}
                      className='ml-auto flex-shrink-0 text-gray-400 hover:text-red-500 text-xs font-bold transition'>
                      ✕
                    </button>
                  )}
                </div>
                <button onClick={() => setLovOpen(true)}
                  className='px-3 py-2 text-sm font-semibold text-white rounded-lg transition hover:opacity-90 flex-shrink-0'
                  style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  🔍
                </button>
              </div>
              {linkedEmployee && (
                <p className='text-xs text-gray-400 mt-1'>
                  {getDept(linkedEmployee.departmentId)} · {getPos(linkedEmployee.positionId)}
                </p>
              )}
            </div>

            {/* ── Standard fields ── */}
            {[
              ['Username',    'text',     'username'],
              ['Password',    'password', 'password'],
              ['Nama Lengkap','text',     'name'],
              ['Email',       'email',    'email'],
              ['Departemen',  'text',     'dept'],
              ['Jabatan',     'text',     'position'],
            ].map(([lbl, type, key]) => (
              <div key={key}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{lbl}</label>
                <input type={type} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={editing && key === 'password' ? 'Kosongkan jika tidak diubah' : ''}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}

            {/* Role */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave}
                className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
                style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                {editing ? t('Simpan', 'Save') : t('Tambah', 'Add')}
              </button>
              {editing && (
                <button onClick={handleCancel}
                  className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg'>
                  {t('Batal', 'Cancel')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>👥 Daftar User</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50'>
                  {['Username', 'Nama', 'Employee', 'Role', 'Departemen', 'Aksi'].map(h => (
                    <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map(u => {
                  const emp = u.employeeId ? employees.find(e => e.id === Number(u.employeeId)) : null
                  return (
                    <tr key={u.id} className='border-t border-gray-100 hover:bg-gray-50'>
                      <td className='px-4 py-2.5 font-medium text-gray-700'>{u.username}</td>
                      <td className='px-4 py-2.5 text-gray-700'>{u.name}</td>
                      <td className='px-4 py-2.5'>
                        {emp ? (
                          <span className='text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium'>
                            #{emp.id} {emp.name}
                          </span>
                        ) : (
                          <span className='text-xs text-gray-400'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-2.5'>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[u.role] || 'bg-gray-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className='px-4 py-2.5 text-gray-500'>{u.dept || '—'}</td>
                      <td className='px-4 py-2.5'>
                        <div className='flex gap-2'>
                          <button onClick={() => handleEdit(u)}
                            className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>
                            Edit
                          </button>
                          {u.id !== currentUser?.id && (
                            <button onClick={() => deleteUser(u.id)}
                              className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>
                              {t('Hapus', 'Delete')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Employee LOV Modal ── */}
      {lovOpen && (
        <EmployeeLOV
          employees={employees}
          departments={departments}
          positions={positions}
          onSelect={handleSelectEmployee}
          onClose={() => setLovOpen(false)}
        />
      )}
    </div>
  )
}
