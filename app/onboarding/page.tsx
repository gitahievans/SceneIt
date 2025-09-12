import OnboardingForm from "@/components/OnboardingForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Otherwise, render the onboarding UI
    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Pick your favorite genres</h1>
            <OnboardingForm />
        </div>
    );
}
