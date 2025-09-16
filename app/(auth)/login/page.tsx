import LoginButton from "@/components/LoginButton";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/20 dark:bg-green-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-indigo-400/20 dark:bg-indigo-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 p-8 md:p-10">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="text-4xl">🎬</span>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                            Sign in to your SceneIt account
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/60 dark:border-gray-600/50 rounded-xl 
                           text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 
                           focus:border-green-400/50 dark:focus:ring-green-400/50 dark:focus:border-green-500/50 transition-all duration-200 hover:bg-white/60 dark:hover:bg-gray-700/70"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/60 dark:border-gray-600/50 rounded-xl 
                           text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 
                           focus:border-green-400/50 dark:focus:ring-green-400/50 dark:focus:border-green-500/50 transition-all duration-200 hover:bg-white/60 dark:hover:bg-gray-700/70"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <LoginButton />
                    </form>

                    <div className="mt-8 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/30 dark:border-gray-600/30"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white/40 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-medium">Don&apos;t have an account?</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a href="/signup" className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold 
                                        transition-colors duration-200 hover:underline">
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Create account
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}