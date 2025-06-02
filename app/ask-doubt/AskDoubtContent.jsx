"use client"
import { useSearchParams } from "next/navigation"
import AskDoubtPage from "./AskDoubtPage"

export default function AskDoubtContent() {
  const searchParams = useSearchParams();
  const convoId = searchParams.get("convoId");

  return <AskDoubtPage convoId={convoId} />
}