type Environment = {
  API_PORT?: string;
  APP_BASE_URL?: string;
  AUTH_BOOTSTRAP_KEY?: string;
  AUTH_JWT_EXPIRES_SECONDS?: string;
  AUTH_JWT_SECRET?: string;
  DATABASE_URL?: string;
  NODE_ENV?: string;
};

export function validateEnvironment(environment: Environment): Environment {
  if (environment.API_PORT) {
    const port = Number(environment.API_PORT);

    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new Error("API_PORT must be an integer between 1 and 65535");
    }
  }

  if (environment.APP_BASE_URL) {
    assertUrl("APP_BASE_URL", environment.APP_BASE_URL, ["http:", "https:"]);
  }

  if (environment.DATABASE_URL) {
    assertUrl("DATABASE_URL", environment.DATABASE_URL, ["postgres:", "postgresql:"]);
  }

  if (!environment.AUTH_JWT_SECRET || environment.AUTH_JWT_SECRET.length < 32) {
    throw new Error("AUTH_JWT_SECRET must contain at least 32 characters");
  }

  if (!environment.AUTH_BOOTSTRAP_KEY || environment.AUTH_BOOTSTRAP_KEY.length < 16) {
    throw new Error("AUTH_BOOTSTRAP_KEY must contain at least 16 characters");
  }

  if (environment.AUTH_JWT_EXPIRES_SECONDS) {
    const expiresInSeconds = Number(environment.AUTH_JWT_EXPIRES_SECONDS);

    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 60) {
      throw new Error("AUTH_JWT_EXPIRES_SECONDS must be an integer of at least 60");
    }
  }

  return environment;
}

function assertUrl(name: string, value: string, allowedProtocols: string[]) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  if (!allowedProtocols.includes(url.protocol)) {
    throw new Error(`${name} must use ${allowedProtocols.join(" or ")}`);
  }
}
