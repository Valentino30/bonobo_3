import { type StoredChat } from '@/services/chat-storage'
import { extractWhatsAppZip } from '@/utils/zip-extractor'
import { parseWhatsAppChat } from '@/utils/whatsapp-parser'
import { useEffect } from 'react'

export type ShareDataProcessorCallbacks = {
  onSuccess: (participantNames: string, messageCount: number) => void
  onZipExtractionFailed: () => void
  onZipProcessingError: () => void
  onNoTextData: () => void
  addChat: (chat: StoredChat) => Promise<void>
  clearShareData: () => void
}

type ShareData = {
  text?: string
  files?: string[]
}

/**
 * Custom hook that processes shared WhatsApp chat data (text or ZIP files)
 * Separates complex share processing logic from UI components
 */
export function useShareDataProcessor(
  shareData: ShareData | null,
  hasShareData: boolean,
  callbacks: ShareDataProcessorCallbacks
) {
  useEffect(() => {
    const processShareData = async () => {
      if (!hasShareData) {
        return
      }

      // Handle text-based WhatsApp exports
      if (shareData?.text) {
        await processTextShare(shareData.text, callbacks)
        return
      }

      // Handle ZIP file exports
      if (shareData?.files && shareData.files.length > 0) {
        await processZipShare(shareData.files[0], callbacks)
        return
      }

      // Handle invalid share data
      if (!shareData || !shareData.text) {
        console.log('Share intent detected but no text data:', shareData)
        callbacks.onNoTextData()
      }
    }

    processShareData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareData])
}

/**
 * Process text-based WhatsApp chat exports
 */
async function processTextShare(text: string, callbacks: ShareDataProcessorCallbacks): Promise<void> {
  console.log('🟢 Processing share data:', text.substring(0, 100) + '...')

  const parsedData = parseWhatsAppChat(text)
  console.log('Parsed data:', parsedData)

  const chatId = Date.now().toString()
  const newChat: StoredChat = {
    id: chatId,
    text,
    timestamp: new Date(),
    participants: parsedData.participants,
    messageCount: parsedData.messageCount,
  }

  console.log('🔵 About to add chat to database:', {
    chatId,
    participants: parsedData.participants,
    timestamp: new Date().toISOString(),
  })

  await callbacks.addChat(newChat)

  console.log('🟢 Chat added to database successfully:', {
    chatId,
    timestamp: new Date().toISOString(),
  })

  const participantNames =
    parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

  callbacks.onSuccess(participantNames, parsedData.messageCount)
}

/**
 * Process ZIP file WhatsApp exports
 */
async function processZipShare(zipFilePath: string, callbacks: ShareDataProcessorCallbacks): Promise<void> {
  console.log('🟢 ZIP file detected:', zipFilePath)

  try {
    console.log('Attempting to extract ZIP file:', zipFilePath)

    const extractedContent = await extractWhatsAppZip(zipFilePath)

    if (!extractedContent) {
      callbacks.onZipExtractionFailed()
      return
    }

    console.log('Successfully extracted content from ZIP')

    const parsedData = parseWhatsAppChat(extractedContent)
    console.log('Parsed ZIP data:', parsedData)

    const newChat: StoredChat = {
      id: Date.now().toString(),
      text: extractedContent,
      timestamp: new Date(),
      participants: parsedData.participants,
      messageCount: parsedData.messageCount,
    }

    await callbacks.addChat(newChat)

    const participantNames =
      parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

    callbacks.onSuccess(participantNames, parsedData.messageCount)
  } catch (error) {
    console.error('Error processing ZIP file:', error)
    callbacks.onZipProcessingError()
  }
}
