/** 用户对象类型 */
export enum TargetType {
  /** 外部用户 */
  'Group' = '组织群',
  'Cohort' = '群组',
  /** 内部用户 */
  'College' = '学院',
  'Department' = '部门',
  'Office' = '办事处',
  'Section' = '科室',
  'Major' = '专业',
  'Working' = '工作组',
  'Research' = '研究所',
  'Laboratory' = '实验室',
  /** 岗位 */
  'Station' = '岗位',
  /** 自归属用户 */
  'Person' = '人员',
  'Company' = '单位',
  'University' = '大学',
  'Hospital' = '医院',
}

/** 分类基础类型 */
export enum SpeciesType {
  /** 类别目录 */
  'FileSystem' = '文件类',
  'Market' = '流通类',
  'Resource' = '资源类',
  'Store' = '物资类',
  'Application' = '应用类',
  /** 类别类目 */
  'Commodity' = '商品类',
  'AppModule' = '应用模块',
  'WorkItem' = '应用办事',
  'WorkForm' = '应用表单',
  'ReportBI' = '应用报表',
}

/** 消息类型 */
export enum MessageType {
  File = '文件',
  Text = '文本',
  Image = '图片',
  Video = '视频',
  Voice = '语音',
  Recall = '撤回',
  Readed = '已读',
}

/** 任务状态 */
export enum TaskStatus {
  ApplyStart = 0,
  ApprovalStart = 100,
  RefuseStart = 200,
}
