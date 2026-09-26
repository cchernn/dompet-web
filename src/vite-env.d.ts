/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REGION: string
    readonly VITE_COGNITO_USERPOOLID: string
    readonly VITE_COGNITO_CLIENTID: string
    readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
