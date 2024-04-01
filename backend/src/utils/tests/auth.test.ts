import signup from "../../controllers/auth";
import app from "../../app";
import request from "supertest"

describe("POST /signup", () => {
        it("responds with a registration success message", async () => {
            const response = await request(app).post('/signup')
             .send({
                username: "Kash",
                password: "<PASSWORD>"
              })
              expect(response.status).toBe(200);
              expect(response.body).toHaveProperty("message");
        });
    }
)