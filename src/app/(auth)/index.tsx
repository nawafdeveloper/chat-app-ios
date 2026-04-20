import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useLoginStore } from '@/store/use-login-store'
import { SymbolView } from 'expo-symbols'
import React, { useRef } from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const COLORS = {
    dark: {
        inputBackground: '#1C1C1E',
        border: '#3A3A3C',
        divider: '#3A3A3C',
        text: '#FFFFFF',
        placeholder: '#636366',
        buttonText: '#FFFFFF',
        buttonBackground: '#2C2C2E',
    },
    light: {
        inputBackground: '#efefef',
        border: '#E5E5EA',
        divider: '#E5E5EA',
        text: '#000000',
        placeholder: '#C7C7CC',
        buttonText: '#000000',
        buttonBackground: '#F2F2F7',
    },
}

const PhoneLogin = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()
    const isDark = scheme === 'dark'
    const colors = isDark ? COLORS.dark : COLORS.light
    const textFieldRef = useRef<TextInput>(null)

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
            <View style={styles.formContainer}>
                <View
                    style={[
                        styles.inputRow,
                        { backgroundColor: colors.inputBackground },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.countryButton}
                        activeOpacity={0.7}
                        onPress={() => textFieldRef.current?.focus()}
                    >
                        <Text style={[styles.countryCode, { color: colors.buttonText }]}>
                            {selectedCountry.value}
                        </Text>
                        <SymbolView
                            tintColor={colors.text}
                            name={{ ios: 'chevron.down' }}
                            size={12}
                        />
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    <TextInput
                        ref={textFieldRef}
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Your phone number"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="number-pad"
                        autoFocus
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />
                </View>
            </View>
        </ThemedView>
    )
}

export default PhoneLogin

const styles = StyleSheet.create({
    main: {
        flex: 1,
        gap: 10,
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