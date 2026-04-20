import { formatPhoneNumber } from '@/helper/phone-formatters';
import { authClient } from '@/lib/auth-client';
import { fetchAndDecryptProfileImage } from '@/lib/profile-image';
import {
    Button,
    Form,
    Host,
    HStack,
    Section,
    Spacer,
    Image as SwiftImage,
    Text,
    VStack,
} from '@expo/ui/swift-ui';
import { buttonStyle, cornerRadius, font, foregroundStyle, frame } from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const SettingsScreen = () => {
    const { data } = authClient.useSession();
    const scheme = useColorScheme()

    const [decryptedImageUri, setDecryptedImageUri] = useState<string | null>(null)

    useEffect(() => {
        if (!data?.user.image) return

        const decrypt = async () => {
            try {
                const objectKey = data.user.image!.split('/api/profile-image/')[1]
                if (!objectKey) return

                const localUri = await fetchAndDecryptProfileImage(objectKey)
                setDecryptedImageUri(localUri)
            } catch (e) {
                console.log('❌ Failed to decrypt profile image:', e)
            }
        }

        decrypt()
    }, [data?.user.image])

    return (
        <Host style={{ flex: 1 }}>
            <Form>
                <Section>
                    <Link href="/(tabs)/settings/profile-edit" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={12}>
                                <HStack modifiers={[frame({ width: 52, height: 52 }), cornerRadius(99)]}>
                                    {decryptedImageUri ? (
                                        <Image
                                            source={{ uri: decryptedImageUri }}
                                            contentFit="contain"
                                            style={{ width: 52, height: 52 }}
                                        />
                                    ) : (
                                        <SwiftImage
                                            systemName="person.crop.circle.fill"
                                            color="gray"
                                            size={52}
                                        />
                                    )}
                                </HStack>
                                <VStack spacing={2} alignment='leading'>
                                    <Text modifiers={[font({ weight: 'bold' })]}>
                                        {data?.user.name ?? 'Your Name'}
                                    </Text>
                                    <Text modifiers={[font({ weight: 'regular', size: 14 }), foregroundStyle('secondary')]}>
                                        {formatPhoneNumber(data?.user.phoneNumber)}
                                    </Text>
                                </VStack>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                </Section>

                <Section title='Settings'>
                    <Link href="/(tabs)/settings/starred" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="star" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Starred</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                    <Link href="/(tabs)/settings/linked-devices" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="laptopcomputer.badge.checkmark" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Linked devices</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                </Section>

                <Section title='Account'>
                    <Link href="/(tabs)/settings/account" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="key" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Account</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                    <Link href="/(tabs)/settings/privacy" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="lock" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Privacy</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                    <Link href="/(tabs)/settings/chats" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="message" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Chats</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                    <Link href="/(tabs)/settings/notifications" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="app.badge" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Notifications</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                </Section>

                <Section title='Help and feedback'>
                    <Link href="/(tabs)/settings/profile-edit" asChild>
                        <Button modifiers={[buttonStyle('plain')]}>
                            <HStack spacing={8}>
                                <SwiftImage systemName="questionmark.circle" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                                <Text>Help center</Text>
                                <Spacer />
                                <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                </Section>
            </Form>
        </Host>
    )
}

export default SettingsScreen