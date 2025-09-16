import OnboardingForm from "@/components/OnboardingForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-4xl mx-auto p-2">
            <OnboardingForm />
        </div>
    );
}
