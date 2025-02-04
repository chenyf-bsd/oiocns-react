import { schema } from '../../../base';
import { ITarget } from '../../target/base/target';
import { ISpeciesItem, SpeciesItem } from '../base/species';
import { FileSystemItem, IFileSystemItem } from './filesysItem';

/** 任务模型 */
export type TaskModel = {
  group: string;
  name: string;
  size: number;
  finished: number;
  createTime: Date;
};

/** 文件系统类型接口 */
export interface IFileSystem extends ISpeciesItem {
  /** 主目录 */
  home: IFileSystemItem | undefined;
  /** 上传任务列表 */
  taskList: TaskModel[];
  /** 任务变更通知 */
  onTaskChange(callback: (taskList: TaskModel[]) => void): void;
  /** 禁用通知 */
  unTaskChange(): void;
  /** 任务变更 */
  taskChanged(id: string, task: TaskModel): void;
}

/** 文件系统类型实现 */
export class FileSystem extends SpeciesItem implements IFileSystem {
  constructor(_metadata: schema.XSpecies, _current: ITarget) {
    super(_metadata, _current);
    this._taskIdSet = new Map<string, TaskModel>();
    this.loadTeamHome();
  }
  home: IFileSystemItem | undefined;
  private _taskIdSet: Map<string, TaskModel>;
  taskChangeNotify?: (taskList: TaskModel[]) => void;
  get taskList(): TaskModel[] {
    const result: TaskModel[] = [];
    this._taskIdSet.forEach((v) => result.push(v));
    return result;
  }
  onTaskChange(callback: (taskList: TaskModel[]) => void): void {
    this.taskChangeNotify = callback;
    callback(this.taskList);
  }
  unTaskChange(): void {
    this.taskChangeNotify = undefined;
  }
  taskChanged(id: string, task: TaskModel): void {
    this._taskIdSet.set(id, task);
    this.taskChangeNotify?.apply(this, [this.taskList]);
  }
  private async loadTeamHome(): Promise<void> {
    let root: IFileSystemItem = new FileSystemItem(this, {
      size: 0,
      key: '',
      name: '根目录',
      isDirectory: true,
      dateCreated: new Date(),
      dateModified: new Date(),
      hasSubDirectories: true,
    });
    if (this.current.metadata.belongId != this.current.metadata.id) {
      const teamRoot = await root.create(this.current.metadata.name);
      if (teamRoot) {
        this.home = await teamRoot.create(this.metadata.name);
      }
    } else {
      this.home = root;
    }
  }
  createChildren(_metadata: schema.XSpecies, _current: ITarget): ISpeciesItem {
    return new FileSystem(_metadata, _current);
  }
}
