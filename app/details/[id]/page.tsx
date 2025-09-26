import React, { use } from 'react'
import MovieDetailsClient from '@/components/DetailsPage/MovieDetailsClient';
import MovieViewTracker from '@/components/DetailsPage/MovieViewTracker';



const DetailsPage = ({ params }: { params: Promise<{ id: number }> }) => {
    const { id } = use(params);

    return (
        <div className='min-h-screen bg-gray-900'>
            <MovieDetailsClient movieId={id} />
        </div>
    )
}

export default DetailsPage