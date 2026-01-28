import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../schema";
import { db } from "..";

const router = express.Router();

// GET all Departments with optional search and pagination
router.get("/", async (req, res) => {
	try {
		const { search, page = 1, limit = 10 } = req.query;

		const currentPage = Math.max(1, +page);
		const limitPerPage = Math.max(1, +limit);

		// TODO: How does this work?
		const offset = (currentPage - 1) * limitPerPage;

		const filterCondtions = [];

		// if search query exist, filter by subject name OR subject code
		if (search) {
			filterCondtions.push(
				or(
					ilike(departments.name, `%${search}%`),
					ilike(departments.code, `%${search}%`),
				),
			);
		}

		// if there are filters, apply filter conditions in query
		const whereClause =
			filterCondtions.length > 0 ? and(...filterCondtions) : undefined;

		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(departments)
			.where(whereClause);

		const totalCount = countResult[0]?.count ?? 0;

		const departmentsList = await db
			.select({
				...getTableColumns(departments),
				totalSubjects: sql<number>`count(${subjects.id})`,
			})
			.from(departments)
			.leftJoin(subjects, eq(departments.id, subjects.departmentId))
			.where(whereClause)
			.groupBy(departments.id)
			.orderBy(desc(departments.createdAt))
			.limit(limitPerPage)
			.offset(offset);

		res.status(200).json({
			data: departmentsList,
			pagination: {
				total: totalCount,
				page: currentPage,
				limit: limitPerPage,
				totalPages: Math.ceil(totalCount / limitPerPage),
			},
		});
	} catch (error) {
		console.log("GET /departments error", error);
		res.status(500).json({ error: "Failed to fetch departments" });
	}
});

export default router;
