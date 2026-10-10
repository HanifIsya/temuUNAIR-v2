import { redirect } from "next/navigation";
import { HomeView } from "@/features/home/home-view";
import { getAppUser } from "@/features/shell/server-user";

export default async function HomePage() {
  const result = await getAppUser();
  if ("redirectTo" in result) {
    return redirect(result.redirectTo);
  }

  return <HomeView user={result.user} />;
}
