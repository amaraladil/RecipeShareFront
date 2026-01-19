const { appName } = useAppSettings()

export function pageTitle(title: string) {
  return `${title} | ${appName}`
}
