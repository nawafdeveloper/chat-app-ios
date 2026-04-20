import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

const ArchiveLayout = () => {
    const colorScheme = useColorScheme();
    
    return (
        <Stack>
            <Stack.Screen
                name='index'
                options={{
                    headerTitle: 'Archive',
                    headerLargeTitleEnabled: true,
                    headerSearchBarOptions: {
                        placeholder: 'Search for chats...',
                        allowToolbarIntegration: false
                    },
                    headerLargeTitleShadowVisible: false,
                    headerLargeStyle: { backgroundColor: 'transparent' },
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
                }}
            />
        </Stack>
    )
}

export default ArchiveLayout