import {
  Command,
  CompletionsCommand,
  HelpCommand,
} from "https://deno.land/x/cliffy/mod.ts";
import meta from "../../astrodon.meta.ts";
import { build } from "./commands/build.ts";
import { init } from "./commands/init.ts";

await new Command()
  .name(meta.name)
  .version(meta.version)
  .global()
  .description(`Project manager for Astrodon`)
  .command("help", new HelpCommand().global())
  .command("completions", new CompletionsCommand())
  .command(
    "build",
    new Command()
      .description("Build the app.")
      .allowEmpty(false)
      .option("-i, --entry [type:string]", "Entry point for the app.", {
        required: true,
      })
      .option("-d, --out [type:string]", "Output directory.", {
        default: "./dist",
      })
      .action(async (options) => await build(options)),
  )
  .command(
    "init",
    new Command()
      .description("Initialize a new project.")
      .allowEmpty(false)
      .option("-t, --template [type:string]", "Template to use.", {
        default: "default",
      })
      .option("-n, --name [type:string]", "Name of the project.", {
        default: "my_astrodon_app",
      })
      .action(async (options) => await init(options))
  )
  .parse(Deno.args);
