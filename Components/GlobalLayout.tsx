"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar';

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-gray-50">
            {!pathname.includes('details') && <Navbar />}
            {children}
        </div>
        // dark:bg-gray-900
    )
}

export default GlobalLayout;