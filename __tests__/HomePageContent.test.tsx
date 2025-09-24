import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Mock the components and services
jest.mock('@/components/Section', () => {
    return function Section({ title, movies }: { title: string; movies: MovieItem[] }) {
        return (
            <div data-testid={`section-${title}`}>
                <h3>{title}</h3>
                <div data-testid="movies-count">{movies?.length || 0} movies</div>
            </div>
        );
    };
});

jest.mock('@/components/HomeHeroSection', () => {
    return function HomeHeroSection() {
        return <div data-testid="hero-section">Hero Section</div>;
    };
});

jest.mock('@/components/EmailConfirmationModal', () => {
    return function EmailConfirmationModal() {
        return <div data-testid="email-modal">Email Modal</div>;
    };
});

jest.mock('@/components/Loader', () => {
    return function Loading() {
        return <div data-testid="loading">Loading...</div>;
    };
});

jest.mock('@/app/services/queryClient');

import HomePageContent from '@/components/Home/HomeComponent';
import { QueryService } from '@/app/services/queryClient';
import { MovieItem } from '@/types/types';

// scroll behavior
Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true
});

Element.prototype.scrollIntoView = jest.fn();

describe('HomePageContent', () => {
    let queryClient: QueryClient;

    const mockMoviesData = {
        results: [
            { id: 1, title: 'Movie 1' },
            { id: 2, title: 'Movie 2' }
        ]
    };

    const mockGenresData = {
        genres: [
            { id: 28, name: 'Action' },
            { id: 35, name: 'Comedy' },
            { id: 18, name: 'Drama' },
            { id: 27, name: 'Horror' },
            { id: 878, name: 'Science Fiction' }
        ]
    };

    const mockGenreMovies = {
        results: [
            { id: 101, title: 'Action Movie 1' },
            { id: 102, title: 'Action Movie 2' }
        ]
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        jest.clearAllMocks();

        (QueryService.getDailyTrending as jest.Mock).mockResolvedValue(mockMoviesData);
        (QueryService.getGenres as jest.Mock).mockResolvedValue(mockGenresData);
        (QueryService.getMoviesByGenre as jest.Mock).mockResolvedValue(mockGenreMovies);
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <HomePageContent />
            </QueryClientProvider>
        );
    };

    describe('Loading States', () => {
        it('shows loading spinner when data is being fetched', () => {
            (QueryService.getDailyTrending as jest.Mock).mockImplementation(() => new Promise(() => { }));
            (QueryService.getGenres as jest.Mock).mockImplementation(() => new Promise(() => { }));

            renderComponent();

            expect(screen.getByTestId('loading')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('shows error message when movies query fails', async () => {
            const errorMessage = 'Failed to fetch movies';
            (QueryService.getDailyTrending as jest.Mock).mockRejectedValue(new Error(errorMessage));
            (QueryService.getGenres as jest.Mock).mockResolvedValue(mockGenresData);

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
                expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
            });
        });
    });

    describe('Content Rendering', () => {
        it('renders hero section and main components when data loads', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('hero-section')).toBeInTheDocument();
                expect(screen.getByTestId('email-modal')).toBeInTheDocument();
                expect(screen.getByTestId('section-🔥 Daily Trending')).toBeInTheDocument();
            });
        });

        it('displays daily trending movies', async () => {
            renderComponent();

            await waitFor(() => {
                const trendingSection = screen.getByTestId('section-🔥 Daily Trending');
                expect(trendingSection).toBeInTheDocument();
                expect(trendingSection).toHaveTextContent('2 movies');
            });
        });

        it('shows genre sections with correct pagination info', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Browse by Genre')).toBeInTheDocument();
                expect(screen.getByText('Page 1 of 2 • 5 genres total')).toBeInTheDocument();

                expect(screen.getByTestId('section-Action')).toBeInTheDocument();
                expect(screen.getByTestId('section-Comedy')).toBeInTheDocument();
                expect(screen.getByTestId('section-Drama')).toBeInTheDocument();
                expect(screen.getByTestId('section-Horror')).toBeInTheDocument();

                expect(screen.queryByTestId('section-Science Fiction')).not.toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('navigates to next page when next button is clicked', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Page 1 of 2 • 5 genres total')).toBeInTheDocument();
            });

            const nextButton = screen.getByText('Next');
            fireEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('Page 2 of 2 • 5 genres total')).toBeInTheDocument();
                expect(screen.getByTestId('section-Science Fiction')).toBeInTheDocument();
            });
        });

        it('navigates to previous page when previous button is clicked', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Next')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Next'));

            await waitFor(() => {
                expect(screen.getByText('Page 2 of 2 • 5 genres total')).toBeInTheDocument();
            });

            const prevButton = screen.getByText('Previous');
            fireEvent.click(prevButton);

            await waitFor(() => {
                expect(screen.getByText('Page 1 of 2 • 5 genres total')).toBeInTheDocument();
                expect(screen.getByTestId('section-Action')).toBeInTheDocument();
            });
        });

        it('disables previous button on first page', async () => {
            renderComponent();

            await waitFor(() => {
                const prevButton = screen.getByText('Previous');
                expect(prevButton).toBeDisabled();
            });
        });

        it('disables next button on last page', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Next')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Next'));

            await waitFor(() => {
                const nextButton = screen.getByText('Next');
                expect(nextButton).toBeDisabled();
            });
        });

        it('uses load more button to increment page', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Load More Genres (1 remaining)')).toBeInTheDocument();
            });

            const loadMoreButton = screen.getByText('Load More Genres (1 remaining)');
            fireEvent.click(loadMoreButton);

            await waitFor(() => {
                expect(screen.getByText('Page 2 of 2 • 5 genres total')).toBeInTheDocument();
            });
        });
    });

    describe('API Calls', () => {
        it('calls the correct API endpoints', async () => {
            renderComponent();

            await waitFor(() => {
                expect(QueryService.getDailyTrending).toHaveBeenCalledTimes(1);
                expect(QueryService.getGenres).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expect(QueryService.getMoviesByGenre).toHaveBeenCalledTimes(4);
                expect(QueryService.getMoviesByGenre).toHaveBeenCalledWith(28);
                expect(QueryService.getMoviesByGenre).toHaveBeenCalledWith(35);
                expect(QueryService.getMoviesByGenre).toHaveBeenCalledWith(18);
                expect(QueryService.getMoviesByGenre).toHaveBeenCalledWith(27);
            });
        });
    });

    describe('Scrolling Behavior', () => {
        it('scrolls to genres section when page changes', async () => {
            const mockElement = document.createElement('div');
            mockElement.scrollIntoView = jest.fn();
            jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Next')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Next'));

            expect(document.getElementById).toHaveBeenCalledWith('genres-section');
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });
    });
});