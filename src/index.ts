import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send("API is running");
});
app.post("/test", async (req, res) => {
	// const data = {
	// 	name: "Introduction to Computer Science",
	// 	code: "CS101",
	// 	department: "Computer Science",
	// 	description:
	// 		"Introduction to computer science fundamentals including algorithms, problem-solving, and basic programming concepts.",
	// };
	// try {
	// 	const result = await db.insert(subjects).values(data).returning();
	// 	res.json(result);
	// } catch (error) {
	// 	console.log("Error add data: ", error);
	// 	res.status(400).json({ error: error });
	// }
});

app.listen(8080, () => console.log("Server is running on port 8080"));
