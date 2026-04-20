import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePinOldUserStore } from '@/store/use-pin-old-user-store'
import React, { useEffect, useRef } from 'react'
import {
    StyleSheet,
    TextInput,
    useColorScheme,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PIN_LENGTH = 6

const COLORS = {
    dark: { filled: '#FFFFFF', empty: '#3A3A3C', error: '#FF453A' },
    light: { filled: '#000000', empty: '#E5E5EA', error: '#FF3B30' },
}

const PinOldUser = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()
    const colors = scheme === 'dark' ? COLORS.dark : COLORS.light

    const inputRef = useRef<TextInput>(null)

    const { pin, error, setPin, reset } = usePinOldUserStore()

    useEffect(() => {
        inputRef.current?.focus()
        reset()
    }, [])

    const dotColor = (i: number) => {
        if (error) return colors.error
        return i < pin.length ? colors.filled : colors.empty
    }

    return (
        <ThemedView style={[styles.main, { paddingTop: insets.top * 2 }]}>
            <ThemedText style={styles.title}>Enter your PIN</ThemedText>
            <ThemedText style={styles.description}>
                Type your 6-digit PIN to continue.
            </ThemedText>

            <View style={styles.dots}>
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            { backgroundColor: dotColor(i) },
                        ]}
                    />
                ))}
            </View>

            <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={setPin}   // ✅ FIXED
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                secureTextEntry
                style={styles.hiddenInput}
                caretHidden
            />
        </ThemedView>
    )
}

export default PinOldUser

const styles = StyleSheet.create({
    main: { flex: 1, gap: 10 },
    title: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
    description: { textAlign: 'center', color: 'gray', paddingHorizontal: 16 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    dotFilled: { transform: [{ scale: 1.1 }] },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
})