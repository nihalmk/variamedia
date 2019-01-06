import { hash } from "bcrypt";
import "jest";
import { disconnect } from "mongoose";
import { env } from "process";
import { stringToken } from "string-token";
import { main } from "../main";
import { getContext } from "../shared/context/get-context.function";
import { sendMail } from "../shared/mail.function";
import { signJWT } from "../shared/sign-jwt.function";
import { UserModel } from "./user.model";
import supertest = require("supertest");

jest.mock("../shared/mail.function");

const url = `http://localhost:4000/`;
const request = supertest(url);

const PORT: number = 4000;
let verified_user = null;
let server = null;

describe("User Resolver", () => {

    beforeAll(async (done) => {
        env.APP_SECRET = "some_random_secret_key";
        server = await main({ env: "dev", port: PORT });
        const passwordHash = await hash("123456", 10);
        const verifiedUser = new UserModel({
            email: "verifieduser@gmail.com",
            passwordHash,
        });
        await verifiedUser.save();
        verified_user = verifiedUser;
        const unverifiedUser = new UserModel({
            email: "notverifieduser@gmail.com",
            passwordHash,
            emailVerifyToken: "randomtoken",
        });
        await unverifiedUser.save();
        done();
    });
    it("sign up mutation should return true if success", (done) => {
        sendMail.mockImplementation(() => null);
        const query = `mutation {
            signup(params:{
            email:"test@gmail.com"
            password:"123456"
        })
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.signup).toBe(true);
            done();
        });
    });
    it("sign up mutation should return error 'Same email address already exists' if same email exist", (done) => {
        sendMail.mockImplementation(() => null);
        const query = `mutation {
            signup(params:{
            email:"test@gmail.com"
            password:"123456"
        })
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("Same email address already exists");
            done();
        });
    });

    it ("verify email should return true for valid token", async (done) => {
        const token = await stringToken(64);
        await UserModel.update({ email: "test@gmail.com"}, { emailVerifyToken: token });
        const query = `mutation {
            verifyEmail(
                emailVerifyToken: "${token}"
            )
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.verifyEmail).toBe(true);
            done();
        });
    });
    it ("verify email should return error message 'Invalid Token' for invalid token", async (done) => {
        const token = await stringToken(64);
        await UserModel.update({ email: "test@gmail.com"}, { emailVerifyToken: token });
        const query = `mutation {
            verifyEmail(
                emailVerifyToken: "${token}invalid"
            )
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("Invalid Token");
            done();
        });
    });

    it("when verified user login, it should return valid token", async (done) => {
        const loginquery = `mutation {
            login(params:{
            email:"verifieduser@gmail.com"
            password:"123456"
        }) {
            token
            user {
            email
            }
        }
        }`;
        request.post("/")
        .send({ query: loginquery })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.login.token).toBeDefined();
            const token = res.body.data.login.token;
            const payload = getContext(token);
            expect(payload._id).toBeDefined();
            done();
        });
    });
    it("when non verified user login, it should return error message 'Email not verified yet'", async (done) => {
        // not verified user
        const notverified = `mutation {
            login(params:{
            email:"notverifieduser@gmail.com"
            password:"123456"
        }) {
            token
            user {
            email
            }
        }
        }`;
        request.post("/")
        .send({ query: notverified })
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("Email not verified yet");
            done();
        });

    });
    it ("Invalid email login mutation should return error message 'Invalid email address or password'",
    async (done) => {

        // wrong email or password
        const wrong_loginquery = `mutation {
            login(params:{
            email:"testfailed@gmail.com"
            password:"123456"
        }) {
            token
            user {
            email
            }
        }
        }`;
        request.post("/")
        .send({ query: wrong_loginquery })
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("Invalid email address or password");
            done();
        });
    });
    it ("Invalid password login mutation should return error message 'Invalid email address or password'",
    async (done) => {

        // wrong email or password
        const wrong_loginquery = `mutation {
            login(params:{
            email:"test@gmail.com"
            password:"123456invalid"
        }) {
            token
            user {
            email
            }
        }
        }`;
        request.post("/")
        .send({ query: wrong_loginquery })
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("Invalid email address or password");
            done();
        });
    });

    it("send password recovery email mutation should return true if success", async (done) => {
        sendMail.mockImplementation(() => null);
        const query = `mutation{
            sendPasswordRecoverEmail(email:"test@gmail.com")
          }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.sendPasswordRecoverEmail).toBe(true);
            done();
        });
    });
    it(`send password recovery  email mutation should return error message
     'No user with such email' if no such email registered`, async (done) => {
        sendMail.mockImplementation(() => null);
        const query = `mutation{
            sendPasswordRecoverEmail(email:"testunknown@gmail.com")
          }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("No user with such email");
            done();
        });
    });

    it("Should return recoverPassword variable true if recover password successed", async (done) => {
        const token = await stringToken(64);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await UserModel.update({ email: "test@gmail.com"},
        { passwordResetToken: token, passwordResetExpires: expires, emailVerifyToken: null });
        const query = `mutation {
            recoverPassword(
                passwordResetToken: "${token}"
                newPassword: "newpassword"
            )
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.recoverPassword).toBe(true);
            done();
        });
    });
    it("Should return 'Invalid token' error if recover password token invalid", async (done) => {
        const token = await stringToken(64);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await UserModel.update({ email: "test@gmail.com"},
        { passwordResetToken: token, passwordResetExpires: expires, emailVerifyToken: null });
        const query = `mutation {
            recoverPassword(
                passwordResetToken: "${token}"
                newPassword: "newpassword"
            )
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.recoverPassword).toBe(true);
            done();
        });
    });
    it("Should return 'Expired token' error if recover password token expired", async (done) => {
        const token = await stringToken(64);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await UserModel.update({ email: "test@gmail.com"},
        { passwordResetToken: token, passwordResetExpires: expires, emailVerifyToken: null });
        const query = `mutation {
            recoverPassword(
                passwordResetToken: "${token}"
                newPassword: "newpassword"
            )
        }`;
        request.post("/")
        .send({ query })
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.recoverPassword).toBe(true);
            done();
        });
    });

    it("Change Password mutation should return true for valid token", async (done) => {

        const authroiazation =  signJWT({ _id: verified_user._id, role: verified_user.role });
        const changepasswordquery = `mutation {
            changePassword(new_password:"123123")
        }`;
        request.post("/")
        .send({ query: changepasswordquery })
        .set("Authorization", authroiazation)
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.changePassword).toBe(true);
            done();
        });
    });
    it("Change Password mutation should return error message 'No such user found' for Invalid token", async (done) => {

        const authroiazation =  signJWT({ _id: "5bedd2d2223ba649fffac91b", role: verified_user.role });
        const changepasswordquery = `mutation {
            changePassword(new_password:"123123")
        }`;
        request.post("/")
        .send({ query: changepasswordquery })
        .set("Authorization", authroiazation)
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("No such user found");
            done();
        });
    });

    it("Update profile mutation should return updated profile data if success", async (done) => {

        const authroiazation =  signJWT({ _id: verified_user._id, role: verified_user.role });
        const changepasswordquery = `mutation{
            updateProfile(params:{
              firstName:"changedname"
              lastName:"changedname2"
              dateOfBirth:"2018-9-1"
              address:{
                city:"Toyko"
                company:"Varia"
                country:"Jp"
                street:"st"
                zipCode:"123123"
              }
            }){
              _id,
              firstName,
              lastName,
              dateOfBirth,
              address {
                  city,
                  company,
                  country,
                  street,
                  zipCode
              }
            }
          }`;
        request.post("/")
        .send({ query: changepasswordquery })
        .set("Authorization", authroiazation)
        .expect(200)
        .end((err, res) => {
            expect(res.body.data.updateProfile._id).toBeDefined();
            expect(res.body.data.updateProfile.firstName).toBe("changedname");
            expect(res.body.data.updateProfile.lastName).toBe("changedname2");
            const expected_date = new Date("2018-9-1");
            const returned_date = new Date(res.body.data.updateProfile.dateOfBirth);
            const compared_date = expected_date.toISOString() === returned_date.toISOString();
            expect(compared_date).toBe(true);

            expect(res.body.data.updateProfile.address.city).toBe("Toyko");
            expect(res.body.data.updateProfile.address.company).toBe("Varia");
            expect(res.body.data.updateProfile.address.country).toBe("Jp");
            expect(res.body.data.updateProfile.address.street).toBe("st");
            expect(res.body.data.updateProfile.address.zipCode).toBe("123123");
            done();
        });
    });
    it("Update profile mutation should return error message 'No such user found' for Invalid token", async (done) => {

        const authroiazation =  signJWT({ _id: "5bedd2d2223ba649fffac91b", role: verified_user.role });
        const changepasswordquery = `mutation{
            updateProfile(params:{
              firstName:"changedname"
              lastName:"changedname2"
              dateOfBirth:"2018-9-1"
              address:{
                city:"Toyko"
                company:"Varia"
                country:"Jp"
                street:"st"
                zipCode:"123123"
              }
            }){
              _id,
              firstName,
              lastName,
              dateOfBirth,
              address {
                  city,
                  company,
                  country,
                  street,
                  zipCode
              }
            }
          }`;
        request.post("/")
        .send({ query: changepasswordquery })
        .set("Authorization", authroiazation)
        .expect(200)
        .end((err, res) => {
            const errMsg = res.body.errors[0].message;
            expect(errMsg).toBe("No such user found");
            done();
        });
    });
    afterAll(() => {
        if (server) {
            server.stop();
        }
        disconnect();
    });
});
