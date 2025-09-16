import { redirect } from "next/navigation";

export const redirectToWaitlist = () => {
  redirect("/waitlist");
};

export default function Home() {
  redirectToWaitlist();
  return <div></div>;
}
