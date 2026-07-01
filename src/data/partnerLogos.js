const logoPaths = Object.keys(
  import.meta.glob('../../public/scroll/*.{jpg,jpeg,png,webp,svg}', {
    eager: true,
  }),
)

function publicUrlFromModulePath(modulePath) {
  const match = modulePath.match(/public\/(.+)$/)
  return match ? `/${match[1]}` : modulePath
}

function formatPartnerName(filePath) {
  const fileName = filePath.split('/').pop() ?? filePath
  const baseName = fileName.replace(/\.[^.]+$/, '')

  return baseName
    .replace(/^\d+/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
}

export const partnerLogos = logoPaths
  .map((path) => {
    const name = formatPartnerName(path)
    return {
      src: publicUrlFromModulePath(path),
      alt: name ? `${name} logo` : 'Financial partner logo',
    }
  })
  .sort((a, b) => a.alt.localeCompare(b.alt))
