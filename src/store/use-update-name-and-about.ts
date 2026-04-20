import { create } from 'zustand'

interface UpdateNameAndAbout {
    firstName: string
    lastName: string
    about: string
    isLoading: boolean
    errors: { firstName?: string; lastName?: string; about?: string }

    setFirstName: (v: string) => void
    setLastName: (v: string) => void
    setAbout: (v: string) => void
    reset: (firstName: string, lastName: string, about?: string) => void
    validate: (editType: 'edit-name' | 'edit-about') => boolean
    clearErrors: () => void
    setLoading: (v: boolean) => void
}

export const useUpdateNameAndAbout = create<UpdateNameAndAbout>((set, get) => ({
    firstName: '',
    lastName: '',
    about: '',
    isLoading: false,
    errors: {},

    setFirstName: (v) => set({ firstName: v, errors: { ...get().errors, firstName: undefined } }),
    setLastName: (v) => set({ lastName: v, errors: { ...get().errors, lastName: undefined } }),
    setAbout: (v) => set({ about: v, errors: { ...get().errors, about: undefined } }),
    setLoading: (v) => set({ isLoading: v }),
    clearErrors: () => set({ errors: {} }),

    reset: (firstName, lastName, about = '') =>
        set({ firstName, lastName, about, errors: {}, isLoading: false }),

    validate: (editType) => {
        const { firstName, lastName, about } = get()
        const errors: UpdateNameAndAbout['errors'] = {}

        if (editType === 'edit-name') {
            if (!firstName.trim()) errors.firstName = 'First name is required'
            else if (firstName.trim().length < 2) errors.firstName = 'Must be at least 2 characters'
            else if (firstName.trim().length > 32) errors.firstName = 'Must be under 32 characters'

            if (lastName.trim().length > 32) errors.lastName = 'Must be under 32 characters'
        } else {
            if (about.trim().length > 150) errors.about = 'Must be under 150 characters'
        }

        set({ errors })
        return Object.keys(errors).length === 0
    },
}))