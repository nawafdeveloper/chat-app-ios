import { ThemedText } from '@/components/themed-text'
import { authClient } from '@/lib/auth-client'
import { fetchAndDecryptProfileImage, uploadEncryptedProfileImage } from '@/lib/profile-image'
import {
    Button, Form, Host, HStack, RNHostView,
    Section, Spacer, Image as SwiftImage, Text
} from '@expo/ui/swift-ui'
import { buttonStyle, frame, listRowBackground, listSectionSpacing } from '@expo/ui/swift-ui/modifiers'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native'

const ProfileEditPageSettings = () => {
    const { data, refetch } = authClient.useSession()
    const scheme = useColorScheme()
    const [decryptedImageUri, setDecryptedImageUri] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your photo library.')
            return
        }

        const picked = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (picked.canceled) return

        const localUri = picked.assets[0].uri

        setDecryptedImageUri(localUri)
        setLoading(true)

        try {
            const { imageUrl } = await uploadEncryptedProfileImage(localUri)

            const { error } = await authClient.updateUser({ image: imageUrl })
            if (error) throw new Error(error.message || 'Failed to update profile')

            await refetch()
        } catch (e: any) {
            // Revert optimistic preview on failure
            setDecryptedImageUri(null)
            Alert.alert('Upload failed', e.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Host style={styles.main}>
            <Form>
                <Section modifiers={[listRowBackground('clear'), listSectionSpacing('compact'), frame({ height: 170 })]}>
                    <RNHostView matchContents>
                        <View style={[styles.profileImageContainer, { backgroundColor: 'transparent' }]}>

                            {/* Avatar with loading overlay */}
                            <Pressable onPress={pickImage} disabled={loading} style={styles.avatarWrapper}>
                                {decryptedImageUri ? (
                                    <Image
                                        source={{ uri: decryptedImageUri }}
                                        contentFit="cover"
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatarFallback, loading && styles.avatarDimmed]} />
                                )}

                                {/* Overlay shown while uploading */}
                                {loading && (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="large" color="#ffffff" />
                                    </View>
                                )}
                            </Pressable>

                            <Pressable
                                onPress={pickImage}
                                disabled={loading}
                                style={[
                                    styles.editImageButton,
                                    { backgroundColor: scheme === 'dark' ? '#1A1A1C' : '#ffffff' },
                                    loading && styles.buttonDisabled,
                                ]}
                            >
                                <ThemedText style={[{ fontSize: 14 }, loading && styles.textDisabled]}>
                                    {loading ? 'Uploading...' : 'Edit Photo'}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </RNHostView>
                </Section>

                <Section>
                    <Button
                        modifiers={[buttonStyle('plain')]}
                        onPress={() => router.push({ pathname: '/(tabs)/settings/profile-edit-modal', params: { editType: 'edit-name' } })}
                    >
                        <HStack spacing={8}>
                            <SwiftImage systemName="person" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                            <Text>{data?.user.name}</Text>
                            <Spacer />
                            <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                    <Button
                        modifiers={[buttonStyle('plain')]}
                        onPress={() => router.push({ pathname: '/(tabs)/settings/profile-edit-modal', params: { editType: 'edit-about' } })}
                    >
                        <HStack spacing={8}>
                            <SwiftImage systemName="square.and.pencil" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={18} />
                            <Text>About</Text>
                            <Spacer />
                            <SwiftImage systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                </Section>
            </Form>
        </Host>
    )
}

export default ProfileEditPageSettings

const AVATAR_SIZE = 140

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    profileImageContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        gap: 14,
        width: '100%',
    },
    avatarWrapper: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        overflow: 'hidden',
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
    },
    avatarFallback: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        backgroundColor: '#ccc',
    },
    avatarDimmed: {
        opacity: 0.4,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editImageButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    textDisabled: {
        opacity: 0.6,
    },
})