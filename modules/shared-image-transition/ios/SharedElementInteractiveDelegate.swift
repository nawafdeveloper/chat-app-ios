import UIKit

public class SharedElementInteractiveDelegate: UIPercentDrivenInteractiveTransition {

  // Whether a gesture is currently driving the transition
  var isInteractive = false

  private weak var viewController: UIViewController?
  private var panGesture: UIPanGestureRecognizer?

  // The snapshot being dragged — handed to us from the transition delegate
  weak var snapshotView: UIView?
  private var snapshotStartFrame: CGRect = .zero

  // Track velocity for commit/cancel decision
  private var lastVelocity: CGPoint = .zero

  init(viewController: UIViewController) {
    self.viewController = viewController
    super.init()
    self.completionCurve = .easeOut
    setupGesture()
  }

  private func setupGesture() {
    let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
    pan.maximumNumberOfTouches = 1
    viewController?.view.addGestureRecognizer(pan)
    self.panGesture = pan
  }

  @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
    guard let view = gesture.view else { return }

    let translation = gesture.translation(in: view)
    let velocity = gesture.velocity(in: view)
    self.lastVelocity = velocity

    switch gesture.state {

    case .began:
      // Only trigger if dragging downward
      guard velocity.y > 0 && abs(velocity.y) > abs(velocity.x) else { return }
      isInteractive = true
      viewController?.navigationController?.popViewController(animated: true)

    case .changed:
      guard isInteractive else { return }
      // Progress 0→1 over 400pt of drag
      let progress = min(max(translation.y / 400, 0), 1)
      update(progress)

    case .ended, .cancelled:
      guard isInteractive else { return }
      isInteractive = false

      let shouldComplete = lastVelocity.y > 300 || percentComplete > 0.4

      if shouldComplete {
        finish()
      } else {
        // Snap back with spring feel
        completionSpeed = 0.8
        cancel()
      }

    default:
      break
    }
  }
}