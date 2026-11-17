/**
 * Utilidades de NAVEGADOR para o gerador de proposta (carregar imagens, foto circular, baixar PDF).
 * Importe junto com ./proposta-pdf. Só roda no browser (usa fetch/Image/canvas).
 */
import type { Assets, Produto } from "./proposta-pdf";

export interface ImagemCarregada {
  dataUrl: string;
  w: number;
  h: number;
}

/** Baixa uma imagem (mesma origem ou com CORS liberado) e devolve data URL + tamanho. */
export async function carregarImagem(url: string, maxLado = 1400, tipo: "jpeg" | "png" = "jpeg"): Promise<ImagemCarregada> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Imagem não carregou (${resp.status})`);
  const bmp = await createImageBitmap(await resp.blob());
  const esc = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * esc);
  const h = Math.round(bmp.height * esc);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  if (tipo === "jpeg") {
    ctx.fillStyle = "#FFFFFF"; // JPEG não tem transparência
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  return { dataUrl: cv.toDataURL(tipo === "jpeg" ? "image/jpeg" : "image/png", 0.88), w, h };
}

/** Foto de perfil → quadrado recortado em círculo (PNG com transparência). */
export async function fotoCircular(url: string, lado = 360): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Foto não carregou (${resp.status})`);
  const bmp = await createImageBitmap(await resp.blob());
  const cv = document.createElement("canvas");
  cv.width = lado;
  cv.height = lado;
  const ctx = cv.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(lado / 2, lado / 2, lado / 2, 0, Math.PI * 2);
  ctx.clip();
  const m = Math.min(bmp.width, bmp.height); // corte central quadrado
  ctx.drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, lado, lado);
  return cv.toDataURL("image/png");
}

/** Carrega os fundos de luz (e a logo) que ficam em /public/proposta/. */
export async function carregarAssets(base: string): Promise<Assets> {
  const [c, f, l] = await Promise.all([
    carregarImagem(`${base}/glow-cover.jpg`, 1200),
    carregarImagem(`${base}/glow-final.jpg`, 1200),
    carregarImagem(`${base}/logo-csm.png`, 1600, "png").catch(() => null), // logo é opcional
  ]);
  return {
    glowCover: c.dataUrl,
    glowFinal: f.dataUrl,
    logoDataUrl: l?.dataUrl,
    logoW: l?.w,
    logoH: l?.h,
  };
}

/** Converte uma peça do catálogo em Produto para o PDF (imagem pode falhar sem derrubar a proposta). */
export async function produtoParaPdf(
  base: Omit<Produto, "imgDataUrl" | "imgW" | "imgH">,
  imagemUrl?: string,
): Promise<Produto> {
  if (!imagemUrl) return base;
  try {
    const img = await carregarImagem(imagemUrl);
    return { ...base, imgDataUrl: img.dataUrl, imgW: img.w, imgH: img.h };
  } catch (erro) {
    console.warn("PDF: foto não carregou", imagemUrl, erro);
    return base; // sem foto, o layout mostra só o painel cinza
  }
}

/** Dispara o download (ou abre o compartilhamento nativo no celular, se disponível). */
export async function entregarPdf(pdf: ArrayBuffer, nomeArquivo: string) {
  const blob = new Blob([pdf], { type: "application/pdf" });
  const arquivo = new File([blob], nomeArquivo, { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: nomeArquivo });
      return;
    } catch {
      /* usuário cancelou: cai no download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
