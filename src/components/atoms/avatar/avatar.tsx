import {
  Avatar as UIAvatar,
  AvatarFallback as UIAvatarFallback,
  AvatarImage as UIAvatarImage,
} from "@/components/ui/avatar";

import type { AvatarFallbackProps, AvatarImageProps, AvatarProps } from "./avatar.types";

export function Avatar(props: AvatarProps) {
  return <UIAvatar {...props} />;
}

export function AvatarImage(props: AvatarImageProps) {
  return <UIAvatarImage {...props} />;
}

export function AvatarFallback(props: AvatarFallbackProps) {
  return <UIAvatarFallback {...props} />;
}
