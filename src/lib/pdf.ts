import fs from 'fs/promises';
import path from 'path';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

// Promisify libre.convert so that we can await it.
const libreConvertAsync = promisify(libre.convert);

// Set LibreOffice path for Windows
if (process.platform === 'win32') {
  process.env.LIBREOFFICE_PATH = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
}

/**
 * Reads a DOCX template (from templatePath), replaces placeholders (using a simple replaceAll) with provided form data, writes the filled DOCX (using fs.promises.writeFile) to a temporary file (e.g. /tmp/filled.docx), then calls libreoffice-convert (via libreConvertAsync) to convert the filled DOCX into a PDF (saved as a buffer). Finally, it deletes the temporary filled DOCX (using fs.promises.unlink) and returns the PDF buffer.
 * (Note: This assumes that LibreOffice is installed on the system and that the environment variable (e.g. PROGRAMFILES) is set so that libreoffice-convert can locate the LibreOffice executable.)
 * (Also, the DOCX template is assumed to contain placeholders (e.g. {{name}}, {{email}}) that are replaced by the provided form data.)
 *
 * @param {string} templatePath – The (absolute or relative) path to the DOCX template file.
 * (For example, if your template is in “/resources/rental.docx” (relative to the project root), you might pass “/resources/rental.docx”.)
 * (If you pass a relative path, it is resolved relative to the current working directory (process.cwd()).)
 * (If you pass an absolute path (e.g. “C:/Users/…/rental.docx”), it is used as is.)
 * (If the file does not exist, an error is thrown.)
 * (If the file is not a DOCX (or if libreoffice-convert cannot read it), an error is thrown.)
 *
 * @param {Record<string, string>} formData – An object (or “Record”) whose keys are the placeholder names (without the “{{” and “}}”) and whose values are the replacement strings. (For example, if your template contains “{{name}}” and “{{email}}”, you might pass { name: “John Doe”, email: “john@example.com” }.)
 * (If a placeholder (e.g. “{{unknown}}”) is not provided in formData, it is left unchanged.)
 *
 * @param {string} [outputExt] – (Optional) The desired output extension (e.g. “.pdf”). (If not provided, “.pdf” is used.)
 *
 * @returns {Promise<Buffer>} – A promise that resolves to a Buffer (i.e. the PDF file’s contents) if conversion is successful. (If an error occurs (e.g. LibreOffice is not installed, or the conversion fails), the promise rejects with an error.)
 *
 * @example
 * (Assume that “/resources/rental.docx” is a DOCX template containing “{{name}}” and “{{email}}”.)
 * const pdfBuffer = await generatePDF(“/resources/rental.docx”, { name: “John Doe”, email: “john@example.com” });
 * // pdfBuffer is a Buffer (i.e. the PDF file’s contents) (e.g. you can write it to a file or send it as a download).
 */
export async function generatePDF(templatePath: string, formData: Record<string, string>, outputExt: string = ".pdf"): Promise< Buffer > {
  // Resolve the template path (if relative, it is resolved relative to process.cwd()).
  const resolvedTemplatePath = path.resolve(templatePath);
  // Read the DOCX template (as a Buffer).
  const docxBuf = await fs.readFile(resolvedTemplatePath);
  // Convert the Buffer to a string (using utf-8 encoding) so that we can replace placeholders.
  let docxStr = docxBuf.toString("utf-8");
  // Iterate over the keys (i.e. placeholder names) in formData and replace “{{key}}” with “value” (using replaceAll).
  for (const [key, value] of Object.entries(formData)) {
    docxStr = docxStr.replace(new RegExp("{{" + key + "}}", "g"), value);
  }
  // Convert the filled DOCX (as a string) back to a Buffer (using utf-8 encoding).
  const filledDocxBuf = Buffer.from(docxStr, "utf-8");
  // (Optional) Write the filled DOCX (filledDocxBuf) to a temporary file (e.g. “/tmp/filled.docx”) (using fs.promises.writeFile) (so that you can inspect it if needed). (If you do not need a temporary file, you can skip this step.)
  const tmpFilledDocxPath = path.join(process.cwd(), "tmp", "filled.docx");
  await fs.mkdir(path.dirname(tmpFilledDocxPath), { recursive: true });
  await fs.writeFile(tmpFilledDocxPath, filledDocxBuf, { flag: "w" });
  // Call libreoffice-convert (via libreConvertAsync) to convert the filled DOCX (filledDocxBuf) into a PDF (saved as a buffer). (Note: libreConvertAsync expects a Buffer (filledDocxBuf), an output extension (outputExt), and an optional “filter” (undefined in our case).)
  const pdfBuf = await libreConvertAsync(filledDocxBuf, outputExt, undefined);
  // (Optional) Delete the temporary filled DOCX (using fs.promises.unlink) (so that you do not leave a “filled.docx” lying around). (If you did not write a temporary file, you can skip this step.)
  await fs.unlink(tmpFilledDocxPath);
  // Return the PDF buffer (i.e. the PDF file’s contents).
  return pdfBuf;
} 