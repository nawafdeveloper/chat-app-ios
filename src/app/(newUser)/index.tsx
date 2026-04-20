import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePinStore } from '@/store/use-pin-store'
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
    dark: { dotFilled: '#FFFFFF', dotEmpty: '#3A3A3C' },
    light: { dotFilled: '#000000', dotEmpty: '#E5E5EA' },
}

const NewPinCode = () => {
    const insets = useSafeAreaInsets()
    const scheme = useColorScheme()
    const isDark = scheme === 'dark'
    const colors = isDark ? COLORS.dark : COLORS.light

    const { pin, setPin } = usePinStore()
    const inputRef = useRef<TextInput>(null)

    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <ThemedView style={[styles.main, { paddingTop: insets.top * 2 }]}>
            <ThemedText style={styles.title}>Create your PIN</ThemedText>
            <ThemedText style={styles.description}>
                PINs can help you restore your account and keep your data encrypted with YaaHalaa.
            </ThemedText>

            <View style={styles.dots}>
                {Array(PIN_LENGTH).fill(0).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            { backgroundColor: i < pin.length ? colors.dotFilled : colors.dotEmpty },
                            i < pin.length && styles.dotFilled,
                        ]}
                    />
                ))}
            </View>

            <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                secureTextEntry
                style={styles.hiddenInput}
                caretHidden
            />
        </ThemedView>
    )
}

export default NewPinCode

const styles = StyleSheet.create({
    main: { flex: 1, gap: 10 },
    title: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
    description: { textAlign: 'center', color: 'gray', paddingHorizontal: 16 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    dotFilled: { transform: [{ scale: 1.1 }] },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
})