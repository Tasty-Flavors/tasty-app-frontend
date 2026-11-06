import Image from "next/image";
import { iniciais } from "@/lib/format";

export function Avatar({ nome, src, grande }: { nome: string; src?: string; grande?: boolean }) {
  const lado = grande ? 100 : 40;
  return (
    <span className={grande ? "avatar avatar--g" : "avatar"}>
      {src ? <Image src={src} alt={`Imagem de ${nome}`} width={lado} height={lado} unoptimized /> : <span aria-hidden="true">{iniciais(nome)}</span>}
    </span>
  );
}
