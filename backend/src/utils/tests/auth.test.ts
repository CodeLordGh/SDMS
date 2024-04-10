import app from "../../app";
import request from "supertest";

const users = [
  {
    username: "Kash",
    password: "1234kash",
    email: "kash@gmail.com",
  },
  {
    username: "jhon",
    password: "1234john",
    email: "john@gmail.com",
  }
]

describe("POST /auth", () => {
  it("responds with a registration success message", async () => {
    const response = await request(app).post("/auth").send({
      username: users[0].username,
      password: users[0].password,
      email: users[0].email
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
  it("response with all fields are requiered", async () => {
    const response = await request(app).post("/auth").send({
      username: users[0].username,
      password: users[0].password,
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
  it("responds with wrong credentials!", async () => {
    const response = await request(app).post('/auth').send({
      email: "lord@gmail.com",
      password: "23588"
    })
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  })
  it("responds with No user found!", async () => {
    const response = await request(app).post("/singup").send({
      password: users[1].password,
      email: users[1].email
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
});
