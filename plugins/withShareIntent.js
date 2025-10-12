const { withAndroidManifest } = require('@expo/config-plugins')

const withShareIntentPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults

    // Find the main activity
    const mainActivity = androidManifest.manifest.application[0].activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    )

    if (mainActivity) {
      // Add intent filter for receiving share intents
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = []
      }

      // Add share intent filter
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:mimeType': 'text/plain' } }],
      })

      // Add another for text/* mime types
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:mimeType': 'text/*' } }],
      })
    }

    return config
  })
}

module.exports = withShareIntentPlugin
