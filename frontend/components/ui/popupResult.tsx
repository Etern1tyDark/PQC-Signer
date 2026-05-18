'use client'
import { motion } from "motion/react"
import { VerifyResponse } from "@/lib/types"
import { formatBytes, truncateMiddle } from "@/lib/formatters" 
import { AnimatePresence } from "motion/react"

interface ResultProps {
  result: VerifyResponse
  onClose: () => void 
}

export default function Result({ result, onClose }: ResultProps) {
  const isValid = result.valid && result.success

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-Space"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 p-8 shadow-2xl ${
            isValid 
              ? "bg-gradient-to-b from-green-900/40 to-black/90" 
              : "bg-gradient-to-b from-red-900/40 to-black/90"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            
            <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 ${
              isValid ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
            }`}>
              <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {isValid ? (
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="#22c55e" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                  />
                ) : (
                  <motion.path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="#ef4444" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                  />
                )}
              </svg>
            </div>

            <h2 className="mb-2 text-3xl font-bold text-white tracking-wide font-Akira">
              {isValid ? "VERIFIED" : "INVALID"}
            </h2>
            <p className="mb-8 text-white/80">
              {result.message}
            </p>

            {result.file_info && (
              <div className="w-full rounded-2xl bg-white/5 p-4 text-left border border-white/10">
                <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">File Details</h3>
                
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Filename</span>
                    <span className="font-mono text-white max-w-[150px] truncate">{result.file_info.filename}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/60">Size</span>
                    <span className="font-mono text-white">{formatBytes ? formatBytes(result.file_info.size) : `${result.file_info.size} B`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/60">Hash</span>
                    <span className="font-mono text-white" title={result.file_info.hash}>
                      {truncateMiddle ? truncateMiddle(result.file_info.hash, 12, 10) : result.file_info.hash.substring(0, 16) + '...'}
                    </span>
                  </div>
                  
                  {result.manifest?.algorithm && (
                    <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                      <span className="text-white/60">Algorithm</span>
                      <span className="font-bold text-amber-400">{result.manifest.algorithm}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-white py-3 font-bold text-black transition-colors hover:bg-gray-200"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}