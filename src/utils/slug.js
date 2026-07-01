const RESERVED_SLUGS = new Set([
  'admin',
  'login',
  'ranking',
  'solicitar-acesso',
  'recuperar-senha',
  'redefinir-senha',
  'auth',
  'api',
])

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function generateSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(String(slug || '').toLowerCase())
}

export function isValidSlug(slug) {
  const normalizedSlug = String(slug || '')

  return SLUG_PATTERN.test(normalizedSlug) && !isReservedSlug(normalizedSlug)
}

export function getSlugValidationError(slug) {
  if (!slug) return ''

  if (!SLUG_PATTERN.test(slug)) {
    return 'Use apenas letras minúsculas, números e hífens na URL pública.'
  }

  if (isReservedSlug(slug)) {
    return 'Essa URL pública é reservada. Escolha outra.'
  }

  return ''
}
