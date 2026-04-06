"use client";

import { useMemo, useState } from "react";

import { api } from "~/trpc/react";

type VoteKind = "like" | "dislike" | null;

type SnippetVotesProps = {
  snippetId: string;
  initialLikes: number;
  initialDislikes: number;
  initialUserVote: VoteKind;
};

export function SnippetVotes({
  snippetId,
  initialLikes,
  initialDislikes,
  initialUserVote,
}: SnippetVotesProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<VoteKind>(initialUserVote);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const voteMutation = api.snippets.vote.useMutation({
    onSuccess: (result) => {
      setLikes(result.likes);
      setDislikes(result.dislikes);
      setUserVote(result.userVote);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const score = useMemo(() => likes - dislikes, [likes, dislikes]);

  const submitVote = (nextVote: Exclude<VoteKind, null>) => {
    const normalizedVote = userVote === nextVote ? "none" : nextVote;
    voteMutation.mutate({ snippetId, vote: normalizedVote });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => submitVote("like")}
          disabled={voteMutation.isPending}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            userVote === "like"
              ? "bg-emerald-600/30 text-emerald-200"
              : "bg-slate-900 text-slate-200 hover:bg-slate-800"
          }`}
        >
          Like {likes}
        </button>
        <button
          type="button"
          onClick={() => submitVote("dislike")}
          disabled={voteMutation.isPending}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            userVote === "dislike"
              ? "bg-rose-600/30 text-rose-200"
              : "bg-slate-900 text-slate-200 hover:bg-slate-800"
          }`}
        >
          Dislike {dislikes}
        </button>
        <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
          Score {score}
        </span>
      </div>
      {errorMessage && <p className="mt-2 text-xs text-rose-400">{errorMessage}</p>}
    </div>
  );
}
