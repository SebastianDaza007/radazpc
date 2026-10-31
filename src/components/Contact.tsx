"use client";

import { useState } from "react";
import { branches, whatsappUrl } from "@/lib/branches";
import { site } from "@/lib/site";
import { useQuote } from "./QuoteProvider";

const equipment = ["PC de escritorio", "Notebook", "PC armada por mí", "Otro"];

export default function Contact() {
  const { branch, branchIndex, setBranchIndex } = useQuote();
  const [name, setName] = useState("");
  const [type, setType] = useState(equipment[0]);
  const [message, setMessage] = useState("");

  const text = [
    `Hola ${site.name}, soy ${name.trim() || "(mi nombre)"}.`,
    `Tengo: ${type}.`,
    message.trim() ? `Consulta: ${message.trim()}` : "Quiero hacer una consulta.",
  ].join("\n");

  return (
    <section id="contacto" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="contact">
        <div>
          <p className="eyebrow text-mist">Contacto</p>
          <h2 className="display mt-4 text-3xl sm:text-5xl">Contanos qué le pasa a tu equipo.</h2>
          <p className="mt-4 max-w-[46ch] text-mist/85">
            Completá los datos y se abre WhatsApp con tu consulta lista para enviar. También podés escribirnos directo a
            cualquiera de las dos sucursales.
          </p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
          <div className="field-row">
            <label htmlFor="c-name">Tu nombre</label>
            <input id="c-name" autoComplete="name" placeholder="Ej: Martina" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field-row">
            <label htmlFor="c-type">Tipo de equipo</label>
            <select id="c-type" value={type} onChange={(e) => setType(e.target.value)}>
              {equipment.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="c-branch">Sucursal</label>
            <select id="c-branch" value={branchIndex} onChange={(e) => setBranchIndex(Number(e.target.value))}>
              {branches.map((b, k) => (
                <option key={b.id} value={k}>
                  {b.name} ({b.street})
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="c-msg">Qué necesitás o qué le pasa</label>
            <textarea id="c-msg" placeholder="Ej: se calienta y hace mucho ruido cuando juego" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <a className="btn-lime" href={whatsappUrl(branch, text)} target="_blank" rel="noopener noreferrer">
            Abrir WhatsApp con mi consulta
          </a>
          <p className="text-sm text-mist/85">Se abre WhatsApp con el mensaje escrito. Lo enviás vos.</p>
        </form>
      </div>
    </section>
  );
}
