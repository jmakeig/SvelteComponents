# Force Chrome to use a specific locale, not that of the host OS

# Set to a locale
defaults write com.google.Chrome AppleLanguages '("ja-JP")'

# Reset
defaults delete com.google.Chrome AppleLanguages

