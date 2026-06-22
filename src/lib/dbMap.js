// Maps a loose client object to the columns each Prisma model accepts.
// Int fields coerce '' / null / undefined → null; strings → String.

const EMP_INT = ['companyId', 'divisionId', 'businessUnitId', 'departmentId',
  'positionId', 'gradeId', 'managerId', 'salary']
const EMP_STR = ['nik', 'name', 'status', 'employmentType', 'role', 'joinDate', 'endDate',
  'gender', 'birthPlace', 'birthDate', 'nationality', 'religion', 'maritalStatus', 'ktp',
  'phone', 'email', 'personalEmail', 'address', 'city', 'province', 'country', 'location',
  'dept', 'position']

const USER_INT = ['employeeId', 'salary']
const USER_STR = ['username', 'password', 'name', 'role', 'dept', 'position', 'email']

function pick(body, ints, strs, withId) {
  const out = {}
  if (withId && body.id != null) out.id = Number(body.id)
  for (const k of ints) if (k in body) out[k] = (body[k] === '' || body[k] == null) ? null : Number(body[k])
  for (const k of strs) if (k in body) out[k] = body[k] == null ? '' : String(body[k])
  return out
}

export const pickEmployee = (body, opts = {}) => pick(body, EMP_INT, EMP_STR, opts.withId)
export const pickUser     = (body, opts = {}) => pick(body, USER_INT, USER_STR, opts.withId)
