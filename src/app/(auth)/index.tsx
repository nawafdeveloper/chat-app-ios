import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useLoginStore } from '@/store/use-login-store'
import { Button, Divider, Form, Host, HStack, Image, Spacer, TextField, TextFieldRef, Text as TextUI } from '@expo/ui/swift-ui'
import { buttonStyle, foregroundStyle, keyboardType } from '@expo/ui/swift-ui/modifiers'
import { Link } from 'expo-router'
import React, { useRef } from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    useColorScheme
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PhoneLogin = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()
    const ref = useRef<TextFieldRef>(null);

    const {
        selectedCountry,
        phoneNumber,
        setPhoneNumber,
        isLoading
    } = useLoginStore()

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator size={'small'} />
                    <ThemedText style={{ fontSize: 14 }}>Sending verification code</ThemedText>
                </ThemedView>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={[styles.main, { paddingTop: insets.top * 2 }]}>
            <ThemedText style={styles.title}>Your Phone Number</ThemedText>
            <ThemedText style={styles.description}>
                Enter your phone number to get started.
            </ThemedText>
            <Host style={{ flex: 1 }}>
                <Form>
                    <Link href="/(auth)/country-selector" asChild>
                        <Button modifiers={[buttonStyle('automatic')]}>
                            <HStack spacing={8}>
                                <Image systemName="globe" color={scheme === 'dark' ? '#ffffff' : '#000000'} size={16} />
                                <TextUI modifiers={[foregroundStyle(scheme === 'dark' ? '#ffffff' : '#000000')]}>{selectedCountry.label}</TextUI>
                                <Spacer />
                                <Image systemName="chevron.right" size={14} color="secondary" />
                            </HStack>
                        </Button>
                    </Link>
                    <HStack spacing={18}>
                        <TextUI modifiers={[foregroundStyle(scheme === 'dark' ? '#ffffff' : '#000000')]}>{selectedCountry.code}</TextUI>
                        <Divider />
                        <TextField
                            ref={ref}
                            placeholder="Your phone number"
                            autoFocus
                            defaultValue={phoneNumber}
                            onValueChange={(value) => {
                                if (value.length > selectedCountry.maxLength) {
                                    const truncated = value.slice(0, selectedCountry.maxLength);
                                    setPhoneNumber(truncated);
                                    ref.current?.setText(truncated);
                                } else {
                                    setPhoneNumber(value);
                                }
                            }}
                            modifiers={[keyboardType('numeric')]}
                        />
                    </HStack>
                </Form>
            </Host>
        </ThemedView>
    )
}

export default PhoneLogin

const styles = StyleSheet.create({
    main: {
        flex: 1,
        gap: 10,
        backgroundColor: 'transparent'
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        color: 'gray',
    },
    formContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 99,
        borderCurve: 'continuous',
        overflow: 'hidden',
        height: 52,
    },
    countryButton: {
        paddingHorizontal: 14,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    countryCode: {
        fontSize: 15,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: '60%',
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 15,
        height: '100%',
    },
    nextBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    nextBtnActive: {
        backgroundColor: '#22c55e',
    },
    nextBtnDisabled: {
        backgroundColor: 'transparent',
    },
    nextBtnText: {
        fontSize: 15,
        fontWeight: '500',
    },
    nextBtnTextActive: {
        color: '#fff',
    },
    nextBtnTextDisabled: {
        color: '#9ca3af',
    },
})