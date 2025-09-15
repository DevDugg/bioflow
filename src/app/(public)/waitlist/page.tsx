import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WaitlistForm } from "@/components/waitlist-form";

export default function WaitlistPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>
            Sign up to be the first to know when we launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaitlistForm />
        </CardContent>
      </Card>
    </div>
  );
}
