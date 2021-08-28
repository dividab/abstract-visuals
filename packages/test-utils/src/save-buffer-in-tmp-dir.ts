import fs from "fs";
import path from "path";

export function saveBufferInTmpDir(tmpDir: string, name: string, result: Buffer): void {
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  fs.writeFileSync(path.join(tmpDir, name + ".docx"), result);
}
