import React from 'react';

interface LoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'cinematic';
    fullScreen?: boolean;
    className?: string;
}

const Loading: React.FC<LoadingProps> = ({
    message = "Loading amazing content...",
    size = 'md',
    variant = 'default',
    fullScreen = true,
    className = ""
}) => {
    const sizeClasses = {
        sm: {
            spinner: 'h-8 w-8',
            text: 'text-base',
            spacing: 'space-x-3',
            dots: 'w-1.5 h-1.5'
        },
        md: {
            spinner: 'h-12 w-12',
            text: 'text-xl',
            spacing: 'space-x-4',
            dots: 'w-2 h-2'
        },
        lg: {
            spinner: 'h-16 w-16',
            text: 'text-2xl',
            spacing: 'space-x-6',
            dots: 'w-3 h-3'
        }
    };

    const currentSize = sizeClasses[size];

    const containerClasses = fullScreen
        ? "h-[70vh] mx-4 my-16 md:my-24 flex items-center justify-center"
        : "flex items-center justify-center p-8";

    if (variant === 'minimal') {
        return (
            <div className={`${containerClasses} ${className}`}>
                <div className={`flex items-center ${currentSize.spacing}`}>
                    <div className={`animate-spin rounded-full ${currentSize.spinner} border-4 border-purple-500 border-t-transparent shadow-lg`}></div>
                    <span className={`text-gray-700 ${currentSize.text} font-medium`}>
                        {message}
                    </span>
                </div>
            </div>
        );
    }

    if (variant === 'cinematic') {
        return (
            <div className={`${containerClasses} ${className} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-red-500/5"></div>
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="relative z-10 text-center">
                    <div className="mb-8 relative">
                        <div className={`mx-auto ${currentSize.spinner} relative`}>
                            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                            <div className="absolute inset-1/2 w-2 h-2 -ml-1 -mt-1 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-32 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                    </div>

                    <h2 className={`text-gray-800 ${currentSize.text} font-bold mb-4 animate-pulse`}>
                        {message}
                    </h2>

                    <div className="flex items-center justify-center space-x-2">
                        <div className={`${currentSize.dots} bg-purple-500 rounded-full animate-bounce`}></div>
                        <div className={`${currentSize.dots} bg-purple-500 rounded-full animate-bounce delay-100`}></div>
                        <div className={`${currentSize.dots} bg-purple-500 rounded-full animate-bounce delay-200`}></div>
                        <div className={`${currentSize.dots} bg-purple-500 rounded-full animate-bounce delay-300`}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${containerClasses} ${className} relative overflow-hidden`}>
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/5 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-16 h-16 bg-red-500/5 rounded-full blur-xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-orange-300/5 rounded-full blur-lg animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 text-center max-w-md mx-auto px-4">
                <div className="mb-6 relative">
                    <div className={`mx-auto ${currentSize.spinner} relative`}>
                        <div className="absolute -inset-2 rounded-full border border-purple-500/20 animate-ping"></div>
                        <div className={`relative ${currentSize.spinner} rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin shadow-lg`}></div>
                        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-purple-500/20 to-transparent animate-pulse"></div>
                    </div>
                </div>

                <div className="relative">
                    <h2 className={`text-gray-800 ${currentSize.text} font-semibold mb-2 leading-tight`}>
                        {message}
                    </h2>

                    <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse mx-auto" style={{ width: '60%' }}></div>
                </div>

                <div className="mt-6 flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`${currentSize.dots} bg-purple-500 rounded-full animate-pulse`}
                            style={{ animationDelay: `${i * 200}ms` }}
                        ></div>
                    ))}
                </div>

                <p className="text-gray-500 text-sm mt-4 animate-pulse">
                    Please wait while we prepare your experience
                </p>
            </div>

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-500/30 rounded-full animate-float"></div>
                <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-purple-500/30 rounded-full animate-float-delayed"></div>
                <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-float-slow"></div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-10px) translateX(5px) rotate(90deg); 
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-5px) translateX(-5px) rotate(180deg); 
            opacity: 1;
          }
          75% { 
            transform: translateY(-15px) translateX(3px) rotate(270deg); 
            opacity: 0.7;
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg); 
            opacity: 0.4;
          }
          33% { 
            transform: translateY(-8px) translateX(-8px) rotate(120deg); 
            opacity: 0.8;
          }
          66% { 
            transform: translateY(-3px) translateX(8px) rotate(240deg); 
            opacity: 1;
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-20px) scale(1.2); 
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default Loading;