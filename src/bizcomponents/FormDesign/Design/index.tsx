import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
} from 'antd';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { ProForm } from '@ant-design/pro-components';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { AiOutlineSearch, AiOutlineSend } from 'react-icons/ai';
import AttrItem from './AttrItem';
import OperateItem from './OperateItem';
import { XForm, XFormItem } from '@/ts/base/schema';
import { FormItemModel, FormModel } from '@/ts/base/model';
import OioForm from './OioForm';
import { IWorkForm } from '@/ts/core/thing/app/work/workform';
import { widgetsOpts, regexpOpts } from './rule';
import { ImUndo2 } from 'react-icons/im';

/**
 * 转化特性为表单项
 */
const transformAttrToOperationItem = (attr: any, operationId: string): FormItemModel => {
  let widget = 'text';
  let type = 'string';
  let dictId: string | undefined = undefined;
  if (attr.valueType === '数值型') {
    widget = 'number';
    type = 'number';
  } else if (attr.valueType === '选择型') {
    widget = 'dict';
    dictId = attr.dictId;
  } else if (attr.valueType === '分类' || attr.valueType === '分类型') {
    widget = 'species';
    dictId = attr.dictId;
  } else if (attr.valueType === '日期型') {
    widget = 'date';
    dictId = attr.dictId;
  } else if (attr.valueType === '时间型') {
    widget = 'datetime';
    dictId = attr.dictId;
  } else if (
    attr.valueType === '附件' ||
    attr.valueType === '附件型' ||
    attr.valueType === '文件'
  ) {
    widget = 'file';
    dictId = attr.dictId;
  } else if (
    attr.valueType === '人员' ||
    attr.valueType === '用户' ||
    attr.valueType === '用户型'
  ) {
    widget = 'person';
    dictId = attr.dictId;
  } else if (attr.valueType === '部门' || attr.valueType === '内部机构') {
    widget = 'department';
    dictId = attr.dictId;
  } // Todo 增加类型
  return (
    attr.operationItem || {
      id: attr.id,
      name: attr.name,
      code: attr.code,
      operationId: operationId,
      attrId: attr.id,
      attr: attr,
      rule: JSON.stringify({
        title: attr.name,
        type,
        widget,
        required: true,
        readOnly: false,
        hidden: attr.code === 'thingId',
        placeholder: `请输入${attr.name}`,
        description: attr.remark,
        dictId,
      }),
    }
  );
};

/**
 * 转化表单项为特性
 */
const transformOperationItemToAttr = (operationItem: any) => {
  const rule = JSON.parse(operationItem.rule);
  return (
    operationItem.attr || {
      id: operationItem.attrId,
      name: operationItem.name,
      code: operationItem.code,
      remark: rule.description,
      dictId: rule.dictId || undefined,
      valueType:
        rule.widget === 'number' || rule.widget === 'digit'
          ? '数值型'
          : rule.dictId
          ? '选择型'
          : '描述型',
    }
  );
};

type IProps = {
  form: XForm;
  current: IWorkForm;
  onBack: () => void;
};

type FormLayout = {
  layout: 'horizontal' | 'vertical';
  col: 8 | 12 | 24;
};

/**
 * 表单设计器
 * @param props
 */
const Design: React.FC<IProps> = ({ form: operation, current, onBack }) => {
  const [tkey, tforceUpdate] = useObjectUpdate(current);
  const [formModel, setFormModel] = useState<FormModel>();
  const [items, setItems] = useState<any>({
    // 特性
    attrs: [],
    // 表单项
    operationItems: [],
  });
  // 表单项--子表
  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState<FormLayout>(
    operation.remark
      ? JSON.parse(operation.remark)
      : {
          type: 'object',
          properties: {},
          labelWidth: 120,
          layout: 'horizontal',
          col: 12,
        },
  );
  const [selectedItem, setSelectedItem] = useState<XFormItem>();
  const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false);

  useEffect(() => {
    const queryItems = async () => {
      // 查询特性
      let operateItems = operation.items;
      const attrIds = operateItems?.map((item) => item.attrId);
      items['operationItems'] = operateItems || [];
      // 过滤出特性
      items['attrs'] = current.attributes
        .filter((attr) => !attrIds?.includes(attr.id))
        .filter((attr) => attr.belongId);
      setItems(items);
      tforceUpdate();
    };
    queryItems();
  }, [operation.id]);

  // 找到容器
  const findContaniner = (id: string) => {
    if (id in items) {
      return id;
    }
    return (
      Object.keys(items).find((key) => {
        return items[key].find((item: any) => item.id === id || item.attrId === id);
      }) || ''
    );
  };

  // 设置从一个容器到另一个容器时候的变化
  const dragMoveEvent = (props: any) => {
    const { active, over } = props;
    const overId = over?.id;
    if (!overId) return;
    const activeContainer = findContaniner(active?.id);
    const overContainer = findContaniner(over?.id);

    // 将activeContainer里删除拖拽元素，在overContainer中添加拖拽元素
    if (activeContainer !== overContainer) {
      const overIndex = items[overContainer].indexOf(over.id);
      const newIndex = overIndex >= 0 ? overIndex : items[overContainer].length + 1;
      let dragItem: any;
      // attr 转 operationItem
      if (activeContainer === 'attrs') {
        const attr = items[activeContainer].find((attr: any) => attr.id === active.id);
        dragItem = transformAttrToOperationItem(attr, operation.id);
        itemClick(dragItem);
      } else if (items[activeContainer]) {
        const operationItem = items[activeContainer].find(
          (oi: any) => oi.id === active.id,
        );
        dragItem = transformOperationItemToAttr(operationItem);
      }
      if (dragItem) {
        const data = {
          ...items,
          [activeContainer]: items[activeContainer].filter((item: any) => {
            return item.id !== active.id;
          }),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            dragItem,
            ...items[overContainer].slice(newIndex, items[overContainer].length),
          ],
        };
        setFormModel({
          ...operation,
          ...{ items: data['operationItems'] },
        });
        setItems(data);
      }
    }
  };

  // 设置移动结束后时候的改变
  const dragEndFn = (props: any) => {
    const { over, active } = props;
    const overId = over?.id;
    const activeId = active?.id;
    const activeContainer = findContaniner(activeId);
    const overContainer = findContaniner(overId);

    const activeItems = items[activeContainer];
    const overItems = items[overContainer];
    if (!overId) {
      const x: number = props.delta.x || 0;
      const y: number = props.delta.y || 0;
      if (x * x + y * y > 6400) {
        // 目标容器为空
        if (activeContainer === 'attrs') {
          // 特性转表单项
          const attr = items['attrs'].find((attr: any) => attr.id === active.id);
          const operationItem = transformAttrToOperationItem(attr, operation.id);
          const data = {
            attrs: items['attrs'].filter((item: any) => {
              return item.id !== active.id;
            }),
            operationItems: [...items['operationItems'], operationItem],
          };
          setFormModel({
            ...operation,
            ...{ items: data['operationItems'] },
          });
          setItems(data);
        } else if (activeContainer === 'operationItems') {
          // 表单项转特性
          const operationItem = items['operationItems'].find(
            (oi: any) => oi.id === active.id,
          );
          const operationItems = items['operationItems'].filter((item: any) => {
            return item.id !== active.id;
          });
          const data = {
            attrs: [...items['attrs'], transformOperationItemToAttr(operationItem)],
            operationItems,
          };
          setFormModel({
            ...operation,
            ...{ items: operationItems },
          });
          setItems(data);
          if (operationItems.length > 0) {
            itemClick(operationItems[0]);
          }
        }
      } else {
        setFormModel({
          ...operation,
          ...{ items: items['operationItems'] },
        });
      }
    } else if (activeContainer == overContainer) {
      // 相同容器
      const overIndex = overItems.findIndex((item: any) => item.id === overId);
      const activeIndex = activeItems.findIndex((item: any) => item.id === activeId);
      if (activeIndex !== overIndex) {
        setItems((items: any) => ({
          ...items,
          [overContainer]: arrayMove(overItems, activeIndex, overIndex),
        }));
      }
      if (overContainer == 'operationItems') {
        itemClick(activeItems.find((item: any) => item.id === activeId));
      }
      setFormModel({
        ...operation,
        ...{ items: items['operationItems'] },
      });
    } else {
      itemClick(activeItems.find((item: any) => item.id === activeId));
      setFormModel({
        ...operation,
        ...{ items: items['operationItems'] },
      });
    }
  };

  // 表单项选中事件
  const itemClick = (item: any) => {
    setSelectedItem(item);
    if (item && item.rule) {
      form.setFieldsValue(JSON.parse(item.rule));
    }
  };

  // 布局改变
  const layoutChange = (value: any) => {
    const newFormLayout = { ...formLayout, ...value };
    setFormLayout(newFormLayout);
    setFormModel({
      ...operation,
      items: items['operationItems'],
      remark: JSON.stringify({ ...JSON.parse(operation.remark), ...newFormLayout }),
    });
  };

  // 项配置改变
  const formValuesChange = (changedValues: any) => {
    if (selectedItem) {
      const rule = { ...JSON.parse(selectedItem.rule), ...changedValues };
      setSelectedItem({
        ...selectedItem,
        rule: JSON.stringify(rule),
      });
      const operationItems = items['operationItems'].map((oi: any) => {
        if (oi.id === selectedItem.id) {
          oi.rule = JSON.stringify(rule);
        }
        return oi;
      });
      const data = { ...items, ...{ operationItems } };
      setFormModel({
        ...operation,
        ...{ items: operationItems },
      });
      setItems(data);
      tforceUpdate();
    }
  };

  return (
    <div key={tkey}>
      <Card
        title={operation.name}
        extra={
          <>
            <Button
              type="primary"
              icon={<AiOutlineSend />}
              disabled={!formModel}
              style={{ margin: 5 }}
              onClick={async () => {
                if (formModel) {
                  if (await current.updateForm(formModel)) {
                    message.success('保存成功！');
                    onBack();
                  }
                }
              }}>
              保存
            </Button>
            <Button
              danger
              type="primary"
              style={{ margin: 5 }}
              icon={<ImUndo2 />}
              onClick={onBack}>
              返回
            </Button>
          </>
        }>
        <DndContext onDragMove={dragMoveEvent} onDragEnd={dragEndFn}>
          <Row>
            <Col span={4}>
              <SortableContext key={'attrs'} items={items['attrs']}>
                <h3 style={{ paddingLeft: '6px' }}>特性</h3>
                <div
                  style={{
                    maxHeight: '700px',
                    overflowY: 'scroll',
                    overflowX: 'scroll',
                  }}>
                  {items['attrs'].map((attr: any) => (
                    <AttrItem item={attr} key={attr.id} />
                  ))}
                </div>
              </SortableContext>
            </Col>
            <Col span={16}>
              <SortableContext key={'operations'} items={items['operationItems']}>
                <Card
                  style={{
                    maxHeight: '800px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    maxWidth: '1000px',
                  }}
                  title={'表单'}
                  extra={
                    <div style={{ display: 'flex' }}>
                      <label style={{ padding: '6px' }}>整体布局：</label>
                      <Select
                        defaultValue={formLayout.col}
                        style={{ width: '120px' }}
                        options={[
                          { value: 24, label: '一行一列' },
                          { value: 12, label: '一行两列' },
                          { value: 8, label: '一行三列' },
                        ]}
                        onChange={(value) => {
                          layoutChange({ col: value });
                        }}
                      />
                      <Select
                        defaultValue={formLayout.layout}
                        style={{ width: '80px' }}
                        options={[
                          { value: 'horizontal', label: '水平' },
                          { value: 'vertical', label: '垂直' },
                        ]}
                        onChange={(value) => {
                          layoutChange({ layout: value });
                        }}
                      />
                      <Space wrap>
                        <Button
                          icon={<AiOutlineSearch />}
                          onClick={() => setOpenPreviewModal(true)}>
                          预览表单
                        </Button>
                      </Space>
                    </div>
                  }>
                  <ProForm
                    submitter={{
                      searchConfig: {
                        resetText: '重置',
                        submitText: '提交',
                      },
                      resetButtonProps: {
                        style: { display: 'none' },
                      },
                      submitButtonProps: {
                        style: { display: 'none' },
                      },
                    }}
                    layout={formLayout.layout}
                    labelAlign="left"
                    labelWrap={true}
                    labelCol={{
                      xs: { span: 10 },
                      sm: { span: 10 },
                    }}>
                    <Row gutter={24}>
                      {items['operationItems']?.map((item: XFormItem) => (
                        <Col span={formLayout.col} key={item.id}>
                          <OperateItem
                            item={item}
                            belong={current.current.space}
                            onClick={itemClick}
                          />
                        </Col>
                      ))}
                    </Row>
                  </ProForm>
                </Card>
              </SortableContext>
            </Col>
            <Col span={4}>
              <Card title="表单项配置">
                <Card bordered={false} title={selectedItem?.name}>
                  <Form form={form} onValuesChange={formValuesChange}>
                    <Form.Item label="组件" name="widget">
                      <Select
                        options={widgetsOpts}
                        defaultValue={
                          selectedItem?.attr?.property?.valueType == '描述型'
                            ? 'dict'
                            : ''
                        }
                      />
                    </Form.Item>
                    <Form.Item label="必填" name="required">
                      <Radio.Group buttonStyle="solid" defaultValue={true}>
                        <Radio.Button value={true}>是</Radio.Button>
                        <Radio.Button value={false}>否</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item label="只读" name="readOnly">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value={true}>是</Radio.Button>
                        <Radio.Button value={false}>否</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item label="隐藏" name="hidden">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value={true}>是</Radio.Button>
                        <Radio.Button value={false}>否</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item label="最小值" name="min">
                      <InputNumber />
                    </Form.Item>
                    <Form.Item label="最大值" name="max">
                      <InputNumber />
                    </Form.Item>
                    <Form.Item label="输入提示" name="placeholder">
                      <Input />
                    </Form.Item>
                    <Form.Item label="特性说明" name="description">
                      <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                      label="正则校验"
                      name="rules"
                      tooltip="示例：^[A-Za-z0-9]+$">
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="请输入或者选择正则表达式"
                        options={regexpOpts}
                      />
                    </Form.Item>
                  </Form>
                </Card>
              </Card>
            </Col>
          </Row>
        </DndContext>{' '}
      </Card>
      <Modal
        title={`${operation?.name}(预览)`}
        open={openPreviewModal}
        destroyOnClose={true}
        onOk={() => setOpenPreviewModal(false)}
        onCancel={() => setOpenPreviewModal(false)}
        maskClosable={false}
        width={900}>
        <OioForm
          belong={current.current.space}
          form={operation}
          formItems={items['operationItems']}
          formRef={undefined}
          onValuesChange={(values) => console.log('values', values)}
        />
      </Modal>
    </div>
  );
};

export default Design;
