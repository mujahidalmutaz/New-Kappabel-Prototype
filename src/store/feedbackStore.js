import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Keyed by `${reviewerId}_${employeeId}` — supports multiple reviewers per employee
const _key = (reviewerId, employeeId) => `${reviewerId}_${employeeId}`

const BLANK = {
  effectiveDate:   '',
  documentNumber:  '',
  revision:        '',
  classification:  '',
  strength:        '',
  areaDevelopment: '',
}

export const useFeedbackStore = create(persist(
  (set, get) => ({
    feedbacks: {},

    getFeedback: (reviewerId, employeeId) =>
      get().feedbacks[_key(reviewerId, employeeId)] ?? { ...BLANK },

    saveFeedback: (reviewerId, employeeId, data) =>
      set(s => ({
        feedbacks: {
          ...s.feedbacks,
          [_key(reviewerId, employeeId)]: {
            ...(s.feedbacks[_key(reviewerId, employeeId)] ?? {}),
            ...data,
          },
        },
      })),

    hasFeedback: (reviewerId, employeeId) => {
      const fb = get().feedbacks[_key(reviewerId, employeeId)]
      return !!(fb?.strength || fb?.areaDevelopment)
    },
  }),
  { name: 'hcm-feedback-v2' }
))
