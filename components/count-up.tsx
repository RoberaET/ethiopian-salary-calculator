"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

interface CountUpProps {
    to: number
    from?: number
    direction?: "up" | "down"
    delay?: number
    duration?: number
    className?: string
    separator?: string
}

export default function CountUp({
    to,
    from = 0,
    direction = "up",
    delay = 0,
    duration = 2,
    className = "",
    separator = ",",
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(from)
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
        duration: duration * 1000,
    })
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    useEffect(() => {
        if (isInView) {
            motionValue.set(to)
        }
    }, [isInView, to, motionValue])

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(latest)
            }
        })
    }, [springValue])

    return <span className={className} ref={ref} />
}
