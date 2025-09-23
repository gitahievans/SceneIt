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
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 shadow-xl border border-purple-500/20">
                <div className="relative mb-4">
                    <button
                        onClick={() => setShowTypeFilter(!showTypeFilter)}
                        className="flex items-center justify-between w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-purple-700/50 hover:to-purple-800/50 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-purple-500/20 shadow-lg"
                    >
                        <span className="flex items-center">
                            <Filter className="w-4 h-4 mr-2 text-purple-300" />
                            <span className="text-purple-100">{selectedType}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 text-purple-300 ${showTypeFilter ? 'rotate-180' : ''}`} />
                    </button>

                    {showTypeFilter && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-2xl z-10 max-h-60 overflow-y-auto border border-purple-500/30 backdrop-blur-sm">
                            {videoTypes?.map((type: string) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeFilter(type)}
                                    className={`w-full text-left px-3 py-2 hover:bg-gradient-to-r hover:from-purple-600/40 hover:to-purple-700/40 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${selectedType === type ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'text-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <h3 className="font-semibold mb-3 text-purple-100 text-lg">Videos ({filteredVideos.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredVideos.map((video: Video, index: number) => (
                        <button
                            key={video.id}
                            onClick={() => handleVideoSelect(index)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-500 transform ${index === selectedVideo 
                                ? 'bg-gradient-to-r from-purple-600/40 via-pink-950/50 to-purple-700/60 hover:from-purple-700/10 hover:to-purple-800/10 shadow-xl border border-purple-400/30' 
                                : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-purple-600/50 hover:to-purple-700/20 border border-purple-500/10'
                            }`}
                        >
                            <div className={`font-medium text-sm mb-1 line-clamp-2 ${index === selectedVideo ? 'text-white' : 'text-gray-200'}`}>
                                {video.name}
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                <span className={`px-2 py-0.5 rounded-full ${index === selectedVideo 
                                    ? 'bg-purple-500/40 text-purple-100' 
                                    : 'bg-gray-600/60 text-gray-300'
                                }`}>
                                    {video.type}
                                </span>
                                <span className={index === selectedVideo ? 'text-purple-200' : 'text-gray-400'}>
                                    {video.size}p
                                </span>
                                {video.official && (
                                    <span className="text-green-400 font-medium">Official</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
    )
}

export default VideoPlayList