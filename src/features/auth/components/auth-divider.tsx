interface AuthDividerProps {
  label: string;
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="border-border w-full border-t" />
      </div>

      <div className="relative flex justify-center">
        <span className="bg-card text-muted-foreground px-2 text-xs lowercase">{label}</span>
      </div>
    </div>
  );
}
