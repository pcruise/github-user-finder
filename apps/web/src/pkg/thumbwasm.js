import * as wasm from "./thumbwasm_bg.wasm";
export * from "./thumbwasm_bg.js";
import { __wbg_set_wasm } from "./thumbwasm_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
