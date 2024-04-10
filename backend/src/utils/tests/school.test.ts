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

    it("protects against SQL injection", async () => {
        const payload = "test'; DROP TABLE schools; --";
        const response = await request(app).post("/schools/registration").send({
            ownerName: payload,
            schoolName: "Test School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        });

        expect(response.status).toBe(400); // Or any appropriate error code
        expect(response.body).toMatch(/SQL injection attempt/i);
    });

    it("responds with 400 for XSS attack attempt", async () => {
        const response = await request(app).post("/schools/registration").send({
            ownerName: "Ali Koffi<script>alert('XSS')</script>",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    it("responds with 400 for invalid schoolHotline format", async () => {
        const response =await request(app)
          .post("/schools/registration")
          .send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "054223351A",
            location: "Sapeiman",
          });
      
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", /School hotline should be a valid phone number/);
      });
      
      it("responds with 400 for invalid email format", async () => {
        const response = await request(app)
          .post("/schools/registration")
          .send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            email: "invalid-email",
            location: "Sapeiman",
          });
      
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", /Email should be a valid email address/);
      });
      
      it("responds with 400 for invalid location format", async () => {
        const response = await request(app)
          .post("/schools/registration")
          .send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            email: "valid@email.com",
            location: 123,
          });
      
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", /Location should be a valid string/);
      });
      
      it("responds with 400 for invalid name format", async () => {
        const response = await request(app)
          .post("/schools/registration")
          .send({
            ownerName: 123,
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            email: "valid@email.com",
            location: "Sapeiman",
          });
      
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", /Owner name should be a valid string/);
      });

    it("responds with school already exist", async () => {
        const response = await request(app).post("/shools/registration").send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        })
    });

    it("responds with 429 for too many requests", async () => {
        const agent = request.agent(app);

        for (let i = 0; i < 10; i++) {
            await agent.post("/schools/registration").send({
                ownerName: "Ali Koffi",
                schoolName: "HolyStar Int.School",
                schoolHotline: "0542233516",
                location: "Sapeiman"
            });
        }

        const response = await agent.post("/schools/registration").send({
            ownerName: "Ali Koffi",
            schoolName: "HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        });

        expect(response.status).toBe(429);
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

})

describe("GET /schools", () => {
    it("responds with 401 for unauthorized access", async () => {
        const response = await request(app).get("/schools/123");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Unauthorized access");
    });

    it("responds with 401 for unauthorized access with token", async () => {
        const response = await request(app)
            .get("/schools/123")
            .set("Authorization", "Bearer invalid_token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Unauthorized access");
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

    it("responds with an array of schools for valid request", async () => {
        const response = await request(app).get("/schools?page=1&limit=10").send();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it("handles missing owner name during registration", async () => {
        const response = await request(app).post("/schools/registration").send({
            schoolName: "Test School",
            schoolHotline: "0542233516",
            location: "Sapeiman"
        });

        expect(response.status).toBe(400);
        expect(response.body).toMatch(/Owner name is required/i);
    });

    it("responds with 200 for successful read", async () => {
        const response = await request(app).get("/schools/123").set("Authorization", "Bearer valid_token");
      
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("_id", "123");
        expect(response.body.data).toHaveProperty("ownerName", "Ali Koffi");
        expect(response.body.data).toHaveProperty("schoolName", "HolyStar Int.School");
        expect(response.body.data).toHaveProperty("schoolHotline", "0542233516");
        expect(response.body.data).toHaveProperty("location", "Sapeiman");
    });
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


describe("UPDATE /schools/:id", () => {
    it("responds with 401 for unauthorized access", async () => {
        const response = await request(app).put("/schools/123").send({
            ownerName: "Updated Ali Koffi",
            schoolName: "Updated HolyStar Int.School",
            schoolHotline: "0542233516",
            location: "Updated Sapeiman",
        });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Unauthorized access");
    });

    it("responds with 401 for unauthorized access with token", async () => {
        const response = await request(app)
            .put("/schools/123")
            .set("Authorization", "Bearer invalid_token")
            .send({
                ownerName: "Updated Ali Koffi",
                schoolName: "Updated HolyStar Int.School",
                schoolHotline: "0542233516",
                location: "Updated Sapeiman",
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Unauthorized access");
    });

    it("responds with 400 for invalid ID", async () => {
        const response = await request(app)
            .put("/schools/invalid_id")
            .set("Authorization", "Bearer valid_token") // FIXME: add a valid bearer
            .send({
                ownerName: "Updated Ali Koffi",
                schoolName: "Updated HolyStar Int.School",
                schoolHotline: "0542233516",
                location: "Updated Sapeiman",
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", /Invalid ID format/);
    });

    it("responds with 200 for valid ID", async () => {
        const response = await request(app)
            .put("/schools/123")
            .set("Authorization", "Bearer valid_token") // FIXME: add a valid bearer
            .send({
                ownerName: "Updated Ali Koffi",
                schoolName: "Updated HolyStar Int.School",
                schoolHotline: "0542233516",
                location: "Updated Sapeiman",
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "School updated successfully");
    });

})