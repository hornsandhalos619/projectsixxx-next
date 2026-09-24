import { redirect } from "next/navigation";

/** Optional door — manifesto lives on the house homepage. */
export default function ManifestoPage() {
  redirect("/#manifesto");
}
