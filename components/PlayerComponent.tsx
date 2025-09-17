import { Play, Pause, Volume2, VolumeX, Maximize, Filter, ChevronDown } from 'lucide-react';
import React from 'react'
import ReactPlayer from 'react-player';
import { Video } from '@/types/types';

interface PlayerComponentProps {
    currentVideo: Video,
    playing: boolean,
    setPlaying: (playing: boolean) => void,
    volume: number,
    setVolume: (volume: number) => void,
    muted: boolean,
    setMuted: (muted: boolean) => void,
    duration: number,
    setDuration: (duration: number) => void,
    played: number,
    setPlayed: (played: number) => void,
    seeking: boolean,
    setSeeking: (seeking: boolean) => void,
    showControls: boolean,
    setShowControls: (showControls: boolean) => void,
    handlePlayPause: () => void,
    handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSeekMouseDown: () => void,
    handleSeekMouseUp: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleProgress: (state: { played: number; loaded: number; playedSeconds: number; loadedSeconds: number }) => void,
    handleDuration: (duration: number) => void,
    handleFullscreen: () => void,
    handleMouseMove: () => void,
    formatTime: (time: number) => string,
    handleVideoSelect: (index: number) => void,
    playerRef: any
}

const PlayerComponent = ({
    currentVideo,
    playing,
    setPlaying,
    volume,
    setVolume,
    muted,
    setMuted,
    duration,
    setDuration,
    played,
    setPlayed,
    seeking,
    setSeeking,
    showControls,
    setShowControls,
    handlePlayPause,
    handleVolumeChange,
    handleSeekChange,
    handleSeekMouseDown,
    handleSeekMouseUp,
    handleProgress,
    handleDuration,
    handleFullscreen,
    handleMouseMove,
    formatTime,
    handleVideoSelect,
    playerRef
}: PlayerComponentProps) => {
    return (
            <div
                className="player-wrapper relative min-h-full h-full w-full aspect-video"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => playing && setShowControls(false)}
            >
                <ReactPlayer
                    ref={(player) => { playerRef.current = player; }}
                    src={currentVideo?.key ? `https://www.youtube.com/watch?v=${currentVideo.key}` : ''}
                    width="100%"
                    height="100%"
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    onProgress={(state) => handleProgress(state as any)}
                    // onDuration={handleDuration}
                    onEnded={() => setPlaying(false)}
                    onReady={() => console.log('Player ready')}
                    onError={(error) => console.error('Player error:', error)}
                    config={{
                        youtube: {
                            // showinfo: 0,
                            // controls: 0,
                            // modestbranding: 1,
                            rel: 0
                        }
                    }}
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={handlePlayPause}
                            className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
                        >
                            {playing ? (
                                <Pause className="w-8 h-8 text-white" />
                            ) : (
                                <Play className="w-8 h-8 text-white ml-1" />
                            )}
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="mb-4">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={played}
                                onChange={handleSeekChange}
                                onMouseDown={handleSeekMouseDown}
                                // onMouseUp={handleSeekMouseUp}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handlePlayPause}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setMuted(!muted)}
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step="any"
                                        value={muted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>

                                <span className="text-sm text-gray-300">
                                    {formatTime(duration * played)} / {formatTime(duration)}
                                </span>
                            </div>

                            <button
                                onClick={handleFullscreen}
                                className="hover:text-blue-400 transition-colors"
                            >
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default PlayerComponent