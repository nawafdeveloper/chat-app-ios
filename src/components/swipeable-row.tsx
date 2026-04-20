import { SymbolView, SymbolViewProps } from 'expo-symbols';
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface SwipeAction {
    icon: SymbolViewProps['name'];
    label: string;
    color: string;
    onPress: () => void;
}

interface SwipeableRowProps {
    children: React.ReactNode;
    leftActions?: SwipeAction[];
    actions?: SwipeAction[];
}

const ACTION_WIDTH = 75;

const LeftActions: React.FC<{
    progress: Animated.AnimatedInterpolation<number>;
    dragX: Animated.AnimatedInterpolation<number>;
    actions: SwipeAction[];
}> = ({ progress, actions }) => {
    return (
        <View style={styles.leftActionsContainer}>
            {actions.map((action, index) => {
                const translateX = progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-ACTION_WIDTH * (actions.length - index), 0],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.actionButton,
                            {
                                backgroundColor: action.color,
                                transform: [{ translateX }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={action.onPress}
                            style={styles.actionTouchable}
                            activeOpacity={0.6}
                        >
                            <SymbolView
                                name={action.icon}
                                size={22}
                                tintColor="#FFFFFF"
                                type="palette"
                            />
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const RightActions: React.FC<{
    progress: Animated.AnimatedInterpolation<number>;
    dragX: Animated.AnimatedInterpolation<number>;
    actions: SwipeAction[];
}> = ({ progress, actions }) => {
    return (
        <View style={styles.rightActionsContainer}>
            {actions.map((action, index) => {
                const translateX = progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ACTION_WIDTH * (actions.length - index), 0],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.actionButton,
                            {
                                backgroundColor: action.color,
                                transform: [{ translateX }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={action.onPress}
                            style={styles.actionTouchable}
                            activeOpacity={0.6}
                        >
                            <SymbolView
                                name={action.icon}
                                size={22}
                                tintColor="#FFFFFF"
                                type="palette"
                            />
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const SwipeableRow: React.FC<SwipeableRowProps> = ({
    children,
    leftActions = [],
    actions = [],
}) => {
    const swipeableRef = React.useRef<Swipeable>(null);

    const close = () => swipeableRef.current?.close();

    const withClose = (acts: SwipeAction[]) =>
        acts.map((action) => ({
            ...action,
            onPress: () => {
                action.onPress();
                close();
            },
        }));

    return (
        <Swipeable
            ref={swipeableRef}
            friction={2}
            leftThreshold={30}
            rightThreshold={40}
            renderLeftActions={
                leftActions.length > 0
                    ? (progress, dragX) => (
                        <LeftActions
                            progress={progress}
                            dragX={dragX}
                            actions={withClose(leftActions)}
                        />
                    )
                    : undefined
            }
            renderRightActions={
                actions.length > 0
                    ? (progress, dragX) => (
                        <RightActions
                            progress={progress}
                            dragX={dragX}
                            actions={withClose(actions)}
                        />
                    )
                    : undefined
            }
        >
            {children}
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    leftActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    rightActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
    },
    actionButton: {
        width: ACTION_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTouchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    actionLabel: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
});

export default SwipeableRow;