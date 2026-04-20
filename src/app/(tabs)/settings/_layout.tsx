import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, useColorScheme } from 'react-native';

const SettingsLayout = () => {
    const colorScheme = useColorScheme();

    return (
        <Stack>
            <Stack.Screen
                name='index'
                options={{
                    headerTitle: 'Settings',
                    headerLargeTitleEnabled: true,
                    headerLargeTitleShadowVisible: false,
                    headerLargeStyle: { backgroundColor: 'transparent' },
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='profile-edit'
                options={{
                    headerTitle: 'Edit Profile',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />

            <Stack.Screen
                name='starred'
                options={{
                    headerTitle: 'Starred Chats',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='linked-devices'
                options={{
                    headerTitle: 'Linked Devices',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='account'
                options={{
                    headerTitle: 'Account',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='privacy'
                options={{
                    headerTitle: 'Privacy Settings',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='chats'
                options={{
                    headerTitle: 'Chats Settings',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='notifications'
                options={{
                    headerTitle: 'Notifications',
                    headerTransparent: true,
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
            <Stack.Screen
                name='profile-edit-modal'
                options={{
                    headerTitle: 'Edit Information',
                    headerTransparent: true,
                    headerBackVisible: true,
                    presentation: 'formSheet',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()}>
                            <Ionicons name="close-outline" size={32} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name='privacy-modal'
                options={{
                    headerTitle: 'Edit Privacy',
                    headerTransparent: true,
                    headerBackVisible: true,
                    presentation: 'formSheet',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()}>
                            <Ionicons name="close-outline" size={32} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
                        </Pressable>
                    ),
                }}
            />
        </Stack>
    )
}

export default SettingsLayout