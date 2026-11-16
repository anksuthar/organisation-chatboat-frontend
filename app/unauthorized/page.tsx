import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">Access denied</h1>
      <p className="max-w-md text-muted-foreground">
        You don&apos;t have permission to view this page. If you think this is a mistake, contact an
        administrator.
      </p>
      <Button render={<Link href="/chat" />}>Back to chat</Button>
    </div>
  );
}
