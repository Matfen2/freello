import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class TaskExportService {
  private readonly logger = new Logger(TaskExportService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async exportTasksCsv(): Promise<void> {
    try {
      // 1. Charger les tâches et les projets
      const [tasks, projects] = await Promise.all([
        this.taskRepository.find({ order: { createdAt: 'ASC' } }),
        this.projectRepository.find(),
      ]);

      // 2. Construire une map projectId → project
      const projectMap = new Map(projects.map((p) => [p.id, p]));

      // 3. Générer le CSV
      const header = [
        'task_id',
        'task_title',
        'task_description',
        'task_status',
        'task_estimation',
        'task_created_at',
        'task_updated_at',
        'project_id',
        'project_name',
        'project_description',
      ].join(',');

      const rows = tasks.map((task) => {
        const project = projectMap.get(task.projectId);
        return [
          task.id,
          this.escapeCsv(task.title),
          this.escapeCsv(task.description ?? ''),
          task.status,
          task.estimation ?? '',
          task.createdAt.toISOString(),
          task.updatedAt.toISOString(),
          task.projectId,
          this.escapeCsv(project?.name ?? ''),
          this.escapeCsv(project?.description ?? ''),
        ].join(',');
      });

      const csv = [header, ...rows].join('\n');

      // 4. Écrire le fichier
      const reportsDir = process.env['REPORTS_DIR'] ?? './reports';
      await mkdir(reportsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = join(reportsDir, `tasks-${timestamp}.csv`);
      await writeFile(filePath, csv, 'utf-8');

      this.logger.log(`✅ CSV exported: ${tasks.length} tasks → ${filePath}`);
    } catch (error) {
      this.logger.error('❌ CSV export failed', error);
    }
  }

  // Échappement RFC-4180 : les champs contenant virgule/guillemet/saut de ligne
  // sont encadrés de guillemets doubles, les guillemets internes sont doublés
  private escapeCsv(value: string): string {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}