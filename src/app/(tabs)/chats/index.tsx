import SwipeableRow from '@/components/swipeable-row';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Button, ContextMenu, Divider, Host, Section } from '@expo/ui/swift-ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

const NAMES = [
    'Ahmed Ali', 'Sara Khan', 'Mohammed Omar', 'Fatima Zahra', 'Youssef Nabil',
    'Layla Hassan', 'Omar Khattab', 'Noor Al-Din', 'Huda Salem', 'Khalid Ibrahim',
    'Amira Youssef', 'Tariq Ziad', 'Dina Adel', 'Bilal Mansour', 'Salma Rami',
    'Zainab Faris', 'Imad Haddad', 'Rania Bassam', 'Faisal Saeed', 'Mona Tarek',
    'Hani Nasser', 'Lina Karim', 'Wael Jaber', 'Heba Mostafa', 'Samir Ghassan',
    'Nadia Kamal', 'Rami Atiya', 'Dalia Fawzi', 'Majid Raafat', 'Yara Wissam',
    'Tamer Hosny', 'Celine Makram', 'Nabil El-Din', 'Rita Antoun', 'Hossam Badr',
    'Maya Sharif', 'George Boulos', 'Amina Diaa', 'Karim El-Sayed', 'Salaheddine',
    'Inas Lotfy', 'Pierre Gemayel', 'Hala Nawfal', 'Mazen Othman', 'Rasha Wael',
    'Tarek Allam', 'Nourhan Ehab', 'Adham Sabri', 'Yasmine Galal', 'Hisham Ragheb',
];

const MESSAGES = [
    'Hey, how are you? 😊',
    'Let me know when you are free',
    'The meeting is at 3 PM tomorrow',
    'Check this out! 📸',
    'Thanks for your help!',
    'See you later 👋',
    'Did you finish the project?',
    'Happy birthday! 🎂🎉',
    'On my way, be there in 10 min',
    'Good morning ☀️',
    'Can you send me the file?',
    'That sounds great!',
    'I will call you back',
    'Don\'t forget the appointment',
    'What time works for you?',
    'Just got home 🏠',
    'Let\'s grab lunch tomorrow',
    'Perfect, thanks! 👍',
    'I\'ll send it right away',
    'Miss you! ❤️',
];

const TIMES = [
    '9:41 AM', '10:02 AM', '10:30 AM', '11:15 AM', '12:00 PM',
    '12:45 PM', '1:30 PM', '2:15 PM', '3:00 PM', '3:22 PM',
    '4:05 PM', '4:30 PM', '5:00 PM', '5:45 PM', '6:10 PM',
    'Yesterday', 'Yesterday', 'Yesterday', 'Yesterday', 'Yesterday',
    'Monday', 'Monday', 'Monday', 'Sunday', 'Sunday',
    'Saturday', 'Saturday', 'Friday', 'Friday', 'Thursday',
    '4/15', '4/14', '4/13', '4/12', '4/11',
    '9:41 AM', '10:02 AM', '10:30 AM', '11:15 AM', '12:00 PM',
    'Yesterday', 'Yesterday', 'Monday', 'Monday', 'Sunday',
    'Saturday', 'Friday', '4/10', '4/9', '4/8',
];

const PERSON_COLORS = [
    '#34B7F1', '#5B61B9', '#D4477E', '#E67E22', '#1ABC9C',
    '#8E44AD', '#2ECC71', '#E74C3C', '#3498DB', '#F39C12',
    '#9B59B6', '#1ABC9C', '#E91E63', '#00BCD4', '#FF5722',
    '#607D8B', '#795548', '#4CAF50', '#FF9800', '#673AB7',
];

const AVATAR_COLORS = [
    '#34B7F133', '#5B61B933', '#D4477E33', '#E67E2233', '#1ABC9C33',
    '#8E44AD33', '#2ECC7133', '#E74C3C33', '#3498DB33', '#F39C1233',
    '#9B59B633', '#1ABC9C33', '#E91E6333', '#00BCD433', '#FF572233',
    '#607D8B33', '#79554833', '#4CAF5033', '#FF980033', '#673AB733',
];

const generateChats = () => {
    return Array.from({ length: 50 }, (_, i) => ({
        id: i.toString(),
        name: NAMES[i % NAMES.length],
        message: MESSAGES[i % MESSAGES.length],
        time: TIMES[i % TIMES.length],
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        unreadCount: [0, 0, 0, 0, 2, 0, 1, 0, 0, 5, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0][i % 20],
        online: i % 7 === 0,
        read: i % 3 !== 0,
    }));
};

const CHATS = generateChats();

type ChatItem = ReturnType<typeof generateChats>[number];

export default function ChatScreen() {
    const theme = useTheme();

    const pressColor = theme.backgroundSelected;

    const getSwipeActions = (item: ChatItem) => [
        {
            icon: 'pin' as const,
            label: 'Pin',
            color: '#3B82F6',
            onPress: () => console.log('Pin', item.id),
        },
        {
            icon: 'bell.slash' as const,
            label: 'Mute',
            color: '#F59E0B',
            onPress: () => console.log('Mute', item.id),
        },
        {
            icon: 'trash' as const,
            label: 'Delete',
            color: '#EF4444',
            onPress: () => console.log('Delete', item.id),
        },
    ];

    const getSwipeLeftActions = (item: ChatItem) => [
        {
            icon: 'archivebox' as const,
            label: 'Archive',
            color: '#10B981',
            onPress: () => console.log('Archive', item.id),
        },
    ];

    const renderItem = ({ item, index }: { item: ChatItem; index: number }) => (
        <SwipeableRow leftActions={getSwipeLeftActions(item)} actions={getSwipeActions(item)}>
            <Host>
                <ContextMenu>
                    <ContextMenu.Trigger>
                        <Pressable
                            style={({ pressed }) => [
                                styles.chatItem,
                                { backgroundColor: theme.background },
                                pressed && { backgroundColor: pressColor },
                            ]}
                            onPress={() => router.push('/chatId')}
                        >
                            {/* Avatar */}
                            <View style={styles.avatarContainer}>
                                <View style={[
                                    styles.avatar,
                                    {
                                        backgroundColor: item.avatarColor,
                                        borderColor: PERSON_COLORS[parseInt(item.id) % PERSON_COLORS.length] + '33',
                                    }
                                ]}>
                                    <Ionicons
                                        name="person"
                                        size={20}
                                        color={PERSON_COLORS[parseInt(item.id) % PERSON_COLORS.length]}
                                    />
                                </View>
                            </View>

                            {/* Content */}
                            <View style={styles.chatContent}>
                                <View style={styles.topRow}>
                                    <ThemedText
                                        style={[styles.chatName, { color: theme.text }]}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.chatTime,
                                            { color: item.unreadCount > 0 ? '#25D366' : theme.textSecondary },
                                        ]}
                                    >
                                        {item.time}
                                    </ThemedText>
                                </View>

                                <View style={styles.bottomRow}>
                                    <View style={styles.messageRow}>
                                        {item.read ? (
                                            <Ionicons
                                                name="checkmark-done"
                                                size={16}
                                                color="#25D366"
                                                style={styles.checkIcon}
                                            />
                                        ) : (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={theme.textSecondary}
                                                style={styles.checkIcon}
                                            />
                                        )}
                                        <ThemedText
                                            style={[styles.chatMessage, { color: theme.textSecondary }]}
                                            numberOfLines={1}
                                        >
                                            {item.message}
                                        </ThemedText>
                                    </View>

                                    {item.unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <ThemedText style={[styles.unreadText, { color: theme.background }]}>
                                                {item.unreadCount}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* iOS-style separator (inset from left) */}
                            {index < CHATS.length - 1 && (
                                <View
                                    style={[
                                        styles.separator,
                                        { backgroundColor: theme.backgroundSelected },
                                    ]}
                                />
                            )}
                        </Pressable>
                    </ContextMenu.Trigger>
                    <ContextMenu.Items>
                        <Section title="Message">
                            <Button label="Reply" systemImage="arrowshape.turn.up.left" onPress={() => console.log('Reply', item.id)} />
                            <Button label="Forward" systemImage="arrowshape.turn.up.right" onPress={() => console.log('Forward', item.id)} />
                            <Button label="Copy" systemImage="doc.on.doc" onPress={() => console.log('Copy', item.id)} />
                        </Section>
                        <Divider />
                        <Section title="Chat">
                            <Button label="Pin" systemImage="pin" onPress={() => console.log('Pin', item.id)} />
                            <Button label="Star" systemImage="star" onPress={() => console.log('Star', item.id)} />
                            <Button label="Mute" systemImage="bell.slash" onPress={() => console.log('Mute', item.id)} />
                        </Section>
                        <Divider />
                        <Button label="Delete" systemImage="trash" role="destructive" onPress={() => console.log('Delete', item.id)} />
                    </ContextMenu.Items>
                </ContextMenu>
            </Host>
        </SwipeableRow>
    );

    return (
        <FlatList
            data={CHATS}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        position: 'relative',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
        minHeight: 56,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
        letterSpacing: -0.2,
    },
    chatTime: {
        fontSize: 14,
        fontWeight: '400',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    checkIcon: {
        marginRight: 3,
        marginTop: 1,
    },
    chatMessage: {
        fontSize: 14,
        fontWeight: '400',
        flex: 1,
        letterSpacing: -0.1,
    },
    unreadBadge: {
        backgroundColor: '#25D366',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 13,
    },
    separator: {
        position: 'absolute',
        bottom: 0,
        left: 84,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
});