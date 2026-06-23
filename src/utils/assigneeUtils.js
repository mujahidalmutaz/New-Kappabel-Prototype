export function assigneeLabel(val, employees = []) {
  if (!val || val === 'self' || val === 'employee') return 'Self'
  if (val === 'manager') return 'Manager Langsung'
  if (val.startsWith('emp:')) {
    const emp = employees.find(e => e.id === Number(val.slice(4)))
    return emp ? emp.name : val
  }
  return val
}

export function assigneeBadgeCls(val) {
  if (!val || val === 'self' || val === 'employee') return 'bg-green-50 text-green-700 border-green-200'
  if (val === 'manager') return 'bg-purple-50 text-purple-700 border-purple-200'
  return 'bg-orange-50 text-orange-700 border-orange-200'
}
