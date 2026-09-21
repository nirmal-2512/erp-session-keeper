import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

const getKey = () => {
  const key = process.env.ERP_COOKIE_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "ERP_COOKIE_ENCRYPTION_KEY is not configured"
    );
  }

  const buffer = Buffer.from(key, "hex");

  if (buffer.length !== 32) {
    throw new Error(
      "ERP_COOKIE_ENCRYPTION_KEY must be exactly 32 bytes"
    );
  }

  return buffer;
};

export const encryptData = (plainText) => {
  const key = getKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
};

export const decryptData = (
  encryptedData,
  iv,
  authTag
) => {
  const key = getKey();

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(
    Buffer.from(authTag, "base64")
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(encryptedData, "base64")
    ),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};