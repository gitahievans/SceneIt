'use client';

import React from 'react'
import { useRouter } from 'next/navigation';

const WatchButton = ({ movieId }: { movieId: number }) => {
    const router = useRouter();
    return (
        <button onClick={() => router.push(`/watch/${movieId}`)} className="group/btn relative p-4 bg-transparent border border-white/20 md:bg-gradient-to-r from-gray-600 to-black rounded-xl md:rounded-2xl font-semibold text-white shadow-lg md:hover:shadow-orange-500/25 md:hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
        <span className='hidden md:block'>Watch Now</span>
        <span className='block md:hidden'>Watch</span>
    </div>
</button>
  )
}

export default WatchButton