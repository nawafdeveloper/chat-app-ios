import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLogout } from '@/hooks/use-logout';
import { useChatSelectionStore } from '@/store/chat-selection-store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';

const { Navigator } = createNativeStackNavigator();
const NativeStack = withLayoutContext(Navigator);

const ChatsLayout = () => {
    const colorScheme = useColorScheme();
    const { loading } = useLogout();
    const { isSelectionMode, enterSelectionMode, exitSelectionMode } = useChatSelectionStore();

    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator size={'small'} />
                    <ThemedText style={{ fontSize: 14 }}>Signing you out, please wait</ThemedText>
                </ThemedView>
            </ThemedView>
        );
    }

    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            exitSelectionMode()
        } else {
            enterSelectionMode();
        }
    }

    return (
        <NativeStack>
            <NativeStack.Screen
                name='index'
                options={{
                    headerTitle: 'Chats',
                    headerLargeTitleEnabled: true,
                    headerSearchBarOptions: {
                        placeholder: 'Search for chats...',
                        allowToolbarIntegration: false,
                    },
                    headerLargeTitleShadowVisible: false,
                    headerLargeStyle: { backgroundColor: 'transparent' },
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                    unstable_headerRightItems: () => [
                        {
                            type: 'button',
                            label: isSelectionMode ? 'Done' : 'Edit',
                            onPress: () => toggleSelectionMode(),
                            labelStyle: { fontWeight: '600' }
                        }
                    ],
                    unstable_headerLeftItems: () => [
                        {
                            type: 'button',
                            icon: { type: 'sfSymbol', name: 'square.and.pencil' },
                            onPress: () => console.log('New Chat'),
                        },
                    ],
                }}
            />
        </NativeStack>
    );
};

export default ChatsLayout;