import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassView } from 'expo-glass-effect';
import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

type Item = {
    key: string;
    label: string;
    icon: string;
    onPress: () => void;
    color: string;
};

const AttachmentsPage = () => {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const colors = scheme ? Colors.dark : Colors.light

    const getItemColors = (colorName: string) => {
        const colorMap: Record<string, { main: string; light: string; dark: string }> = {
            green: { main: '#25D366', light: 'rgba(76, 175, 80, 0.2)', dark: 'rgba(27, 94, 32, 0.4)' },
            blue: { main: '#2196F3', light: 'rgba(25, 118, 210, 0.2)', dark: 'rgba(13, 71, 161, 0.4)' },
            purple: { main: '#9C27B0', light: 'rgba(123, 31, 162, 0.2)', dark: 'rgba(74, 20, 140, 0.4)' },
            red: { main: '#F44336', light: 'rgba(211, 47, 47, 0.2)', dark: 'rgba(183, 28, 28, 0.4)' },
            orange: { main: '#FF9800', light: 'rgba(245, 124, 0, 0.2)', dark: 'rgba(230, 81, 0, 0.4)' },
            teal: { main: '#009688', light: 'rgba(0, 121, 107, 0.2)', dark: 'rgba(0, 68, 64, 0.4)' },
        };

        return colorMap[colorName] || colorMap.green;
    };

    const itemList: Item[] = [
        { key: 'photo', label: 'Photos', icon: 'images', onPress: () => { }, color: 'blue' },
        { key: 'location', label: 'Location', icon: 'location', onPress: () => { }, color: 'green' },
        { key: 'contact', label: 'Contact', icon: 'person-circle', onPress: () => { }, color: 'purple' },
        { key: 'document', label: 'Document', icon: 'document', onPress: () => { }, color: 'red' },
        { key: 'poll', label: 'Poll', icon: 'podium', onPress: () => { }, color: 'orange' },
        { key: 'event', label: 'Event', icon: 'calendar', onPress: () => { }, color: 'teal' },
    ];

    return (
        <ThemedView style={styles.main}>
            {itemList.map((list) => {
                const colors_set = getItemColors(list.color);
                const bgColor = isDark ? colors_set.dark : colors_set.light;
                const iconColor = colors_set.main;

                return (
                    <Pressable style={styles.buttonContainer} key={list.key} onPress={list.onPress}>
                        <GlassView
                            style={[styles.iconContainer]}
                            tintColor={bgColor}
                            isInteractive
                            glassEffectStyle="regular"
                        >
                            <Ionicons
                                name={list.icon as any}
                                size={28}
                                color={iconColor}
                            />
                        </GlassView>
                        <ThemedText style={styles.buttonText}>{list.label}</ThemedText>
                    </Pressable>
                );
            })}
        </ThemedView>
    )
}

export default AttachmentsPage

const styles = StyleSheet.create({
    main: {
        height: 200,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 40,
        paddingTop: 20
    },
    buttonContainer: {
        width: '28%',
        aspectRatio: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    iconContainer: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 99,
        borderCurve: 'continuous',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 16
    }
})