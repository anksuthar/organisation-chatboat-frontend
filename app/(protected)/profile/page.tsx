"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShippingDetailsForm } from "@/components/profile/shipping-details-form";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {user?.role === "customer" && <ShippingDetailsForm />}
    </div>
  );
}
