"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "../../app/indicadores/actions";

export default function IndicatorsLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className="mt-10 grid max-w-sm gap-4">
      <div className="field-row">
        <label htmlFor="admin-username">Usuario</label>
        <input id="admin-username" name="username" required autoComplete="username" maxLength={100}
          autoCapitalize="none" spellCheck={false} />
      </div>
      <div className="field-row">
        <label htmlFor="ind-password" className="text-sm font-bold">
          Contraseña
        </label>
        <input
          id="ind-password"
          name="password"
          type={showPassword ? "text" : "password"}
          maxLength={256}
          required
          autoComplete="current-password"
          className="min-h-[46px] rounded border-2 border-mist/15 bg-ink px-3 text-mist"
        />
      </div>
      <button type="button" className="min-h-11 justify-self-start text-sm text-mist/80 underline underline-offset-4"
        aria-controls="ind-password" aria-pressed={showPassword} onClick={() => setShowPassword((show) => !show)}>
        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-lime">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-lime">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
