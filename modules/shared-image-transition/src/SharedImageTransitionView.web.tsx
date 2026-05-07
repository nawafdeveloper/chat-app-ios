import * as React from 'react';

import { SharedImageTransitionViewProps } from './SharedImageTransition.types';

export default function SharedImageTransitionView(props: SharedImageTransitionViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
