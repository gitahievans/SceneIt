"use client";

import MediaImage from "./MediaImage";
import { Provider } from "@/types/types";

export default function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow dark:bg-gray-800/90 dark:text-gray-100">
      <span className="relative h-4 w-4 overflow-hidden rounded">
        <MediaImage
          path={provider.logo_path}
          kind="logo"
          size="w45"
          fallback="provider"
          fallbackLabel={provider.provider_name}
          alt={`${provider.provider_name} logo`}
          fill
          sizes="16px"
          className="rounded"
        />
      </span>
      {provider.provider_name}
    </span>
  );
}
