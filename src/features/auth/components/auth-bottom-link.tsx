import Link from "next/link";

interface AuthBottomLinkProps {
  text: string;
  action: string;
  href: string;
}

export function AuthBottomLink({ text, action, href }: AuthBottomLinkProps) {
  return (
    <div className="mt-8 text-center text-sm">
      <span className="text-muted-foreground">{text} </span>

      <Link href={href} className="text-primary font-medium hover:underline">
        {action}
      </Link>
    </div>
  );
}
