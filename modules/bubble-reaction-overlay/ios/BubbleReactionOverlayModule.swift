import ExpoModulesCore

public class BubbleReactionOverlayModule: Module {
    public func definition() -> ModuleDefinition {
        Name("BubbleReactionOverlay")

        View(BubbleReactionOverlayView.self) {
            Prop("visible") { (view: BubbleReactionOverlayView, visible: Bool) in
                view.visible = visible
            }

            // Emojis to display in the bar
            Prop("emojis") { (view: BubbleReactionOverlayView, emojis: [String]) in
                view.emojis = emojis
            }

            // Kept for API compatibility even though the context menu now drives visibility.
            Prop("minimumPressDuration") { (view: BubbleReactionOverlayView, duration: Double) in
                view.minimumPressDuration = duration
            }

            // Blur darkness 0.0 - 1.0 (default 0.7)
            Prop("overlayOpacity") { (view: BubbleReactionOverlayView, opacity: Double) in
                view.overlayOpacity = opacity
            }

            // Fired when user taps an emoji
            Events("onReactionSelected")

            // Fired when overlay is dismissed without selection
            Events("onDismiss")
        }
    }
}
