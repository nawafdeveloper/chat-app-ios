import { authClient } from '@/lib/auth-client'
import { useUpdateNameAndAbout } from '@/store/use-update-name-and-about'
import { Form, Host, TextField } from '@expo/ui/swift-ui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, Pressable, useColorScheme } from 'react-native'

const ProfileEditModalPageSettings = () => {
    const { data } = authClient.useSession()
    const colorScheme = useColorScheme();

    const { editType } = useLocalSearchParams<{ editType: string }>()
    const navigation = useNavigation()
    const router = useRouter()

    const {
        firstName, lastName, about,
        isLoading, errors,
        setFirstName, setLastName, setAbout,
        reset, validate, setLoading,
    } = useUpdateNameAndAbout()

    useEffect(() => {
        const fullName = data?.user.name || ''
        reset(
            fullName.split(' ')[0] || '',
            fullName.split(' ').slice(1).join(' ') || '',
        )
    }, [data?.user.name])

    const handleSubmit = async () => {
        if (!validate(editType as 'edit-name' | 'edit-about')) return

        setLoading(true)
        try {
            if (editType === 'edit-name') {
                const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
                const { error } = await authClient.updateUser({ name: fullName })
                if (error) throw new Error(error.message)
            }
            router.back()
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to update. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerTitle: editType === 'edit-name' ? 'Edit your name' : 'Edit your about',
            headerRight: () =>
                isLoading ? (
                    <ActivityIndicator size={'small'} />
                ) : (
                    <Pressable onPress={handleSubmit}>
                        <Ionicons name="checkmark-outline" size={32} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
                    </Pressable>
                ),
        })
    }, [editType, isLoading, firstName, lastName, about])

    return (
        <Host style={{ flex: 1 }}>
            {editType === 'edit-name' ? (
                <Form>
                    <TextField
                        placeholder="First name"
                        autoFocus
                        defaultValue={firstName}
                        onValueChange={setFirstName}
                    />
                    <TextField
                        placeholder="Last name"
                        defaultValue={lastName}
                        onValueChange={setLastName}
                    />
                </Form>
            ) : (
                <Form>
                    <TextField
                        placeholder="About you"
                        autoFocus
                        defaultValue={about}
                        onValueChange={setAbout}
                    />
                </Form>
            )}
        </Host>
    )
}

export default ProfileEditModalPageSettings