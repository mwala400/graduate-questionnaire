import libre from 'libreoffice-convert';
import { promisify } from 'util';

const convertAsync = promisify(libre.convert) as (buf: Buffer, ext: string, filter: undefined) => Promise<Buffer>;

/**
 * Converts a DOCX buffer to PDF using LibreOffice (via the `libreoffice-convert`
 * npm wrapper, which shells out to `soffice --headless`). Because the PDF is
 * produced by converting the exact DOCX we generate, formatting, logos, and
 * layout are guaranteed to match between the two downloadable formats.
 *
 * Requires LibreOffice to be installed on the host machine — see README.md.
 */
export async function docxBufferToPdf(docxBuffer: Buffer): Promise<Buffer> {
  return convertAsync(docxBuffer, '.pdf', undefined);
}
