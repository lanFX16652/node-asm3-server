export const config = {
    baseUrl: process.env.NODE_ENV === 'production' ? process.env.BASE_URL : 'http://localhost:5000',
    port: process.env.NODE_ENV === 'production' ? process.env.PORT : 5000,
    mongodbUri: process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : "mongodb+srv://phong:phong@cluster0.iaau95a.mongodb.net/",
    crossDomainClient: process.env.NODE_ENV === 'production' ? process.env.CROSS_DOMAIN_CLIENT : "http://localhost:3000",
    crossDomainAdmin: process.env.NODE_ENV === 'production' ? process.env.CROSS_DOMAIN_ADMIN : "http://localhost:3001",
    transporterUser: process.env.NODE_ENV === 'production' ? process.env.TRANSPORTER_USER : "phonghan548@gmail.com",
    trasnporterPass: process.env.NODE_ENV === 'production' ? process.env.TRANSPORTER_PASS : "flrmycxarcmlwbpt",
}