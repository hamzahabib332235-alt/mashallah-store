import { createFileRoute } from "@tanstack/react-router";
import { WholesaleApp } from "@/components/wholesale/WholesaleApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <WholesaleApp />;
}
