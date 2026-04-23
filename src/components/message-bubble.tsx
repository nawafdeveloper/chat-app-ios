import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BubbleContextMenuView, type BubbleContextMenuItem } from '../../modules/bubble-context-menu';

const BORDER_RADIUS = 12;
const INPUT_BAR_HEIGHT = 60;

const SWIPE_MAX = 90;
const SWIPE_TRIGGER = 60;
const RESISTANCE = 0.25;

const SPRING_CONFIG = {
    damping: 24,
    stiffness: 220,
    mass: 0.8,
};

type Message = {
    id: string;
    text: string;
    sent: boolean;
    time: string;
    status: 'sent' | 'delivered' | 'read';
};

type BubbleProps = {
    message: Message;
    prevSent?: boolean;
    nextSent?: boolean;
    isDark: boolean;
    setReply: (user: string, message: string) => void;
};

const DARK = {
    sentBubble: '#144D37',
    receivedBubble: '#242626',
    sentText: '#E9EDEF',
    receivedText: '#E9EDEF',
    sentTime: 'rgba(233,237,239,0.6)',
    receivedTime: 'rgba(233,237,239,0.5)',
    checkRead: '#53BDEB',
    checkUnread: 'rgba(255,255,255,0.6)',
    replyIcon: 'rgba(255,255,255,0.9)',
    replyBg: '#262626',
};

const LIGHT = {
    sentBubble: '#D9FDD3',
    receivedBubble: '#FFFFFF',
    sentText: '#111B21',
    receivedText: '#111B21',
    sentTime: 'rgba(0,0,0,0.4)',
    receivedTime: 'rgba(0,0,0,0.4)',
    checkRead: '#53BDEB',
    checkUnread: 'rgba(0,0,0,0.35)',
    replyIcon: '#111B21',
    replyBg: '#ffffff',
};

const TAIL_PATH =
    'M14.8779 20.8158C8.62452 13.7086 7 4.16101 7 0L0 16.5C4.21754 20.7175 10.2551 22.1503 14.1644 22.4522C15.0416 22.5199 15.4591 21.4764 14.8779 20.8158Z';
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

function Tail({ color, sent }: { color: string; sent: boolean }) {
    return (
        <View
            style={[
                styles.tailContainer,
                sent ? styles.tailSent : styles.tailReceived,
            ]}
        >
            <Svg
                width={10}
                height={14}
                viewBox="0 0 16 23"
                style={!sent ? { transform: [{ scaleX: -1 }] } : undefined}
            >
                <Path d={TAIL_PATH} fill={color} />
            </Svg>
        </View>
    );
}

function ReplyIcon({
    translateX,
    isDark,
    shouldAnimateRing,
}: {
    translateX: Animated.SharedValue<number>;
    isDark: boolean;
    shouldAnimateRing: Animated.SharedValue<boolean>;
}) {
    const theme = isDark ? DARK : LIGHT;

    const iconStyle = useAnimatedStyle(() => {
        const tx = interpolate(
            translateX.value,
            [0, SWIPE_TRIGGER, SWIPE_MAX],
            [-10, 0, 6],
            Extrapolation.CLAMP
        );

        const scale = interpolate(
            translateX.value,
            [0, SWIPE_TRIGGER * 0.4, SWIPE_TRIGGER, SWIPE_MAX],
            [0.4, 0.85, 1.0, 1.05],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            translateX.value,
            [0, 20, SWIPE_TRIGGER * 0.5],
            [0, 0.5, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ translateX: tx }, { scale }],
        };
    });

    const ringStyle = useAnimatedStyle(() => {
        if (shouldAnimateRing.value) {
            return {
                opacity: withSpring(0.3, { duration: 200, damping: 8, stiffness: 40 }),
                transform: [{ scale: withSpring(1, { duration: 250, damping: 10, stiffness: 35 }) }],
            };
        }
        return {
            opacity: 0,
            transform: [{ scale: 0.6 }],
        };
    });

    return (
        <Animated.View style={[styles.replyIconWrapper, iconStyle]}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.replyRing,
                    { borderColor: isDark ? '#494949' : '#c8c8c8' },
                    ringStyle,
                ]}
            />
            <View
                style={[
                    styles.replyIconCircle,
                    { backgroundColor: theme.replyBg },
                ]}
            >
                <Ionicons
                    name="arrow-undo"
                    size={18}
                    color={theme.replyIcon}
                />
            </View>
        </Animated.View>
    );
}

function Bubble({ message, prevSent, nextSent, isDark, setReply }: BubbleProps) {
    const { sent, text, time, status } = message;
    const theme = isDark ? DARK : LIGHT;
    const isIOS = Platform.OS === 'ios';
    const hasTriggeredHaptic = useRef(false);
    const shouldAnimateRing = useSharedValue(false);

    const isGroupedTop = prevSent === sent;
    const isGroupedBottom = nextSent === sent;
    const showTail = !isGroupedBottom;
    const bubbleColor = sent ? theme.sentBubble : theme.receivedBubble;

    const translateX = useSharedValue(0);

    const triggerReply = () => {
        setReply('Mohammed', text);
    };

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX(20)
        .failOffsetY([-12, 12])
        .onUpdate((e) => {
            const raw = e.translationX;
            if (raw <= 0) {
                translateX.value = 0;
                return;
            }

            if (raw <= SWIPE_MAX) {
                translateX.value = raw;
            } else {
                const overflow = raw - SWIPE_MAX;
                translateX.value = SWIPE_MAX + overflow * RESISTANCE;
            }

            const currentValue = translateX.value;
            if (!hasTriggeredHaptic.current && currentValue >= SWIPE_TRIGGER) {
                hasTriggeredHaptic.current = true;
                shouldAnimateRing.value = true;
                runOnJS(triggerHaptic)();
            } else if (hasTriggeredHaptic.current && currentValue < SWIPE_TRIGGER) {
                hasTriggeredHaptic.current = false;
            }
        })
        .onEnd(() => {
            hasTriggeredHaptic.current = false;
            shouldAnimateRing.value = false;

            const currentValue = translateX.value;
            if (currentValue >= SWIPE_TRIGGER) {
                runOnJS(triggerReply)();
            }

            translateX.value = withSpring(0, SPRING_CONFIG);
        });

    const bubbleRowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const menuItems: BubbleContextMenuItem[] = [
        { id: 'reply', title: 'Reply', systemImage: 'arrowshape.turn.up.left' },
        { id: 'forward', title: 'Forward', systemImage: 'arrowshape.turn.up.right' },
        { id: 'copy', title: 'Copy', systemImage: 'doc.on.doc' },
        { id: 'pin', title: 'Pin', systemImage: 'pin' },
        { id: 'star', title: 'Star', systemImage: 'star' },
        { id: 'delete', title: 'Delete', systemImage: 'trash', destructive: true },
    ];

    const handleMenuAction = (event: { nativeEvent: { id: string } }) => {
        switch (event.nativeEvent.id) {
            case 'reply': setReply('Mohammed', text); break;
            case 'forward': console.log('Forward'); break;
            case 'copy': console.log('Copy'); break;
            case 'pin': console.log('Pin'); break;
            case 'star': console.log('Star'); break;
            case 'delete': console.log('Delete'); break;
        }
    };

    const rowStyle = [
        styles.row,
        sent ? styles.rowSent : styles.rowReceived,
        isGroupedBottom && styles.groupedMargin,
    ];

    const bubbleContent = (
        <>
            {!sent && showTail && <Tail color={bubbleColor} sent={false} />}
            {!sent && !showTail && <View style={styles.tailSpacer} />}

            <View
                style={[
                    styles.bubble,
                    { backgroundColor: bubbleColor },
                    sent
                        ? showTail ? styles.sentBubbleTail : styles.sentBubbleGrouped
                        : showTail ? styles.receivedBubbleTail : styles.receivedBubbleGrouped,
                    isGroupedTop && (sent ? styles.sentGroupedTop : styles.receivedGroupedTop),
                ]}
            >
                <Text style={[styles.messageText, { color: sent ? theme.sentText : theme.receivedText }]}>
                    {text}
                    <Text style={styles.timeSpacer}>{'  ' + time + (sent ? '    ' : '')}</Text>
                </Text>
                <View style={styles.metaRow}>
                    <Text style={[styles.timeText, { color: sent ? theme.sentTime : theme.receivedTime }]}>
                        {time}
                    </Text>
                    {sent && (
                        <Ionicons
                            name={
                                status === 'read'
                                    ? 'checkmark-done'
                                    : status === 'delivered'
                                        ? 'checkmark-done'
                                        : 'checkmark'
                            }
                            size={14}
                            color={status === 'read' ? theme.checkRead : theme.checkUnread}
                            style={styles.checkmark}
                        />
                    )}
                </View>
            </View>

            {sent && showTail && <Tail color={bubbleColor} sent={true} />}
            {sent && !showTail && <View style={styles.tailSpacer} />}
        </>
    );

    const innerContent = (
        <View style={[rowStyle, { overflow: 'visible' }]}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={[styles.replyIconAnchor, sent ? styles.replyIconSent : styles.replyIconReceived]}>
                    <ReplyIcon translateX={translateX} isDark={isDark} shouldAnimateRing={shouldAnimateRing} />
                </View>
            </View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-end' }, sent ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }, bubbleRowStyle]}>
                    {bubbleContent}
                </Animated.View>
            </GestureDetector>
        </View>
    );

    if (!isIOS) {
        return innerContent;
    }

    return (
        <BubbleContextMenuView
            menuItems={menuItems}
            reactionEmojis={REACTION_EMOJIS}
            onMenuAction={handleMenuAction}
            onReactionSelected={(event) => {
                console.log('Reaction', event.nativeEvent.emoji);
            }}
            style={[rowStyle, { overflow: 'visible' }]}
        >
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={[styles.replyIconAnchor, sent ? styles.replyIconSent : styles.replyIconReceived]}>
                    <ReplyIcon translateX={translateX} isDark={isDark} shouldAnimateRing={shouldAnimateRing} />
                </View>
            </View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-end', flex: 1 }, sent ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }, bubbleRowStyle]}>
                    {bubbleContent}
                </Animated.View>
            </GestureDetector>
        </BubbleContextMenuView>
    );
}

export default Bubble;

const styles = StyleSheet.create({
    flex: { flex: 1 },
    background: { flex: 1 },
    linearBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingBottom: INPUT_BAR_HEIGHT,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        marginVertical: 1,
        alignItems: 'flex-end',
    },
    rowSent: { justifyContent: 'flex-end' },
    rowReceived: { justifyContent: 'flex-start' },
    groupedMargin: { marginBottom: 0 },
    tailContainer: {
        width: 10,
        height: 14,
        marginBottom: -1,
    },
    tailReceived: { marginRight: -5 },
    tailSent: { marginLeft: -5 },
    tailSpacer: { width: 16 },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 80,
        borderRadius: BORDER_RADIUS,
        borderCurve: 'continuous',
    },
    sentBubbleTail: { borderRadius: BORDER_RADIUS },
    sentBubbleGrouped: { borderRadius: BORDER_RADIUS },
    sentGroupedTop: { borderTopRightRadius: BORDER_RADIUS },
    receivedBubbleTail: { borderRadius: BORDER_RADIUS },
    receivedBubbleGrouped: { borderRadius: BORDER_RADIUS },
    receivedGroupedTop: { borderTopLeftRadius: BORDER_RADIUS },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timeSpacer: {
        fontSize: 11,
        color: 'transparent',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        marginTop: -14,
    },
    timeText: {
        fontSize: 11,
        lineHeight: 14,
    },
    checkmark: { marginLeft: 1 },
    replyIconAnchor: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    replyIconReceived: {
        left: 0,
    },
    replyIconSent: {
        left: 0,
    },
    replyIconWrapper: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    replyRing: {
        borderRadius: 22,
        borderWidth: 10,
        width: 44,
        height: 44,
        top: -5,
        left: -5,
        zIndex: -3,
        opacity: 0.2
    },
});