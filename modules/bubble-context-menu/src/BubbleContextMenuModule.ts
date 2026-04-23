import { NativeModule, requireNativeModule } from 'expo';

import { BubbleContextMenuModuleEvents } from './BubbleContextMenu.types';

declare class BubbleContextMenuModule extends NativeModule<BubbleContextMenuModuleEvents> {}

// This call loads the native module object from the JSI.
export default requireNativeModule<BubbleContextMenuModule>('BubbleContextMenu');
