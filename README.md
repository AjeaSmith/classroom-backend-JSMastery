# Classroom App: Course by JS Mastery

## ⭐️ Setup Project ⭐️

- Install express and create app with test routes.
- Configure typescript
- Setup serverless Postgres database using Neon (on platform)
- Installed Drizzle for ORM, connected DB to Drizzle. (`src/db/index.ts`)
- Configure Drizzle's migration and schema files (`drizzle.config.ts`)
- Add schema's

## ⭐️ Notes ⭐️

**What does this code do?**

```js
export const departmentRelations = relations(departments, ({ many }) => ({
	subjects: many(subjects),
}));
```

It establishes a (one-to-many) relationship between `department -> subjects`. So when we query for a `department`, we can get all it's `subjects` as well.

Example of what data look like:

query ->

```js
db.query.departments.findMany({
	with: {
		subjects: true,
	},
});
```

result ->

```json
[
	{
		"id": 1,
		"name": "Mathematics",
		"subjects": [
			{
				"id": 101,
				"name": "Algebra",
				"departmentId": 1
			},
			{
				"id": 102,
				"name": "Calculus",
				"departmentId": 1 // reference to department table
			}
		]
	},
	{
		"id": 2,
		"name": "Science",
		"subjects": [
			{
				"id": 201,
				"name": "Biology",
				"departmentId": 2 // reference to department table
			}
		]
	}
]
```

**What does this code do?**

```js
export const subjectRelations = relations(subjects, ({ one, many }) => ({
	department: one(departments, {
		fields: [subjects.departmentId],
		references: [departments.id],
	}),
}));
```

It establishes a (many-to-one) relationship between `subjects -> department`. So when we query for `subjects` we also get it's `department` as well.

Example of what data look like:
query ->

```js
const subject = await db.query.subjects.findFirst({
	where: (subjects, { eq }) => eq(subjects.name, "Calculus"),
	with: {
		department: true,
	},
});
```

result ->

```json
{
	"id": 102,
	"name": "Calculus",
	"departmentId": 1,
	"department": {
		"id": 1,
		"name": "Mathematics"
	}
}
```

`export type Department = typeof departments.$inferSelect;`
`export type Subject = typeof subjects.$inferSelect;`
This code ensures that the App types are in sync with Database types. It will auto generate types for you, based on your DB schema to avoid creating types yourself.

**What does this code do?**

```js
const countResult = await db
	.select({ count: sql < number > `count(*)` })
	.from(subjects)
	.leftJoin(departments, eq(subjects.departmentId, departments.id))
	.where(whereClause);
```

This returns the total number of subject rows that match your filters — not the actual subjects.

```js
const totalCount = countResult[0]?.count ?? 0;
```

This extracts the number from `countResult`, If none it returns 0.

```js
const subjectsResult = await db
	.select({
		...getTableColumns(subjects),
		department: { ...getTableColumns(departments) },
	})
	.from(subjects)
	.leftJoin(departments, eq(subjects.departmentId, departments.id))
	.where(whereClause)
	.orderBy(desc(subjects.createdAt))
	.limit(limitPerPage)
	.offset(offset);
```

This query's for the subjects and the department and applies all filters/pagination. FYI without `leftJoin` the department data will not be included in the result.

```js
res.status(200).json({
	data: subjectsResult,
	pagination: {
		total: totalCount,
		page: currentPage,
		limit: limitPerPage,
		totalPages: Math.ceil(totalCount / limitPerPage),
	},
});
```

This lets us return the data in a  `{data: , pagination: {}}` format.
