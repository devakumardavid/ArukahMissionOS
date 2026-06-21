import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";
import { Injectable } from "@nestjs/common";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;

    return `scrypt$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, saltValue, keyValue] = storedHash.split("$");

    if (algorithm !== "scrypt" || !saltValue || !keyValue) {
      return false;
    }

    const salt = Buffer.from(saltValue, "base64");
    const storedKey = Buffer.from(keyValue, "base64");
    const suppliedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;

    return (
      storedKey.length === suppliedKey.length &&
      timingSafeEqual(storedKey, suppliedKey)
    );
  }
}
