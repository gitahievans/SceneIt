import { QueryService } from "@/app/services/queryClient";
import { Genre, MovieItem } from "@/types/types";
import { Film } from "lucide-react";
import Image from "next/image";
import { DefaultSection } from "../SearchComponent";

export const renderDefaultContent = (defaultSections: DefaultSection[], handleResultClick: (id: number) => void, formatReleaseDate: (dateString: string) => string) => (
    <div className="p-6">
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Discover Movies</h2>
            <p className="text-gray-400">Based on your Interests</p>
        </div>

        {defaultSections.map((section: DefaultSection) => (
            <div key={crypto.randomUUID()} className="mb-8">
                <div className={`bg-gradient-to-r rounded-lg p-4 mb-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Film className="w-6 h-6 text-white" />
                            <h3 className="text-xl font-semibold text-white">{section?.name}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {section?.movies?.slice(0, 10).map((item: MovieItem) => (
                        <div
                            key={item.id}
                            onClick={() => handleResultClick(item.id)}
                            className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                        >
                            <div className="aspect-[2/3] relative bg-gray-900">
                                {item.poster_path ? (
                                    <Image
                                        src={QueryService.getPoster(item.poster_path)}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Film className="w-12 h-12 text-gray-500" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                {item.vote_average && (
                                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                                        <span className="text-orange-400 text-xs font-medium">
                                            ★ {item.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h4 className="text-white font-medium text-sm truncate group-hover:text-orange-400 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-gray-400 text-xs mt-1">
                                    {item.release_date ? formatReleaseDate(item.release_date) : 'TBA'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}

        {defaultSections.length === 0 && (
            <div className="text-center py-12">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Film className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">Loading content...</p>
            </div>
        )}
    </div>
);