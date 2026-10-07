export const MAX_CERT_BYTES = 100 * 1024

/** Same limits as nexo-bk's StoreCertificateRequest (p12/pfx, max 100 KB). */
export function validateCertificateFile(file: { name: string; size: number }): string | undefined {
  if (!/\.(p12|pfx)$/i.test(file.name)) return 'Choose a .p12 or .pfx file.'
  if (file.size > MAX_CERT_BYTES) return 'The file is larger than 100 KB.'
  return undefined
}
