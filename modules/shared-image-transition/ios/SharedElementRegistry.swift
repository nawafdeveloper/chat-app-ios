import UIKit

private var sharedTagKey = "SharedElementTagKey"

class WeakViewRef {
  weak var view: UIView?
  let tag: String
  init(view: UIView, tag: String) {
    self.view = view
    self.tag = tag
  }
}

@objc public class SharedElementRegistry: NSObject {

  @objc public static let shared = SharedElementRegistry()
  private var registry: [String: WeakViewRef] = [:]
  private var pendingViewTags: [String: Int] = [:] // tag → RN viewTag
  private(set) var pendingTag: String? = nil

  private override init() {}

  @objc public func register(tag: String, view: UIView) {
    registry[tag] = WeakViewRef(view: view, tag: tag)
    pendingViewTags.removeValue(forKey: tag)
    objc_setAssociatedObject(view, &sharedTagKey, tag, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    print("[SharedElement] ✅ Registered tag: \(tag)")
  }

  @objc public func storePending(tag: String, viewTag: Int) {
    pendingViewTags[tag] = viewTag
  }

  // Try to resolve pending registrations — call this before transitioning
  @objc public func resolvePending(in rootView: UIView) {
    for (tag, viewTag) in pendingViewTags {
      if let view = findViewByTag(viewTag, in: rootView) {
        register(tag: tag, view: view)
        print("[SharedElement] ✅ Resolved pending tag: \(tag)")
      }
    }
  }

  private func findViewByTag(_ tag: Int, in view: UIView) -> UIView? {
    if view.tag == tag { return view }
    for subview in view.subviews {
      if let found = findViewByTag(tag, in: subview) { return found }
    }
    return nil
  }

  @objc public func unregister(tag: String) {
    registry.removeValue(forKey: tag)
    pendingViewTags.removeValue(forKey: tag)
  }

  @objc public func prepare(tag: String) {
    pendingTag = tag
  }

  @objc public func clearPending() {
    pendingTag = nil
  }

  @objc public func sourceView(for tag: String) -> UIView? {
    return registry[tag]?.view
  }

  @objc public func targetView(for tag: String, in rootView: UIView) -> UIView? {
    // Try registry first
    if let view = registry[tag]?.view { return view }
    // Try finding by tree traversal using stamped tag
    return findByStampedTag(tag, in: rootView)
  }

  private func findByStampedTag(_ tag: String, in view: UIView) -> UIView? {
    if let stamped = objc_getAssociatedObject(view, &sharedTagKey) as? String,
       stamped == tag {
      return view
    }
    for subview in view.subviews {
      if let found = findByStampedTag(tag, in: subview) { return found }
    }
    return nil
  }
}