import Image from "next/image";

import { Button } from "@/components/atoms";

interface Provider {
  provider: "Google" | "Apple" | "Microsoft";
  label: string;
  icon: string;
}

interface AuthProvidersProps {
  providers: Provider[];
  loading?: boolean;
  onProviderClick(provider: Provider["provider"]): void;
}

export function AuthProviders({ providers, loading, onProviderClick }: AuthProvidersProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {providers.map((provider) => (
        <Button
          key={provider.provider}
          variant="outline"
          disabled={loading}
          onClick={() => onProviderClick(provider.provider)}
          className="gap-2"
        >
          <Image src={provider.icon} alt="" width={16} height={16} />

          {provider.label}
        </Button>
      ))}
    </div>
  );
}
