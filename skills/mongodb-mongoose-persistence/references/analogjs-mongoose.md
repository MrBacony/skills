# AnalogJS + Mongoose Reference

## Table of Contents
1. Connection management
2. Schema and model pattern
3. Repository pattern
4. Optional DI with @analog-tools/inject
5. API route example (h3/Nitro)
6. Validation and error handling
7. Vitest testing setup
8. Indexes and performance tips

## 1) Connection management
Use a cached connection to avoid creating multiple connections during SSR or HMR.

```ts
import mongoose, { type Connection } from 'mongoose';

type MongooseCache = {
	conn: Connection | null;
	promise: Promise<Connection> | null;
};

declare global {
	// eslint-disable-next-line no-var
	var __mongooseCache: MongooseCache | undefined;
}

const cache = (globalThis.__mongooseCache ??= { conn: null, promise: null });

export async function connectToDatabase(uri = process.env.MONGODB_URI ?? ''): Promise<Connection> {
	if (!uri) {
		throw new Error('MONGODB_URI is not set');
	}

	if (cache.conn) {
		return cache.conn;
	}

	if (!cache.promise) {
		cache.promise = mongoose.connect(uri, {
			serverSelectionTimeoutMS: 5000,
		}).then((m) => m.connection);
	}

	cache.conn = await cache.promise;
	return cache.conn;
}
```

## 2) Schema and model pattern
Reuse models when hot-reloading to avoid OverwriteModelError.

```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const GuestSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, index: true },
		rsvp: { type: String, enum: ['yes', 'no', 'maybe'], default: 'maybe' },
	},
	{ timestamps: true }
);

export type Guest = InferSchemaType<typeof GuestSchema>;

export const GuestModel =
	mongoose.models.Guest ?? mongoose.model<Guest>('Guest', GuestSchema);
```

## 3) Repository pattern
Keep all database calls centralized and typed.

```ts
import type { Guest } from './guest.model';
import { GuestModel } from './guest.model';

export async function listGuests(): Promise<Guest[]> {
	return GuestModel.find().sort({ createdAt: -1 }).lean<Guest[]>().exec();
}

export async function createGuest(input: Pick<Guest, 'name' | 'email' | 'rsvp'>): Promise<Guest> {
	const doc = await GuestModel.create(input);
	return doc.toObject() as Guest;
}
```

## 4) Optional DI with @analog-tools/inject
Use server-side DI to keep API handlers thin and reuse repository instances.

```ts
import { Injectable, inject } from '@analog-tools/inject';
import { GuestModel } from './guest.model';

@Injectable()
export class GuestRepository {
	async list() {
		return GuestModel.find().sort({ createdAt: -1 }).lean().exec();
	}
}

const repo = inject(GuestRepository);
```

> Note: TypeScript decorators require `target: ES2015` or later in `tsconfig.json` (no `reflect-metadata` needed).

## 5) API route example (h3/Nitro)
AnalogJS server routes live in `apps/<app>/src/server/routes/api/*`.

```ts
import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';
import { connectToDatabase } from '@shared/data-access/db/mongoose-connection';
import { createGuest } from '@shared/data-access/guest/guest.repository';

const GuestInput = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	rsvp: z.enum(['yes', 'no', 'maybe']).optional(),
});

export default defineEventHandler(async (event) => {
	await connectToDatabase();

	const body = GuestInput.safeParse(await readBody(event));
	if (!body.success) {
		throw createError({ statusCode: 400, statusMessage: body.error.message });
	}

	return createGuest({
		name: body.data.name,
		email: body.data.email,
		rsvp: body.data.rsvp ?? 'maybe',
	});
});
```

## 6) Validation and error handling
- Normalize duplicate key errors (code 11000) to `409 Conflict`.
- Use explicit error messages for user-facing errors.
- Avoid leaking raw database errors to the client.

## 7) Vitest testing setup
Use a dedicated test DB and clean between tests.

```ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { connectToDatabase } from '@shared/data-access/db/mongoose-connection';

beforeAll(async () => {
	process.env.MONGODB_URI = process.env.MONGODB_URI_TEST;
	await connectToDatabase();
});

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections();
	await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
	await mongoose.disconnect();
});
```

## 8) Indexes and performance tips
- Use schema indexes for query-heavy fields.
- Prefer `lean()` for read-only API responses.
- Avoid N+1 queries by modeling embedded documents when appropriate.
