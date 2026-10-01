import { createFileRoute } from "@tanstack/react-router";
import { CallApp } from "@/components/call-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CallApp />;
}
