'use client'
import FileDropzone from "@/components/ui/file-dropzone"
import Glass from "@/components/ui/glassmorphism/glassMorph"
import { KeyInfo, ToastType, VerifyPatchedResponse } from "@/lib/types"
import { apiForm } from "@/lib/api" 
import { motion } from "motion/react"
import { FormEvent, useState } from "react"
import Result from "@/components/ui/popupResult"

interface EmbedVerifyFormState {
  file: File | null
}

interface EmbedVerifyProps {
    keysData: Record<string, KeyInfo>
    pushToast: (type: ToastType, message: string) => void
}

export default function EmbedVerify({ pushToast }: EmbedVerifyProps){

    const [embedSign, setEmbedForm] = useState<EmbedVerifyFormState>({ file: null })
    const [busyAction, setBusyAction] = useState(false)
    const [verifyResult, setVerifyResult] = useState<any | null>(null)

    const handleVerifyEmbed = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        
        if (!embedSign.file) {
            pushToast('error', 'Choose a patched binary first.')
            return
        }

        setBusyAction(true)
        setVerifyResult(null)

        try {
            const formData = new FormData()
            formData.append('file', embedSign.file)

            const response = await apiForm<VerifyPatchedResponse>('/verify-patched-binary', formData)
            
            setVerifyResult(response)
            pushToast(response.valid ? 'success' : 'warning', response.message)
            
        } catch (error) {
            const message = error instanceof Error ? error.message : "Verification failed"
            pushToast('error', message)
        } finally {
            setBusyAction(false)
        }
    }
    
    return(
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <h1>Embedded Verification</h1>

                <Glass className="mt-3 p-3">
                    <form onSubmit={handleVerifyEmbed}>
                        <h2>Verify a Patched Binary</h2>
                        <p className="text-xs mt-1">
                            Extracts the appended manifest block, recomputes the original file hash, and verifies the ML-DSA Signature
                        </p>

                        <div className="sections-1">
                            <FileDropzone 
                                label="Upload Patched Binary"
                                file={embedSign.file}
                                onFileSelect={(file) => setEmbedForm({ file })}
                                className="h-48"
                            />
                        </div>

                        <motion.button 
                            className="h-10 w-full bg-white text-black mt-4 rounded-xl font-bold" 
                            type="submit"
                            disabled={busyAction}
                            whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                            whileTap={{ scale: busyAction ? 1 : 0.95 }}
                        >
                            {busyAction ? 'Verifying...' : 'Verify Embedded Signature'}
                        </motion.button>
                    </form>
                </Glass>
            </motion.div>

            {verifyResult && (
                 <Result 
                     result={verifyResult} 
                     onClose={() => setVerifyResult(null)} 
                 />
            )}
        </>
    )
}