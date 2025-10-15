import { signOut } from "@/lib/auth-actions"
import { redirect } from "next/navigation"

export default async function LogoutPage() {
  // Immediately sign out and redirect to welcome page
  await signOut()
  redirect("/welcome")
}
