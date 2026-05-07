import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCountrySearchStore } from '@/store/use-country-search-store';
import { useLoginStore } from '@/store/use-login-store';
import { usePinStore } from '@/store/use-pin-store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { router, withLayoutContext } from 'expo-router';
import { Pressable } from 'react-native';

const { Navigator } = createNativeStackNavigator();
const NativeStack = withLayoutContext(Navigator);

export default function AuthLayout() {
    const colorScheme = useColorScheme();
    const { isNextEnabled, handleNext } = useLoginStore();
    const { isPinComplete } = usePinStore();

    return (
        <NativeStack>
            <NativeStack.Screen
                name="index"
                options={{
                    headerTransparent: true,
                    headerTitle: '',
                    headerBackVisible: false,
                    gestureEnabled: false,
                    unstable_headerRightItems: () => [
                        {
                            type: 'button',
                            label: 'Next',
                            onPress: async () => await handleNext(),
                            tintColor: isNextEnabled && '#25D366',
                            variant: isNextEnabled ? 'prominent' : 'plain',
                            labelStyle: {
                                color: isNextEnabled ? '#fff' : 'gray',
                                fontWeight: '600'
                            }
                        }
                    ]
                }}
            />
            <NativeStack.Screen
                name="country-selector"
                options={{
                    headerTitle: 'Select country',
                    headerTransparent: true,
                    headerBackVisible: true,
                    headerSearchBarOptions: {
                        placeholder: 'Search country',
                        onChangeText: (e: any) => useCountrySearchStore.getState().setQuery(e.nativeEvent.text),
                    },
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7' },
                    presentation: 'formSheet',
                    unstable_headerLeftItems: () => [
                        {
                            type: 'button',
                            icon: {
                                type: 'sfSymbol',
                                name: 'xmark',
                            },
                            onPress: () => router.back()
                        }
                    ],
                }}
            />
            <NativeStack.Screen
                name="otp-verification"
                options={{
                    headerTransparent: true,
                    headerTitle: '',
                    animation: 'none',
                    gestureEnabled: false,
                    headerBackVisible: false,
                    unstable_headerLeftItems: () => [
                        { type: 'button', label: 'Back', onPress: () => router.back() },
                    ],
                }}
            />
            <NativeStack.Screen
                name="new-pin-code"
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