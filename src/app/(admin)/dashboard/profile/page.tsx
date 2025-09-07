import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getArtistByHandle } from "@/server/artists";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const artist = await getArtistByHandle("DevDugg");

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your public profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm artist={artist} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Customize the look and feel of your public page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Theme Form will go here */}
          <p>Theme form coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
