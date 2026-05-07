import { useEffect, useRef } from 'react';
import { findNodeHandle } from 'react-native';
import SharedImageTransitionModule from './SharedImageTransitionModule';

export function useSharedImageTag(tag: string) {
    const ref = useRef<any>(null);

    useEffect(() => {
        if (!ref.current) return;

        const timeout = setTimeout(() => {
            const viewTag = findNodeHandle(ref.current);
            if (viewTag !== null) {
                SharedImageTransitionModule.registerTag(tag, viewTag);
            }
        }, 50);

        return () => {
            clearTimeout(timeout);
            SharedImageTransitionModule.unregisterTag(tag);
        };
    }, [tag]);

    return ref;
}