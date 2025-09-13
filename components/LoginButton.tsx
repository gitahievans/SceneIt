'use client'

import { login } from "@/app/(auth)/actions";
import { useFormStatus } from "react-dom";

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            formAction={login}
            disabled={pending}
            className={`w-full group relative flex items-center justify-center gap-2 px-6 py-4 
                bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700
                text-white font-semibold rounded-xl transition-all duration-300 
                transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
                ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {pending ? (
                <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2zm16 0a8 8 0 01-8 8v-2a6 6 0 006-6h-2z" />
                    </svg>
                    Signing In...
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                </>
            )}
        </button>
    );
}

export default LoginButton;
