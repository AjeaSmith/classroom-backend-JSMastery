import express from "express";
import subjectsRouter from "./db/routes/subjects";
import departmentsRouter from "./db/routes/departments";
import cors from "cors";
import { config } from "dotenv";

config({ path: ".env" });

const app = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
		credentials: true,
	}),
);
app.use(express.json());

app.use("/api/subjects", subjectsRouter);
app.use("/api/departments", departmentsRouter);

app.get("/", (req, res) => {
	res.send("API is running");
});

app.listen(8080, () => console.log("Server is running on port 8080"));
