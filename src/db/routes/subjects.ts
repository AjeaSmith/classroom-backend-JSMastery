import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../schema";
import { db } from "..";

const router = express.Router();

// GET all subjects with optional search, filter and pagination
router.get("/", async (req, res) => {
	try {
		const { search, department, page = 1, limit = 10 } = req.query;

		const currentPage = Math.max(1, +page);
		const limitPerPage = Math.max(1, +limit);

		// TODO: How does this work?
		const offset = (currentPage - 1) * limitPerPage;

		const filterCondtions = [];

		// if search query exist, filter by subject name OR subject code
		if (search) {
			filterCondtions.push(
				or(
					ilike(subjects.name, `%${search}%`),
					ilike(subjects.code, `%${search}%`),
				),
			);
		}
		// if deartment query exist, filter by department name
		if (department) {
			filterCondtions.push(ilike(departments.name, `%${department}%`));
		}

		// if there are filter, apply filter condtions in query
		const whereClause =
			filterCondtions.length > 0 ? and(...filterCondtions) : undefined;

		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(subjects)
			.leftJoin(departments, eq(subjects.departmentId, departments.id))
			.where(whereClause);

		const totalCount = countResult[0]?.count ?? 0;

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

		res.status(200).json({
			data: subjectsResult,
			pagination: {
				total: totalCount,
				page: currentPage,
				limit: limitPerPage,
				totalPages: Math.ceil(totalCount / limitPerPage),
			},
		});
	} catch (error) {
		console.log("GET /subject error", error);
		res.status(500).json({ error: error });
	}
});

export default router;
