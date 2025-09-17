import Image from 'next/image'
import React from 'react'
import { QueryService } from '@/app/services/queryClient';
import { Company, Genre } from '@/types/types';
import LikeButton from '@/components/LikeButton';
import DetailsClient from '@/components/DetailsClient';
import WatchButton from '@/components/WatchButton';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    return 'text-red-500';
};



const DetailsPage = async ({ params }: { params: { id: number } }) => {
    const { id } = params;
    const { getMovieDetails, getPoster } = QueryService;
    const movie = await getMovieDetails(id);

    return (
        <div className='min-h-screen bg-gray-900'>
            <DetailsClient movieId={params?.id} />
            <div className='relative lg:h-screen'>
                <div className='absolute inset-0'>
                    <Image
                        src={getPoster(movie.backdrop_path, 'w1280')}
                        alt={`${movie.title} backdrop`}
                        fill
                        className='object-cover'
                        priority
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent' />
                    <div className='absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-gray-900/40' />
                </div>

                <div className='relative z-10 h-full flex items-center'>
                    <div className='max-w-7xl mx-auto px-6 w-full'>
                        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
                            <div className='lg:col-span-4 xl:col-span-3'>
                                <div className='relative mx-auto lg:mx-0 w-80 lg:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl'>
                                    <Image
                                        src={getPoster(movie.poster_path, 'w500')}
                                        alt={`${movie.title} poster`}
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                            </div>

                            <div className='lg:col-span-8 xl:col-span-9 text-white space-y-6'>
                                <div>
                                    <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight'>
                                        {movie.title}
                                    </h1>
                                    {movie.tagline && (
                                        <p className='text-lg md:text-xl text-gray-300 italic mb-6'>
                                            {movie.tagline}
                                        </p>
                                    )}
                                </div>

                                <div className='flex flex-wrap items-center gap-6 text-sm md:text-base'>
                                    <div className='flex items-center space-x-2'>
                                        <span className='text-yellow-400'>★</span>
                                        <span className={`font-semibold ${getRatingColor(movie.vote_average)}`}>
                                            {movie.vote_average.toFixed(1)}
                                        </span>
                                        <span className='text-gray-400'>({movie.vote_count} votes)</span>
                                    </div>
                                    <div className='text-gray-300'>
                                        {new Date(movie.release_date).getFullYear()}
                                    </div>
                                    <div className='text-gray-300'>
                                        {formatRuntime(movie.runtime)}
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-2'>
                                    {movie.genres.map((genre: Genre) => (
                                        <span
                                            key={genre.id}
                                            className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30'
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>

                                <div className='max-w-3xl'>
                                    <p className='text-lg md:text-xl leading-relaxed text-gray-200'>
                                        {movie.overview}
                                    </p>
                                </div>

                                <div className='flex items-center gap-4 pt-4'>
                                    <div className='transform hover:scale-105 transition-transform duration-200'>
                                        <LikeButton movieId={params?.id} />
                                    </div>

                                    <WatchButton movieId={params?.id} />

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bg-gray-900 py-16'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                        <div className='bg-transparent border border-white/10 shadow-2xl shadow-amber-50/30 rounded-2xl p-8 backdrop-blur-md'>
                            <h2 className='text-2xl font-bold text-white mb-6'>Movie Details</h2>
                            <div className='space-y-4'>
                                <div className='flex justify-between items-center py-2 border-b border-gray-700'>
                                    <span className='text-gray-400'>Release Date</span>
                                    <span className='text-white font-medium'>
                                        {new Date(movie.release_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center py-2 border-b border-gray-700'>
                                    <span className='text-gray-400'>Runtime</span>
                                    <span className='text-white font-medium'>{formatRuntime(movie.runtime)}</span>
                                </div>
                                <div className='flex justify-between items-center py-2 border-b border-gray-700'>
                                    <span className='text-gray-400'>Budget</span>
                                    <span className='text-white font-medium'>
                                        {movie.budget > 0 ? formatCurrency(movie.budget) : 'N/A'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center py-2 border-b border-gray-700'>
                                    <span className='text-gray-400'>Revenue</span>
                                    <span className='text-white font-medium'>
                                        {movie.revenue > 0 ? formatCurrency(movie.revenue) : 'N/A'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center py-2 border-b border-gray-700'>
                                    <span className='text-gray-400'>Status</span>
                                    <span className='text-white font-medium'>{movie.status}</span>
                                </div>
                                <div className='flex justify-between items-center py-2 border-b border-gray-700'>
                                    <span className='text-gray-400'>Language</span>
                                    <span className='text-white font-medium'>
                                        {movie.spoken_languages[0]?.english_name || 'N/A'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center py-2'>
                                    <span className='text-gray-400'>Country</span>
                                    <span className='text-white font-medium'>
                                        {movie.production_countries[0]?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='bg-transparent border border-white/10 shadow-2xl shadow-amber-50/30 rounded-2xl p-8 backdrop-blur-md'>
                            <h2 className='text-2xl font-bold text-white mb-6'>Production</h2>
                            <div className='space-y-6'>
                                {movie.production_companies.map((company: Company) => (
                                    <div key={company.id} className='flex items-center space-x-4'>
                                        {company.logo_path && (
                                            <div className='w-16 h-16 bg-white rounded-lg p-2 flex-shrink-0'>
                                                <Image
                                                    src={getPoster(company.logo_path, 'w200')}
                                                    alt={`${company.name} logo`}
                                                    width={60}
                                                    height={60}
                                                    className='w-full h-full object-contain'
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className='text-white font-medium'>{company.name}</h3>
                                            <p className='text-gray-400 text-sm'>{company.origin_country}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='mt-8 pt-6 border-t border-gray-700'>
                                <div className='flex flex-wrap gap-4'>
                                    {movie.homepage && (
                                        <a
                                            href={movie.homepage}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                                        >
                                            Official Website
                                        </a>
                                    )}
                                    {movie.imdb_id && (
                                        <a
                                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className='px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors'
                                        >
                                            IMDb
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailsPage