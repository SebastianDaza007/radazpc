"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../../app/indicadores/actions";

export default function IndicatorsLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <form action={action} className="mt-10 grid max-w-sm gap-4">
      <div className="field-row">
        <label htmlFor="ind-password" className="text-sm font-bold">
          Contraseña
        </label>
        <input
          id="ind-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-[46px] rounded border-2 border-mist/15 bg-ink px-3 text-mist"
        />
      </div>
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
