"use client"

import * as motion from "motion/react-client"

export default function HeroPage() {

  return (
    <div id='hero' className="relative h-screen w-full overflow-hidden cursor-default">

      <motion.div className="relative z-10 flex flex-col h-full w-full items-center justify-center text-white gap-3 sm:gap-4 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: 1,
            scale: 1.05
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-5xl sm:text-7xl md:text-8xl font-Akira leading-tight"
        >
          Q-Sealnet
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
          className="text-lg sm:text-2xl md:text-3xl font-Space"
        >
          Post-Quantum Signing Workbench
        </motion.div>
      </motion.div>

    </div>
  )
}
