import { SearchBar } from "~/components/search/SearchBar";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-[28px] font-medium text-slate-100">CodeSnip</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed muted">
            Public snippets from the community.
          </p>
          <div className="mt-6">
            <SearchBar />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
