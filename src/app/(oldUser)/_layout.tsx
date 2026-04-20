import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { useCrypto } from "@/hooks/use-crypto"
import { usePinOldUserStore } from "@/store/use-pin-old-user-store"
import { triggerRefreshKeys } from "@/types/keys.module"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { router, withLayoutContext } from "expo-router"
import { ActivityIndicator, Pressable } from "react-native"

const { Navigator } = createNativeStackNavigator()
const NativeStack = withLayoutContext(Navigator)

export default function OldUserLayout() {
    const { unlock } = useCrypto()

    const {
        pin,
        canGoNext,
        setError,
        setProcessing,
        isProcessing,
        setPin,
    } = usePinOldUserStore()

    const verify = async () => {
        if (!canGoNext) return

        setProcessing(true)

        try {
            const ok = await unlock(pin)

            if (!ok) {
                setError(true)
                setPin('')
                setProcessing(false)
                setTimeout(() => setError(false), 600)
                return
            }

            setProcessing(false)

            triggerRefreshKeys()

            router.replace('/(tabs)')
        } catch {
            setError(true)
            setProcessing(false)
            setPin('')
            setTimeout(() => setError(false), 600)
        }
    }

    if (isProcessing) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator size={'small'} />
                    <ThemedText style={{ fontSize: 14 }}>Verifying your pin, please wait</ThemedText>
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
                            onPress={verify}
                            disabled={!canGoNext}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                opacity: canGoNext ? 1 : 0.4,
                            }}
                        >
                            <ThemedText
                                style={{
                                    fontSize: 15,
                                    fontWeight: '500',
                                    color: '#fff',
                                }}
                            >
                                Next
                            </ThemedText>
                        </Pressable>
                    ),
                }}
            />
        </NativeStack>
    )
}