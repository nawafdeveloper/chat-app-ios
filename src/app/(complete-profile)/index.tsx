import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useCompleteProfileStore } from '@/store/use-complete-profile-store'
import { Form, Host, TextField } from '@expo/ui/swift-ui'
import { Ionicons } from '@expo/vector-icons'
import { GlassView } from 'expo-glass-effect'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CompleteProfile = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()

    const {
        firstName,
        lastName,
        image,
        setFirstName,
        setLastName,
        setImage,
    } = useCompleteProfileStore()

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    return (
        <ThemedView style={[styles.main, { paddingTop: insets.top * 2 }]}>
            <ThemedText style={styles.title}>Set up your profile</ThemedText>

            <ThemedText style={styles.description}>
                Profiles are visible to people you message, contacts and groups.
            </ThemedText>

            {/* Avatar */}
            <Pressable onPress={pickImage} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.avatarContainer}>
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor: '#2ECC7133',
                                borderColor: '#2ECC7133' + '33',
                            },
                        ]}
                    >
                        {image ? (
                            <Image
                                source={image}
                                contentFit='contain'
                                style={styles.avatar}
                            />
                        ) : (
                            <Ionicons name="person" size={32} color="#2ECC71" />
                        )}
                    </View>

                    <View style={styles.cameraButtonWrapper}>
                        <GlassView
                            style={[
                                styles.cameraButton,
                                {
                                    backgroundColor:
                                        scheme === 'dark'
                                            ? 'rgba(255,255,255,0.4)'
                                            : 'rgba(0,0,0,0.4)',
                                },
                            ]}
                        >
                            <Ionicons
                                name="camera"
                                size={12}
                                color={scheme === 'dark' ? '#000' : '#fff'}
                            />
                        </GlassView>
                    </View>
                </View>
            </Pressable>

            {/* Inputs */}
            <Host style={{ flex: 1 }}>
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
            </Host>
        </ThemedView>
    )
}

export default CompleteProfile

const styles = StyleSheet.create({
    main: { flex: 1, gap: 10 },
    title: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
    description: { textAlign: 'center', color: 'gray', paddingHorizontal: 16 },
    avatarContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: 72,
        height: 72,
    },

    avatar: {
        width: 68,
        height: 68,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
    },

    cameraButtonWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },

    cameraButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
});