import React from 'react'
import { Video } from '@/types/types';
import { ChevronDown, Filter } from 'lucide-react';

const VideoPlayList = ({ videos,
    selectedVideo,
    setSelectedVideo,
    setShowTypeFilter,
    showTypeFilter,
    selectedType,
    setSelectedType,
    videoTypes,
    filteredVideos,
    handleTypeFilter,
    handleVideoSelect
}:
    {
        videos: Video[],
        selectedVideo: number,
        setSelectedVideo: (index: number) => void,
        setShowTypeFilter: (show: boolean) => void,
        showTypeFilter: boolean,
        selectedType: string,
        setSelectedType: (type: string) => void,
        videoTypes: string[],
        filteredVideos: Video[],
        handleTypeFilter: (type: string) => void,
        handleVideoSelect: (index: number) => void
    }) => {
    return (
        <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
                <div className="relative mb-4">
                    <button
                        onClick={() => setShowTypeFilter(!showTypeFilter)}
                        className="flex items-center justify-between w-full bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 text-sm transition-colors"
                    >
                        <span className="flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            {selectedType}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
                    </button>

                    {showTypeFilter && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {videoTypes?.map((type: string) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeFilter(type)}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedType === type ? 'bg-blue-600 text-white' : ''
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <h3 className="font-semibold mb-3">Videos ({filteredVideos.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredVideos.map((video: Video, index: number) => (
                        <button
                            key={video.id}
                            onClick={() => handleVideoSelect(index)}
                            className={`w-full text-left p-3 rounded-lg transition-all hover:bg-gray-700 ${index === selectedVideo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700/50'
                                }`}
                        >
                            <div className="font-medium text-sm mb-1 line-clamp-2">{video.name}</div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <span className="bg-gray-600 px-2 py-0.5 rounded">{video.type}</span>
                                <span>{video.size}p</span>
                                {video.official && <span className="text-green-400">Official</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VideoPlayList