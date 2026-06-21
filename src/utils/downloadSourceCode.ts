import JSZip from "jszip";

// @ts-ignore
import packageJson from "../../package.json?raw";
// @ts-ignore
import tsConfigJson from "../../tsconfig.json?raw";
// @ts-ignore
import viteConfig from "../../vite.config.ts?raw";
// @ts-ignore
import indexHtml from "../../index.html?raw";
// @ts-ignore
import metadataJson from "../../metadata.json?raw";
// @ts-ignore
import gitIgnore from "../../.gitignore?raw";
// @ts-ignore
import envExample from "../../.env.example?raw";
// @ts-ignore
import mainTsx from "../main.tsx?raw";
// @ts-ignore
import indexCss from "../index.css?raw";
// @ts-ignore
import appTsx from "../App.tsx?raw";
// @ts-ignore
import permissionModal from "../components/PermissionModal.tsx?raw";
// @ts-ignore
import visualizer from "../components/Visualizer.tsx?raw";
// @ts-ignore
import libUtils from "../lib/utils.ts?raw";
// @ts-ignore
import commandService from "../services/commandService.ts?raw";
// @ts-ignore
import geminiService from "../services/geminiService.ts?raw";
// @ts-ignore
import liveService from "../services/liveService.ts?raw";
// @ts-ignore
import audioUtils from "./audioUtils.ts?raw";

export async function downloadSourceCode() {
  try {
    const zip = new JSZip();

    // Add root files
    zip.file("package.json", packageJson);
    zip.file("tsconfig.json", tsConfigJson);
    zip.file("vite.config.ts", viteConfig);
    zip.file("index.html", indexHtml);
    zip.file("metadata.json", metadataJson);
    zip.file(".gitignore", gitIgnore);
    zip.file(".env.example", envExample);

    // Add source files
    const src = zip.folder("src");
    if (src) {
      src.file("main.tsx", mainTsx);
      src.file("index.css", indexCss);
      src.file("App.tsx", appTsx);

      const components = src.folder("components");
      if (components) {
        components.file("PermissionModal.tsx", permissionModal);
        components.file("Visualizer.tsx", visualizer);
      }

      const lib = src.folder("lib");
      if (lib) {
        lib.file("utils.ts", libUtils);
      }

      const services = src.folder("services");
      if (services) {
        services.file("commandService.ts", commandService);
        services.file("geminiService.ts", geminiService);
        services.file("liveService.ts", liveService);
      }

      const utils = src.folder("utils");
      if (utils) {
        utils.file("audioUtils.ts", audioUtils);
        utils.file("downloadSourceCode.ts", `// Downloader module\nexport { downloadSourceCode } from "./downloadSourceCode";`);
      }
    }

    // Generate zip content
    const blob = await zip.generateAsync({ type: "blob" });
    
    // Create download link and trigger click
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zoya-bengali-voice-assistant.zip";
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate ZIP download:", error);
    alert("Sorry, failed to bundle raw source files.");
  }
}
