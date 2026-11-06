/** Datas relativas a "agora", para que os mocks continuem fazendo sentido em qualquer dia. */
export const minutosAtras = (min: number) => new Date(Date.now() - min * 60000).toISOString();
export const diasAtras = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
export const diasAFrente = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
