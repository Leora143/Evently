import { Globe, LockKey } from "@phosphor-icons/react";
import { Badge } from "./Badge";

export function EventTypeChip({ type }) {
  const isPrivate = type === "PRIVATE";
  return (
    <Badge tone={isPrivate ? "brand" : "neutral"}>
      {isPrivate ? <LockKey size={12} weight="fill" /> : <Globe size={12} weight="fill" />}
      {isPrivate ? "Invite only" : "Open to all"}
    </Badge>
  );
}

export function PriceChip({ isPaid, price, currency = "INR", formatter }) {
  if (!isPaid) return <Badge tone="success">Free entry</Badge>;
  return <Badge tone="neutral">{formatter(price, currency)}</Badge>;
}
