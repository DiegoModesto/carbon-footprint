import request from "supertest"
import { app } from "../src/"

describe("POST /carbom-footprint", () => {
    it ("should store a new value from carbon footprint and return id", async () => {
        const response = await request(app)
            .post("/carbon-footprint")
            .send({ value: 123 })
            .expect(201)

        expect(response.body).toHaveProperty("id")
        expect(response.body.value).toBe(123)

        const getResponse = await request(app)
            .get("/carbon-footprint")
            .expect(200)

        expect(getResponse.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: response.body.id,
                    value: 123,
                }),
            ]),
        )
    })

    it ("should return an error for a invalid value", async () => {
        const response = await request(app)
            .post("/carbon-footprint")
            .send({ value: -1 })
            .expect(400)

        expect(response.body).toHaveProperty("error")
    })

    it ("should return an error from a not number value", async () => {
        const response = await request(app)
            .post("/carbon-footprint")
            .send({ value: "a" })
            .expect(400)

        expect(response.body).toHaveProperty("error")
    })
})