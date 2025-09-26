'use client'

import { signup } from "@/app/(auth)/actions";
import { useFormStatus } from "react-dom";

function SignUpButton() {
    const { pending } = useFormStatus();

    return (
        <button
            formAction={signup}
            className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 
             bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
             text-white font-semibold rounded-xl transition-all duration-300 
             transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
             disabled:opacity-50 disabled:cursor-not-allowed"
        >

            {pending ? (
                <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2zm16 0a8 8 0 01-8 8v-2a6 6 0 006-6h-2z" />
                    </svg>
                    <span>Signing Up...</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Create Account</span>
                </>
            )}
        </button>
    )
}

export default SignUpButton