import ExpoModulesCore

public class BubbleContextMenuModule: Module {
    public func definition() -> ModuleDefinition {
        Name("BubbleContextMenu")

        View(BubbleContextMenuView.self) {
            Prop("menuItems") { (view: BubbleContextMenuView, items: [[String: Any]]) in
                view.menuItems = items
            }
            Prop("reactionEmojis") { (view: BubbleContextMenuView, emojis: [String]) in
                view.reactionEmojis = emojis
            }
            Events("onMenuAction", "onMenuWillShow", "onMenuDidHide", "onReactionSelected")
        }
    }
}
