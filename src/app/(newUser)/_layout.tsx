import { ThemedText } from '@/components/themed-text';
import { usePinStore } from '@/store/use-pin-store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { router, withLayoutContext } from 'expo-router';
import { Pressable } from 'react-native';

const { Navigator } = createNativeStackNavigator();
const NativeStack = withLayoutContext(Navigator);

export default function AuthLayout() {
    const { isPinComplete } = usePinStore();

    return (
        <NativeStack>
            <NativeStack.Screen
                name="index"
                options={{
                    headerTransparent: true,
                    headerTitle: '',
                    animation: 'none',
                    gestureEnabled: false,
                    headerBackVisible: false,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/(newUser)/verify-new-pin-code')}
                            disabled={!isPinComplete}
                            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                        >
                            <ThemedText style={{ fontSize: 15, fontWeight: '500', color: isPinComplete ? '#fff' : '#9ca3af' }}>
                                Next
                            </ThemedText>
                        </Pressable>
                    ),
                }}
            />
            <NativeStack.Screen
                name="verify-new-pin-code"
                options={{
                    headerTransparent: true,
                    headerTitle: '',
                    headerBackVisible: false,
                    gestureEnabled: false,
                }}
            />
        </NativeStack>
    );
}