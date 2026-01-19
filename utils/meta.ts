export function pageTitle(title: string) {
  const { appName } = useAppSettings()

  return `${title} | ${appName}`
}
