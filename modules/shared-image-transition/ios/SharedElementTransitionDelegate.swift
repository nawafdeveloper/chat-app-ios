import UIKit

public class SharedElementTransitionDelegate: NSObject, UIViewControllerAnimatedTransitioning {

  private let tag: String
  private let isPresenting: Bool
  private let duration: TimeInterval = 0.45

  // Stored so the interactive delegate can access the snapshot
  var snapshotView: UIView?
  var sourceView: UIView?
  var targetView: UIView?

  init(tag: String, isPresenting: Bool) {
    self.tag = tag
    self.isPresenting = isPresenting
  }

  // MARK: - UIViewControllerAnimatedTransitioning

  public func transitionDuration(using transitionContext: UIViewControllerContextTransitioning?) -> TimeInterval {
    return duration
  }

  public func animateTransition(using transitionContext: UIViewControllerContextTransitioning) {
    if isPresenting {
      animatePresent(using: transitionContext)
    } else {
      animateDismiss(using: transitionContext)
    }
  }

  // MARK: - Present (list → detail)

  private func animatePresent(using context: UIViewControllerContextTransitioning) {
    guard
      let toVC = context.viewController(forKey: .to),
      let fromVC = context.viewController(forKey: .from)
    else {
      context.completeTransition(false)
      return
    }

    let container = context.containerView

    // Add destination screen but keep it invisible for now
    toVC.view.frame = context.finalFrame(for: toVC)
    toVC.view.alpha = 0
    container.addSubview(toVC.view)

    // Force layout so target view has its final frame
    toVC.view.layoutIfNeeded()

    // Find source and target views
    guard
      let source = SharedElementRegistry.shared.sourceView(for: tag),
      let target = SharedElementRegistry.shared.targetView(for: tag, in: toVC.view)
    else {
      // No matching tag found — fall back to plain fade
      UIView.animate(withDuration: duration) {
        toVC.view.alpha = 1
      } completion: { _ in
        context.completeTransition(!context.transitionWasCancelled)
      }
      return
    }

    self.sourceView = source
    self.targetView = target

    // Get absolute frames relative to container
    let sourceFrame = source.convert(source.bounds, to: container)
    let targetFrame = target.convert(target.bounds, to: container)

    // Snapshot the source image
    guard let snapshot = source.snapshotView(afterScreenUpdates: false) else {
      context.completeTransition(false)
      return
    }

    // Hide real views during animation — the snapshot travels instead
    source.alpha = 0
    target.alpha = 0

    snapshot.frame = sourceFrame
    snapshot.clipsToBounds = true
    snapshot.layer.cornerRadius = source.layer.cornerRadius
    container.addSubview(snapshot)
    self.snapshotView = snapshot

    // Animate screen fade in slightly delayed
    UIView.animate(withDuration: duration * 0.6, delay: duration * 0.4) {
      toVC.view.alpha = 1
    }

    // Animate snapshot from source → target with spring
    let springTiming = UISpringTimingParameters(
      mass: 1.0,
      stiffness: 280,
      damping: 28,
      initialVelocity: .zero
    )
    let animator = UIViewPropertyAnimator(duration: duration, timingParameters: springTiming)

    animator.addAnimations {
      snapshot.frame = targetFrame
      snapshot.layer.cornerRadius = target.layer.cornerRadius
    }

    animator.addCompletion { _ in
      // Restore real views, remove snapshot
      source.alpha = 1
      target.alpha = 1
      snapshot.removeFromSuperview()
      context.completeTransition(!context.transitionWasCancelled)
      SharedElementRegistry.shared.clearPending()
    }

    animator.startAnimation()
  }

  // MARK: - Dismiss (detail → list)

  private func animateDismiss(using context: UIViewControllerContextTransitioning) {
    guard
      let toVC = context.viewController(forKey: .to),
      let fromVC = context.viewController(forKey: .from)
    else {
      context.completeTransition(false)
      return
    }

    let container = context.containerView

    toVC.view.frame = context.finalFrame(for: toVC)
    container.insertSubview(toVC.view, at: 0)
    toVC.view.layoutIfNeeded()

    guard
      let source = SharedElementRegistry.shared.targetView(for: tag, in: fromVC.view),
      let target = SharedElementRegistry.shared.sourceView(for: tag)
    else {
      // Fallback — plain fade out
      UIView.animate(withDuration: duration) {
        fromVC.view.alpha = 0
      } completion: { _ in
        fromVC.view.alpha = 1
        context.completeTransition(!context.transitionWasCancelled)
      }
      return
    }

    self.sourceView = source
    self.targetView = target

    let sourceFrame = source.convert(source.bounds, to: container)
    let targetFrame = target.convert(target.bounds, to: container)

    guard let snapshot = source.snapshotView(afterScreenUpdates: false) else {
      context.completeTransition(false)
      return
    }

    source.alpha = 0
    target.alpha = 0

    snapshot.frame = sourceFrame
    snapshot.clipsToBounds = true
    snapshot.layer.cornerRadius = source.layer.cornerRadius
    container.addSubview(snapshot)
    self.snapshotView = snapshot

    // Fade out the detail screen
    UIView.animate(withDuration: duration * 0.5) {
      fromVC.view.alpha = 0
    }

    let springTiming = UISpringTimingParameters(
      mass: 1.0,
      stiffness: 280,
      damping: 28,
      initialVelocity: .zero
    )
    let animator = UIViewPropertyAnimator(duration: duration, timingParameters: springTiming)

    animator.addAnimations {
      snapshot.frame = targetFrame
      snapshot.layer.cornerRadius = target.layer.cornerRadius
    }

    animator.addCompletion { _ in
      source.alpha = 1
      target.alpha = 1
      snapshot.removeFromSuperview()
      fromVC.view.alpha = 1
      context.completeTransition(!context.transitionWasCancelled)
    }

    animator.startAnimation()
  }
}