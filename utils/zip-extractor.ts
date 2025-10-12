import { File } from 'expo-file-system'
import JSZip from 'jszip'

export async function extractWhatsAppZip(filePath: string): Promise<string | null> {
  try {
    console.log('Extracting ZIP file:', filePath)

    // Create a File object from the path
    const file = new File(filePath)

    // Load the ZIP file with JSZip using arrayBuffer
    const zip = new JSZip()
    let loadedZip: JSZip

    try {
      // Try loading as arrayBuffer first (most reliable)
      const arrayBuffer = await file.arrayBuffer()
      loadedZip = await zip.loadAsync(arrayBuffer)
    } catch (error) {
      console.log('ArrayBuffer load failed, trying base64...', error)
      // Fallback to base64 if arrayBuffer fails
      const base64Content = await file.base64()
      loadedZip = await zip.loadAsync(base64Content, { base64: true })
    }

    console.log('ZIP contents:', Object.keys(loadedZip.files))

    // Find .txt files in the ZIP
    const txtFiles = Object.keys(loadedZip.files).filter(
      (fileName) => fileName.toLowerCase().endsWith('.txt') && !loadedZip.files[fileName].dir
    )

    console.log('Found .txt files:', txtFiles)

    if (txtFiles.length === 0) {
      console.log('No .txt files found in ZIP')
      return null
    }

    // Get the first .txt file (should be the chat export)
    const txtFileName = txtFiles[0]
    const txtFile = loadedZip.files[txtFileName]

    // Extract the content as text
    const content = await txtFile.async('string')

    console.log('Successfully extracted chat content, length:', content.length)
    console.log('First 200 characters:', content.substring(0, 200))

    return content
  } catch (error) {
    console.error('Error extracting ZIP file:', error)
    return null
  }
}
