import app from "@/app";
import request from "supertest";

describe("POST /schools/registration", () => {

    it("responds with 400 for SQL injection attempt", async () => {
        const response = await request(app).post("/schools/registration").send({
            ownerName: "Ali Koffi' OR 1=1 --",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        });
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    it("respond registration successfull", async () => {
        const response = await request(app).post("/schools/registration").send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("message")
    });

    it("respond with all fields are required", async () => {
        const response = await request(app).post("/schools/registration").send({
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        })

        expect(response.status).toBe(403)
        expect (response.body).toHaveProperty("message")
    });

    it("responds with school already exist", async () => {
        const response = await request(app).post("/shools/registration").send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        })
    });
})

describe("GET /schools", () => {
    it("responds you don't have access to this feature", async () => {
        const response = await request(app).get("/schools").send()

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("message")
    });

    it("responds succeed getting all schools", async () => {
        const response = await request(app).get("/schools/").send()

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("message")
    });

    it("responds no school found", async () => {
        const response = await request(app).get("/schools/:id")/* replace :id with actual id*/.send()

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("message")
    });

    it("responds school sccessfully retreived", async () => {
        const response = await request(app).get("/schools/:id")/* replace :id with actual id*/.send()

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("message")
    })
})

describe("DELETE /schools/:id", () => {
    it("responds with 405 for invalid request method", async () => {
        const response = await request(app).delete("/schools/registration").send();
    
        expect(response.status).toBe(405);
        expect(response.body).toHaveProperty("message");
    });

    it("responds with 404 for invalid id", async () => {
        const response = await request(app).delete("/schools/:id").send();
    
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
    });

    it("responds with 200 for valid id", async () => {
        const response = await request(app).delete("/schools/:id").send();
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
    });
})
