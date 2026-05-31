export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type AuthResponse = {
  success: true;
};

/**
 * Simula el inicio de sesión de un usuario.
 * @param payload - Datos del formulario de inicio de sesión.
 * @returns Promesa resuelta con un resultado de éxito.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("loginUser payload", payload);
      resolve({ success: true });
    }, 1000);
  });
}

/**
 * Simula el registro de un usuario.
 * @param payload - Datos del formulario de registro.
 * @returns Promesa resuelta con un resultado de éxito.
 */
export async function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("registerUser payload", payload);
      resolve({ success: true });
    }, 1000);
  });
}
