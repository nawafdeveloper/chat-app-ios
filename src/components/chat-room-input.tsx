import { useReplyStore } from '@/store/use-reply-store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { setAudioModeAsync } from 'expo-audio';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
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

// Gesture thresholds
const LOCK_THRESHOLD = -80;    // upward (negative Y) to lock
const CANCEL_THRESHOLD = -90;  // leftward (negative X) to cancel

const PLUS_BUTTON_WIDTH = 40; // padding 6*2 + icon 28
const LOCK_Y_RESISTANCE = 0.25; // lock bar moves 25% of vertical drag

type ChatRoomInputProps = {
    onHeightChange?: (height: number) => void;
};

const ChatRoomInput = ({ onHeightChange }: ChatRoomInputProps) => {
    const scheme = useColorScheme();
    const { bottom } = useSafeAreaInsets();
    const { isReplying, replyToUser, replyMessage, clearReply } = useReplyStore();
    const inputRef = useRef<TextInput>(null);
    const composerHeightRef = useRef(0);

    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLockedRecording, setIsLockedRecording] = useState(false);

    const prevIsRecording = useRef(isRecording);

    // ─── Shared values ────────────────────────────────────────────────────────
    const inputOffset = useSharedValue(0);             // marginRight — send button side
    const inputLeftOffset = useSharedValue(PLUS_BUTTON_WIDTH); // width of plus button wrapper
    const replyProgress = useSharedValue(0);
    const replyHeight = useSharedValue(0);
    const lockGap = useSharedValue(24);
    const plusScale = useSharedValue(1);
    const greenButtonScale = useSharedValue(0);

    // 0 = text-input mode, 1 = recording mode  (drives all slide animations)
    const recordingProgress = useSharedValue(0);

    // Lock bar: scale entrance + Y nudge from gesture
    const lockBarProgress = useSharedValue(0);
    const lockBarY = useSharedValue(0);

    // Green mic button position — follows the finger exactly
    const micX = useSharedValue(0);
    const micY = useSharedValue(0);

    // "Slide to cancel" opacity driven by leftward drag
    const cancelOpacity = useSharedValue(1);

    // Tracks whether lock threshold was hit — prevents onFinalize from cancelling
    const isLockedSV = useSharedValue(false);
    const hasHandledGestureSV = useSharedValue(false);

    // ─── Sticky view offset ───────────────────────────────────────────────────
    const stickyViewOffset = useMemo(
        () => ({ opened: bottom - MARGIN, closed: -bottom }),
        [bottom],
    );

    // ─── JS-thread helpers ────────────────────────────────────────────────────
    const startRecording = useCallback(() => {
        setIsRecording(true);
    }, []);

    const triggerLock = useCallback(() => {
        setIsLockedRecording(true);
        // isRecording stays true — only gesture influence is killed
    }, []);

    const cancelRecording = useCallback(() => {
        setIsRecording(false);
        setIsLockedRecording(false);
    }, []);

    useEffect(() => {
        void setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: false,
            shouldPlayInBackground: false,
            interruptionMode: 'doNotMix',
        }).catch(() => null);
    }, []);

    // ─── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        replyProgress.value = withTiming(isReplying ? 1 : 0, { duration: 250 });
        if (isReplying) inputRef.current?.focus();
    }, [isReplying]);

    useEffect(() => {
        if (prevIsRecording.current === isRecording) {
            return;
        }

        if (isRecording) {
            isLockedSV.value = false;
            hasHandledGestureSV.value = false;
            recordingProgress.value = withSpring(1, { duration: 220 });
            lockBarProgress.value = withSpring(1, { duration: 280 });
            // Plus button collapses → animate its wrapper to 0
            inputLeftOffset.value = withSpring(0, { duration: 300 });
            plusScale.value = withSpring(0, { duration: 300 });
            greenButtonScale.value = withSpring(1, { duration: 220 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (prevIsRecording.current === true && !isRecording) {
            recordingProgress.value = withSpring(0, { duration: 300 });
            lockBarProgress.value = withSpring(0, { duration: 180 });
            micX.value = withSpring(0);
            micY.value = withSpring(0);
            lockBarY.value = withSpring(0);
            lockGap.value = withSpring(24, { duration: 300 });
            cancelOpacity.value = withSpring(1, { duration: 300 });
            // Plus button returns → expand its wrapper back
            inputLeftOffset.value = withSpring(PLUS_BUTTON_WIDTH, { duration: 300 });
            // Also ensure right margin resets (locked send button gone)
            inputOffset.value = withSpring(0, { duration: 300 });
            plusScale.value = withSpring(1, { duration: 300 });
            greenButtonScale.value = withSpring(0, { duration: 300 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        prevIsRecording.current = isRecording;
    }, [isRecording]);

    useEffect(() => {
        if (isLockedRecording) {
            micX.value = withSpring(0, { damping: 20, stiffness: 300 });
            micY.value = withSpring(0, { damping: 20, stiffness: 300 });
            lockBarY.value = withSpring(0);
            lockGap.value = withSpring(24, { duration: 220 });
            cancelOpacity.value = withTiming(1);
            // Send button appears in locked mode → shrink right side
            inputOffset.value = withTiming(SEND_BUTTON_WIDTH, { duration: 150 });
            greenButtonScale.value = withSpring(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [isLockedRecording]);

    // ─── Single Pan with activateAfterLongPress ───────────────────────────────
    //
    //  activateAfterLongPress(300): Pan sits in BEGAN for 300ms without activating.
    //  Any movement during those 300ms → gesture FAILS (no accidental triggers).
    //  After 300ms with no movement → Pan transitions to ACTIVE → onStart fires.
    //  From that point onUpdate fires freely on every finger movement.
    //  onFinalize fires on any finger lift, whether a threshold was hit or not.
    //
    //  No separate LongPress gesture. No Simultaneous. No isPressing guard.
    //  This is the correct, documented approach for "drag after long press".
    //
    const composedGesture = useMemo(() => {
        const resetGestureValues = () => {
            'worklet';
            micX.value = withSpring(0, { damping: 20, stiffness: 300 });
            micY.value = withSpring(0, { damping: 20, stiffness: 300 });
            lockBarY.value = withSpring(0, { damping: 20, stiffness: 300 });
            lockGap.value = withSpring(24, { damping: 20, stiffness: 300 });
            cancelOpacity.value = withTiming(1, { duration: 200 });
        };

        return Gesture.Pan()
            .activateAfterLongPress(300)
            .onStart(() => {
                isLockedSV.value = false;
                hasHandledGestureSV.value = false;
                micX.value = 0;
                micY.value = 0;
                runOnJS(startRecording)();
            })
            .onUpdate((e) => {
                'worklet';

                if (hasHandledGestureSV.value) {
                    return;
                }

                // Clamp to only left / up directions
                const dx = Math.min(0, e.translationX);
                const dy = Math.min(0, e.translationY);

                // Green mic follows finger exactly
                micX.value = dx;
                micY.value = dy;

                // Lock bar nudges upward at 25% of vertical movement
                lockBarY.value = dy * (LOCK_Y_RESISTANCE * 1.2);
                lockGap.value = dy * -LOCK_Y_RESISTANCE;

                // Slide-to-cancel text fades as finger moves left
                const leftRatio = Math.abs(dx) / Math.abs(CANCEL_THRESHOLD);
                cancelOpacity.value = interpolate(leftRatio, [0, 0.5, 1], [1, 0.5, 0]);

                // Threshold checks run on UI thread — instant, no bridge round-trip
                if (dy <= LOCK_THRESHOLD) {
                    isLockedSV.value = true;
                    hasHandledGestureSV.value = true;
                    resetGestureValues();
                    runOnJS(triggerLock)();
                    return;
                }

                if (dx <= CANCEL_THRESHOLD) {
                    hasHandledGestureSV.value = true;
                    resetGestureValues();
                    runOnJS(cancelRecording)();
                }
            })
            .onFinalize(() => {
                'worklet';

                if (hasHandledGestureSV.value) {
                    return;
                }

                resetGestureValues();
                runOnJS(cancelRecording)();
            });
    }, [cancelRecording, hasHandledGestureSV, isLockedSV, lockBarY, lockGap, micX, micY, cancelOpacity, startRecording, triggerLock]);

    // ─── Text input handler ────────────────────────────────────────────────────
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

    const onComposerLayout = useCallback((e: LayoutChangeEvent) => {
        const nextHeight = Math.ceil(e.nativeEvent.layout.height);

        if (nextHeight === composerHeightRef.current) {
            return;
        }

        composerHeightRef.current = nextHeight;
        onHeightChange?.(nextHeight);
    }, [onHeightChange]);

    // ─── Animated styles ───────────────────────────────────────────────────────

    const animatedInputStyle = useAnimatedStyle(() => ({
        marginRight: inputOffset.value,
    }));

    const plusButtonWrapperStyle = useAnimatedStyle(() => ({
        width: inputLeftOffset.value, // 👈 keeps layout working
        transform: [{ scale: plusScale.value }], // 👈 visual zoom
        opacity: plusScale.value, // optional but makes it cleaner
        marginRight: 10 * plusScale.value
    }));

    const animatedReplyStyle = useAnimatedStyle(() => {
        const h = replyHeight.value || 1;
        return {
            height: h * replyProgress.value,
            opacity: replyProgress.value,
            overflow: 'hidden',
        };
    });

    // Text input: slides left + fades as recording starts
    const textInputSlideStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(recordingProgress.value, [0, 1], [0, -24]) }],
        opacity: interpolate(recordingProgress.value, [0, 0.45], [1, 0.05]),
    }));

    // Recording UI: slides in from right + fades in
    const recordingSlideStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(recordingProgress.value, [0, 1], [36, 0]) }],
        opacity: interpolate(recordingProgress.value, [0.35, 1], [0, 1]),
    }));

    const lockBarEntranceStyle = useAnimatedStyle(() => ({
        opacity: interpolate(lockBarProgress.value, [0, 0.6, 1], [0, 0.7, 1]),
        transformOrigin: 'bottom',
        gap: lockGap.value
    }));

    const lockBarMainContainerTransformation = useAnimatedStyle(() => ({
        transform: [
            { translateY: lockBarY.value },
            { scaleY: lockBarProgress.value },
        ],
    }));

    // Green mic: follows the finger
    const micButtonStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: micX.value },
            { translateY: micY.value },
            { scale: greenButtonScale.value }
        ],
    }));

    // Slide-to-cancel text opacity
    const slideToCancelStyle = useAnimatedStyle(() => ({
        opacity: cancelOpacity.value,
    }));

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <KeyboardStickyView offset={stickyViewOffset} style={styles.composer} onLayout={onComposerLayout}>
            <ThemedView style={styles.inputContainer}>

                {/* ── Lock bar (expands upward when recording) ─────────────── */}
                {isRecording && !isLockedRecording && (
                    <Animated.View style={[styles.lockMainContainer, lockBarMainContainerTransformation]}>
                        <GlassView style={styles.lockGlassView}>
                            <Animated.View style={[styles.lockRecordingBar, lockBarEntranceStyle]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={28}
                                    color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                />
                                <Ionicons
                                    name="chevron-up-outline"
                                    size={24}
                                    color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                    style={{ marginLeft: 2 }}
                                />
                            </Animated.View>
                        </GlassView>
                    </Animated.View>
                )}

                {/* ── Add attachment — always mounted, width animates to 0 during recording ── */}
                <Animated.View style={plusButtonWrapperStyle}>
                    <GlassView style={styles.plusButtonContainer} isInteractive>
                        <Pressable onPress={() => router.push('/attachment')}>
                            <Ionicons
                                name="add"
                                size={28}
                                color={scheme === 'dark' ? '#ffffff' : '#000000'}
                            />
                        </Pressable>
                    </GlassView>
                </Animated.View>

                {/* ── Main input pill ───────────────────────────────────────── */}
                <Animated.View style={[styles.textInputAnimatedWrapper, animatedInputStyle]}>
                    <GlassView style={styles.textInputGlassContainer} isInteractive={false}>

                        {/* Reply preview */}
                        <Animated.View style={animatedReplyStyle}>
                            <ThemedView
                                onLayout={onReplyLayout}
                                style={[
                                    styles.replyContainer,
                                    {
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        backgroundColor:
                                            scheme === 'dark'
                                                ? 'rgba(55,55,55,0.6)'
                                                : 'rgba(220,220,220,0.6)',
                                    },
                                ]}
                            >
                                <ThemedView style={styles.innerReplyContainer}>
                                    <ThemedView style={styles.innerReplyTopContainer}>
                                        <ThemedText
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={styles.usernameText}
                                        >
                                            {replyToUser}
                                        </ThemedText>
                                        <Pressable
                                            onPress={clearReply}
                                            style={[
                                                styles.closeReplyButton,
                                                {
                                                    backgroundColor:
                                                        scheme === 'dark'
                                                            ? 'rgb(55,55,55)'
                                                            : 'rgb(220,220,220)',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="close"
                                                size={16}
                                                color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                            />
                                        </Pressable>
                                    </ThemedView>
                                    <ThemedText
                                        numberOfLines={3}
                                        ellipsizeMode="tail"
                                        style={styles.replyMessageContentText}
                                    >
                                        {replyMessage}
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                        </Animated.View>

                        {/* ── Inner row: text input ↔ recording UI ────────── */}
                        <ThemedView style={styles.textInputContainer}>

                            {/* TEXT INPUT — fades/slides out when recording starts */}
                            <Animated.View
                                style={[styles.textInputRow, textInputSlideStyle]}
                            >
                                <TextInput
                                    ref={inputRef}
                                    placeholder="Message"
                                    value={message}
                                    onChangeText={handleChangeText}
                                    multiline
                                    style={[
                                        styles.input,
                                        { color: scheme === 'dark' ? '#ffffff' : '#000000' },
                                    ]}
                                    selectionColor={'#25D366'}
                                    enablesReturnKeyAutomatically={true}
                                />

                                {/*
                                  ── Plain mic: holds BOTH longPress + pan gestures ──
                                  The finger stays here the whole time. Pan tracks
                                  the same pointer from touchdown, so it works even
                                  though the green button is a separate visual element.
                                */}
                                {message.length === 0 && (
                                    <GestureDetector gesture={composedGesture}>
                                        <Animated.View
                                            entering={ZoomIn.duration(150)}
                                            exiting={ZoomOut.duration(150)}
                                        >
                                            <Ionicons
                                                name="mic-outline"
                                                size={28}
                                                color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                                style={{ marginBottom: 6 }}
                                            />
                                        </Animated.View>
                                    </GestureDetector>
                                )}
                            </Animated.View>

                            {/* RECORDING UI — slides in when recording starts */}
                            <Animated.View
                                style={[styles.recordingInnterContentContainer, recordingSlideStyle]}
                            >
                                {/* Left: pulsing mic + timer */}
                                <ThemedView style={styles.recordingInnerLeftContainer}>
                                    <Ionicons name="mic" size={28} color="red" />
                                    <ThemedText style={{ fontSize: 19, fontWeight: '600' }}>
                                        0:33
                                    </ThemedText>
                                </ThemedView>

                                {/* Center: slide-to-cancel hint OR Cancel button when locked */}
                                {isLockedRecording ? (
                                    <Pressable onPress={cancelRecording}>
                                        <ThemedText
                                            style={{ fontSize: 19, fontWeight: '600', color: 'red' }}
                                        >
                                            Cancel
                                        </ThemedText>
                                    </Pressable>
                                ) : (
                                    <Animated.View
                                        style={[styles.recordingInnerRightContainer, slideToCancelStyle]}
                                    >
                                        <Ionicons
                                            name="chevron-back-outline"
                                            size={18}
                                            color="gray"
                                            style={{ marginBottom: 3 }}
                                        />
                                        <ThemedText style={styles.slideToCancelText}>
                                            Slide to cancel
                                        </ThemedText>
                                    </Animated.View>
                                )}
                            </Animated.View>

                            {/* 
    ── Green mic button ──
    MOVED OUTSIDE the sliding container so it's independent
    Pure visual — no gesture here.
    Follows micX/micY shared values driven by pan
    running on the plain mic element above.
*/}
                            <Animated.View
                                key="green-record-button"
                                style={[
                                    micButtonStyle,
                                    styles.greenMicAbsolute,
                                    {
                                        opacity: isRecording && !isLockedRecording ? 1 : 0,
                                    },
                                ]}
                                entering={ZoomIn.duration(150)}
                                exiting={ZoomOut.duration(150)}
                            >
                                <Pressable style={styles.recordingGreenButton}>
                                    <Ionicons
                                        name="mic"
                                        size={28}
                                        color={scheme === 'dark' ? '#ffffff' : '#000000'}
                                    />
                                </Pressable>
                            </Animated.View>

                        </ThemedView>
                    </GlassView>
                </Animated.View>

                {/* ── Send button (typed message) ───────────────────────────── */}
                {message.length > 0 && (
                    <Animated.View
                        style={styles.sendButtonWrapper}
                        entering={ZoomInRight.duration(150)}
                        exiting={ZoomOutRight.duration(150)}
                    >
                        <GlassView
                            style={styles.plusButtonContainer}
                            isInteractive
                            tintColor="#25d365ac"
                            glassEffectStyle="regular"
                        >
                            <Ionicons
                                name="arrow-up"
                                size={28}
                                color={scheme === 'dark' ? '#ffffff' : '#000000'}
                            />
                        </GlassView>
                    </Animated.View>
                )}

                {/* ── Send button (locked recording) ────────────────────────── */}
                {isRecording && isLockedRecording && (
                    <Animated.View
                        style={styles.sendButtonWrapper}
                        entering={ZoomInRight.duration(150)}
                        exiting={ZoomOutRight.duration(150)}
                    >
                        <GlassView
                            style={styles.plusButtonContainer}
                            isInteractive
                            tintColor="#25d365ac"
                            glassEffectStyle="regular"
                        >
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        width: '100%',
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'transparent',
        position: 'relative',
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
        paddingTop: 5,
        borderRadius: 20,
        borderCurve: 'continuous',
        flex: 1,
        overflow: 'visible',
    },
    replyContainer: {
        padding: 8,
        borderRadius: 14,
        borderCurve: 'continuous',
        paddingBottom: 10,
    },
    innerReplyContainer: {
        borderLeftWidth: 3,
        borderLeftColor: '#808080',
        backgroundColor: 'transparent',
        paddingLeft: 8,
        flexDirection: 'column',
        gap: 4,
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
        alignItems: 'center',
    },
    usernameText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 14,
    },
    replyMessageContentText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14,
    },
    textInputContainer: {
        // Stack text-input row and recording row on top of each other
        minHeight: 36,
        backgroundColor: 'transparent',
    },
    textInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        backgroundColor: 'transparent',
    },
    recordingInnterContentContainer: {
        position: 'absolute',
        left: 6,
        right: 6,
        top: 1,
        bottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    recordingInnerLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'transparent',
    },
    recordingInnerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    slideToCancelText: {
        fontSize: 14,
        lineHeight: 14,
        fontWeight: '400',
        color: 'gray',
    },
    input: {
        flex: 1,
        marginBottom: 10,
        maxHeight: 120,
        fontSize: 16,
    },
    greenMicAbsolute: {
        position: 'absolute',
        right: -18,
        bottom: -18,
    },
    recordingGreenButton: {
        padding: 24,
        borderRadius: 99,
        backgroundColor: '#25D366',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    lockMainContainer: {
        position: 'absolute',
        right: 8,
        bottom: 110,
        transformOrigin: 'bottom',
    },
    lockGlassView: {
        paddingHorizontal: 6,
        paddingVertical: 10,
        borderRadius: 99,
        borderCurve: 'continuous',
        backgroundColor: 'transparent'
    },
    lockRecordingBar: {
        flexDirection: 'column',
        backgroundColor: 'transparent'
    },
});
