"use client";

import { useState, type ChangeEvent } from "react";

type EventoCampo = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/** Estado de um formulário. `campo` liga um <Field> a uma chave, com máscara opcional. */
export function useFormulario<T extends object>(inicial: T | (() => T)) {
  const [form, setForm] = useState<T>(inicial);

  const campo = (chave: keyof T, mascara?: (v: string) => string) => ({
    value: form[chave] as string,
    onChange: (e: EventoCampo) => {
      const valor = e.target.value;
      setForm((f) => ({ ...f, [chave]: mascara ? mascara(valor) : valor }));
    },
  });

  return { form, setForm, campo };
}
