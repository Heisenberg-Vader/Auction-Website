import selfsigned from "selfsigned";
import fs from "fs";
import path from "path";

const certsDir = path.join(process.cwd(), "certs");

if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

const keyPath = path.join(certsDir, "key.pem");
const certPath = path.join(certsDir, "cert.pem");

const attrs = [{ name: "commonName", value: "localhost" }];
const pems = await selfsigned.generate(attrs, { keySize: 2048, days: 365 });

fs.writeFileSync(keyPath, pems.private);
fs.writeFileSync(certPath, pems.cert);

console.log("Self-signed certificates generated in backend/certs/");
