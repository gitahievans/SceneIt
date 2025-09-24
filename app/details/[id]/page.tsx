import React, { use } from 'react'
import MovieViewTracker from '@/components/MovieViewTracker';
import MovieDetailsClient from '@/components/MovieDetailsClient';



const DetailsPage = ({ params }: { params: Promise<{ id: number }> }) => {
    const { id } = use(params);

    return (
        <div className='min-h-screen bg-gray-900'>
            <MovieViewTracker movieId={id} />
            <MovieDetailsClient movieId={id} />
        </div>
    )
}

export default DetailsPage