import fs from "fs/promises";
import path from "path";

export class FileManager {
  /**
   * Ensure directory exists, create if it doesn't
   */
  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Write JSON data to file
   */
  static async writeJsonFile<T>(
    outputDir: string,
    filename: string,
    data: T
  ): Promise<string> {
    await this.ensureDirectoryExists(outputDir);
    const filePath = path.join(outputDir, filename);
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, "utf-8");
    return filePath;
  }

  /**
   * Read JSON data from file
   */
  static async readJsonFile<T>(filePath: string): Promise<T> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
    }
  }

  /**
   * Write text data to file
   */
  static async writeTextFile(
    outputDir: string,
    filename: string,
    data: string
  ): Promise<string> {
    await this.ensureDirectoryExists(outputDir);
    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, data, "utf-8");
    return filePath;
  }

  /**
   * Generate filename with timestamp pattern
   */
  static generateFilename(
    prefix: string,
    username: string,
    startDate: string,
    endDate: string,
    extension: string = "json"
  ): string {
    // ファイル名に使えない文字をアンダースコアに置換
    const safeUsername = username.replace(/[\/\\:*?"<>|]/g, "_");
    return `${prefix}_${safeUsername}_${startDate}-${endDate}.${extension}`;
  }
}
