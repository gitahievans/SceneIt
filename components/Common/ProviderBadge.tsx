"use client";

import Image from "next/image";
import { QueryService } from "@/app/services/queryClient";
import { Provider } from "@/types/types";

export default function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow dark:bg-gray-800/90 dark:text-gray-100">
      {provider.logo_path && (
        <Image
          src={QueryService.getPoster(provider.logo_path, "w45")}
          alt=""
          width={16}
          height={16}
          className="rounded"
          unoptimized
        />
      )}
      {provider.provider_name}
    </span>
  );
}
