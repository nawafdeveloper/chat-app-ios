import { authClient } from '@/lib/auth-client'
import { Button, Form, Host, HStack, Image, Section, Spacer, Text } from '@expo/ui/swift-ui'
import { buttonStyle } from '@expo/ui/swift-ui/modifiers'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'

type PrivacyValue = 'all' | 'contacts' | 'nobody'
type TimerValue = '24h' | '7d' | '90d'

const TOGGLE_CONFIG = {
    'last-seen': {
        title: 'Last Seen',
        sectionTitle: 'Who can see my last seen',
        field: 'whoCanSeeLastSeen' as const,
        options: [
            { label: 'Everyone', value: 'all' },
            { label: 'Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
        ],
    },
    'profile-picture': {
        title: 'Profile Picture Seen',
        sectionTitle: 'Who can see my profile picture',
        field: 'whoCanSeeProfilePicture' as const,
        options: [
            { label: 'Everyone', value: 'all' },
            { label: 'Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
        ],
    },
    about: {
        title: 'About Seen',
        sectionTitle: 'Who can see my About',
        field: 'whoCanSeeAbout' as const,
        options: [
            { label: 'Everyone', value: 'all' },
            { label: 'Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
        ],
    },
    status: {
        title: 'Status Seen',
        sectionTitle: 'Who can see my status',
        field: 'whoCanSeeStatus' as const,
        options: [
            { label: 'Everyone', value: 'all' },
            { label: 'Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
        ],
    },
    'message-timer': {
        title: 'Message Timer',
        sectionTitle: 'Start new chats with a disappearing message timer set to',
        field: 'defaultMessageTimer' as const,
        options: [
            { label: '24 Hours', value: '24h' },
            { label: '7 Days', value: '7d' },
            { label: '90 Days', value: '90d' },
        ],
    },
} as const

type ToggleType = keyof typeof TOGGLE_CONFIG

const PrivacyModalPageSettings = () => {
    const { data, refetch } = authClient.useSession()
    const navigation = useNavigation()
    const { toggleType } = useLocalSearchParams<{ toggleType: string }>()

    const config = TOGGLE_CONFIG[toggleType as ToggleType]

    // Optimistic local state so UI updates instantly
    const [selected, setSelected] = useState<string>(
        () => (data?.user as any)?.[config?.field] ?? ''
    )

    useEffect(() => {
        if (config) navigation.setOptions({ headerTitle: config.title })
    }, [toggleType])

    // Sync if session loads after mount
    useEffect(() => {
        if (config && data?.user) {
            setSelected((data.user as any)[config.field] ?? '')
        }
    }, [data?.user])

    const handleSelect = async (value: string) => {
        if (!config || value === selected) return

        const previous = selected
        setSelected(value) // optimistic

        try {
            const { error } = await authClient.updateUser({
                [config.field]: value,
            })
            if (error) throw new Error(error.message)
            await refetch()
        } catch (e: any) {
            setSelected(previous) // revert on failure
            console.log('❌ Failed to update:', e.message)
        }
    }

    if (!config) return null

    return (
        <Host style={{ flex: 1 }}>
            <Form>
                <Section title={config.sectionTitle}>
                    {config.options.map(({ label, value }) => (
                        <Button
                            key={value}
                            modifiers={[buttonStyle('plain')]}
                            onPress={() => handleSelect(value)}
                        >
                            <HStack spacing={8}>
                                <Text>{label}</Text>
                                <Spacer />
                                {selected === value && (
                                    <Image systemName="checkmark" size={14} color="#25D366" />
                                )}
                            </HStack>
                        </Button>
                    ))}
                </Section>
            </Form>
        </Host>
    )
}

export default PrivacyModalPageSettings