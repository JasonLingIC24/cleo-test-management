import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import { GithubConfig, WorkflowArtifact } from "../types/github.js";
import { configAccess } from "./configAccessService.js";
import AdmZip from "adm-zip";

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

    fs.mkdirSync(outputDir, { recursive: true });

    const zipPath = path.join(outputDir, `${name}.zip`);

    fs.writeFileSync(zipPath, Buffer.from(response.data as ArrayBuffer));

    return zipPath;
  }

  async downloadRunArtifacts(
    runId: number,
    outputDir: string,
  ): Promise<string[]> {
    const artifacts = await this.listArtifacts(runId);

    const files: string[] = [];

    for (const [index, artifact] of artifacts.entries()) {
      if (artifact.expired) {
        console.log(
          `[${index + 1}/${artifacts.length}] Skipping expired artifact: ${artifact.name}`,
        );
        continue;
      }

      console.log(
        `[${index + 1}/${artifacts.length}] Downloading: ${artifact.name}`,
      );

      const file = await this.downloadArtifact(
        artifact.id,
        artifact.name,
        outputDir,
      );

      files.push(file);
    }

    return files;
  }

  async downloadAndExtractRunArtifacts(
    runId: number,
    outputDir: string,
  ): Promise<string[]> {
    const downloads = await this.downloadRunArtifacts(runId, outputDir);

    const extracted: string[] = [];

    for (const zipPath of downloads) {
      const extractDir = zipPath.replace(/\.zip$/, "");

      console.log(`Extracting ${zipPath} -> ${extractDir}`);

      this.extractArtifact(zipPath, extractDir);

      extracted.push(extractDir);

      console.log(`✓ Extracted ${extractDir}`);
    }

    return extracted;
  }

  async fetchRunArtifacts(runId: number): Promise<string[]> {
    return this.downloadAndExtractRunArtifacts(
      runId,
      configAccess.getGithubRunDirectory(runId),
    );
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
    return configAccess.getGithubRunDirectory(runId);
  }
}
