"use client";

import { Skeleton } from "@mui/material";
import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string; // 원본 이미지 URL
  size?: number; // CSS 표시 크기(px), 기본 40
};

export default function AvatarCanvas({ imageUrl, size = 40 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;

    const handleImage = async () => {
      setLoading(true);

      try {
        // 1) WASM 모듈 동적 로드
        //    - .js가 .wasm를 자동으로 fetch합니다(같은 폴더에 있어야 함)
        const wasm = await import("@/pkg/thumbwasm.js");
        if (aborted) return;

        // 2) 이미지 바이트 가져오기
        const resp = await fetch(imageUrl, { cache: "no-store" });
        const arrbuf = await resp.arrayBuffer();
        const input = new Uint8Array(arrbuf);
        if (aborted) return;

        // 3) WASM으로 40x40 원형 마스킹 RGBA 버퍼 생성
        const outBuf: Uint8Array = wasm.resize_and_mask_rgba(input);
        if (aborted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: false });
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        // 4) 캔버스 실제 픽셀 크기를 DPR 반영해 선명하게
        canvas.width = 40 * dpr;
        canvas.height = 40 * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // DPR 스케일

        // 5) RGBA → ImageData → putImageData로 렌더링
        const imgData = new ImageData(
          new Uint8ClampedArray(
            outBuf.buffer as ArrayBuffer,
            outBuf.byteOffset,
            outBuf.byteLength
          ),
          40,
          40
        );

        ctx.clearRect(0, 0, 40, 40);
        ctx.putImageData(imgData, 0, 0);

        if (!aborted) {
          setLoading(false);
        }
      } catch (_error) {
        // 에러 발생 시 loading 상태를 유지합니다.
      }
    };

    handleImage();

    return () => {
      aborted = true;
    };
  }, [imageUrl, size]);

  return (
    <div className="flex justify-center items-center">
      <canvas
        className="block"
        role="img"
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
      {loading && (
        <Skeleton
          role="progressbar"
          variant="circular"
          width={size}
          height={size}
          className="absolute"
        />
      )}
    </div>
  );
}
