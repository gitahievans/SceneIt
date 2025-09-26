"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Common/Navbar';

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {!pathname.includes('details') && <Navbar />}
            <div className={pathname.includes('details') ? 'mt-0' : 'mt-8'}>
                {children}
            </div>
        </div>
    )
}

export default GlobalLayout;