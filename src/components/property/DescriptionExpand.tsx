"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_CHARS = 300

interface Props {
  text: string
}

export function DescriptionExpand({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const needsExpand = text.length > MAX_CHARS

  const shown = !needsExpand || expanded ? text : text.slice(0, MAX_CHARS) + "…"

  return (
    <div>
      <AnimatePresence initial={false}>
        <motion.p
          key={expanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground font-sans leading-relaxed text-sm lg:text-base"
        >
          {shown}
        </motion.p>
      </AnimatePresence>

      {needsExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1.5 text-sm font-sans text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
        >
          {expanded ? "Mostrar menos" : "Mostrar mais"}
          <ChevronDown
            size={14}
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>
      )}
    </div>
  )
}
