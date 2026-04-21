import ChatRoomInput from '@/components/chat-room-input';
import VirtualizedListScrollView from '@/components/virtualized-list-scroll-view';
import { useReplyStore } from '@/store/use-reply-store';
import { Button, ContextMenu, Divider, Host, Section } from '@expo/ui/swift-ui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef } from 'react';
import {
    FlatList,
    ImageBackground,
    ScrollViewProps,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import {
    KeyboardGestureArea
} from 'react-native-keyboard-controller';
import Svg, { Path } from 'react-native-svg';

type Message = {
    id: string;
    text: string;
    sent: boolean;
    time: string;
    status: 'sent' | 'delivered' | 'read';
};

const MESSAGES: Message[] = [
    { id: '1', text: 'Hey! How are you doing?', sent: false, time: '9:41 AM', status: 'read' },
    { id: '2', text: 'I\'m doing great, thanks! How about you?', sent: true, time: '9:42 AM', status: 'read' },
    { id: '3', text: 'Pretty good! Did you see the game last night?', sent: false, time: '9:42 AM', status: 'read' },
    { id: '4', text: 'Yes!! It was insane 🔥 Can\'t believe that last minute goal', sent: true, time: '9:43 AM', status: 'read' },
    { id: '5', text: 'Right?? I was screaming 😂', sent: false, time: '9:43 AM', status: 'read' },
    { id: '6', text: 'Same here lol. Are you free this weekend?', sent: true, time: '9:45 AM', status: 'read' },
    { id: '7', text: 'Yeah should be. What\'s up?', sent: false, time: '9:46 AM', status: 'read' },
    { id: '8', text: 'Thinking of having a barbecue at my place on Saturday 🍖', sent: true, time: '9:46 AM', status: 'read' },
    { id: '9', text: 'Oh that sounds amazing! Count me in 🙌', sent: false, time: '9:47 AM', status: 'read' },
    { id: '10', text: 'Perfect! I\'ll send you the details later', sent: true, time: '9:47 AM', status: 'read' },
    { id: '11', text: 'Sounds good. Should I bring anything?', sent: false, time: '9:50 AM', status: 'read' },
    { id: '12', text: 'Just bring yourself 😄 And maybe some drinks if you want', sent: true, time: '9:51 AM', status: 'read' },
    { id: '13', text: 'Haha sure I\'ll grab some 🍺', sent: false, time: '9:51 AM', status: 'read' },
    { id: '14', text: 'Awesome! Looking forward to it', sent: true, time: '9:52 AM', status: 'delivered' },
    { id: '15', text: 'Me too! See you Saturday 👋', sent: false, time: '9:52 AM', status: 'read' },
    { id: '16', text: 'See you then!', sent: true, time: '9:53 AM', status: 'sent' },
];

const DARK = {
    sentBubble: '#144D37',
    receivedBubble: '#242626',
    sentText: '#E9EDEF',
    receivedText: '#E9EDEF',
    sentTime: 'rgba(233,237,239,0.6)',
    receivedTime: 'rgba(233,237,239,0.5)',
    checkRead: '#53BDEB',
    checkUnread: 'rgba(255,255,255,0.6)',
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
};

const TAIL_PATH = "M14.8779 20.8158C8.62452 13.7086 7 4.16101 7 0L0 16.5C4.21754 20.7175 10.2551 22.1503 14.1644 22.4522C15.0416 22.5199 15.4591 21.4764 14.8779 20.8158Z";

function Tail({ color, sent }: { color: string; sent: boolean }) {
    return (
        <View style={[
            styles.tailContainer,
            sent ? styles.tailSent : styles.tailReceived,
        ]}>
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

type BubbleProps = {
    message: Message;
    prevSent?: boolean;
    nextSent?: boolean;
    isDark: boolean;
    setReply: (user: string, message: string) => void;
};

function Bubble({ message, prevSent, nextSent, isDark, setReply }: BubbleProps) {
    const { sent, text, time, status } = message;
    const theme = isDark ? DARK : LIGHT;

    const isGroupedTop = prevSent === sent;
    const isGroupedBottom = nextSent === sent;
    const showTail = !isGroupedBottom;
    const bubbleColor = sent ? theme.sentBubble : theme.receivedBubble;

    return (
        <Host>
            <ContextMenu key={message.id}>
                <ContextMenu.Trigger key={message.id}>
                    <View style={[
                        styles.row,
                        sent ? styles.rowSent : styles.rowReceived,
                        isGroupedBottom && styles.groupedMargin,
                    ]}>
                        {!sent && showTail && <Tail color={bubbleColor} sent={false} />}
                        {!sent && !showTail && <View style={styles.tailSpacer} />}

                        <View style={[
                            styles.bubble,
                            { backgroundColor: bubbleColor },
                            sent ? (
                                showTail ? styles.sentBubbleTail : styles.sentBubbleGrouped
                            ) : (
                                showTail ? styles.receivedBubbleTail : styles.receivedBubbleGrouped
                            ),
                            isGroupedTop && (sent ? styles.sentGroupedTop : styles.receivedGroupedTop),
                        ]}>
                            <Text style={[
                                styles.messageText,
                                { color: sent ? theme.sentText : theme.receivedText },
                            ]}>
                                {text}
                                <Text style={styles.timeSpacer}>
                                    {'  ' + time + (sent ? '    ' : '')}
                                </Text>
                            </Text>
                            <View style={styles.metaRow}>
                                <Text style={[
                                    styles.timeText,
                                    { color: sent ? theme.sentTime : theme.receivedTime },
                                ]}>
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
                    </View>
                </ContextMenu.Trigger>
                <ContextMenu.Items>
                    <Section title="Message">
                        <Button label="Reply" systemImage="arrowshape.turn.up.left" onPress={() => setReply('Mohammed', message.text)} />
                        <Button label="Forward" systemImage="arrowshape.turn.up.right" onPress={() => console.log('Forward', message.text)} />
                        <Button label="Copy" systemImage="doc.on.doc" onPress={() => console.log('Copy', message.text)} />
                    </Section>
                    <Divider />
                    <Section title="Chat">
                        <Button label="Pin" systemImage="pin" onPress={() => console.log('Pin', message.text)} />
                        <Button label="Star" systemImage="star" onPress={() => console.log('Star', message.text)} />
                        <Button label="Mute" systemImage="bell.slash" onPress={() => console.log('Mute', message.text)} />
                    </Section>
                    <Divider />
                    <Button label="Delete" systemImage="trash" role="destructive" onPress={() => console.log('Delete', message.text)} />
                </ContextMenu.Items>
            </ContextMenu>
        </Host>
    );
}

const INPUT_BAR_HEIGHT = 60;

const ChatRoom = () => {
    const listRef = useRef<FlatList>(null);
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const { setReply } = useReplyStore();

    const memoList = useCallback(
        (props: ScrollViewProps) => <VirtualizedListScrollView {...props} />,
        [],
    );

    return (
        <KeyboardGestureArea
            interpolator="ios"
            offset={INPUT_BAR_HEIGHT}
            style={{ flex: 1 }}
            textInputNativeID="chat-input"
        >
            <ImageBackground
                source={
                    isDark
                        ? require('../../assets/bg-pattern-dark.png')
                        : require('../../assets/bg-pattern-light.png')
                }
                style={styles.background}
                resizeMode="cover"
            >
                <FlatList
                    ref={listRef}
                    data={MESSAGES}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Bubble
                            key={index}
                            message={item}
                            prevSent={index > 0 ? MESSAGES[index - 1].sent : undefined}
                            nextSent={index < MESSAGES.length - 1 ? MESSAGES[index + 1].sent : undefined}
                            isDark={isDark}
                            setReply={setReply}
                        />
                    )}
                    contentInsetAdjustmentBehavior="automatic"
                    contentContainerStyle={styles.listContent}
                    onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
                    renderScrollComponent={memoList}
                />
                <ChatRoomInput />
            </ImageBackground>
            <LinearGradient
                colors={[
                    scheme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
                    scheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                ]}
                style={styles.linearBackground}
            />
        </KeyboardGestureArea>
    );
};

export default ChatRoom;

const BORDER_RADIUS = 12;

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
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
    rowSent: {
        justifyContent: 'flex-end',
    },
    rowReceived: {
        justifyContent: 'flex-start',
    },
    groupedMargin: {
        marginBottom: 0,
    },
    tailContainer: {
        width: 10,
        height: 14,
        marginBottom: -1,
    },
    tailReceived: {
        marginRight: -5,
    },
    tailSent: {
        marginLeft: -5,
    },
    tailSpacer: {
        width: 16,
    },
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
    checkmark: {
        marginLeft: 1,
    },
});