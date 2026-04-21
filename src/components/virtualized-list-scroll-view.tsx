import React, { forwardRef } from "react";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";

import type { ScrollViewProps } from "react-native";
import type { KeyboardChatScrollViewProps } from "react-native-keyboard-controller";

type Ref = React.ElementRef<typeof KeyboardChatScrollView>;

const VirtualizedListScrollView = forwardRef<
    Ref,
    ScrollViewProps & KeyboardChatScrollViewProps
>((props, ref) => {
    return (
        <KeyboardChatScrollView
            ref={ref}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            {...props}
        />
    );
});

export default VirtualizedListScrollView;