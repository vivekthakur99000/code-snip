import "dotenv/config";

import { eq, inArray, sql } from "drizzle-orm";

import { createSnippetSlug } from "../src/lib/utils";
import { db } from "../src/server/db";
import { snippetTags, snippets, tags, users } from "../src/server/db/schema";

type LanguageTemplate = {
  language: string;
  titlePrefix: string;
  codeFactory: (index: number) => string;
  tagSet: string[];
};

const templates: LanguageTemplate[] = [
  {
    language: "typescript",
    titlePrefix: "Type-safe Debounce Utility",
    codeFactory: (i) => `type Fn = (...args: unknown[]) => void;\n\nexport function debounce(fn: Fn, wait = 300) {\n  let t: ReturnType<typeof setTimeout> | null = null;\n\n  return (...args: unknown[]) => {\n    if (t) clearTimeout(t);\n    t = setTimeout(() => fn(...args), wait);\n  };\n}\n\nconsole.log("snippet-${i}");`,
    tagSet: ["typescript", "utility", "frontend"],
  },
  {
    language: "javascript",
    titlePrefix: "Promise Retry Helper",
    codeFactory: (i) => `export async function retry(fn, retries = 3) {\n  let err;\n  for (let attempt = 0; attempt < retries; attempt++) {\n    try {\n      return await fn();\n    } catch (e) {\n      err = e;\n    }\n  }\n  throw err;\n}\n\nconsole.log("retry-${i}");`,
    tagSet: ["javascript", "async", "backend"],
  },
  {
    language: "python",
    titlePrefix: "Dataclass Settings Pattern",
    codeFactory: (i) => `from dataclasses import dataclass\n\n@dataclass\nclass Settings:\n    app_name: str = "CodeSnip"\n    timeout: int = 30\n\nsettings = Settings()\nprint(settings.app_name, ${i})`,
    tagSet: ["python", "backend", "config"],
  },
  {
    language: "go",
    titlePrefix: "HTTP JSON Response Helper",
    codeFactory: (i) => `package main\n\nimport (\n  \"encoding/json\"\n  \"net/http\"\n)\n\nfunc writeJSON(w http.ResponseWriter, data any) {\n  w.Header().Set(\"Content-Type\", \"application/json\")\n  _ = json.NewEncoder(w).Encode(data)\n}\n\nfunc main() { _ = ${i} }`,
    tagSet: ["go", "api", "backend"],
  },
  {
    language: "rust",
    titlePrefix: "Result-based Parsing",
    codeFactory: (i) => `fn parse_port(input: &str) -> Result<u16, String> {\n    input.parse::<u16>().map_err(|_| \"invalid port\".to_string())\n}\n\nfn main() {\n    println!(\"{:?}\", parse_port(\"808${i % 10}\"));\n}`,
    tagSet: ["rust", "backend", "error-handling"],
  },
  {
    language: "java",
    titlePrefix: "Immutable DTO Record",
    codeFactory: (i) => `record UserDto(String id, String email) {}\n\npublic class Main {\n  public static void main(String[] args) {\n    UserDto dto = new UserDto(\"${i}\", \"demo@example.com\");\n    System.out.println(dto.email());\n  }\n}`,
    tagSet: ["java", "dto", "backend"],
  },
  {
    language: "csharp",
    titlePrefix: "LINQ Filtering Example",
    codeFactory: (i) => `using System.Linq;\n\nvar numbers = new[] {1, 2, 3, 4, ${i % 9}};\nvar even = numbers.Where(n => n % 2 == 0).ToList();\nConsole.WriteLine(string.Join(\",\", even));`,
    tagSet: ["csharp", "linq", "dotnet"],
  },
  {
    language: "cpp",
    titlePrefix: "RAII File Handle Wrapper",
    codeFactory: (i) => `#include <iostream>\n\nclass Resource {\npublic:\n  Resource() { std::cout << \"open\"; }\n  ~Resource() { std::cout << \"close\"; }\n};\n\nint main() { Resource r; return ${i % 2}; }`,
    tagSet: ["cpp", "systems", "performance"],
  },
  {
    language: "php",
    titlePrefix: "Array Map Transformer",
    codeFactory: (i) => `<?php\n$users = [[\"name\" => \"A\"], [\"name\" => \"B\"]];\n$names = array_map(fn($u) => strtoupper($u[\"name\"]), $users);\necho implode(\",\", $names) . \"-${i}\";`,
    tagSet: ["php", "backend", "api"],
  },
  {
    language: "swift",
    titlePrefix: "Codable API Model",
    codeFactory: (i) => `import Foundation\n\nstruct Snippet: Codable {\n  let id: String\n  let title: String\n}\n\nlet json = \"{\\\"id\\\":\\\"${i}\\\",\\\"title\\\":\\\"Hello\\\"}\".data(using: .utf8)!\nlet snippet = try! JSONDecoder().decode(Snippet.self, from: json)\nprint(snippet.title)`,
    tagSet: ["swift", "ios", "codable"],
  },
  {
    language: "kotlin",
    titlePrefix: "Coroutine Dispatcher Snippet",
    codeFactory: (i) => `import kotlinx.coroutines.*\n\nfun main() = runBlocking {\n  val result = withContext(Dispatchers.Default) { ${i} * 2 }\n  println(result)\n}`,
    tagSet: ["kotlin", "android", "coroutines"],
  },
  {
    language: "ruby",
    titlePrefix: "Service Object Pattern",
    codeFactory: (i) => `class SnippetService\n  def call(title)\n    \"created: #{title}\"\n  end\nend\n\nputs SnippetService.new.call(\"sample-${i}\")`,
    tagSet: ["ruby", "rails", "service"],
  },
  {
    language: "sql",
    titlePrefix: "Window Function Ranking",
    codeFactory: (i) => `select\n  user_id,\n  count(*) as snippets_count,\n  rank() over (order by count(*) desc) as rank_no\nfrom snippets\ngroup by user_id\nlimit ${5 + (i % 5)};`,
    tagSet: ["sql", "analytics", "database"],
  },
  {
    language: "bash",
    titlePrefix: "Backup Script Example",
    codeFactory: (i) => `#!/usr/bin/env bash\nset -euo pipefail\nSTAMP=$(date +%Y%m%d_%H%M%S)\nmkdir -p backups\ntar -czf backups/app_${i}_$STAMP.tgz src`,
    tagSet: ["bash", "devops", "automation"],
  },
  {
    language: "json",
    titlePrefix: "API Contract Fragment",
    codeFactory: (i) => `{\n  \"id\": \"${i}\",\n  \"title\": \"CodeSnip Contract\",\n  \"isPublic\": true,\n  \"tags\": [\"api\", \"schema\"]\n}`,
    tagSet: ["json", "api", "schema"],
  },
];

const MIN_SNIPPETS = 50;

async function ensureDemoUser() {
  const email = "seed@codesnip.dev";

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      name: "CodeSnip Seed",
      email,
      image: null,
    })
    .returning();

  if (!created) {
    throw new Error("Unable to create seed user");
  }

  return created;
}

async function getExistingSnippetCount(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(snippets)
    .where(sql`${snippets.userId} = ${userId} and ${snippets.deletedAt} is null`);

  return row?.count ?? 0;
}

async function ensureTags(tagNames: string[]) {
  if (!tagNames.length) {
    return;
  }

  await db
    .insert(tags)
    .values(tagNames.map((name) => ({ name })))
    .onConflictDoNothing({ target: tags.name });
}

async function seedSnippets() {
  const user = await ensureDemoUser();
  const existingCount = await getExistingSnippetCount(user.id);
  const toCreate = Math.max(0, MIN_SNIPPETS - existingCount);

  if (toCreate === 0) {
    console.log(`Seed skipped. Existing snippets: ${existingCount}.`);
    return;
  }

  const allTags = [...new Set(templates.flatMap((template) => template.tagSet))];
  await ensureTags(allTags);

  const tagRows = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, allTags));

  const tagIdByName = new Map(tagRows.map((row) => [row.name, row.id]));

  for (let i = 0; i < toCreate; i++) {
    const template = templates[i % templates.length];
    if (!template) {
      continue;
    }

    const ordinal = existingCount + i + 1;
    const [createdSnippet] = await db
      .insert(snippets)
      .values({
        userId: user.id,
        title: `${template.titlePrefix} #${ordinal}`,
        slug: createSnippetSlug(),
        code: template.codeFactory(ordinal),
        language: template.language,
        isPublic: true,
      })
      .returning({ id: snippets.id });

    if (!createdSnippet) {
      continue;
    }

    const linkingRows = template.tagSet
      .map((name) => ({ name, id: tagIdByName.get(name) }))
      .filter((row): row is { name: string; id: string } => !!row.id)
      .map((row) => ({ snippetId: createdSnippet.id, tagId: row.id }));

    if (linkingRows.length) {
      await db
        .insert(snippetTags)
        .values(linkingRows)
        .onConflictDoNothing();
    }
  }

  const finalCount = await getExistingSnippetCount(user.id);
  console.log(`Seed complete. Snippets available for seed user: ${finalCount}.`);
}

void seedSnippets();
