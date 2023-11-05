import dotenv from "dotenv";
dotenv.config();

export const config = {
    baseUrl: process.env.BASE_URL,
    port: process.env.PORT,
    mongodbUri: process.env.MONGODB_URI,
    crossDomainClient: process.env.CROSS_DOMAIN_CLIENT,
    crossDomainAdmin: process.env.CROSS_DOMAIN_ADMIN,
    transporterUser: process.env.TRANSPORTER_USER,
    transporterPass: process.env.TRANSPORTER_PASS,
}