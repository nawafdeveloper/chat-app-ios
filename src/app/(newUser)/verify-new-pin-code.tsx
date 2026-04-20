import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useCrypto } from '@/hooks/use-crypto'
import { usePinStore } from '@/store/use-pin-store'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
    StyleSheet,
    TextInput,
    useColorScheme,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PIN_LENGTH = 6

const COLORS = {
    dark: { dotFilled: '#FFFFFF', dotEmpty: '#3A3A3C', dotError: '#FF453A' },
    light: { dotFilled: '#000000', dotEmpty: '#E5E5EA', dotError: '#FF3B30' },
}

const VerifyNewPinCode = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()
    const isDark = scheme === 'dark'
    const colors = isDark ? COLORS.dark : COLORS.light

    const { pin, confirmPin, setConfirmPin, isConfirmMatch, reset } = usePinStore()
    const { register } = useCrypto()
    const inputRef = useRef<TextInput>(null)
    const [error, setError] = useState(false)
    const isProcessing = useRef(false)

    useEffect(() => {
        setConfirmPin('')
        isProcessing.current = false
        const timer = setTimeout(() => inputRef.current?.focus(), 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (confirmPin.length !== PIN_LENGTH || isProcessing.current) return
        isProcessing.current = true

        if (isConfirmMatch) {
            const create = async () => {
                try {
                    await register(pin)
                    reset()
                    router.replace('/(complete-profile)')
                } catch(error) {
                    console.log(error);
                    setError(true)
                    setTimeout(() => {
                        setError(false)
                        setConfirmPin('')
                        isProcessing.current = false
                    }, 600)
                }
            }
            create()
        } else {
            setError(true)
            setTimeout(() => {
                setError(false)
                setConfirmPin('')
                isProcessing.current = false
            }, 600)
        }
    }, [confirmPin])

    const dotColor = (i: number) => {
        if (error) return colors.dotError
        return i < confirmPin.length ? colors.dotFilled : colors.dotEmpty
    }

    return (
        <ThemedView style={[styles.main, { paddingTop: insets.top * 2 }]}>
            <ThemedText style={styles.title}>Confirm your PIN</ThemedText>
            <ThemedText style={styles.description}>
                Enter your PIN again to confirm.
            </ThemedText>

            <View style={styles.dots}>
                {Array(PIN_LENGTH).fill(0).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            { backgroundColor: dotColor(i) },
                            i < confirmPin.length && !error && styles.dotFilled,
                        ]}
                    />
                ))}
            </View>

            <TextInput
                ref={inputRef}
                value={confirmPin}
                onChangeText={(text) => {
                    if (!error && !isProcessing.current) setConfirmPin(text)
                }}
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                secureTextEntry
                style={styles.hiddenInput}
                caretHidden
            />
        </ThemedView>
    )
}

export default VerifyNewPinCode

const styles = StyleSheet.create({
    main: { flex: 1, gap: 10 },
    title: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
    description: { textAlign: 'center', color: 'gray', paddingHorizontal: 16 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    dotFilled: { transform: [{ scale: 1.1 }] },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
})