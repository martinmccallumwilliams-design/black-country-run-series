"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const [activeTab, setActiveTab] = useState(items[0].name)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div
            className={cn(
                "fixed bottom-0 sm:top-5 left-1/2 -translate-x-1/2 z-[60] mb-6 sm:mt-2",
                className,
            )}
        >
            <div className="flex items-center gap-2 sm:gap-3 bg-black/60 border border-white/10 backdrop-blur-lg py-1 px-1 rounded-full shadow-2xl">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <a
                            key={item.name}
                            href={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative flex items-center justify-center cursor-pointer text-sm font-semibold px-4 py-2 sm:px-6 rounded-full transition-colors duration-300",
                                "text-gray-400 hover:text-white",
                                isActive && "bg-white/5 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]",
                            )}
                        >
                            <span className="hidden md:inline">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-brand-red/5 rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-red rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-brand-red/30 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-brand-red/30 rounded-full blur-md -top-1" />
                                        <div className="absolute w-4 h-4 bg-brand-red/30 rounded-full blur-sm top-0 left-2" />
                                    </div>
                                </motion.div>
                            )}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
