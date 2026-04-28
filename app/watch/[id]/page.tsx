"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryService } from '@/app/services/queryClient';
import { use } from 'react';
import VideoPlayList from '@/components/Player/VideoPlayList';
import { Video } from '@/types/types';
import PlayerComponent from '@/components/Player/PlayerComponent';
import { BadgeCheck, CalendarDays, Film, MonitorPlay, Radio } from 'lucide-react';

const WatchPage = ({ params }: { params: Promise<{ id: number }> }) => {
    const [selectedVideo, setSelectedVideo] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [duration, setDuration] = useState(0);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [selectedType, setSelectedType] = useState('Trailer');
    const [showTypeFilter, setShowTypeFilter] = useState(false);

    const playerRef = useRef<any>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    const { id } = use(params);

    const { data: videos } = useQuery({
        queryKey: ["movie-videos", id],
        queryFn: () => QueryService.getMovieVideos(id as number),
        enabled: !!id,
    });

    const allVideos = videos?.results || [];
    const hasTrailers = allVideos.some((video: Video) => video.type === 'Trailer');

    // Get unique video types
    const videoTypes: string[] = ['All', ...new Set<string>(allVideos.map((video: Video) => video.type) || [])];

    // Filter videos by selected type
    const filteredVideos = selectedType === 'All'
        ? allVideos
        : allVideos.filter((video: Video) => video.type === selectedType);

    const currentVideo = filteredVideos[selectedVideo];

    useEffect(() => {
        if (!videos) return;

        if (!hasTrailers && selectedType === 'Trailer') {
            setSelectedType('All');
            setSelectedVideo(0);
        }
    }, [hasTrailers, selectedType, videos]);

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

    const handleSeekMouseUp = (e: React.SyntheticEvent<HTMLInputElement>) => {
        setSeeking(false);
        const nextPlayed = parseFloat(e.currentTarget.value);
        const player = playerRef.current;

        if (player) {
            const playerDuration = Number.isFinite(player.duration) ? player.duration : duration;
            if (Number.isFinite(playerDuration) && playerDuration > 0) {
                player.currentTime = nextPlayed * playerDuration;
            } else if (typeof player.seekTo === 'function') {
                player.seekTo(nextPlayed, 'fraction');
            }
        }
    };

    const handleProgress = (state: { played: number; loaded: number; playedSeconds: number; loadedSeconds: number }) => {
        if (!seeking && typeof state.played === 'number') {
            setPlayed(state.played);
        }
    };

    const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        if (seeking) return;

        const player = event.currentTarget;
        if (Number.isFinite(player.duration) && player.duration > 0) {
            setDuration(player.duration);
            setPlayed(player.currentTime / player.duration);
        }
    };

    const handleDurationChange = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const nextDuration = event.currentTarget.duration;
        if (Number.isFinite(nextDuration)) {
            setDuration(nextDuration);
        }
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

    const publishedDate = currentVideo?.published_at
        ? new Date(currentVideo.published_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Release date unknown';

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
                    handleTimeUpdate={handleTimeUpdate}
                    handleDurationChange={handleDurationChange}
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
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95 p-5 shadow-2xl shadow-black/30 md:p-6">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20">
                                        <Radio className="h-3.5 w-3.5" />
                                    </span>
                                    Now Playing
                                </div>
                                <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl">
                                    {currentVideo?.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                                Playing
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                                <Film className="h-5 w-5 text-cyan-200" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Type</p>
                                    <p className="text-sm font-semibold text-gray-100">{currentVideo?.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                                <BadgeCheck className={`h-5 w-5 ${currentVideo?.official ? 'text-emerald-300' : 'text-amber-300'}`} />
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Source</p>
                                    <p className="text-sm font-semibold text-gray-100">{currentVideo?.official ? 'Official' : 'Unofficial'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                                <MonitorPlay className="h-5 w-5 text-violet-200" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Quality</p>
                                    <p className="text-sm font-semibold text-gray-100">{currentVideo?.size}p</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                                <CalendarDays className="h-5 w-5 text-sky-200" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Published</p>
                                    <p className="text-sm font-semibold text-gray-100">{publishedDate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                                <span>{formatTime(duration * played)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400"
                                    style={{ width: `${Math.min(played * 100, 100)}%` }}
                                />
                            </div>
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
