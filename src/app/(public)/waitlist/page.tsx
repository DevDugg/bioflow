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
    <div className="flex h-screen flex-col items-center justify-center space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Bioflow
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
          The ultimate link-in-bio for musicians and artists. Sign up to get
          early access and be the first to know when we launch.
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>
            Enter your email to get early access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaitlistForm />
        </CardContent>
      </Card>
    </div>
  );
}
