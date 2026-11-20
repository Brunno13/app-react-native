'use strict';

const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

// ARN-1: temporary compatibility for Expo SDK 56 with the iOS 27 SDK.
// Remove this plugin when upgrading to a Scene-aware Expo template.
const MARKER = '// ARN-1: iOS UIScene lifecycle';
const WINDOW_PROPERTY = '  var window: UIWindow?\n';
const WINDOW_CREATION = /^([ \t]*)window = UIWindow\(frame: UIScreen\.main\.bounds\)[ \t]*\r?\n/m;
const REACT_NATIVE_START = /^[ \t]*factory\.startReactNative\(\r?\n[ \t]*withModuleName: "main",\r?\n[ \t]*in: window,\r?\n[ \t]*launchOptions: launchOptions\)[ \t]*\r?\n/m;

const SCENE_DELEGATE = `
${MARKER}
final class ARNSceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate? {
    UIApplication.shared.delegate as? AppDelegate
  }

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = appDelegate,
          let factory = appDelegate.reactNativeFactory else {
      assertionFailure("ARNSceneDelegate: could not initialize the React Native window")
      return
    }

    let sceneWindow = UIWindow(windowScene: windowScene)
    window = sceneWindow
    // Expo/React Native dependencies may still access AppDelegate.window.
    appDelegate.window = sceneWindow

    var launchOptions = appDelegate.sceneLaunchOptions ?? [:]

    // Preserve Linking.getInitialURL for cold starts under the scene lifecycle.
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions[UIApplication.LaunchOptionsKey(rawValue: "UIApplicationLaunchOptionsURLKey")] = url
    }
    if let activity = connectionOptions.userActivities.first(where: {
      $0.activityType == NSUserActivityTypeBrowsingWeb
    }) {
      launchOptions[UIApplication.LaunchOptionsKey(rawValue: "UIApplicationLaunchOptionsUserActivityDictionaryKey")] = [
        "UIApplicationLaunchOptionsUserActivityTypeKey": activity.activityType,
        "UIApplicationLaunchOptionsUserActivityKey": activity
      ]
    }

    factory.startReactNative(
      withModuleName: "main",
      in: sceneWindow,
      launchOptions: launchOptions
    )

    // Go through ExpoAppDelegate, not RCTLinkingManager directly, so
    // Expo Linking / Router subscribers also receive the events.
    for context in connectionOptions.urlContexts { forward(context) }
    for activity in connectionOptions.userActivities { forward(activity) }
  }

  func scene(_ scene: UIScene, openURLContexts contexts: Set<UIOpenURLContext>) {
    for context in contexts { forward(context) }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    forward(userActivity)
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    appDelegate?.applicationDidBecomeActive(UIApplication.shared)
  }

  func sceneWillResignActive(_ scene: UIScene) {
    appDelegate?.applicationWillResignActive(UIApplication.shared)
  }

  func sceneWillEnterForeground(_ scene: UIScene) {
    appDelegate?.applicationWillEnterForeground(UIApplication.shared)
  }

  func sceneDidEnterBackground(_ scene: UIScene) {
    appDelegate?.applicationDidEnterBackground(UIApplication.shared)
  }

  func sceneDidDisconnect(_ scene: UIScene) {
    window = nil
  }

  private func forward(_ context: UIOpenURLContext) {
    var options: [UIApplication.OpenURLOptionsKey: Any] = [
      .openInPlace: context.options.openInPlace
    ]
    if let source = context.options.sourceApplication {
      options[.sourceApplication] = source
    }
    _ = appDelegate?.application(UIApplication.shared, open: context.url, options: options)
  }

  private func forward(_ activity: NSUserActivity) {
    _ = appDelegate?.application(
      UIApplication.shared,
      continue: activity,
      restorationHandler: { _ in }
    )
  }
}
`;

function replaceAppDelegate(contents) {
  if (contents.includes(MARKER)) return contents;

  const requirements = [
    [WINDOW_PROPERTY, 'AppDelegate.window'],
    [WINDOW_CREATION, 'UIWindow(frame: UIScreen.main.bounds)'],
    [REACT_NATIVE_START, 'factory.startReactNative'],
    ['RCTLinkingManager.application(app, open: url, options: options)', 'URL linking override'],
    ['RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)', 'universal link override'],
  ];
  for (const [needle, description] of requirements) {
    const matched = typeof needle === 'string' ? contents.includes(needle) : needle.test(contents);
    if (!matched) {
      throw new Error(`ARN-1 UIScene: Expo AppDelegate template changed (${description}).`);
    }
  }
  const countMatches = (pattern) =>
    [...contents.matchAll(new RegExp(pattern.source, 'gm'))].length;
  if (countMatches(WINDOW_CREATION) !== 1 ||
      countMatches(REACT_NATIVE_START) !== 1) {
    throw new Error('ARN-1 UIScene: ambiguous AppDelegate startup; aborting patch.');
  }

  const updated = contents
    .replace(WINDOW_PROPERTY,
      `${WINDOW_PROPERTY}  var sceneLaunchOptions: [UIApplication.LaunchOptionsKey: Any]?\n`)
    .replace(WINDOW_CREATION, (_match, indentation) =>
      `${indentation}sceneLaunchOptions = launchOptions\n`)
    .replace(REACT_NATIVE_START, '');
  return updated + SCENE_DELEGATE;
}

const SCENE_MANIFEST = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).ARNSceneDelegate',
      },
    ],
  },
};

module.exports = function withIosSceneLifecycle(config) {
  config = withAppDelegate(config, (props) => {
    if (props.modResults.language !== 'swift') {
      throw new Error('ARN-1 UIScene: expected Swift AppDelegate.');
    }
    props.modResults.contents = replaceAppDelegate(props.modResults.contents);
    return props;
  });

  return withInfoPlist(config, (props) => {
    const current = props.modResults.UIApplicationSceneManifest;
    if (current && JSON.stringify(current) !== JSON.stringify(SCENE_MANIFEST)) {
      throw new Error('ARN-1 UIScene: an incompatible scene manifest already exists.');
    }
    props.modResults.UIApplicationSceneManifest = SCENE_MANIFEST;
    return props;
  });
};

// Export for local deterministic tests without changing the Expo config contract.
module.exports.replaceAppDelegate = replaceAppDelegate;
