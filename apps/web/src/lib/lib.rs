use wasm_bindgen::prelude::*;
use image::imageops::FilterType;
use image::{DynamicImage, GenericImageView};

#[cfg(feature = "console_error_panic_hook")]
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn resize_and_mask_rgba(input_bytes: &[u8]) -> Result<Box<[u8]>, JsValue> {
    // 1) 메모리상의 이미지 디코딩 (png/jpg/webp 등)
    let img = image::load_from_memory(input_bytes)
        .map_err(|e| JsValue::from_str(&format!("decode error: {e}")))?;

    // 2) 40x40으로 리사이즈 (고품질 필터)
    let mut out = img.resize_exact(40, 40, FilterType::Lanczos3).to_rgba8();

    // 3) 원형 마스크 적용 (알파 채널 조정)
    // - 중심은 (19.5, 19.5)로 잡아 가장자리를 부드럽게(1px feather)
    let (w, h) = out.dimensions();
    let cx = (w as f32 - 1.0) / 2.0;
    let cy = (h as f32 - 1.0) / 2.0;
    let r = (w.min(h) as f32) / 2.0;
    let feather = 1.0_f32;

    for y in 0..h {
        for x in 0..w {
            let dx = x as f32 - cx;
            let dy = y as f32 - cy;
            let dist = (dx * dx + dy * dy).sqrt();

            // 안쪽: 완전 불투명, 바깥: 완전 투명, 경계는 선형 보간
            let a = if dist <= r - feather {
                255
            } else if dist >= r + feather {
                0
            } else {
                // feather 범위(약 2px)에서 0..255 선형 전환
                let t = (r + feather - dist) / (2.0 * feather);
                (t.clamp(0.0, 1.0) * 255.0) as u8
            };

            let px = out.get_pixel_mut(x, y);
            // 기존 알파와 곱해 straight alpha 유지
            let orig_a = px[3] as u32;
            let mixed = ((orig_a * a as u32) / 255) as u8;
            px[3] = mixed;
        }
    }

    // 4) RGBA8 바이트 배열로 반환 (40*40*4 = 6400 bytes)
    Ok(out.into_raw().into_boxed_slice())
}
