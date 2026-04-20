import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCompleteProfileStore } from '@/store/use-complete-profile-store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { withLayoutContext } from 'expo-router';
import { ActivityIndicator, Pressable } from 'react-native';

const { Navigator } = createNativeStackNavigator();
const NativeStack = withLayoutContext(Navigator);

export default function CompleteProfileLayout() {
    const {
        canGoNext,
        onNextPress,
        loading
    } = useCompleteProfileStore()

    if (loading) {
            return (
                <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <ActivityIndicator size={'small'} />
                        <ThemedText style={{ fontSize: 14 }}>Setting up your profile, please wait</ThemedText>
                    </ThemedView>
                </ThemedView>
            )
        }

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
                            onPress={onNextPress}
                            disabled={!canGoNext}
                            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                        >
                            <ThemedText style={{ fontSize: 15, fontWeight: '500', color: canGoNext ? '#fff' : '#9ca3af' }}>
                                Next
                            </ThemedText>
                        </Pressable>
                    ),
                }}
            />
        </NativeStack>
    );
}