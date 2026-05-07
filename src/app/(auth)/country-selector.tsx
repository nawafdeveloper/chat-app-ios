import { countryCodes } from '@/constants/country-codes'
import { useCountrySearchStore } from '@/store/use-country-search-store'
import { useLoginStore } from '@/store/use-login-store'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo } from 'react'
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native'

type CountryItem = typeof countryCodes[number]

// ─── Single row — memoized so it never re-renders unless item changes ─────────
const CountryRow = React.memo(function CountryRow({
    item,
    onPress,
    colorScheme,
    isLast,
}: {
    item: CountryItem
    onPress: (item: CountryItem) => void
    colorScheme: 'light' | 'dark' | null
    isLast: boolean
}) {
    const isDark = colorScheme === 'dark'
    const handlePress = useCallback(() => onPress(item), [item, onPress])

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.row,
                { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' },
                pressed && { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
            ]}
        >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>
                {item.label}
            </Text>
            <View style={styles.right}>
                <Text style={[styles.code, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                    {item.code}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#8E8E93" />
            </View>
            {!isLast && (
                <View style={[
                    styles.separator,
                    { backgroundColor: isDark ? '#404043' : '#C6C6C8' }
                ]} />
            )}
        </Pressable>
    )
})

const CountrySelector = () => {
    const { setSelectedCountry } = useLoginStore()
    const colorScheme = useColorScheme()
    const query = useCountrySearchStore((s) => s.query)

    // Memoized filter — only recomputes when query changes
    const filtered = useMemo(() =>
        countryCodes.filter((c) =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.code.includes(query)
        ),
        [query]
    )

    useEffect(() => {
        return () => useCountrySearchStore.getState().setQuery('')
    }, [])

    const handleSelect = useCallback((item: CountryItem) => {
        setSelectedCountry(item)
        router.back()
    }, [setSelectedCountry])

    const keyExtractor = useCallback((item: CountryItem) => item.key, [])

    const renderItem = useCallback(({ item, index }: { item: CountryItem; index: number }) => (
        <CountryRow
            item={item}
            onPress={handleSelect}
            colorScheme={colorScheme}
            isLast={index === filtered.length - 1}
        />
    ), [handleSelect, colorScheme, filtered.length])

    return (
        <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            windowSize={10}
            maxToRenderPerBatch={20}
            initialNumToRender={20}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', borderCurve: 'continuous', marginTop: 24, backgroundColor: 'transparent' }}
        />
    )
}

export default CountrySelector

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        position: 'relative',
    },
    flag: {
        fontSize: 22,
    },
    label: {
        fontSize: 16,
        flex: 1,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    code: {
        fontSize: 14,
    },
    separator: {
        position: 'absolute',
        bottom: 0,
        left: 52,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
})