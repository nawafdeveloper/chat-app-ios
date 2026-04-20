import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLogout } from '@/hooks/use-logout';
import { Button, Host, Menu, Section } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, useColorScheme, View } from 'react-native';

const ChatsLayout = () => {
    const colorScheme = useColorScheme();
    const {
        loading,
        error,
        errorMsg,
        handleLogout
    } = useLogout();

    if (loading) {
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size={'small'} />
                <ThemedText style={{ fontSize: 14 }}>Signing you out, please wait</ThemedText>
            </ThemedView>
        </ThemedView>
    }

    return (
        <Stack>
            <Stack.Screen
                name='index'
                options={{
                    headerTitle: 'Chats',
                    headerLargeTitleEnabled: true,
                    headerSearchBarOptions: {
                        placeholder: 'Search for chats...',
                        allowToolbarIntegration: false
                    },
                    headerLargeTitleShadowVisible: false,
                    headerLargeStyle: { backgroundColor: 'transparent' },
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                    headerRight: () => (
                        <Pressable style={{ paddingHorizontal: 10 }}>
                            <ThemedText style={{
                                color: colorScheme === 'dark' ? '#fff' : '#000',
                                fontSize: 16
                            }}>
                                Edit
                            </ThemedText>
                        </Pressable>
                    ),
                    headerLeft: () => (
                        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 9, marginLeft: 6 }}>
                            <Host matchContents>
                                <Menu
                                    label=""
                                    systemImage="ellipsis"
                                    modifiers={[buttonStyle('plain')]}
                                >
                                    <Section title="More options">
                                        <Button
                                            label="New Chat"
                                            systemImage="square.and.pencil"
                                            onPress={() => console.log('New Chat')}
                                        />
                                        <Button
                                            label="New Group"
                                            systemImage="person.2"
                                            onPress={() => console.log('New Group')}
                                        />
                                    </Section>
                                    <Section title="Account">
                                        <Button
                                            label="Logout"
                                            systemImage="rectangle.portrait.and.arrow.right"
                                            role="destructive"
                                            onPress={handleLogout}
                                        />
                                    </Section>
                                </Menu>
                            </Host>
                        </View>
                    )
                }}
            />
        </Stack>
    )
}

export default ChatsLayout