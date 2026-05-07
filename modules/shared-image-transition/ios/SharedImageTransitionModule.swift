import ExpoModulesCore
import UIKit

// MARK: - Module

public class SharedImageTransitionModule: Module {

  public required init(appContext: AppContext) {
    super.init(appContext: appContext)
    Self.installObserver()
  }

  private static var observerInstalled = false

  // Instead of swizzling, observe when navigation controllers appear
  // and inject our delegate then
  private static func installObserver() {
    guard !observerInstalled else { return }
    observerInstalled = true

    NotificationCenter.default.addObserver(
      SharedElementNavigationInjector.shared,
      selector: #selector(SharedElementNavigationInjector.onScreenDidAppear(_:)),
      name: NSNotification.Name("RNSNavigationControllerDidShowViewController"),
      object: nil
    )

    // Fallback: poll for RNSNavigationController on first transition
    print("[SharedElement] Observer installed")
  }

  public func definition() -> ModuleDefinition {

    Name("SharedImageTransition")

    Function("registerTag") { (tag: String, viewTag: Int) in
  DispatchQueue.main.async {
    guard let view = Self.findView(withTag: viewTag) else {
      // Store pending registration — view might not be in hierarchy yet
      SharedElementRegistry.shared.storePending(tag: tag, viewTag: viewTag)
      print("[SharedElement] View not found yet, stored pending for tag: \(tag) viewTag: \(viewTag)")
      return
    }
    SharedElementRegistry.shared.register(tag: tag, view: view)
    print("[SharedElement] Registered tag: \(tag) for viewTag: \(viewTag)")
  }
}

    Function("unregisterTag") { (tag: String) in
      DispatchQueue.main.async {
        SharedElementRegistry.shared.unregister(tag: tag)
      }
    }

    // Called right before router.push() from JS
    Function("prepareTransition") { (tag: String) in
      DispatchQueue.main.async {
        SharedElementRegistry.shared.prepare(tag: tag)
        // Inject our delegate into the active RNSNavigationController NOW
        SharedElementNavigationInjector.shared.injectIfNeeded()
        print("[SharedElement] Prepared transition for tag: \(tag)")
      }
    }
  }

  static func findView(withTag tag: Int) -> UIView? {
  guard let window = UIApplication.shared.connectedScenes
    .compactMap({ $0 as? UIWindowScene })
    .flatMap({ $0.windows })
    .first(where: { $0.isKeyWindow })
  else { return nil }

  return findViewByReactTag(tag: tag, in: window)
}

// In Fabric, react tags are stored in accessibilityIdentifier or nativeID
// We store it ourselves via a lookup table instead
private static func findViewByReactTag(tag: Int, in view: UIView) -> UIView? {
  // Check accessibilityIdentifier which Fabric uses for react tag
  if let identifier = view.accessibilityIdentifier,
     identifier == "__rnTag_\(tag)" {
    return view
  }
  // Also check the raw tag (old arch fallback)
  if view.tag == tag { return view }

  for subview in view.subviews {
    if let found = findViewByReactTag(tag: tag, in: subview) {
      return found
    }
  }
  return nil
}
}

// MARK: - Injector (finds RNSNavigationController and sets our delegate)

class SharedElementNavigationInjector: NSObject {

  static let shared = SharedElementNavigationInjector()
  private weak var injectedNavController: UINavigationController?
  private var ourDelegate: SharedElementNavigationDelegate?

  @objc func onScreenDidAppear(_ notification: Notification) {
    injectIfNeeded()
  }

  func injectIfNeeded() {
    guard let navController = findRNSNavigationController() else {
      print("[SharedElement] Could not find RNSNavigationController")
      return
    }

    // Already injected into this nav controller
    if navController === injectedNavController {
      print("[SharedElement] Delegate already injected")
      return
    }

    let original = navController.delegate
    // Don't wrap our own delegate
    if original is SharedElementNavigationDelegate { return }

    let delegate = SharedElementNavigationDelegate(
      original: original,
      navigationController: navController
    )
    ourDelegate = delegate
    injectedNavController = navController

    // Directly set — no swizzle needed
    navController.delegate = delegate
    print("[SharedElement] Delegate injected into \(type(of: navController))")
  }

  private func findRNSNavigationController() -> UINavigationController? {
    guard let window = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .flatMap({ $0.windows })
      .first(where: { $0.isKeyWindow }),
      let rootVC = window.rootViewController
    else { return nil }

    return findNavController(in: rootVC)
  }

  private func findNavController(in vc: UIViewController) -> UINavigationController? {
    let targetClass: AnyClass? = NSClassFromString("RNSNavigationController")

    if let cls = targetClass, vc.isKind(of: cls) {
      return vc as? UINavigationController
    }

    for child in vc.children {
      if let found = findNavController(in: child) {
        return found
      }
    }

    if let nav = vc as? UINavigationController {
      return nav
    }

    return nil
  }
}

// MARK: - Navigation Delegate Wrapper

class SharedElementNavigationDelegate: NSObject, UINavigationControllerDelegate {

  private weak var originalDelegate: UINavigationControllerDelegate?
  private weak var navigationController: UINavigationController?
  private var transitionDelegate: SharedElementTransitionDelegate?
  private var interactiveDelegate: SharedElementInteractiveDelegate?

  init(original: UINavigationControllerDelegate?, navigationController: UINavigationController) {
    self.originalDelegate = original
    self.navigationController = navigationController
    super.init()
  }

  func navigationController(
    _ navigationController: UINavigationController,
    animationControllerFor operation: UINavigationController.Operation,
    from fromVC: UIViewController,
    to toVC: UIViewController
  ) -> UIViewControllerAnimatedTransitioning? {

    guard let tag = SharedElementRegistry.shared.pendingTag else {
      return originalDelegate?.navigationController?(
        navigationController,
        animationControllerFor: operation,
        from: fromVC,
        to: toVC
      )
    }

    let isPresenting = operation == .push
    let animator = SharedElementTransitionDelegate(tag: tag, isPresenting: isPresenting)
    self.transitionDelegate = animator
    return animator
  }

  func navigationController(
    _ navigationController: UINavigationController,
    interactionControllerFor animationController: UIViewControllerAnimatedTransitioning
  ) -> UIViewControllerInteractiveTransitioning? {

    guard let interactive = interactiveDelegate, interactive.isInteractive else {
      return originalDelegate?.navigationController?(
        navigationController,
        interactionControllerFor: animationController
      )
    }
    return interactive
  }

  func navigationController(
    _ navigationController: UINavigationController,
    didShow viewController: UIViewController,
    animated: Bool
  ) {
    if SharedElementRegistry.shared.pendingTag != nil {
      let interactive = SharedElementInteractiveDelegate(viewController: viewController)
      self.interactiveDelegate = interactive
    }

    originalDelegate?.navigationController?(
      navigationController,
      didShow: viewController,
      animated: animated
    )
  }

  func navigationController(
    _ navigationController: UINavigationController,
    willShow viewController: UIViewController,
    animated: Bool
  ) {
    originalDelegate?.navigationController?(
      navigationController,
      willShow: viewController,
      animated: animated
    )
  }

  override func responds(to aSelector: Selector!) -> Bool {
    if super.responds(to: aSelector) { return true }
    return originalDelegate?.responds(to: aSelector) ?? false
  }

  override func forwardingTarget(for aSelector: Selector!) -> Any? {
    if originalDelegate?.responds(to: aSelector) == true {
      return originalDelegate
    }
    return nil
  }
}