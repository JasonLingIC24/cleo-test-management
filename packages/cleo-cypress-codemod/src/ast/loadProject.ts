import { Project, SourceFile } from "ts-morph";

export interface LoadedSource {
  project: Project;
  sourceFile: SourceFile;
}

export function loadSourceFile(filePath: string, sourceText: string): LoadedSource {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const sourceFile = project.createSourceFile(filePath, sourceText);

  return { project, sourceFile };
}