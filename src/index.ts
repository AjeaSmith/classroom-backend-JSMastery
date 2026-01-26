import express from "express";
import subjectsRouter from "./db/routes/subjects";
import cors from "cors";
import { config } from "dotenv";

config({ path: ".env" });

const app = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL!,
		credentials: true,
	}),
);
app.use(express.json());

app.use("/api/subjects", subjectsRouter);

app.get("/", (req, res) => {
	res.send("API is running");
});

app.listen(8080, () => console.log("Server is running on port 8080"));
