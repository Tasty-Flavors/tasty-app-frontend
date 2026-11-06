"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { iniciais } from "@/lib/format";
import type { Coordenada, Entregador } from "@/types";

/*
 * Mapas do OpenStreetMap: gratuitos e sem chave, mas o servidor público tem política
 * de uso justo e exige a atribuição abaixo. Com muito tráfego em produção, troque esta
 * URL por um provedor de mapas com o mesmo formato de endereço.
 */
const URL_MAPA = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATRIBUICAO = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
const RAIO_ENTREGA_M = 3000;
const TAMANHO_MARCADOR = 36;

interface Camadas {
  marcador: L.Marker;
  chaveIcone: string;
  rota: L.Polyline;
  destino: L.CircleMarker;
}

function iconeEntregador(e: Entregador, selecionado: boolean) {
  // textContent: nomes vêm do cadastro e não podem virar HTML.
  const elemento = document.createElement("span");
  elemento.textContent = iniciais(e.nome);
  return L.divIcon({
    html: elemento,
    className: `mapa__marcador mapa__marcador--${e.status}${selecionado ? " mapa__marcador--selecionado" : ""}`,
    iconSize: [TAMANHO_MARCADOR, TAMANHO_MARCADOR],
  });
}

interface Props {
  entregadores: Entregador[];
  loja: Coordenada;
  selecionadoId: string | null;
  onSelecionar: (id: string) => void;
}

export function MapaEntregadores({ entregadores, loja, selecionadoId, onSelecionar }: Props) {
  const elemento = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const camadas = useRef(new Map<string, Camadas>());
  const selecionar = useRef(onSelecionar);
  useEffect(() => {
    selecionar.current = onSelecionar;
  });

  useEffect(() => {
    if (!elemento.current) return;
    const instancia = L.map(elemento.current, { scrollWheelZoom: false });
    L.tileLayer(URL_MAPA, { attribution: ATRIBUICAO, maxZoom: 19 }).addTo(instancia);
    const area = L.circle(loja, { radius: RAIO_ENTREGA_M, className: "mapa__area", interactive: false }).addTo(instancia);
    // Enquadra a área de entrega em qualquer tamanho de tela.
    instancia.setView(loja, 13);
    instancia.fitBounds(area.getBounds(), { animate: false });
    L.marker(loja, {
      icon: L.divIcon({ html: "Loja", className: "mapa__marcador mapa__marcador--loja", iconSize: [44, 28] }),
      title: "Loja",
      alt: "Loja",
      zIndexOffset: -100,
    }).addTo(instancia);
    // Sem transição enquanto o mapa é arrastado ou redimensionado: o marcador acompanha na hora.
    const alternar = (ativo: boolean) => () => instancia.getContainer().classList.toggle("mapa--arrastando", ativo);
    instancia.on("movestart zoomstart", alternar(true));
    instancia.on("moveend zoomend", alternar(false));
    mapa.current = instancia;
    const registradas = camadas.current;
    return () => {
      instancia.remove();
      mapa.current = null;
      registradas.clear();
    };
  }, [loja]);

  useEffect(() => {
    const instancia = mapa.current;
    if (!instancia) return;
    const visiveis = entregadores.filter((e) => e.status !== "offline");
    const ids = new Set(visiveis.map((e) => e.id));

    camadas.current.forEach((c, id) => {
      if (ids.has(id)) return;
      c.marcador.remove();
      c.rota.remove();
      c.destino.remove();
      camadas.current.delete(id);
    });

    visiveis.forEach((e) => {
      const selecionado = e.id === selecionadoId;
      const chaveIcone = `${e.nome}|${e.status}|${selecionado}`;
      let c = camadas.current.get(e.id);
      if (!c) {
        const marcador = L.marker(e.posicao, { icon: iconeEntregador(e, selecionado), title: e.nome, alt: e.nome }).addTo(instancia);
        marcador.on("click", () => selecionar.current(e.id));
        c = {
          marcador,
          chaveIcone,
          rota: L.polyline([], { className: "mapa__rota", interactive: false }).addTo(instancia),
          destino: L.circleMarker(e.posicao, { radius: 5, className: "mapa__rota", interactive: false }),
        };
        camadas.current.set(e.id, c);
      } else {
        c.marcador.setLatLng(e.posicao);
        if (c.chaveIcone !== chaveIcone) {
          c.marcador.setIcon(iconeEntregador(e, selecionado));
          c.chaveIcone = chaveIcone;
        }
      }
      if (e.status === "em_entrega" && e.destino) {
        c.rota.setLatLngs([e.posicao, e.destino]);
        c.destino.setLatLng(e.destino).addTo(instancia);
      } else {
        c.rota.setLatLngs([]);
        c.destino.remove();
      }
    });
  }, [entregadores, selecionadoId]);

  // Só reage à troca de seleção: não pode recentrar o mapa a cada leitura de posição.
  const posicoes = useRef(entregadores);
  posicoes.current = entregadores;
  useEffect(() => {
    const alvo = posicoes.current.find((e) => e.id === selecionadoId && e.status !== "offline");
    if (alvo) mapa.current?.panTo(alvo.posicao);
  }, [selecionadoId]);

  return <div ref={elemento} className="mapa" role="region" aria-label="Mapa da área de entrega. A lista Frota agora traz os mesmos dados em texto." />;
}
