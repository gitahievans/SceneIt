"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryService } from '@/app/services/queryClient';
import { use } from 'react';
import VideoPlayList from '@/components/VideoPlayList';
import { Video } from '@/types/types';
import PlayerComponent from '@/components/PlayerComponent';

const WatchPage = ({ params }: { params: Promise<{ id: number }> }) => {
    const [selectedVideo, setSelectedVideo] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [duration, setDuration] = useState(0);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [selectedType, setSelectedType] = useState('All');
    const [showTypeFilter, setShowTypeFilter] = useState(false);

    const playerRef = useRef<any>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    const { id } = use(params);

    const { data: videos } = useQuery({
        queryKey: ["movie-videos", id],
        queryFn: () => QueryService.getMovieVideos(id as number),
        enabled: !!id,
    });

    // Get unique video types
    const videoTypes: string[] = ['All', ...new Set<string>(videos?.results?.map((video: Video) => video.type) || [])];

    // Filter videos by selected type
    const filteredVideos = selectedType === 'All'
        ? videos?.results || []
        : videos?.results?.filter((video: Video) => video.type === selectedType) || [];

    const currentVideo = filteredVideos[selectedVideo];

    useEffect(() => {
        if (currentVideo && filteredVideos.length > 0) {
            const timer = setTimeout(() => {
                setPlaying(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentVideo?.key, currentVideo, filteredVideos.length]);

    useEffect(() => {
        if (currentVideo?.key) {
            setPlaying(false);
            setPlayed(0);
            const timer = setTimeout(() => {
                setPlaying(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentVideo?.key]);

    const handlePlayPause = () => {
        setPlaying(prev => !prev);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSeeking(false);
        if (playerRef.current && playerRef.current.getInternalPlayer) {
            playerRef.current.seekTo(parseFloat(e.target.value));
        }
    };

    const handleProgress = (state: { played: number; loaded: number; playedSeconds: number; loadedSeconds: number }) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };

    const handleFullscreen = () => {
        const playerWrapper = document.querySelector('.player-wrapper');
        if (!playerWrapper) return;

        if (playerWrapper.requestFullscreen) {
            playerWrapper.requestFullscreen();
        } else if ((playerWrapper as any).webkitRequestFullscreen) {
            (playerWrapper as any).webkitRequestFullscreen();
        } else if ((playerWrapper as any).mozRequestFullScreen) {
            (playerWrapper as any).mozRequestFullScreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) {
                setShowControls(false);
            }
        }, 3000);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    const handleVideoSelect = (index: number) => {
        setSelectedVideo(index);
        setPlayed(0);
    };

    const handleTypeFilter = (type: string) => {
        setSelectedType(type);
        setSelectedVideo(0);
        setShowTypeFilter(false);
    };

    if (!videos) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading videos...</div>
            </div>
        );
    }

    if (!filteredVideos.length) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">No videos available</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white max-w-7xl w-full min-h-screen mx-auto flex flex-col gap-4">
            <div className="flex flex-row items-start gap-4 justify-between">
                <PlayerComponent
                    currentVideo={currentVideo}
                    playing={playing}
                    setPlaying={setPlaying}
                    volume={volume}
                    setVolume={setVolume}
                    muted={muted}
                    setMuted={setMuted}
                    duration={duration}
                    setDuration={setDuration}
                    played={played}
                    setPlayed={setPlayed}
                    seeking={seeking}
                    setSeeking={setSeeking}
                    showControls={showControls}
                    setShowControls={setShowControls}
                    handlePlayPause={handlePlayPause}
                    handleVolumeChange={handleVolumeChange}
                    handleSeekChange={handleSeekChange}
                    handleSeekMouseDown={handleSeekMouseDown}
                    handleSeekMouseUp={handleSeekMouseUp}
                    handleProgress={handleProgress}
                    handleDuration={handleDuration}
                    handleFullscreen={handleFullscreen}
                    handleMouseMove={handleMouseMove}
                    formatTime={formatTime}
                    handleVideoSelect={handleVideoSelect}
                    playerRef={playerRef}
                />
                <div className='hidden lg:block lg:w-1/2'>
                    <VideoPlayList
                        videos={videos?.results || []}
                        selectedVideo={selectedVideo}
                        setSelectedVideo={setSelectedVideo}
                        setShowTypeFilter={setShowTypeFilter}
                        showTypeFilter={showTypeFilter}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        videoTypes={videoTypes}
                        filteredVideos={filteredVideos}
                        handleTypeFilter={handleTypeFilter}
                        handleVideoSelect={handleVideoSelect}
                    />
                </div>
            </div>

            <div className="mx-auto w-full flex flex-col md:flex-row items-start justify-between gap-6 py-6">
                <div className="w-full lg:w-2/3 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h1 className="text-xl lg:text-2xl font-bold mb-2">{currentVideo?.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded">
                                {currentVideo?.type}
                            </span>
                            <span>{currentVideo?.official ? 'Official' : 'Unofficial'}</span>
                            <span>{currentVideo?.size}p</span>
                            <span>{new Date(currentVideo?.published_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className='w-full flex lg:hidden'>
                    <VideoPlayList
                        videos={videos?.results || []}
                        selectedVideo={selectedVideo}
                        setSelectedVideo={setSelectedVideo}
                        setShowTypeFilter={setShowTypeFilter}
                        showTypeFilter={showTypeFilter}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        videoTypes={videoTypes}
                        filteredVideos={filteredVideos}
                        handleTypeFilter={handleTypeFilter}
                        handleVideoSelect={handleVideoSelect}
                    />
                </div>
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #ffffff;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #ffffff;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
};

export default WatchPage;