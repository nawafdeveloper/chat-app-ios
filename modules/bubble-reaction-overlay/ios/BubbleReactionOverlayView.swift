import ExpoModulesCore
import UIKit

private final class BubbleReactionOverlayPresentationView: UIView {
    var emojis: [String] {
        didSet {
            rebuildEmojiButtons()
        }
    }

    var overlayOpacity: CGFloat {
        didSet {
            updateGlassAppearance()
        }
    }

    var sourceFrame: CGRect {
        didSet {
            setNeedsLayout()
        }
    }

    var onReaction: ((String) -> Void)?

    private let snapshot: UIView
    private let emojiBar = UIVisualEffectView()
    private let stackView = UIStackView()

    init(snapshot: UIView, sourceFrame: CGRect, emojis: [String], overlayOpacity: CGFloat) {
        self.snapshot = snapshot
        self.sourceFrame = sourceFrame
        self.emojis = emojis
        self.overlayOpacity = overlayOpacity
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

    func playEntranceAnimation() {
        snapshot.alpha = 0
        emojiBar.transform = CGAffineTransform(scaleX: 0.4, y: 0.4)

        UIView.animate(withDuration: 0.18) { [weak self] in
            guard let self = self else { return }
            self.snapshot.alpha = 1
        }

        UIView.animate(
            withDuration: 0.35,
            delay: 0,
            usingSpringWithDamping: 0.65,
            initialSpringVelocity: 0.8
        ) { [weak self] in
            self?.emojiBar.transform = .identity
        }
    }

    private func setupView() {
        backgroundColor = .clear

        snapshot.layer.cornerRadius = 18
        snapshot.clipsToBounds = true
        snapshot.isUserInteractionEnabled = false
        addSubview(snapshot)

        emojiBar.clipsToBounds = false
        emojiBar.layer.cornerRadius = 32
        emojiBar.layer.cornerCurve = .continuous
        emojiBar.layer.shadowOpacity = 0.08
        emojiBar.layer.shadowRadius = 18
        emojiBar.layer.shadowOffset = CGSize(width: 0, height: 8)
        emojiBar.layer.shadowColor = UIColor.black.withAlphaComponent(0.28).cgColor
        addSubview(emojiBar)

        stackView.axis = .horizontal
        stackView.spacing = 4
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
        let clampedOpacity = max(0, min(1, overlayOpacity))

        #if compiler(>=6.2)
        if #available(iOS 26.0, *), isGlassEffectAvailable() {
            let glassEffect = UIGlassEffect(style: .regular)
            glassEffect.tintColor = UIColor.white.withAlphaComponent(0.12 + (clampedOpacity * 0.1))
            glassEffect.isInteractive = true
            emojiBar.effect = glassEffect
            emojiBar.alpha = 1
            emojiBar.overrideUserInterfaceStyle = .light
            emojiBar.cornerConfiguration = .capsule()
            emojiBar.layer.borderWidth = 0
            emojiBar.layer.borderColor = nil
            return
        }
        #endif

        emojiBar.effect = UIBlurEffect(style: .systemUltraThinMaterialLight)
        emojiBar.alpha = 0.96
        emojiBar.layer.borderWidth = 1
        emojiBar.layer.borderColor = UIColor.white.withAlphaComponent(0.18).cgColor
    }

    private func isGlassEffectAvailable() -> Bool {
        #if compiler(>=6.2)
        if #available(iOS 26.0, *) {
            guard let glassEffectClass = NSClassFromString("UIGlassEffect") as? NSObject.Type else {
                return false
            }
            return glassEffectClass.responds(to: Selector(("effectWithStyle:")))
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
            button.titleLabel?.font = .systemFont(ofSize: 28)
            button.widthAnchor.constraint(equalToConstant: 48).isActive = true
            button.heightAnchor.constraint(equalToConstant: 48).isActive = true
            button.addAction(UIAction { [weak self] _ in
                self?.onReaction?(emoji)
            }, for: .touchUpInside)
            stackView.addArrangedSubview(button)
        }

        setNeedsLayout()
    }

    private func layoutEmojiBar() {
        let barWidth = CGFloat(max(emojis.count, 1)) * 52 + 16
        let barHeight: CGFloat = 64
        let x = max(16, min(sourceFrame.minX, bounds.width - barWidth - 16))
        let y = max(sourceFrame.minY - barHeight - 12, 60)

        emojiBar.frame = CGRect(x: x, y: y, width: barWidth, height: barHeight)
    }
}

class BubbleReactionOverlayView: ExpoView {
    var emojis: [String] = ["❤️", "😂", "😮", "😢", "😡", "👍"] {
        didSet {
            overlayView?.emojis = emojis
        }
    }

    var minimumPressDuration: Double = 0.4

    var overlayOpacity: Double = 0.7 {
        didSet {
            overlayView?.overlayOpacity = clampedOverlayOpacity
        }
    }

    var visible: Bool = false {
        didSet {
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.updateOverlayVisibility(emitDismissEvent: !self.visible)
            }
        }
    }

    var onReactionSelected = EventDispatcher()
    var onDismiss = EventDispatcher()

    private var overlayView: BubbleReactionOverlayPresentationView?

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        backgroundColor = .clear
        clipsToBounds = false
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            if self.window == nil {
                self.removeOverlayIfNeeded(emitDismissEvent: false)
                return
            }

            self.updateOverlayVisibility(emitDismissEvent: false)
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        guard let overlayView = overlayView, let window = window else { return }

        overlayView.frame = window.bounds
        overlayView.sourceFrame = convert(bounds, to: window)
    }

    private var clampedOverlayOpacity: CGFloat {
        CGFloat(max(0, min(1, overlayOpacity)))
    }

    private func updateOverlayVisibility(emitDismissEvent: Bool) {
        if visible {
            showOverlayIfNeeded()
        } else {
            removeOverlayIfNeeded(emitDismissEvent: emitDismissEvent)
        }
    }

    private func showOverlayIfNeeded() {
        guard let window = window, !bounds.isEmpty else { return }

        if let overlayView = overlayView {
            overlayView.frame = window.bounds
            overlayView.sourceFrame = convert(bounds, to: window)
            overlayView.emojis = emojis
            overlayView.overlayOpacity = clampedOverlayOpacity
            window.bringSubviewToFront(overlayView)
            return
        }

        let snapshot = snapshotView(afterScreenUpdates: true)
            ?? snapshotView(afterScreenUpdates: false)
            ?? UIView(frame: bounds)

        let overlayView = BubbleReactionOverlayPresentationView(
            snapshot: snapshot,
            sourceFrame: convert(bounds, to: window),
            emojis: emojis,
            overlayOpacity: clampedOverlayOpacity
        )

        overlayView.frame = window.bounds
        overlayView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        overlayView.onReaction = { [weak self] emoji in
            self?.onReactionSelected(["emoji": emoji])
        }

        window.addSubview(overlayView)
        window.bringSubviewToFront(overlayView)
        overlayView.playEntranceAnimation()
        self.overlayView = overlayView
    }

    private func removeOverlayIfNeeded(emitDismissEvent: Bool) {
        guard let overlayView = overlayView else { return }

        overlayView.removeFromSuperview()
        self.overlayView = nil

        if emitDismissEvent {
            onDismiss([:])
        }
    }
}
