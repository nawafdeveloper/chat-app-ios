import { ThemedView } from '@/components/themed-view'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import Animated, { SharedTransition } from 'react-native-reanimated'

const ImagePreview = () => {
    const { messageId } = useLocalSearchParams<{ messageId: string }>();
    const transition = SharedTransition.duration(100).springify();

    return (
        <ThemedView style={styles.main}>
            <Animated.Image
                key={`testing-transition-${messageId}`}
                sharedTransitionStyle={transition}
                sharedTransitionTag={`testing-transition-${messageId}`}
                source={require('@/assets/images/testing-image.png')}
                resizeMode='contain'
                style={{ width: '100%', height: 'auto', aspectRatio: 3 / 4 }}
            />
        </ThemedView>
    )
}

export default ImagePreview

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})