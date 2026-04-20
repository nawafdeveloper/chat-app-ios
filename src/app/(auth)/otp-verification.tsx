import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useLoginStore } from '@/store/use-login-store'
import React, { useEffect, useRef } from 'react'
import {
    ActivityIndicator,
    NativeSyntheticEvent,
    StyleSheet,
    TextInput,
    TextInputKeyPressEventData,
    useColorScheme,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const OTP_LENGTH = 6

const COLORS = {
    dark: {
        underline: '#3A3A3C',
        underlineFocused: '#FFFFFF',
        text: '#FFFFFF',
    },
    light: {
        underline: '#C7C7CC',
        underlineFocused: '#000000',
        text: '#000000',
    },
}

const OtpVerification = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()
    const isDark = scheme === 'dark'
    const colors = isDark ? COLORS.dark : COLORS.light

    const { otp, setOtp, isLoading } = useLoginStore()

    const otpArray = otp.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH)
    const focusedIndex = useRef<number>(0)
    const inputs = useRef<(TextInput | null)[]>([])

    useEffect(() => {
        const timer = setTimeout(() => {
            inputs.current[0]?.focus()
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    const handleChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1)
        const newOtpArray = [...otpArray]
        newOtpArray[index] = digit
        setOtp(newOtpArray.join(''))
        if (digit && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus()
        }
    }

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
            const newOtpArray = [...otpArray]
            newOtpArray[index - 1] = ''
            setOtp(newOtpArray.join(''))
            inputs.current[index - 1]?.focus()
        }
    }

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator size={'small'} />
                    <ThemedText style={{ fontSize: 14 }}>Verifying your OTP</ThemedText>
                </ThemedView>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={[styles.main, { paddingTop: insets.top * 2 }]}>
            <ThemedText style={styles.title}>Verification Code</ThemedText>
            <ThemedText style={styles.description}>
                Enter the 6-digit code sent to your phone number.
            </ThemedText>

            <View style={styles.otpRow}>
                {Array(OTP_LENGTH).fill(0).map((_, index) => {
                    const isFocused = focusedIndex.current === index
                    const underlineColor = isFocused
                        ? colors.underlineFocused
                        : colors.underline

                    return (
                        <View key={index} style={styles.cellWrapper}>
                            <TextInput
                                ref={(r) => { inputs.current[index] = r }}
                                style={[styles.cell, { color: colors.text }]}
                                value={otpArray[index]}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                onFocus={() => { focusedIndex.current = index }}
                                onBlur={() => { focusedIndex.current = -1 }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                selectionColor={colors.underlineFocused}
                                editable={!isLoading}
                            />
                            <View style={[
                                styles.underline,
                                {
                                    backgroundColor: underlineColor,
                                    height: isFocused ? 2 : 1,
                                }
                            ]} />
                        </View>
                    )
                })}
            </View>
        </ThemedView>
    )
}

export default OtpVerification

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
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    cellWrapper: {
        alignItems: 'center',
        gap: 4,
    },
    cell: {
        width: 48,
        height: 48,
        fontSize: 22,
        fontWeight: '600',
    },
    underline: {
        width: 48,
        borderRadius: 2,
    },
})