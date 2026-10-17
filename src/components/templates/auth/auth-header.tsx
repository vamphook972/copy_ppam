import { BrandLogo } from "@/components/atoms";

interface AuthHeaderProps {
  title: string;
  description: string;
  logoVariant?: "full" | "icon";
  logoAlt?: string;
}

export function AuthHeader({
  title,
  description,
  logoVariant = "full",
  logoAlt = "PPAM Logo",
}: AuthHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center justify-center">
        <BrandLogo
          variant={logoVariant}
          theme="auto"
          alt={logoAlt}
          width={160}
          height={44}
          priority
        />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

      <p className="text-muted-foreground mt-2">{description}</p>
    </header>
  );
}
