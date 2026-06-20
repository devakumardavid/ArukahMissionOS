type Environment = {
  API_PORT?: string;
  APP_BASE_URL?: string;
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
