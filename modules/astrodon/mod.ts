import { Plug } from "./deps.ts";
import { getLibraryLocation, getAppOptions, prepareUrl } from "./utils.ts";
import './astrodon.d.ts'

/*
 * This is a bit hacky, it automatically closes the cmd window
 * it opens when the app is launched from a executable generated by `deno compile`
 */
if (Deno.build.os === "windows" && Deno.env.get("DEV") != "true") {
  const mod = Deno.dlopen("kernel32.dll", {
    FreeConsole: {
      parameters: [],
      result: "void",
    },
  });
  mod.symbols.FreeConsole();
}

interface WindowConfig {
  title: string;
  url: string;
}

interface AppConfig {
  windows: WindowConfig[];
}

export interface AppContext {
  bin?: unknown;
  options?: AppOptions
}

export interface AppOptions {
  name?: string;
  version?: string;
  entry?: string;
  preventUnpack?: boolean;
}

interface AppMethods extends Record<string, Deno.ForeignFunction> {
  create_app: { parameters: ["pointer", "usize"], result: "pointer" },
  run_app: { parameters: ["pointer"], result: "pointer" },
  send_message: {
    parameters: ["pointer", "usize", "pointer"],
    result: "pointer",
  },
}

export class App {
  private windows: WindowConfig[];
  private lib: Deno.DynamicLibrary<AppMethods>;
  private app_ptr: Deno.UnsafePointer | undefined;

  constructor(lib: Deno.DynamicLibrary<AppMethods>, windows: WindowConfig[], public globalContext: AppContext) {
    this.windows = windows;
    this.lib = lib;
  }

  public static async new(options = {}) {

    options = Object.assign(await getAppOptions(), options) as AppOptions;

    const context: AppContext = {
      bin: window.astrodonBin,
      options
    };

    const libPath = await getLibraryLocation(context);

    const plugOptions: Plug.Options = {
      name: "astrodon",
      url: libPath,
      policy: Plug.CachePolicy.NONE,
    };

    const libraryMethods: AppMethods = {
      create_app: { parameters: ["pointer", "usize"], result: "pointer" },
      run_app: { parameters: ["pointer"], result: "pointer" },
      send_message: {
        parameters: ["pointer", "usize", "pointer"],
        result: "pointer",
      },
    };
    
    const library = await Plug.prepare(plugOptions, libraryMethods);

    return new App(library, [], context);
  }

  public async registerWindow(window: WindowConfig) {
    window.url = await prepareUrl(window.url, this.globalContext);
    this.windows.push(window);
  }
  
  public run(): void {    
    const context: AppConfig = {
      windows: this.windows,
    };
    this.app_ptr = this.lib.symbols.create_app(
      ...encode(context),
    ) as Deno.UnsafePointer;
    this.app_ptr = this.lib.symbols.run_app(this.app_ptr) as Deno.UnsafePointer;
  }

  public send(msg: string): void {
    if(this.app_ptr){
      this.app_ptr = this.lib.symbols.send_message(
        ...encode(msg),
        this.app_ptr,
      ) as Deno.UnsafePointer;
    }
  }
}

function encode(val: unknown): [Uint8Array, number] {
  const objectStr = JSON.stringify(val);
  const buf = new TextEncoder().encode(objectStr);
  return [buf, buf.length];
}
