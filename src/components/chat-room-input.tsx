import { useReplyStore } from '@/store/use-reply-store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassView } from 'expo-glass-effect';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    ZoomIn,
    ZoomInRight,
    ZoomOut,
    ZoomOutRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const MARGIN = 40;
const SEND_BUTTON_WIDTH = 46;

const ChatRoomInput = () => {
    const scheme = useColorScheme();
    const { bottom } = useSafeAreaInsets();
    const { isReplying, replyToUser, replyMessage, clearReply } = useReplyStore();
    const inputRef = useRef<TextInput>(null);

    const [message, setMessage] = useState('');

    const inputOffset = useSharedValue(0);
    const replyProgress = useSharedValue(0);
    const replyHeight = useSharedValue(0);

    const stickyViewOffset = useMemo(
        () => ({ opened: bottom - MARGIN, closed: -bottom }),
        [bottom],
    );

    useEffect(() => {
        replyProgress.value = withTiming(isReplying ? 1 : 0, { duration: 250 });
        if (isReplying) {
            inputRef.current?.focus();
        }
    }, [isReplying]);

    const handleChangeText = (text: string) => {
        const wasEmpty = message.length === 0;
        const isEmpty = text.length === 0;
        if (wasEmpty && !isEmpty) {
            inputOffset.value = withTiming(SEND_BUTTON_WIDTH, { duration: 150 });
        } else if (!wasEmpty && isEmpty) {
            inputOffset.value = withTiming(0, { duration: 150 });
        }
        setMessage(text);
    };

    const onReplyLayout = (e: LayoutChangeEvent) => {
        replyHeight.value = e.nativeEvent.layout.height;
    };

    const animatedInputStyle = useAnimatedStyle(() => ({
        marginRight: inputOffset.value,
    }));

    const animatedReplyStyle = useAnimatedStyle(() => {
        const h = replyHeight.value || 1;
        return {
            height: h * replyProgress.value,
            opacity: replyProgress.value,
            overflow: 'hidden',
        };
    });

    return (
        <KeyboardStickyView offset={stickyViewOffset} style={styles.composer}>
            <ThemedView style={styles.inputContainer}>
                <GlassView style={styles.plusButtonContainer} isInteractive={true}>
                    <Ionicons
                        name="add"
                        size={28}
                        color={scheme === 'dark' ? '#ffffff' : '#000000'}
                    />
                </GlassView>

                <Animated.View style={[styles.textInputAnimatedWrapper, animatedInputStyle]}>
                    <GlassView style={styles.textInputGlassContainer} isInteractive>

                        <Animated.View style={animatedReplyStyle}>
                            <ThemedView
                                onLayout={onReplyLayout}
                                style={[
                                    styles.replyContainer,
                                    {
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: scheme === 'dark'
                                            ? 'rgb(55, 55, 55, 0.6)'
                                            : 'rgb(220, 220, 220, 0.6)'
                                    }
                                ]}
                            >
                                <ThemedView style={styles.innerReplyContainer}>
                                    <ThemedView style={styles.innerReplyTopContainer}>
                                        <ThemedText numberOfLines={1} ellipsizeMode='tail' style={styles.usernameText}>
                                            {replyToUser}
                                        </ThemedText>
                                        <Pressable onPress={clearReply} style={[
                                            styles.closeReplyButton,
                                            { backgroundColor: scheme === 'dark' ? 'rgb(55, 55, 55)' : 'rgb(220, 220, 220)' }
                                        ]}>
                                            <Ionicons
                                                name="close"
                                                size={16}
                                                color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                            />
                                        </Pressable>
                                    </ThemedView>
                                    <ThemedText numberOfLines={3} ellipsizeMode='tail' style={styles.replyMessageContentText}>
                                        {replyMessage}
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                        </Animated.View>

                        <ThemedView style={styles.textInputContainer}>
                            <TextInput
                                ref={inputRef}
                                placeholder="Message"
                                value={message}
                                onChangeText={handleChangeText}
                                multiline
                                style={[styles.input, { color: scheme === 'dark' ? '#ffffff' : '#000000' }]}
                            />

                            {message.length === 0 && (
                                <Animated.View entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(150)}>
                                    <Pressable>
                                        <Ionicons
                                            name="mic-outline"
                                            size={28}
                                            color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                        />
                                    </Pressable>
                                </Animated.View>
                            )}
                        </ThemedView>

                    </GlassView>
                </Animated.View>

                {message.length > 0 && (
                    <Animated.View style={styles.sendButtonWrapper} entering={ZoomInRight.duration(150)} exiting={ZoomOutRight.duration(150)}>
                        <GlassView style={styles.plusButtonContainer} isInteractive={true} tintColor='#25d365ac' glassEffectStyle={'regular'}>
                            <Ionicons
                                name="arrow-up"
                                size={28}
                                color={scheme === 'dark' ? '#ffffff' : '#000000'}
                            />
                        </GlassView>
                    </Animated.View>
                )}
            </ThemedView>
        </KeyboardStickyView>
    );
};

export default ChatRoomInput;

const styles = StyleSheet.create({
    composer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        width: "100%",
        minHeight: 'auto',
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        backgroundColor: 'transparent',
    },
    plusButtonContainer: {
        padding: 6,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInputAnimatedWrapper: {
        flex: 1,
    },
    sendButtonWrapper: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    textInputGlassContainer: {
        flexDirection: 'column',
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 20,
        borderCurve: 'continuous',
        flex: 1,
    },
    replyContainer: {
        padding: 8,
        borderRadius: 14,
        borderCurve: 'continuous',
        paddingBottom: 10
    },
    innerReplyContainer: {
        borderLeftWidth: 3,
        borderLeftColor: '#808080',
        backgroundColor: 'transparent',
        paddingLeft: 8,
        flexDirection: 'column',
        gap: 4
    },
    innerReplyTopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    closeReplyButton: {
        padding: 3,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center'
    },
    usernameText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 14
    },
    replyMessageContentText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        backgroundColor: 'transparent',
        position: 'relative',
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    input: {
        flex: 1,
        marginBottom: 6,
        maxHeight: 120,
        fontSize: 16
    },
});