import { authClient } from '@/lib/auth-client'
import { uploadEncryptedProfileImage } from '@/lib/profile-image'
import { create } from 'zustand'

type CompleteProfileState = {
    firstName: string
    lastName: string
    image: string | null
    canGoNext: boolean
    loading: boolean
    error: string | null
    setFirstName: (v: string) => void
    setLastName: (v: string) => void
    setImage: (v: string | null) => void
    validate: () => void
    reset: () => void
    onNextPress: () => Promise<void>
}

export const useCompleteProfileStore = create<CompleteProfileState>((set, get) => ({
    firstName: '',
    lastName: '',
    image: null,
    canGoNext: false,
    loading: false,
    error: null,

    setFirstName: (v) => { set({ firstName: v }); get().validate() },
    setLastName: (v) => { set({ lastName: v }); get().validate() },
    setImage: (v) => set({ image: v }),

    validate: () => {
        const { firstName, lastName } = get()
        set({ canGoNext: firstName.trim().length > 1 && lastName.trim().length > 1 })
    },

    reset: () => set({
        firstName: '', lastName: '', image: null,
        canGoNext: false, loading: false, error: null,
    }),

    onNextPress: async () => {
        const { firstName, lastName, image, canGoNext } = get()

        if (!canGoNext) { set({ error: 'Validation failed' }); return }

        try {
            set({ loading: true, error: null })

            const fullName = `${firstName.trim()} ${lastName.trim()}`
            let uploadedImage: string | null = image

            if (image && (image.startsWith('file') || image.startsWith('content'))) {
                console.log('🔐 Uploading encrypted image...')
                const result = await uploadEncryptedProfileImage(image)
                uploadedImage = result.imageUrl
                console.log('✅ Upload result:', result)
            }

            const { error } = await authClient.updateUser({
                name: fullName,
                image: uploadedImage ?? undefined,
            })

            if (error) {
                set({ error: error.message || 'Something went wrong' })
                return
            }

            set({ firstName, lastName, image: uploadedImage })
            console.log('🎉 Profile updated successfully')

        } catch (e) {
            console.log('💥 onNextPress crash:', e)
            set({ error: e instanceof Error ? e.message : 'Unknown error' })
        } finally {
            set({ loading: false })
        }
    },
}))