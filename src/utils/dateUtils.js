const MONTH_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export const formatDate = (ds) => {
  const d = new Date(ds)
  return `${String(d.getDate()).padStart(2,'0')} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`
}

export const daysBetween = (s, e) =>
  Math.round((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)) + 1

export const workingDays = (year, month, holidays, country = 'ID') => {
  const dim = new Date(year, month + 1, 0).getDate()
  let cnt = 0
  for (let d = 1; d <= dim; d++) {
    const dow = new Date(year, month, d).getDay()
    const ds  = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isH = holidays.some(h => h.date === ds && h.country === country)
    if (dow !== 0 && dow !== 6 && !isH) cnt++
  }
  return cnt
}