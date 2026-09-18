import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { GithubConfig, WorkflowArtifact } from "../types/github.js";

import { configAccess } from "./configAccessService.js";

export class GithubArtifactService {
  private readonly octokit: Octokit;

  constructor(private readonly config: GithubConfig) {
    this.octokit = new Octokit({
      auth: config.token,
    });
  }

  private getRunDirectory(runId: number): string {
    return configAccess.getGithubRunDirectory(runId);
  }

  async listArtifacts(runId: number): Promise<WorkflowArtifact[]> {
    const response = await this.octokit.actions.listWorkflowRunArtifacts({
      owner: this.config.owner,
      repo: this.config.repo,
      run_id: runId,
    });

    return response.data.artifacts.map((artifact): WorkflowArtifact => ({
      id: artifact.id,
      name: artifact.name,
      sizeInBytes: artifact.size_in_bytes,
      createdAt: artifact.created_at,
      expired: artifact.expired,
    }));
  }

  async downloadArtifact(
    artifactId: number,
    name: string,
    outputDir: string,
  ): Promise<string> {
    const response = await this.octokit.actions.downloadArtifact({
      owner: this.config.owner,
      repo: this.config.repo,
      artifact_id: artifactId,
      archive_format: "zip",
    });

    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    const zipPath = path.join(outputDir, `${name}.zip`);

    fs.writeFileSync(zipPath, Buffer.from(response.data as ArrayBuffer));

    return zipPath;
  }

  async downloadRunArtifacts(
    runId: number,
    outputDir: string,
  ): Promise<string[]> {
    const artifacts = await this.listArtifacts(runId);

    console.log(`📦 Found ${artifacts.length} artifact(s)`);

    const files: string[] = [];

    for (const [index, artifact] of artifacts.entries()) {
      const progress = `[${index + 1}/${artifacts.length}]`;

      if (artifact.expired) {
        console.log(
          `${progress} ⚠️ Skipping expired artifact: ${artifact.name}`,
        );

        continue;
      }

      const sizeMb = (artifact.sizeInBytes / 1024 / 1024).toFixed(2);

      console.log(`${progress} ⬇️ Downloading ${artifact.name} (${sizeMb} MB)`);

      const file = await this.downloadArtifact(
        artifact.id,
        artifact.name,
        outputDir,
      );

      files.push(file);

      console.log(`${progress} ✅ Downloaded ${artifact.name}`);
    }

    return files;
  }

  async downloadAndExtractRunArtifacts(
    runId: number,
    outputDir: string,
  ): Promise<string[]> {
    const downloads = await this.downloadRunArtifacts(runId, outputDir);

    const extracted: string[] = [];

    for (const [index, zipPath] of downloads.entries()) {
      const progress = `[${index + 1}/${downloads.length}]`;

      const extractDir = zipPath.replace(/\.zip$/, "");

      console.log(`${progress} 📦 Extracting ${path.basename(zipPath)}`);

      this.extractArtifact(zipPath, extractDir);

      extracted.push(extractDir);

      console.log(`${progress} ✅ Extracted ${extractDir}`);
    }

    return extracted;
  }

  async fetchRunArtifacts(runId: number): Promise<string[]> {
    const outputDir = this.getRunDirectory(runId);

    console.log(`📁 Output directory: ${outputDir}`);

    return this.downloadAndExtractRunArtifacts(runId, outputDir);
  }

  async validateRunArtifacts(runId: number): Promise<void> {
    try {
      const artifacts = await this.listArtifacts(runId);

      if (artifacts.length === 0) {
        throw new Error(`No artifacts found for workflow run ${runId}`);
      }
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(
          `Workflow run ${runId} was not found in ${this.config.owner}/${this.config.repo}`,
        );
      }

      throw error;
    }
  }

  extractArtifact(zipPath: string, outputDir: string): string {
    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    const zip = new AdmZip(zipPath);

    zip.extractAllTo(outputDir, true);

    return outputDir;
  }

  getRunResultsDirectory(runId: number): string {
    return this.getRunDirectory(runId);
  }

  hasCachedArtifacts(runId: number): boolean {
    const runDirectory = this.getRunDirectory(runId);

    if (!fs.existsSync(runDirectory)) {
      return false;
    }

    const zipFiles = fs
      .readdirSync(runDirectory)
      .filter((file) => file.endsWith(".zip"));

    return zipFiles.length > 0;
  }

  getCachedArtifacts(runId: number): string[] {
    const runDirectory = this.getRunDirectory(runId);

    if (!fs.existsSync(runDirectory)) {
      return [];
    }

    return fs
      .readdirSync(runDirectory)
      .filter((file) => file.endsWith(".zip"))
      .map((file) => path.join(runDirectory, file));
  }
}
