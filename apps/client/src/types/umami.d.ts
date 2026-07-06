interface UmamiTracker {
  track: (
    event?: string | ((props: Record<string, unknown>) => Record<string, unknown>),
    data?: Record<string, unknown>,
  ) => void;
}

interface Window {
  umami?: UmamiTracker;
}

interface ImportMetaEnv {
  readonly VITE_UMAMI_SCRIPT_URL?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
