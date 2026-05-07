import AppearanceFormatter from '@/helper/appearance-formatter'
import { authClient } from '@/lib/auth-client'
import { Button, Form, Host, HStack, Image, Section, Spacer, Text, Toggle, VStack } from '@expo/ui/swift-ui'
import { buttonStyle, font, foregroundStyle } from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const PrivacyPageSettings = () => {
    const { data } = authClient.useSession();

    return (
        <Host style={{ flex: 1 }}>
            <Form>
                <Section title='Who can see my personal information'>
                    <Button modifiers={[buttonStyle('automatic')]} onPress={() => router.push({ pathname: '/(tabs)/settings/privacy-modal', params: { toggleType: 'last-seen' } })}>
                        <HStack spacing={8}>
                            <Text>Last seen & online</Text>
                            <Spacer />
                            <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>{AppearanceFormatter(data?.user.whoCanSeeLastSeen)}</Text>
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                    <Button modifiers={[buttonStyle('automatic')]} onPress={() => router.push({ pathname: '/(tabs)/settings/privacy-modal', params: { toggleType: 'profile-picture' } })}>
                        <HStack spacing={8}>
                            <Text>Profile picture</Text>
                            <Spacer />
                            <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>{AppearanceFormatter(data?.user.whoCanSeeProfilePicture)}</Text>
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                    <Button modifiers={[buttonStyle('automatic')]} onPress={() => router.push({ pathname: '/(tabs)/settings/privacy-modal', params: { toggleType: 'about' } })}>
                        <HStack spacing={8}>
                            <Text>About</Text>
                            <Spacer />
                            <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>{AppearanceFormatter(data?.user.whoCanSeeAbout)}</Text>
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                    <Button modifiers={[buttonStyle('automatic')]} onPress={() => router.push({ pathname: '/(tabs)/settings/privacy-modal', params: { toggleType: 'status' } })}>
                        <HStack spacing={8}>
                            <Text>Status</Text>
                            <Spacer />
                            <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>{AppearanceFormatter(data?.user.whoCanSeeStatus)}</Text>
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                </Section>
                <Section title='Disappearing messages'>
                    <Button modifiers={[buttonStyle('automatic')]} onPress={() => router.push({ pathname: '/(tabs)/settings/privacy-modal', params: { toggleType: 'message-timer' } })}>
                        <HStack spacing={8}>
                            <Text>Default message timer</Text>
                            <Spacer />
                            <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>{data?.user.defaultMessageTimer}</Text>
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                </Section>
                <Section>
                    <Button modifiers={[buttonStyle('automatic')]}>
                        <HStack spacing={8}>
                            <Text>Blocked contacts</Text>
                            <Spacer />
                            <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>{data?.user.totalBlockedContact}</Text>
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                </Section>
                <Section title='Advanced'>
                    <Button modifiers={[buttonStyle('automatic')]}>
                        <HStack spacing={8}>
                            <VStack spacing={2} alignment='leading'>
                                <Text>Read receipts</Text>
                                <Text modifiers={[font({ size: 14, weight: 'regular' }), foregroundStyle('secondary')]}>When off no read receipts.</Text>
                            </VStack>
                            <Spacer />
                            <Toggle isOn={data?.user.enableReadReceipts} />
                        </HStack>
                    </Button>
                    <Button modifiers={[buttonStyle('automatic')]}>
                        <HStack spacing={8}>
                            <Text>Block unknown account</Text>
                            <Spacer />
                            <Toggle isOn={data?.user.blockUnknownAccount} />
                        </HStack>
                    </Button>
                    <Button modifiers={[buttonStyle('automatic')]}>
                        <HStack spacing={8}>
                            <Text>Disable link previews</Text>
                            <Spacer />
                            <Toggle isOn={data?.user.disableLinkPreview} />
                        </HStack>
                    </Button>
                </Section>
            </Form>
        </Host>
    )
}

export default PrivacyPageSettings

const styles = StyleSheet.create({
    main: {
        flex: 1
    }
})