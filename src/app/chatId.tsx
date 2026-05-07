import ChatRoomInput from '@/components/chat-room-input';
import Bubble from '@/components/message-bubble';
import VirtualizedListScrollView from '@/components/virtualized-list-scroll-view';
import { useReplyStore } from '@/store/use-reply-store';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
    FlatList,
    ImageBackground,
    ScrollViewProps,
    StyleSheet,
    useColorScheme
} from 'react-native';
import {
    KeyboardGestureArea
} from 'react-native-keyboard-controller';

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

const DEFAULT_INPUT_BAR_HEIGHT = 60;

const ChatRoom = () => {
    const listRef = useRef<FlatList>(null);
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const { setReply } = useReplyStore();
    const [composerHeight, setComposerHeight] = useState(DEFAULT_INPUT_BAR_HEIGHT);

    const memoList = useCallback(
        (props: ScrollViewProps) => <VirtualizedListScrollView {...props} />,
        [],
    );

    const handleComposerHeightChange = useCallback((nextHeight: number) => {
        const normalizedHeight = Math.max(DEFAULT_INPUT_BAR_HEIGHT, nextHeight);

        setComposerHeight((currentHeight) => (
            currentHeight === normalizedHeight ? currentHeight : normalizedHeight
        ));
    }, []);

    return (
        <KeyboardGestureArea
            interpolator="ios"
            offset={composerHeight}
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
                    contentContainerStyle={[styles.listContent, { paddingBottom: composerHeight }]}
                    renderScrollComponent={memoList}
                />
                <ChatRoomInput onHeightChange={handleComposerHeightChange} />
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
        flexDirection: 'column-reverse',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 16,
    },
});
