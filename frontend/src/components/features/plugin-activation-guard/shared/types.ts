export interface PluginInfo {
  additionalInfo?: Record<string, unknown>
  canInstallPlugins: boolean
  isActive: boolean
  isInstalled: boolean
  url: string
}
