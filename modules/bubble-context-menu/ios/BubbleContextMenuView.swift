import ExpoModulesCore
import UIKit

enum BubbleReactionPlacement {
    case aboveBubble
    case belowBubble
}

class PassthroughWindow: UIWindow {
    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        // Check if the touch is on the reaction view's emoji bar
        if let reactionView = subviews.first(where: { $0 is BubbleContextMenuReactionView }) as? BubbleContextMenuReactionView {
            let pointInReactionView = convert(point, to: reactionView)
            if reactionView.point(inside: pointInReactionView, with: event) {
                return true
            }
        }
        return false
    }
}

final class BubbleContextMenuReactionView: UIView {
    var emojis: [String] {
        didSet {
            rebuildEmojiButtons()
        }
    }

    var sourceFrame: CGRect {
        didSet {
            setNeedsLayout()
        }
    }

    var placement: BubbleReactionPlacement {
        didSet {
            setNeedsLayout()
        }
    }

    var onReaction: ((String) -> Void)?

    private let snapshot: UIView
    private let emojiBar = UIVisualEffectView()
    private let stackView = UIStackView()

    private let bubbleSpacing: CGFloat = 8
    private let sideInset: CGFloat = 12
    private let horizontalPadding: CGFloat = 12
    private let barHeight: CGFloat = 58
    private let buttonSize: CGFloat = 48
    private let emojiFontSize: CGFloat = 31
    private let stackSpacing: CGFloat = 2
    private let barShadowOpacity: Float = 0.07
    private var animationGeneration = 0

    init(snapshot: UIView, sourceFrame: CGRect, emojis: [String], placement: BubbleReactionPlacement) {
        self.snapshot = snapshot
        self.sourceFrame = sourceFrame
        self.emojis = emojis
        self.placement = placement
        super.init(frame: .zero)
        setupView()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        snapshot.frame = sourceFrame
        layoutEmojiBar()
    }

    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        let pointInBar = convert(point, to: emojiBar)
        return emojiBar.bounds.contains(pointInBar)
    }

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    // Check if the point is inside the emoji bar
    let pointInBar = convert(point, to: emojiBar)
    if emojiBar.bounds.contains(pointInBar) {
        return super.hitTest(point, with: event)
    }
    
    // Otherwise, return nil to let the touch pass through
    return nil
}

    func animateIn(with animator: UIContextMenuInteractionAnimating?) {
        animationGeneration += 1
        let generation = animationGeneration

        snapshot.alpha = 0
        emojiBar.alpha = 1
        emojiBar.transform = .identity
        emojiBar.layer.shadowOpacity = barShadowOpacity
        prepareEmojiButtonsForEntrance()
        emojiBar.layer.removeAllAnimations()
        stackView.arrangedSubviews.forEach { $0.layer.removeAllAnimations() }

        let snapshotAnimations = { [weak self] in
            guard let self = self else { return }
            self.snapshot.alpha = 1
        }

        if let animator = animator {
            animator.addAnimations(snapshotAnimations)
        } else {
            UIView.animate(
                withDuration: 0.14,
                delay: 0,
                options: [.beginFromCurrentState, .curveEaseOut]
            ) {
                snapshotAnimations()
            }
        }

        runEntranceAnimations(generation: generation)
    }

    func animateOut(with animator: UIContextMenuInteractionAnimating?, completion: @escaping () -> Void) {
        animationGeneration += 1
        let generation = animationGeneration

        emojiBar.layer.removeAllAnimations()
        stackView.arrangedSubviews.forEach { $0.layer.removeAllAnimations() }

        let snapshotAnimations = { [weak self] in
            guard let self = self else { return }
            self.snapshot.alpha = 0
        }

        if let animator = animator {
            animator.addAnimations(snapshotAnimations)
        } else {
            UIView.animate(
                withDuration: 0.12,
                delay: 0,
                options: [.beginFromCurrentState, .curveEaseIn]
            ) {
                snapshotAnimations()
            }
        }

        runExitAnimations(generation: generation, completion: completion)
    }

    private func setupView() {
        backgroundColor = .clear

        snapshot.layer.cornerRadius = 18
        snapshot.clipsToBounds = true
        snapshot.isUserInteractionEnabled = false
        addSubview(snapshot)

        emojiBar.clipsToBounds = false
        emojiBar.layer.cornerRadius = barHeight / 2
        emojiBar.layer.cornerCurve = .continuous
        emojiBar.layer.shadowOpacity = barShadowOpacity
        emojiBar.layer.shadowRadius = 16
        emojiBar.layer.shadowOffset = CGSize(width: 0, height: 7)
        emojiBar.layer.shadowColor = UIColor.black.withAlphaComponent(0.22).cgColor
        addSubview(emojiBar)

        stackView.axis = .horizontal
        stackView.spacing = stackSpacing
        stackView.alignment = .center
        stackView.translatesAutoresizingMaskIntoConstraints = false
        emojiBar.contentView.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.centerXAnchor.constraint(equalTo: emojiBar.contentView.centerXAnchor),
            stackView.centerYAnchor.constraint(equalTo: emojiBar.contentView.centerYAnchor)
        ])

        updateGlassAppearance()
        rebuildEmojiButtons()
    }

    private func updateGlassAppearance() {
        #if compiler(>=6.2)
        if #available(iOS 26.0, *), isGlassEffectAvailable() {
            let glassEffect = UIGlassEffect(style: .regular)
            glassEffect.isInteractive = true
            emojiBar.effect = glassEffect
            emojiBar.layer.borderWidth = 0
            emojiBar.layer.borderColor = nil
            return
        }
        #endif

        emojiBar.effect = UIBlurEffect(style: .regular)
        emojiBar.layer.borderWidth = 1
        emojiBar.layer.borderColor = UIColor.separator.withAlphaComponent(0.18).cgColor
    }

    private func isGlassEffectAvailable() -> Bool {
        #if compiler(>=6.2)
        if #available(iOS 26.0, *) {
            guard let glassEffectClass = NSClassFromString("UIGlassEffect") as? NSObject.Type else {
                return false
            }

            return glassEffectClass.responds(to: NSSelectorFromString("effectWithStyle:"))
        }
        #endif

        return false
    }

    private func rebuildEmojiButtons() {
        stackView.arrangedSubviews.forEach { subview in
            stackView.removeArrangedSubview(subview)
            subview.removeFromSuperview()
        }

        for emoji in emojis {
            let button = UIButton(type: .system)
            button.setTitle(emoji, for: .normal)
            button.titleLabel?.font = .systemFont(ofSize: emojiFontSize)
            button.tintColor = .label
            button.widthAnchor.constraint(equalToConstant: buttonSize).isActive = true
            button.heightAnchor.constraint(equalToConstant: buttonSize).isActive = true
            button.addAction(UIAction { [weak self] _ in
                self?.onReaction?(emoji)
            }, for: .touchUpInside)
            stackView.addArrangedSubview(button)
        }

        setNeedsLayout()
    }

    private func prepareEmojiButtonsForEntrance() {
        for view in stackView.arrangedSubviews {
            view.alpha = 0
            view.transform = CGAffineTransform(scaleX: 0.72, y: 0.72)
        }
    }

    private func runEntranceAnimations(generation: Int) {
        for (index, view) in stackView.arrangedSubviews.enumerated() {
            let delay = 0.02 + (Double(index) * 0.034)
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self, weak view] in
                guard let self = self, generation == self.animationGeneration, let view = view else { return }

                UIView.animate(
                    withDuration: 0.32,
                    delay: 0,
                    usingSpringWithDamping: 0.68,
                    initialSpringVelocity: 0.32,
                    options: [.beginFromCurrentState, .allowUserInteraction]
                ) {
                    view.alpha = 1
                    view.transform = .identity
                }
            }
        }
    }

    private func runExitAnimations(generation: Int, completion: @escaping () -> Void) {
        for view in stackView.arrangedSubviews {
            UIView.animate(
                withDuration: 0.1,
                delay: 0,
                options: [.beginFromCurrentState, .curveEaseIn]
            ) {
                view.alpha = 0
                view.transform = CGAffineTransform(scaleX: 0.68, y: 0.68)
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) { [weak self] in
            guard let self = self, generation == self.animationGeneration else { return }
            completion()
        }
    }

    private func layoutEmojiBar() {
        let itemCount = CGFloat(max(emojis.count, 1))
        let contentWidth = (itemCount * buttonSize) + (max(itemCount - 1, 0) * stackSpacing)
        let barWidth = contentWidth + horizontalPadding
        let centeredX = sourceFrame.midX - (barWidth / 2)
        let minX = max(sideInset, min(centeredX, bounds.width - barWidth - sideInset))

        let safeTop = safeAreaInsets.top + sideInset
        let safeBottom = bounds.height - safeAreaInsets.bottom - barHeight - sideInset
        let preferredY: CGFloat

        switch placement {
        case .aboveBubble:
            preferredY = sourceFrame.minY - barHeight - bubbleSpacing
        case .belowBubble:
            preferredY = sourceFrame.maxY + bubbleSpacing
        }

        let clampedY = min(max(preferredY, safeTop), safeBottom)
        emojiBar.frame = CGRect(x: minX, y: clampedY, width: barWidth, height: barHeight)
    }
}

class BubbleContextMenuView: ExpoView, UIContextMenuInteractionDelegate {

    var menuItems: [[String: Any]] = []
    var reactionEmojis: [String] = []
    var onMenuAction = EventDispatcher()
    var onMenuWillShow = EventDispatcher()
    var onMenuDidHide = EventDispatcher()
    var onReactionSelected = EventDispatcher()

    private var interaction: UIContextMenuInteraction?
    private var reactionView: BubbleContextMenuReactionView?
    private var overlayWindow: UIWindow? // ADD THIS

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        setupInteraction()
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()

        if window == nil {
            removeReactionView()
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        guard let reactionView = reactionView, let overlayWindow = overlayWindow else { return }

        reactionView.frame = overlayWindow.bounds
        reactionView.sourceFrame = convert(bounds, to: overlayWindow)
    }

    private func setupInteraction() {
        let interaction = UIContextMenuInteraction(delegate: self)
        self.addInteraction(interaction)
        self.interaction = interaction
    }

    // MARK: - UIContextMenuInteractionDelegate

    func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        configurationForMenuAtLocation location: CGPoint
    ) -> UIContextMenuConfiguration? {
        return UIContextMenuConfiguration(
            identifier: nil,
            previewProvider: nil,
            actionProvider: { [weak self] _ in
                guard let self = self else { return nil }
                return self.buildMenu()
            }
        )
    }

    func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        previewForHighlightingMenuWithConfiguration configuration: UIContextMenuConfiguration
    ) -> UITargetedPreview? {
        return makeTargetedPreview()
    }

    func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        previewForDismissingMenuWithConfiguration configuration: UIContextMenuConfiguration
    ) -> UITargetedPreview? {
        return makeTargetedPreview()
    }

    func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        willDisplayMenuFor configuration: UIContextMenuConfiguration,
        animator: UIContextMenuInteractionAnimating?
    ) {
        showReactionView(with: animator)
        onMenuWillShow([:])
    }

    func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        willEndFor configuration: UIContextMenuConfiguration,
        animator: UIContextMenuInteractionAnimating?
    ) {
        hideReactionView(with: animator)

        if let animator = animator {
            animator.addCompletion { [weak self] in
                self?.onMenuDidHide([:])
            }
        } else {
            onMenuDidHide([:])
        }
    }

    // MARK: - Helpers

    private func makeTargetedPreview() -> UITargetedPreview {
        let params = UIPreviewParameters()
        params.backgroundColor = .clear
        params.visiblePath = UIBezierPath(rect: self.bounds)
        params.shadowPath = UIBezierPath()
        return UITargetedPreview(view: self, parameters: params)
    }

    private func buildMenu() -> UIMenu {
        let actions = menuItems.compactMap { item -> UIAction? in
            guard
                let id = item["id"] as? String,
                let title = item["title"] as? String
            else { return nil }

            let sfSymbol = item["systemImage"] as? String
            let image = sfSymbol != nil ? UIImage(systemName: sfSymbol!) : nil
            let isDestructive = (item["destructive"] as? Bool) == true

            return UIAction(
                title: title,
                image: image,
                attributes: isDestructive ? .destructive : []
            ) { [weak self] _ in
                self?.onMenuAction(["id": id])
            }
        }
        return UIMenu(title: "", children: actions)
    }

    private func showReactionView(with animator: UIContextMenuInteractionAnimating?) {
    guard !reactionEmojis.isEmpty, let currentWindow = window, !bounds.isEmpty else { return }
    
    // Create dedicated overlay window if needed
    if overlayWindow == nil {
        guard let windowScene = currentWindow.windowScene else { return }
        let newWindow = PassthroughWindow(windowScene: windowScene) // Use PassthroughWindow here
        newWindow.windowLevel = .alert + 1
        newWindow.backgroundColor = .clear
        newWindow.isHidden = false
        overlayWindow = newWindow
    }
    
    guard let overlayWindow = overlayWindow else { return }
    
    let sourceFrame = convert(bounds, to: overlayWindow)
    let placement = preferredReactionPlacement(for: sourceFrame, in: overlayWindow)

    if let reactionView = reactionView {
        reactionView.frame = overlayWindow.bounds
        reactionView.sourceFrame = sourceFrame
        reactionView.emojis = reactionEmojis
        reactionView.placement = placement
        overlayWindow.bringSubviewToFront(reactionView)
        reactionView.animateIn(with: animator)
        return
    }

    let snapshot = snapshotView(afterScreenUpdates: true)
        ?? snapshotView(afterScreenUpdates: false)
        ?? UIView(frame: bounds)

    let reactionView = BubbleContextMenuReactionView(
        snapshot: snapshot,
        sourceFrame: sourceFrame,
        emojis: reactionEmojis,
        placement: placement
    )

    reactionView.frame = overlayWindow.bounds
    reactionView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    reactionView.onReaction = { [weak self] emoji in
        self?.onReactionSelected(["emoji": emoji])
        self?.dismissContextMenu() // Add this to dismiss after reaction
    }

    overlayWindow.addSubview(reactionView)
    overlayWindow.bringSubviewToFront(reactionView)
    reactionView.animateIn(with: animator)
    self.reactionView = reactionView
}

private func dismissContextMenu() {
    // Force dismiss the context menu
    interaction?.dismissMenu()
    
    // Also cleanup the reaction view
    hideReactionView(with: nil)
}

    private func hideReactionView(with animator: UIContextMenuInteractionAnimating?) {
        guard let reactionView = reactionView else { return }

        reactionView.animateOut(with: animator) { [weak self, weak reactionView] in
            reactionView?.removeFromSuperview()
            guard let self = self, self.reactionView === reactionView else { return }
            self.reactionView = nil
            self.cleanupOverlayWindow()
        }
    }

    private func removeReactionView() {
        reactionView?.removeFromSuperview()
        reactionView = nil
        cleanupOverlayWindow()
    }
    
    private func cleanupOverlayWindow() {
        overlayWindow?.isHidden = true
        overlayWindow = nil
    }

    private func preferredReactionPlacement(for sourceFrame: CGRect, in window: UIWindow) -> BubbleReactionPlacement {
        let safeTop = window.safeAreaInsets.top
        let safeBottom = window.bounds.height - window.safeAreaInsets.bottom
        let availableAbove = sourceFrame.minY - safeTop
        let availableBelow = safeBottom - sourceFrame.maxY

        return availableBelow >= availableAbove ? .aboveBubble : .belowBubble
    }
}
