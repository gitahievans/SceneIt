import { Modal } from '@mantine/core';
import React from 'react';
import { Lock, LogIn, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginModal = ({ action, opened, close }: { action: string, opened: boolean, close: () => void }) => {
    const router = useRouter();

    const handleLoginClick = () => {
        router.push("/login");
        close();
    }

    return (
        <Modal
            opened={opened}
            onClose={close}
            centered
            size="md"
            padding={0}
            radius="xl"
            shadow="xl"
            overlayProps={{
                backgroundOpacity: 0.6,
                blur: 8,
            }}
            withCloseButton={false}
            styles={{
                content: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                },
                body: {
                    padding: 0,
                }
            }}
        >
            <div className="relative overflow-hidden">
                <button
                    onClick={close}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group"
                >
                    <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
                </div>

                <div className="relative px-8 py-12 text-center">
                    <div className="mb-6 relative">
                        <div className="w-20 h-20 mx-auto bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                        Authentication Required
                    </h2>

                    <p className="text-white/80 text-lg mb-8 leading-relaxed">
                        Please sign in to <span className="font-semibold text-white">{action}</span>
                    </p>

                    <div className="space-y-3">
                        <button onClick={handleLoginClick} className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 group">
                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            Login
                        </button>

                        <button
                            onClick={close}
                            className="w-full bg-transparent hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl border border-white/30 transition-all duration-200 hover:border-white/50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default LoginModal;