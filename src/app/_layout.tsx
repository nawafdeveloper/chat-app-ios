import { install } from 'react-native-quick-crypto';
install();

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authClient } from '@/lib/auth-client';
import { retrieveSessionKeys } from '@/lib/crypto-storage';
import { setRefreshKeysHandler } from '@/types/keys.module';
import { Button, Host, Menu, Section } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();
  const colorScheme = useColorScheme();

  const [hasKeys, setHasKeys] = useState<boolean | null>(null)
  const [booting, setBooting] = useState(true)

  const refreshKeys = async () => {
    setBooting(true)

    try {
      const keys = await retrieveSessionKeys()
      setHasKeys(!!keys)
    } finally {
      setBooting(false)
    }
  }

  useEffect(() => {
    setRefreshKeysHandler(refreshKeys)
  }, [])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setBooting(true)

      try {
        if (session?.session.token) {
          const keys = await retrieveSessionKeys()
          if (!mounted) return

          setHasKeys(!!keys)
        } else {
          setHasKeys(false)
        }
      } finally {
        if (mounted) setBooting(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [session?.session.token])

  if (isPending || booting) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    )
  }

  const hasSession = !!session?.session.token;
  const isNewUser = session?.user.isNewUser === true;
  const hasName = !!session?.user.name?.trim();
  const hasPin = hasKeys === true;
  const hasNoPin = hasKeys === false;

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!hasSession}>
              <Stack.Screen name="(auth)" options={{ animation: 'none', gestureEnabled: false }} />
            </Stack.Protected>

            <Stack.Protected guard={hasSession && isNewUser}>
              <Stack.Screen name="(newUser)" options={{ animation: 'none', gestureEnabled: false }} />
            </Stack.Protected>

            <Stack.Protected guard={hasSession && !isNewUser && hasNoPin}>
              <Stack.Screen name="(oldUser)" options={{ animation: 'none', gestureEnabled: false }} />
            </Stack.Protected>

            <Stack.Protected guard={hasSession && !isNewUser && hasPin && !hasName}>
              <Stack.Screen name="(complete-profile)" options={{ animation: 'none', gestureEnabled: false }} />
            </Stack.Protected>

            <Stack.Protected guard={hasSession && !isNewUser && hasPin && hasName}>
              <Stack.Screen name="(tabs)" options={{ animation: 'none', gestureEnabled: false }} />
              <Stack.Screen
                name="chatId"
                options={{
                  headerShown: true,
                  headerTransparent: true,
                  headerBackButtonDisplayMode: 'minimal',
                  headerRight: () => (
                    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 9, marginLeft: 6 }}>
                      <Host matchContents>
                        <Menu
                          label=""
                          systemImage="ellipsis"
                          modifiers={[buttonStyle('automatic')]}
                        >
                          <Section title="More options">
                            <Button label="Pin" systemImage="pin" onPress={() => console.log('Pin')} />
                            <Button label="Star" systemImage="star" onPress={() => console.log('Star')} />
                            <Button label="Mute" systemImage="bell.slash" onPress={() => console.log('Mute')} />
                          </Section>
                        </Menu>
                      </Host>
                    </View>
                  ),
                  headerTitle: () => (
                    <View style={{ width: '100%' }}>
                      <GlassView
                        glassEffectStyle="regular"
                        isInteractive={true}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingLeft: 12,
                          paddingRight: 22,
                          paddingVertical: 8,
                          borderRadius: 99,
                          overflow: 'hidden',
                          marginRight: 'auto'
                        }}
                      >
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 99,
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Ionicons name="person" size={18} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
                        </View>
                        <View style={{ alignItems: 'flex-start' }}>
                          <ThemedText style={{ fontSize: 16, fontWeight: '600', lineHeight: 16 }}>
                            Ahmed Ali
                          </ThemedText>
                          <ThemedText style={{ fontSize: 12, lineHeight: 12, color: '#8E8E93' }}>
                            online
                          </ThemedText>
                        </View>
                      </GlassView>
                    </View>
                  ),
                }}
              />
              <Stack.Screen
                name="attachment"
                options={{
                  presentation: 'formSheet',
                  sheetGrabberVisible: true,
                  sheetAllowedDetents: 'fitToContents',
                  sheetResizeAnimationEnabled: false,
                }}
              />
              <Stack.Screen
                name="image-preview"
                options={{
                  animation: 'fade',
                  gestureDirection: 'vertical',
                  fullScreenGestureEnabled: true,
                  animationMatchesGesture: true,
                  headerShown: true,
                  headerTransparent: true,
                  headerBackButtonDisplayMode: 'minimal',
                  headerTitle: () => (
                    <GlassView
                      glassEffectStyle="regular"
                      isInteractive={true}
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 22,
                        paddingVertical: 8,
                        borderRadius: 99,
                        overflow: 'hidden',
                      }}
                    >
                      <ThemedText style={{ fontSize: 16, fontWeight: '600', lineHeight: 16 }}>
                        Ahmed Ali
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, lineHeight: 12, color: '#8E8E93' }}>
                        22/04/2026, 3:08 AM
                      </ThemedText>
                    </GlassView>
                  ),
                  headerRight: () => (
                    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 9, marginLeft: 6 }}>
                      <Host matchContents>
                        <Menu
                          label=""
                          systemImage="ellipsis"
                          modifiers={[buttonStyle('automatic')]}
                        >
                          <Section title="More options">
                            <Button label="Save" systemImage="square.and.arrow.down" onPress={() => console.log('Save')} />
                            <Button label="Go to message" systemImage="message" onPress={() => console.log('Go to message')} />
                            <Button label="Delete" systemImage="trash" onPress={() => console.log('Delete')} />
                          </Section>
                        </Menu>
                      </Host>
                    </View>
                  )
                }}
              />
            </Stack.Protected>
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}