import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { cache } from "react";

import { authConfig } from "./config";
import { db } from "~/server/db";
import {
	accounts,
	authenticators,
	sessions,
	users,
	verificationTokens,
} from "~/server/db/schema";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth({
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
		authenticatorsTable: authenticators,
	}),
	session: {
		strategy: "database",
	},
	...authConfig,
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
