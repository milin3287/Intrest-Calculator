import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-xs shrink-0"
        type="button"
        title="Install app on Android / Phone"
      >
        <span className="material-symbols-outlined text-[16px]">install_mobile</span>
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not fired by iOS WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-all border border-outline-variant/60 shrink-0"
          type="button"
          title="Install on iPhone / iPad"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">phone_iphone</span>
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl border border-surface-container-high flex flex-col gap-4 text-on-surface">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                      Install on iPhone / iPad
                    </h3>
                    <p className="text-2xs text-secondary">Add to Home Screen in 2 taps</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-secondary hover:bg-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs text-on-surface-variant">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-2xs">
                    1
                  </div>
                  <div>
                    Tap the <strong>Share</strong> button at the bottom toolbar of Safari (box with an upward arrow <span className="inline-block px-1 rounded bg-surface-container font-mono">⎋</span>).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-2xs">
                    2
                  </div>
                  <div>
                    Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (<span className="inline-block px-1 rounded bg-surface-container font-mono">⊞</span>), then tap <strong>Add</strong>.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-primary/10 text-primary text-2xs font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Works offline and launches in full-screen native mode!</span>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full h-10 rounded-xl bg-primary text-on-primary font-semibold text-xs transition-colors hover:bg-primary-container"
                type="button"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback if mobile or desktop allows manual bookmarking / app prompt
  if (isAndroid) {
    return (
      <button
        onClick={() => {
          alert("To install on Android: Tap the 3 dots (⋮) in Chrome, then tap 'Add to Home screen' or 'Install app'.");
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all border border-surface-container-high shrink-0"
        type="button"
      >
        <span className="material-symbols-outlined text-[16px] text-primary">android</span>
        <span>Install App</span>
      </button>
    );
  }

  return null;
};
