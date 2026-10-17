interface AuthFooterProps {
  version?: string;
}

export function AuthFooter({
  version = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
}: AuthFooterProps) {
  return (
    <footer className="text-muted-foreground mt-8 text-center text-xs">
      APPAM · version {version}
    </footer>
  );
}
