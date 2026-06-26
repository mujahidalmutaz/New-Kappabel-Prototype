'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore }        from '@/store/authStore'
import { useOnboardingStore }  from '@/store/onboardingStore'
import { useT }                from '@/store/languageStore'
import { validateResponse }    from '@/utils/formBuilderUtils'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

// ── Form Fill Modal ───────────────────────────────────────────────────────────
const NILAI_OPTS   = ['A', 'B', 'C', 'D', 'E']
const OBS_OPTS     = ['+', '0', '-']
const KESIMPULAN   = ['Lulus', 'Mengulang', 'Tidak Lulus']
const OJT_SCORES   = [{ val: 'A', poin: 4 }, { val: 'B', poin: 3 }, { val: 'C', poin: 2 }, { val: 'D', poin: 1 }]

function FormFillModal({ item, allSections, evaluatorId, evaluatorName, onSave, onClose }) {
  const existing = (item.formSubmissions ?? []).find(s => s.evaluatorId === evaluatorId)
  const [resp, setResp] = useState(existing?.response ?? item.formResponse ?? {})
  const schema   = item.formSchema ?? []
  const formType = item.formType ?? 'field'
  const setField = (id, val) => setResp(r => ({ ...r, [id]: val }))
  const isValid  = formType === 'field' ? validateResponse(schema, resp) : true

  const evalTopics = (() => {
    if (formType !== 'evaluasi') return []
    const pre = item.evalTopics ?? []
    if (pre.length > 0) return pre
    return (allSections ?? []).flatMap(ms =>
      (ms.items ?? []).filter(i => i.completed && i.type !== 'Configurable Form')
        .map(i => ({ id: i.id, label: i.module || i.agenda || i.id, section: ms.type }))
    )
  })()

  const summaryRows = formType === 'summary'
    ? (allSections ?? []).flatMap(ms =>
        (ms.items ?? []).filter(i => i.completed)
          .map(i => ({ id: i.id, label: i.module || i.agenda || '—', type: i.type, date: i.date, section: ms.type }))
      )
    : []

  const evalMethod = item.evalMethod ?? 'nilai'
  const scoreOpts  = evalMethod === 'nilai' ? NILAI_OPTS : OBS_OPTS

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className={`bg-white rounded-2xl shadow-2xl w-full mx-4 overflow-hidden ${formType === 'ojt' ? 'max-w-3xl' : 'max-w-2xl'}`}>
        <div style={{ background: BRAND }} className='px-6 py-4 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-white'>
            {formType === 'evaluasi' ? '📊' : formType === 'ojt' ? '🏭' : formType === 'summary' ? '📋' : '📝'} {item.module || 'Form'}
          </h2>
          <span className='text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white uppercase'>{formType}</span>
        </div>
        <div className='px-6 py-5 max-h-[65vh] overflow-y-auto'>
          {formType === 'field' && (
            <div className='space-y-4'>
              {schema.length === 0 && <p className='text-gray-400 text-sm text-center py-4'>Form belum memiliki field.</p>}
              {schema.map(f => {
                const val  = resp[f.id] ?? ''
                const opts = (f.options || '').split(',').map(s => s.trim()).filter(Boolean)
                return (
                  <div key={f.id}>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      {f.label}{f.required && <span className='text-red-500 ml-0.5'>*</span>}
                    </label>
                    {f.type === 'text'     && <input value={val} onChange={e => setField(f.id, e.target.value)} className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />}
                    {f.type === 'textarea' && <textarea value={val} onChange={e => setField(f.id, e.target.value)} rows={3} className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />}
                    {f.type === 'number'   && <input type='number' value={val} onChange={e => setField(f.id, e.target.value)} className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />}
                    {f.type === 'date'     && <input type='date' value={val} onChange={e => setField(f.id, e.target.value)} className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />}
                    {f.type === 'dropdown' && (
                      <select value={val} onChange={e => setField(f.id, e.target.value)} className='w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                        <option value=''>— Pilih —</option>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                    {f.type === 'radio' && (
                      <div className='space-y-1'>
                        {opts.map(o => (
                          <label key={o} className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
                            <input type='radio' name={f.id} value={o} checked={val === o} onChange={() => setField(f.id, o)} className='accent-red-600' />
                            {o}
                          </label>
                        ))}
                      </div>
                    )}
                    {f.type === 'checkbox' && (
                      <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
                        <input type='checkbox' checked={!!val} onChange={e => setField(f.id, e.target.checked)} className='w-4 h-4 accent-red-600' />
                        Ya
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {formType === 'evaluasi' && (
            <div>
              <p className='text-xs text-gray-500 mb-3'>Metode penilaian: <strong>{evalMethod === 'nilai' ? 'Nilai (A/B/C/D/E)' : 'Observasi (+/0/−)'}</strong></p>
              {evalTopics.length === 0 ? (
                <p className='text-sm text-gray-400 text-center py-6'>Belum ada topik evaluasi.</p>
              ) : (
                <table className='w-full text-xs border border-gray-200 rounded-lg overflow-hidden'>
                  <thead><tr className='bg-gray-50'>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600 w-8'>No</th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600'>Topik / Materi</th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600 w-24'>Seksi</th>
                    <th className='px-3 py-2 text-center font-semibold text-gray-600 w-24'>{evalMethod === 'nilai' ? 'Nilai' : 'Observasi'}</th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600 w-40'>Catatan</th>
                  </tr></thead>
                  <tbody>
                    {evalTopics.map((tp, idx) => (
                      <tr key={tp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className='px-3 py-1.5 text-center text-gray-400'>{idx + 1}</td>
                        <td className='px-3 py-1.5 text-gray-800 font-medium'>{tp.label}</td>
                        <td className='px-3 py-1.5 text-gray-500 text-[10px]'>{tp.section || '—'}</td>
                        <td className='px-3 py-1.5 text-center'>
                          <select value={resp[`score_${tp.id}`] ?? ''} onChange={e => setField(`score_${tp.id}`, e.target.value)}
                            className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-16'>
                            <option value=''>—</option>
                            {scoreOpts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </td>
                        <td className='px-3 py-1.5'>
                          <input value={resp[`note_${tp.id}`] ?? ''} onChange={e => setField(`note_${tp.id}`, e.target.value)}
                            placeholder='opsional…' className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400' />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className='mt-4 flex items-center gap-3'>
                <label className='text-xs font-semibold text-gray-700'>Kesimpulan:</label>
                <div className='flex gap-2'>
                  {KESIMPULAN.map(k => (
                    <label key={k} className='flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer'>
                      <input type='radio' name='kesimpulan' value={k} checked={resp.kesimpulan === k} onChange={() => setField('kesimpulan', k)} className='accent-red-600' />
                      {k}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formType === 'ojt' && (() => {
            const ojtParams = item.ojtParams ?? []
            if (!ojtParams.length) return <p className='text-sm text-gray-400 text-center py-6'>Belum ada parameter OJT.</p>
            return (
              <div className='space-y-5'>
                {ojtParams.map((p, pIdx) => {
                  const activities = p.activities ?? []
                  let totalY = 0, countZ = 0
                  activities.forEach(a => { const sc = resp[`ojt_${p.id}_${a.id}`]; const f = OJT_SCORES.find(s => s.val === sc); if (f) { totalY += f.poin; countZ++ } })
                  return (
                    <div key={p.id} className='rounded-xl border border-violet-200 overflow-hidden'>
                      <div className='bg-violet-600 px-3 py-2'><span className='text-xs font-bold text-white'>PARAMETER {String.fromCharCode(65+pIdx)}{p.label ? `. ${p.label.toUpperCase()}` : ''}</span></div>
                      <table className='w-full text-xs'>
                        <thead><tr className='bg-gray-50 border-b border-gray-100'>
                          <th className='px-3 py-1.5 text-left font-semibold text-gray-600 w-8'>No</th>
                          <th className='px-3 py-1.5 text-left font-semibold text-gray-600'>Aktivitas</th>
                          {OJT_SCORES.map(s => <th key={s.val} className='px-2 py-1.5 text-center font-semibold text-gray-600 w-14'>{s.val}<br /><span className='text-[10px] text-gray-400'>(Poin:{s.poin})</span></th>)}
                        </tr></thead>
                        <tbody>
                          {activities.map((a, aIdx) => {
                            const key = `ojt_${p.id}_${a.id}`; const val = resp[key] ?? ''
                            return (
                              <tr key={a.id} className={aIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                                <td className='px-3 py-1.5 text-center text-gray-400'>{aIdx+1}</td>
                                <td className='px-3 py-1.5 text-gray-800'>{a.label || '—'}</td>
                                {OJT_SCORES.map(s => <td key={s.val} className='px-2 py-1.5 text-center'><input type='radio' name={key} value={s.val} checked={val===s.val} onChange={() => setField(key,s.val)} className='w-3.5 h-3.5 accent-violet-600 cursor-pointer' /></td>)}
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className='bg-violet-50 border-t border-violet-100 font-semibold text-[10px]'><td colSpan={2} className='px-3 py-1.5 text-violet-700'>Total Poin (Y)</td><td colSpan={4} className='px-3 py-1.5 text-right text-violet-600 font-bold'>{totalY}</td></tr>
                          <tr className='bg-violet-50 text-[10px]'><td colSpan={2} className='px-3 py-1 text-violet-600'>Jumlah JT (Z)</td><td colSpan={4} className='px-3 py-1 text-right text-violet-600 font-bold'>{countZ}</td></tr>
                          <tr className='bg-violet-50 border-b border-violet-100 text-[10px]'><td colSpan={2} className='px-3 py-1.5 text-violet-600'>Rata-rata (Y/Z)</td><td colSpan={4} className='px-3 py-1.5 text-right text-violet-700 font-bold'>{countZ>0?(totalY/countZ).toFixed(2):'—'}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                  )
                })}
                <div className='flex items-center gap-3 pt-2'>
                  <label className='text-xs font-semibold text-gray-700'>Kesimpulan:</label>
                  <div className='flex gap-2'>{KESIMPULAN.map(k => <label key={k} className='flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer'><input type='radio' name='ojt_kesimpulan' value={k} checked={resp.kesimpulan===k} onChange={() => setField('kesimpulan',k)} className='accent-violet-600' />{k}</label>)}</div>
                </div>
              </div>
            )
          })()}

          {(formType === 'form_evaluation' || formType === 'form_evaluation_contract') && (() => {
            const isContract = formType === 'form_evaluation_contract'
            const RATING_OPTS = [1,2,3,4]
            const RATING_LABELS = {1:'Far Below Expectation',2:'Slightly Below Expectation',3:'Meet Expectation',4:'Exceed Expectation'}
            const FINAL_DECISIONS = isContract ? ['Passed, to be Permanent','Extend Contract','Not Passed'] : ['Passed to be Permanent','Not Passed']
            const calcScore = () => {
              const avg = (arr, prefix) => { const r = arr.filter(i => resp[`${prefix}_${i.id}`]); return r.length ? r.reduce((s,i)=>s+Number(resp[`${prefix}_${i.id}`]),0)/r.length : 0 }
              return Math.round((avg(item.coreValues??[],'cv')/4*50) + ((() => { const all=[...(item.coreCompetency??[]),...(item.strategicLeadership??[]),...(item.technicalCompetency??[])]; const r=all.filter(i=>resp[`cb_${i.id}`]); return r.length?r.reduce((s,i)=>s+Number(resp[`cb_${i.id}`]),0)/r.length:0 })()/4*50))
            }
            const RatingSelect = ({ prefix, item: ri }) => (
              <select value={resp[`${prefix}_${ri.id}`]??''} onChange={e=>setField(`${prefix}_${ri.id}`,e.target.value===''?'':Number(e.target.value))} className='w-48 px-2 py-1 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-white'>
                <option value=''>Select</option>{RATING_OPTS.map(n=><option key={n} value={n}>{n} - {RATING_LABELS[n]}</option>)}
              </select>
            )
            const EvalTable = ({ title, pct, items, prefix }) => (
              <div className='mb-4'>
                {pct ? <div className='bg-gray-200 px-4 py-2 flex justify-between'><span className='text-xs font-bold text-gray-700 uppercase tracking-wide'>{title}</span><span className='text-xs font-bold text-gray-700'>{pct}</span></div>
                      : <div className='bg-gray-100 px-4 py-1.5'><span className='text-xs font-semibold text-gray-600 italic'>{title}</span></div>}
                {items.length===0 ? <div className='px-4 py-3 text-xs text-gray-300 italic'>Belum ada item.</div> : (
                  <table className='w-full text-xs'><thead><tr className='bg-gray-50 border-b border-gray-100'><th className='px-3 py-1.5 text-left text-gray-500 font-semibold w-8'>No</th><th className='px-3 py-1.5 text-left text-gray-500 font-semibold w-36'>Aspek</th><th className='px-3 py-1.5 text-left text-gray-500 font-semibold'>Key Behaviors</th><th className='px-3 py-1.5 text-left text-gray-500 font-semibold w-52'>Rating</th></tr></thead>
                  <tbody>{items.map((ri,idx)=><tr key={ri.id} className={idx%2===0?'bg-white':'bg-gray-50/40'}><td className='px-3 py-2 text-center text-gray-400'>{ri.no||idx+1}</td><td className='px-3 py-2 text-gray-800 font-medium'>{ri.aspect||'—'}</td><td className='px-3 py-2 text-gray-500 leading-relaxed'>{ri.keyBehaviors||'—'}</td><td className='px-3 py-2'><RatingSelect prefix={prefix} item={ri} /></td></tr>)}</tbody></table>
                )}
              </div>
            )
            const score = calcScore()
            return (
              <div className='space-y-2'>
                <div className='overflow-x-auto border border-gray-200 rounded-lg'>
                  <EvalTable title='Core Values' pct='50%' items={item.coreValues??[]} prefix='cv' />
                  <EvalTable title='Competency Based' pct='50%' items={[]} prefix='' />
                  <EvalTable title='A. Core Competency' items={item.coreCompetency??[]} prefix='cb' />
                  {item.hasStrategicLeadership && <EvalTable title='B. Strategic Leadership' items={item.strategicLeadership??[]} prefix='cb' />}
                  <EvalTable title={item.hasStrategicLeadership?'C. Technical Competency':'B. Technical Competency'} items={item.technicalCompetency??[]} prefix='cb' />
                </div>
                <div className='grid grid-cols-2 gap-4 pt-2'>
                  <div className='col-span-2'><div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center'><div className='text-[10px] text-gray-500 mb-0.5'>Final Score (0–100)</div><div className={`text-lg font-bold ${score>=75?'text-green-600':score>=50?'text-amber-600':'text-red-600'}`}>{score}</div></div></div>
                  <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Final Decision <span className='text-red-500'>*</span></label><select value={resp.finalDecision??''} onChange={e=>setField('finalDecision',e.target.value)} className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-white'><option value=''>— Pilih —</option>{FINAL_DECISIONS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                  {isContract && resp.finalDecision==='Extend Contract' && <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Perpanjangan Kontrak</label><select value={resp.extendMonths??''} onChange={e=>setField('extendMonths',e.target.value)} className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-white'><option value=''>— Pilih —</option>{['3','6','12'].map(m=><option key={m} value={m}>{m} bulan</option>)}</select></div>}
                  <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Tgl Efektif</label><input type='date' value={resp.finalEffectiveDate??''} onChange={e=>setField('finalEffectiveDate',e.target.value)} className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none' /></div>
                  <div className='col-span-2'><label className='block text-xs font-semibold text-gray-600 mb-1'>Kekuatan</label><textarea rows={2} value={resp.strength??''} onChange={e=>setField('strength',e.target.value)} className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none' /></div>
                  <div className='col-span-2'><label className='block text-xs font-semibold text-gray-600 mb-1'>Area Pengembangan</label><textarea rows={2} value={resp.areaDevelopment??''} onChange={e=>setField('areaDevelopment',e.target.value)} className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none' /></div>
                </div>
              </div>
            )
          })()}

          {formType === 'summary' && (
            <div>
              <p className='text-xs text-gray-500 mb-3'>Ringkasan seluruh task yang telah diselesaikan.</p>
              {summaryRows.length === 0 ? <p className='text-sm text-gray-400 text-center py-6'>Belum ada task selesai.</p> : (
                <table className='w-full text-xs border border-gray-200 rounded-lg overflow-hidden'>
                  <thead><tr className='bg-gray-50'><th className='px-3 py-2 text-left font-semibold text-gray-600 w-8'>No</th><th className='px-3 py-2 text-left font-semibold text-gray-600'>Materi</th><th className='px-3 py-2 text-left font-semibold text-gray-600 w-28'>Seksi</th><th className='px-3 py-2 text-left font-semibold text-gray-600 w-24'>Tipe</th><th className='px-3 py-2 text-left font-semibold text-gray-600 w-24'>Tanggal</th><th className='px-3 py-2 text-left font-semibold text-gray-600 w-32'>Catatan</th></tr></thead>
                  <tbody>{summaryRows.map((r,idx)=><tr key={r.id} className={idx%2===0?'bg-white':'bg-gray-50/60'}><td className='px-3 py-1.5 text-center text-gray-400'>{idx+1}</td><td className='px-3 py-1.5 text-gray-800 font-medium'>{r.label}</td><td className='px-3 py-1.5 text-gray-500 text-[10px]'>{r.section}</td><td className='px-3 py-1.5 text-gray-500 text-[10px]'>{r.type||'—'}</td><td className='px-3 py-1.5 text-gray-500'>{r.date||'—'}</td><td className='px-3 py-1.5'><input value={resp[`note_${r.id}`]??''} onChange={e=>setField(`note_${r.id}`,e.target.value)} placeholder='opsional…' className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400' /></td></tr>)}</tbody>
                </table>
              )}
              <div className='mt-4 flex items-center gap-3'><label className='text-xs font-semibold text-gray-700'>Kesimpulan Akhir:</label><div className='flex gap-2'>{KESIMPULAN.map(k=><label key={k} className='flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer'><input type='radio' name='kesimpulan_summary' value={k} checked={resp.kesimpulan===k} onChange={()=>setField('kesimpulan',k)} className='accent-red-600' />{k}</label>)}</div></div>
            </div>
          )}
        </div>
        <div className='px-6 py-4 border-t border-gray-100 flex justify-end gap-3'>
          <button onClick={onClose} className='px-4 py-2 text-sm text-gray-500 hover:text-gray-700'>Batal</button>
          <button onClick={() => onSave(resp)} disabled={formType==='field' && !isValid && schema.length>0}
            className='px-4 py-2 text-sm font-semibold rounded-lg text-white transition disabled:opacity-40' style={{background:BRAND}}>
            Simpan Jawaban
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Electronic Signature Modal ────────────────────────────────────────────────
function SignatureModal({ item, onSave, onClose, t }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const startDraw = (e) => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getPos(e, canvas)
    ctx.beginPath(); ctx.moveTo(x, y)
    setDrawing(true)
  }
  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getPos(e, canvas)
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a2e'
    ctx.lineTo(x, y); ctx.stroke()
    setHasDrawn(true)
  }
  const stopDraw = () => setDrawing(false)

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const save = () => {
    const canvas = canvasRef.current; if (!canvas || !hasDrawn) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden'>
        <div style={{background:BRAND}} className='px-6 py-4 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-white'>✍ {item.module || t('Tanda Tangan','Signature')}</h2>
          <button onClick={onClose} className='text-white/70 hover:text-white text-lg'>✕</button>
        </div>
        <div className='p-5'>
          {item.signatureData && (
            <div className='mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 text-center'>
              <p className='text-xs text-gray-500 mb-2'>{t('Tanda tangan sebelumnya','Previous signature')}:</p>
              <img src={item.signatureData} alt='signature' className='h-16 mx-auto' />
            </div>
          )}
          <p className='text-xs text-gray-500 mb-2'>{t('Tanda tangan di area bawah ini','Sign in the area below')}:</p>
          <canvas ref={canvasRef} width={380} height={180}
            className='w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-crosshair touch-none'
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          <div className='flex justify-between mt-3'>
            <button onClick={clear} className='px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50'>
              {t('Bersihkan','Clear')}
            </button>
            <div className='flex gap-2'>
              <button onClick={onClose} className='px-4 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50'>{t('Batal','Cancel')}</button>
              <button onClick={save} disabled={!hasDrawn}
                className='px-4 py-1.5 text-xs font-bold text-white rounded-lg disabled:opacity-40 hover:opacity-90'
                style={{background:BRAND}}>
                {t('Simpan TTD','Save Signature')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── File Upload Modal ─────────────────────────────────────────────────────────
function FileUploadModal({ item, onSave, onClose, t }) {
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => setPreview({ name: f.name, size: f.size, data: ev.target.result, type: f.type })
    reader.readAsDataURL(f)
  }

  const save = () => {
    if (!preview) return
    setLoading(true)
    setTimeout(() => { onSave(preview); setLoading(false) }, 300)
  }

  const fmtSize = (b) => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden'>
        <div style={{background:BRAND}} className='px-6 py-4 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-white'>📎 {item.module || t('Upload Dokumen','Upload Document')}</h2>
          <button onClick={onClose} className='text-white/70 hover:text-white text-lg'>✕</button>
        </div>
        <div className='p-5 space-y-4'>
          {item.attachmentName && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-xl'>
              <p className='text-xs text-green-700 font-semibold'>✓ {t('Sudah diupload','Already uploaded')}: {item.attachmentName}</p>
            </div>
          )}
          <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition'>
            <span className='text-3xl mb-1'>📁</span>
            <span className='text-xs text-gray-500'>{t('Klik atau drag file ke sini','Click or drag file here')}</span>
            <span className='text-[10px] text-gray-400 mt-0.5'>PDF, DOC, DOCX, JPG, PNG</span>
            <input type='file' className='sr-only' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleFile} />
          </label>
          {preview && (
            <div className='flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl'>
              <span className='text-2xl'>{preview.type.includes('image') ? '🖼' : '📄'}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-gray-800 truncate'>{preview.name}</p>
                <p className='text-[10px] text-gray-500'>{fmtSize(preview.size)}</p>
              </div>
              <button onClick={() => { setFile(null); setPreview(null) }} className='text-gray-400 hover:text-red-500 text-sm'>✕</button>
            </div>
          )}
          <div className='flex gap-3 pt-1'>
            <button onClick={onClose} className='flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50'>{t('Batal','Cancel')}</button>
            <button onClick={save} disabled={!preview || loading}
              className='flex-1 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-40 hover:opacity-90'
              style={{background:BRAND}}>
              {loading ? t('Menyimpan…','Saving…') : t('Upload','Upload')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Video Modal ───────────────────────────────────────────────────────────────
function VideoModal({ item, onClose, onMarkDone, t }) {
  const url = item.link || ''
  const embedUrl = (() => {
    // YouTube
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`
    // Vimeo
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
    return null
  })()

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden'>
        <div style={{background:BRAND}} className='px-6 py-4 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-white'>▶ {item.module || 'Video'}</h2>
          <button onClick={onClose} className='text-white/70 hover:text-white text-lg'>✕</button>
        </div>
        <div className='p-4'>
          {embedUrl ? (
            <div className='relative w-full rounded-xl overflow-hidden bg-black' style={{paddingTop:'56.25%'}}>
              <iframe src={embedUrl} className='absolute inset-0 w-full h-full' allowFullScreen allow='autoplay; encrypted-media' />
            </div>
          ) : url ? (
            <video src={url} controls className='w-full rounded-xl' style={{maxHeight:400}} />
          ) : (
            <div className='py-16 text-center text-gray-400'>
              <p className='text-3xl mb-2'>🎬</p>
              <p className='text-sm'>{t('URL video belum dikonfigurasi.','Video URL not configured.')}</p>
            </div>
          )}
          <div className='flex justify-end gap-3 mt-4'>
            <button onClick={onClose} className='px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50'>{t('Tutup','Close')}</button>
            <button onClick={() => { onMarkDone(); onClose() }}
              className='px-4 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90' style={{background:BRAND}}>
              ✓ {t('Tandai Selesai','Mark as Done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Action Button per task type ───────────────────────────────────────────────
function ItemActionButton({ item, msId, disabled, onFillForm, onSign, onUpload, onVideo, onMark, t }) {
  const btnCls = 'px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition disabled:opacity-40 whitespace-nowrap'
  const doneCls = 'px-3 py-1 text-xs font-semibold rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition whitespace-nowrap'

  switch (item.type) {
    case 'Configurable Form':
    case 'Questionnaire':
      return (
        <button onClick={() => onFillForm(msId, item)} disabled={disabled} className={item.formResponse ? doneCls : btnCls}>
          {item.formResponse ? `✓ ${t('Edit Jawaban','Edit')}` : `📋 ${t('Isi Form','Fill Form')}`}
        </button>
      )

    case 'Electronic Signature':
      return (
        <button onClick={() => onSign(msId, item)} disabled={disabled} className={item.signatureData ? doneCls : btnCls}>
          {item.signatureData ? `✓ ${t('Lihat TTD','View')}` : `✍ ${t('Tandatangan','Sign')}`}
        </button>
      )

    case 'Document (Attachment)':
      return (
        <button onClick={() => onUpload(msId, item)} disabled={disabled} className={item.attachmentName ? doneCls : btnCls}>
          {item.attachmentName
            ? `✓ ${item.attachmentName.length > 16 ? item.attachmentName.slice(0,16)+'…' : item.attachmentName}`
            : `📤 ${t('Upload Dokumen','Upload')}`}
        </button>
      )

    case 'Video':
      return (
        <button onClick={() => onVideo(msId, item)} disabled={disabled} className={item.completed ? doneCls : btnCls}>
          {item.completed ? `✓ ${t('Ditonton','Watched')}` : `▶ ${t('Tonton Video','Watch Video')}`}
        </button>
      )

    case 'External URL':
      return item.link
        ? <a href={item.link} target='_blank' rel='noreferrer'
            className={btnCls} onClick={() => !item.completed && !disabled && onMark(msId, item.id)}>
            🔗 {t('Buka Link','Open Link')}
          </a>
        : <span className='text-gray-300 text-xs'>—</span>

    case 'Report':
      return item.link
        ? <a href={item.link} target='_blank' rel='noreferrer'
            className={btnCls} onClick={() => !item.completed && !disabled && onMark(msId, item.id)}>
            📊 {t('Lihat Laporan','View Report')}
          </a>
        : <span className='text-gray-300 text-xs'>—</span>

    case 'Application Task':
      return item.link
        ? <a href={item.link} target='_blank' rel='noreferrer'
            className={btnCls} onClick={() => !item.completed && !disabled && onMark(msId, item.id)}>
            🖥 {t('Buka Aplikasi','Open App')}
          </a>
        : <span className='text-gray-300 text-xs'>—</span>

    case 'Learning Course':
      return (
        <a href={item.link || '/ess/learning'} target={item.link ? '_blank' : '_self'} rel='noreferrer'
          className={item.completed ? doneCls : btnCls}
          onClick={() => !item.completed && !disabled && onMark(msId, item.id)}>
          📚 {item.completed ? `✓ ${t('Selesai','Done')}` : t('Mulai Kursus','Start Course')}
        </a>
      )

    case 'Manual Task':
      return (
        <button onClick={() => !disabled && onMark(msId, item.id)} disabled={disabled || item.completed}
          className={item.completed ? doneCls : btnCls}>
          {item.completed ? `✓ ${t('Selesai','Done')}` : `✓ ${t('Tandai Selesai','Mark Done')}`}
        </button>
      )

    default:
      return item.link
        ? <a href={item.link} target='_blank' rel='noreferrer' className='text-red-600 hover:underline text-xs break-all'>{item.link}</a>
        : <span className='text-gray-300 text-xs'>—</span>
  }
}

// ── Misc helpers ──────────────────────────────────────────────────────────────
const STATUS_CLS = {
  Draft:       'bg-gray-100 text-gray-600',
  Preparation: 'bg-indigo-100 text-indigo-700',
  Active:      'bg-blue-100 text-blue-700',
  Pending:     'bg-yellow-100 text-yellow-700',
  Approved:    'bg-green-100 text-green-700',
  Rejected:    'bg-red-100 text-red-700',
}
const SEC_COLORS = [
  { bg:'bg-blue-50',  text:'text-blue-700'  },
  { bg:'bg-red-50',   text:'text-red-700'   },
  { bg:'bg-amber-50', text:'text-amber-700' },
  { bg:'bg-green-50', text:'text-green-700' },
  { bg:'bg-rose-50',  text:'text-rose-700'  },
  { bg:'bg-teal-50',  text:'text-teal-700'  },
]
function toDateInput(val) {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10)
}
function migrateOnboarding(ob) {
  if (!ob) return ob
  if ((ob.mainSections??[]).length > 0) return ob
  const sections = []
  if ((ob.generalItems??[]).length>0||(ob.generalSections??[]).length>0)
    sections.push({id:'ms_general',type:'Onboarding General',sections:ob.generalSections??[],items:ob.generalItems??[]})
  if ((ob.technicalItems??[]).length>0||(ob.technicalSections??[]).length>0)
    sections.push({id:'ms_teknis',type:'Onboarding Teknis',sections:ob.technicalSections??[],items:ob.technicalItems??[]})
  if ((ob.reviewItems??[]).length>0)
    sections.push({id:'ms_review',type:'Periodic Review',sections:[],items:ob.reviewItems??[]})
  return {...ob, mainSections:sections}
}
function AgendaHead({ t }) {
  return (
    <thead>
      <tr style={{background:BRAND}}>
        {['NO',t('Tanggal','Date'),t('AGENDA [Module]','AGENDA [Module]'),'Type',t('Aksi','Action'),
          t('Nama Mentor','Mentor Name'),t('Posisi Mentor','Mentor Position'),t('Completed','Completed')].map((h,i)=>(
          <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap text-xs'
            style={{minWidth:i===2?180:i===4?160:i===7?80:i===0?40:100}}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}
function ReviewHead({ t }) {
  return (
    <thead>
      <tr style={{background:BRAND}}>
        {['NO',t('Tanggal','Date'),t('Agenda','Agenda'),t('Form','Form'),'Action',
          t('Nama Reviewer','Reviewer Name'),t('Posisi Reviewer','Reviewer Position'),t('Completed','Completed')].map((h,i)=>(
          <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap text-xs'
            style={{minWidth:i===2?200:i===3?140:i===4?100:i===7?80:i===0?40:100}}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}
function ProgressBar({ mainSections, t }) {
  const allItems  = (mainSections??[]).flatMap(ms=>ms.items??[])
  const selfItems = allItems.filter(i=>{ const v=i.assignedTo; return !v||v==='self'||v==='employee' })
  const total = selfItems.length
  const done  = selfItems.filter(i=>i.completed).length
  const pct   = total===0?0:Math.round((done/total)*100)
  return (
    <div className='mb-5'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-xs text-gray-500'>{t('Progress Onboarding','Onboarding Progress')}</span>
        <span className='text-xs font-bold text-red-700'>{done}/{total} ({pct}%)</span>
      </div>
      <div className='h-2.5 bg-gray-100 rounded-full overflow-hidden'>
        <div className='h-full rounded-full transition-all' style={{width:`${pct}%`,background:BRAND}} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EssOnboardingPage() {
  const t               = useT()
  const { currentUser } = useAuthStore()
  const { onboardings, updateOnboarding } = useOnboardingStore()

  const raw          = onboardings.find(o => o.employeeId === currentUser?.id) ?? null
  const myOnboarding = migrateOnboarding(raw)
  const status       = myOnboarding?.workflowStatus
  const isPreparation = status === 'Preparation'
  const isRejected    = status === 'Rejected'
  const isActive      = myOnboarding && !isRejected && !isPreparation

  const [form,        setForm       ] = useState(null)
  const [saved,       setSaved      ] = useState(false)
  const [fillModal,   setFillModal  ] = useState(null)
  const [signModal,   setSignModal  ] = useState(null)  // { msId, item }
  const [uploadModal, setUploadModal] = useState(null)  // { msId, item }
  const [videoModal,  setVideoModal ] = useState(null)  // { msId, item }

  useEffect(() => {
    if (myOnboarding) setForm(JSON.parse(JSON.stringify(myOnboarding)))
  }, [myOnboarding?.id, myOnboarding?.workflowStatus])

  const updItem = (msId, itemId, key, val) =>
    setForm(f => ({...f, mainSections: f.mainSections.map(ms =>
      ms.id===msId ? {...ms, items:ms.items.map(i=>i.id===itemId?{...i,[key]:val}:i)} : ms
    )}))

  const patchItem = (msId, itemId, patch) =>
    setForm(f => ({...f, mainSections: f.mainSections.map(ms =>
      ms.id===msId ? {...ms, items:ms.items.map(i=>i.id===itemId?{...i,...patch}:i)} : ms
    )}))

  const markDone = (msId, itemId) => {
    patchItem(msId, itemId, { completed: true, date: new Date().toISOString().slice(0,10) })
  }

  const handleSave = () => {
    if (!form) return
    updateOnboarding(form.id, { mainSections: form.mainSections })
    setSaved(true); setTimeout(()=>setSaved(false), 3000)
  }

  if (!myOnboarding) return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Onboarding Saya','My Onboarding')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Formulir induksi / onboarding karyawan.','Employee induction / onboarding form.')}</p>
      <div className='bg-white rounded-xl shadow-sm px-8 py-16 text-center text-gray-400 text-sm'>
        {t('Belum ada data onboarding untuk akun Anda.','No onboarding record found for your account.')}
      </div>
    </div>
  )

  if (!form) return null

  if (isPreparation) return (
    <div>
      <div className='flex items-center justify-between mb-1'>
        <h1 className='text-2xl font-bold text-gray-800'>{t('Onboarding Saya','My Onboarding')}</h1>
        <span className='text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700'>{t('Persiapan','Preparation')}</span>
      </div>
      <p className='text-gray-500 text-sm mb-5'>{t('Formulir induksi / onboarding karyawan.','Employee induction / onboarding form.')}</p>
      <div className='bg-white rounded-xl shadow-sm px-8 py-16 text-center'>
        <div className='text-5xl mb-4'>🗓️</div>
        <h2 className='text-lg font-bold text-gray-800 mb-2'>{t('Onboarding Anda sedang disiapkan','Your onboarding is being prepared')}</h2>
        <p className='text-gray-500 text-sm max-w-md mx-auto'>{t('HR dan atasan Anda sedang menyiapkan task onboarding. Semua task akan siap pada hari pertama kerja Anda.','HR and your manager are preparing your onboarding tasks. Everything will be ready on your first day.')}</p>
        {myOnboarding.buddyAssignment?.programStartDate && (
          <div className='mt-4 inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold'>
            📅 {t('Mulai','Starts')}: {new Date(myOnboarding.buddyAssignment.programStartDate).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
          </div>
        )}
      </div>
    </div>
  )

  const mainSections = form.mainSections ?? []
  const isMgrTask = (item) => { const v=item.assignedTo; return v==='manager'||(typeof v==='string'&&v.startsWith('emp:')) }

  // Shared action props
  const actionProps = (ms, item) => ({
    item, msId: ms.id,
    disabled: isRejected || isMgrTask(item),
    onFillForm: (msId, it) => setFillModal({ msId, item: it }),
    onSign:     (msId, it) => setSignModal({ msId, item: it }),
    onUpload:   (msId, it) => setUploadModal({ msId, item: it }),
    onVideo:    (msId, it) => setVideoModal({ msId, item: it }),
    onMark: markDone,
    t,
  })

  const renderRow = (item, idx, ms) => {
    const mgrOnly = isMgrTask(item)
    return (
      <tr key={item.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'}${mgrOnly?' opacity-70':''}`}>
        <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8 text-xs'>{idx+1}</td>
        <td className='px-2 py-1.5 w-28'>
          {(!isRejected && !mgrOnly)
            ? <input type='date' value={toDateInput(item.date||'')} onChange={e=>updItem(ms.id,item.id,'date',e.target.value)}
                className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
            : <span className='text-xs text-gray-600 px-2'>{item.date||<span className='text-gray-300'>—</span>}</span>}
        </td>
        <td className='px-3 py-1.5 text-gray-800 font-medium text-xs'>
          {item.module||<span className='text-gray-300'>—</span>}
          {mgrOnly && <span className='ml-1.5 text-[9px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded font-semibold'>Manager</span>}
        </td>
        <td className='px-3 py-1.5 text-gray-600 text-xs w-36'>{item.type||<span className='text-gray-300'>—</span>}</td>
        <td className='px-3 py-1.5 text-xs'>
          {!mgrOnly
            ? <ItemActionButton {...actionProps(ms, item)} />
            : <span className='text-gray-300 text-xs'>—</span>}
        </td>
        <td className='px-3 py-1.5 text-gray-700 text-xs w-28'>{item.mentorName||<span className='text-gray-300'>—</span>}</td>
        <td className='px-3 py-1.5 text-gray-600 text-xs w-28'>{item.mentorPosition||<span className='text-gray-300'>—</span>}</td>
        <td className='px-3 py-1.5 text-center w-16'>
          <input type='checkbox' checked={!!item.completed}
            onChange={e=>!mgrOnly&&updItem(ms.id,item.id,'completed',e.target.checked)}
            disabled={isRejected||mgrOnly}
            className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
        </td>
      </tr>
    )
  }

  return (
    <div className='pb-10'>
      {/* Modals */}
      {fillModal && (
        <FormFillModal item={fillModal.item} allSections={mainSections}
          evaluatorId={fillModal.evaluatorId ?? 'self'} evaluatorName={fillModal.evaluatorName ?? currentUser?.name ?? 'Saya'}
          onClose={() => setFillModal(null)}
          onSave={resp => {
            const submission = { evaluatorId: fillModal.evaluatorId??'self', evaluatorName: fillModal.evaluatorName??currentUser?.name??'Saya', submittedAt: new Date().toISOString(), response: resp }
            const prev = (fillModal.item.formSubmissions??[]).filter(s=>s.evaluatorId!==submission.evaluatorId)
            const newSubs = [...prev, submission]
            const evaluators = fillModal.item.evaluators??[]
            const allDone = evaluators.length===0||newSubs.length>=evaluators.length
            patchItem(fillModal.msId, fillModal.item.id, { formSubmissions:newSubs, formResponse:resp, completed:allDone })
            setFillModal(null)
          }}
        />
      )}
      {signModal && (
        <SignatureModal item={signModal.item} t={t}
          onClose={() => setSignModal(null)}
          onSave={data => {
            patchItem(signModal.msId, signModal.item.id, { signatureData:data, completed:true, date:new Date().toISOString().slice(0,10) })
            setSignModal(null)
          }}
        />
      )}
      {uploadModal && (
        <FileUploadModal item={uploadModal.item} t={t}
          onClose={() => setUploadModal(null)}
          onSave={file => {
            patchItem(uploadModal.msId, uploadModal.item.id, { attachmentName:file.name, attachmentData:file.data, attachmentType:file.type, completed:true, date:new Date().toISOString().slice(0,10) })
            setUploadModal(null)
          }}
        />
      )}
      {videoModal && (
        <VideoModal item={videoModal.item} t={t}
          onClose={() => setVideoModal(null)}
          onMarkDone={() => markDone(videoModal.msId, videoModal.item.id)}
        />
      )}

      {/* Header */}
      <div className='flex items-center justify-between mb-1'>
        <h1 className='text-2xl font-bold text-gray-800'>{t('Onboarding Saya','My Onboarding')}</h1>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_CLS[myOnboarding.workflowStatus]??'bg-gray-100 text-gray-600'}`}>
          {myOnboarding.workflowStatus}
        </span>
      </div>
      <p className='text-gray-500 text-sm mb-5'>{t('Formulir induksi / onboarding karyawan.','Employee induction / onboarding form.')}</p>

      {status==='Approved' ? (
        <div className='mb-5 rounded-xl px-5 py-3.5 text-sm font-medium border bg-green-50 border-green-200 text-green-700'>
          ✅ {t('Onboarding telah selesai diverifikasi.','Onboarding fully verified.')}
        </div>
      ) : isRejected ? (
        <div className='mb-5 rounded-xl px-5 py-3.5 text-sm font-medium border bg-red-50 border-red-200 text-red-700'>
          ❌ {t('Pengajuan onboarding ditolak. Hubungi HR.','Onboarding was rejected. Contact HR.')}
        </div>
      ) : (
        <div className='mb-5 rounded-xl px-5 py-3.5 text-sm font-medium border bg-blue-50 border-blue-200 text-blue-700'>
          🚀 {t('Onboarding Anda sedang berjalan. Selesaikan tugas-tugas di bawah ini.','Your onboarding is in progress. Complete the tasks below.')}
        </div>
      )}
      {saved && (
        <div className='mb-4 rounded-lg px-4 py-2.5 bg-green-50 border border-green-200 text-green-600 text-sm'>
          ✓ {t('Data berhasil disimpan.','Changes saved successfully.')}
        </div>
      )}

      <ProgressBar mainSections={mainSections} t={t} />

      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Form header */}
        <div style={{background:BRAND}} className='px-6 py-4'>
          <h2 className='text-sm font-bold text-white mb-3'>{t('FORMULIR ONBOARDING / INDUKSI KARYAWAN','EMPLOYEE ONBOARDING / INDUCTION FORM')}</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3'>
            {[
              [t('Nama','Name'),                         myOnboarding.employeeName],
              ['NIK',                                      myOnboarding.nik||'—'],
              ['Department',                               myOnboarding.department||'—'],
              [t('Join Date','Join Date'),                myOnboarding.joinDate?String(myOnboarding.joinDate).slice(0,10):'—'],
              [t('Nama / Posisi Atasan','Supervisor'),    `${myOnboarding.supervisorName||'—'} / ${myOnboarding.supervisorPosition||'—'}`],
              [t('Status Karyawan','Employee Status'),    myOnboarding.employmentStatus],
              [t('Masa Probation/Orientasi','Probation'), `${myOnboarding.probationPeriod??'—'} ${t('Bulan','Month(s)')}`],
              [t('Contract No','Contract No'),            myOnboarding.contractNo||'—'],
              [t('Probation End Date','Probation End Date'), myOnboarding.probationEndDate||'—'],
            ].map(([label,val])=>(
              <div key={label} className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-36 flex-shrink-0'>{label} :</span>
                <span className='text-xs text-white font-semibold'>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic sections */}
        {mainSections.length===0 ? (
          <div className='px-6 py-12 text-center text-gray-400 text-sm'>{t('Belum ada materi onboarding.','No onboarding material yet.')}</div>
        ) : mainSections.map((ms) => {
          const isReview = ms.type === 'Periodic Review'
          return (
            <div key={ms.id} className='px-6 pt-5 pb-2'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-1 h-5 rounded-full' style={{background:'linear-gradient(#8B1A1A,#D7252B)'}} />
                <h3 className='text-sm font-bold text-gray-800'>{ms.type}</h3>
              </div>
              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                {isReview ? (
                  <table className='w-full text-xs'>
                    <ReviewHead t={t} />
                    <tbody>
                      {(ms.items??[]).length===0
                        ? <tr><td colSpan={8} className='px-6 py-6 text-center text-gray-400 text-sm'>{t('Tidak ada data.','No data.')}</td></tr>
                        : (ms.items??[]).map((item,idx)=>(
                          <tr key={item.id} className={idx%2===0?'bg-white':'bg-gray-50/60'}>
                            <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx+1}</td>
                            <td className='px-2 py-1.5 w-28'>
                              {!isRejected
                                ? <input type='date' value={toDateInput(item.date||'')} onChange={e=>updItem(ms.id,item.id,'date',e.target.value)}
                                    className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
                                : <span className='text-xs text-gray-600 px-2'>{item.date||<span className='text-gray-300'>—</span>}</span>}
                            </td>
                            <td className='px-3 py-1.5 text-gray-800'>{item.agenda||item.module||<span className='text-gray-300'>—</span>}</td>
                            <td className='px-3 py-1.5 text-gray-600 w-36 text-xs'>{item.masterFormName||item.type||<span className='text-gray-300'>—</span>}</td>
                            <td className='px-3 py-1.5 text-xs'>
                              {item.masterFormId ? (() => {
                                const evaluators = item.evaluators??[]
                                const myId = `emp:${currentUser?.id}`
                                const canFill = evaluators.length===0||evaluators.some(e=>e.id==='self'||e.id===myId)
                                const mySubmission = (item.formSubmissions??[]).find(s=>s.evaluatorId==='self'||s.evaluatorId===myId)
                                const doneEval = (item.formSubmissions??[]).length
                                return (
                                  <div className='flex items-center gap-1.5'>
                                    {canFill && (
                                      <button onClick={()=>setFillModal({msId:ms.id,item,evaluatorId:evaluators.some(e=>e.id===myId)?myId:'self',evaluatorName:currentUser?.name??'Saya'})}
                                        disabled={isRejected}
                                        className='px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition disabled:opacity-40'>
                                        {mySubmission?'✏ Edit':'📋 Isi Form'}
                                      </button>
                                    )}
                                    {evaluators.length>0&&<span className='text-[10px] text-gray-400'>{doneEval}/{evaluators.length}</span>}
                                  </div>
                                )
                              })() : <span className='text-gray-300'>—</span>}
                            </td>
                            <td className='px-3 py-1.5 text-gray-700 w-28'>{item.reviewerName||item.mentorName||<span className='text-gray-300'>—</span>}</td>
                            <td className='px-3 py-1.5 text-gray-600 w-28'>{item.reviewerPosition||item.mentorPosition||<span className='text-gray-300'>—</span>}</td>
                            <td className='px-3 py-1.5 text-center w-16'>
                              <input type='checkbox' checked={!!item.completed} onChange={e=>updItem(ms.id,item.id,'completed',e.target.checked)}
                                disabled={isRejected} className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (ms.sections??[]).length===0 ? (
                  <table className='w-full text-xs'>
                    <AgendaHead t={t} />
                    <tbody>
                      {(ms.items??[]).length===0
                        ? <tr><td colSpan={8} className='px-6 py-6 text-center text-gray-400 text-sm'>{t('Tidak ada data.','No data.')}</td></tr>
                        : (ms.items??[]).map((item,idx) => renderRow(item,idx,ms))}
                    </tbody>
                  </table>
                ) : (
                  (ms.sections??[]).map((sec,secIdx)=>{
                    const cls  = SEC_COLORS[secIdx%SEC_COLORS.length]
                    const rows = (ms.items??[]).filter(i=>i.category===sec.id)
                    return (
                      <table key={sec.id} className='w-full text-xs border-b border-gray-100 last:border-b-0'>
                        <AgendaHead t={t} />
                        <tbody>
                          <tr className={cls.bg}><td colSpan={8} className='px-3 py-2'><span className={`text-xs font-semibold ${cls.text}`}>{sec.label||'—'}</span></td></tr>
                          {rows.length===0&&<tr><td colSpan={8} className='px-4 py-3 text-center text-gray-300 text-xs italic'>{t('Tidak ada baris.','No rows.')}</td></tr>}
                          {rows.map((item,idx) => renderRow(item,idx,ms))}
                        </tbody>
                      </table>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}

        {/* Save */}
        {isActive && (
          <div className='px-6 py-5 flex gap-3'>
            <button onClick={handleSave} className='px-6 py-2.5 text-sm font-bold text-white rounded-xl transition' style={{background:BRAND}}>
              💾 {t('Simpan Perubahan','Save Changes')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
