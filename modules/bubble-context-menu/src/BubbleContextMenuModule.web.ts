import { registerWebModule, NativeModule } from 'expo';

import { BubbleContextMenuModuleEvents } from './BubbleContextMenu.types';

class BubbleContextMenuModule extends NativeModule<BubbleContextMenuModuleEvents> {}

export default registerWebModule(BubbleContextMenuModule, 'BubbleContextMenu');
