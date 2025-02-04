import Thing from '@/pages/Store/content/Thing/Thing';
import { XForm, XFormItem } from '@/ts/base/schema';
import { IFlowDefine } from '@/ts/core';
import { ProFormInstance } from '@ant-design/pro-form';
import { Button, Card, Input, message } from 'antd';
import orgCtrl from '@/ts/controller';
import { Editing } from 'devextreme-react/data-grid';
import React, { useEffect, useRef, useState } from 'react';
import cls from './index.module.less';
import OioForm from '@/bizcomponents/FormDesign/Design/OioForm';
import { kernel } from '@/ts/base';
import { GroupMenuType } from '../../config/menuType';
import { CheckOutlined } from '@ant-design/icons';

// 卡片渲染
interface IProps {
  current: IFlowDefine;
}

/**
 * 办事-业务流程--发起
 * @returns
 */
const WorkStartDo: React.FC<IProps> = ({ current }) => {
  const [data, setData] = useState<any>({});
  const [forms, setForms] = useState<XForm[]>([]);
  const [rows, setRows] = useState<any>([]);
  const [content, setContent] = useState<string>('');
  const formRef = useRef<ProFormInstance<any>>();

  useEffect(() => {
    setTimeout(async () => {
      let node = await current.loadWorkNode();
      if (!node?.forms) {
        message.error('流程未绑定表单');
        return;
      }
      setForms(node.forms);
    }, 100);
  }, [current]);

  const getItems = () => {
    const items: XFormItem[] = [];
    forms.forEach((form) => {
      items.push(...(form.items || []));
    });
    return items;
  };

  const submit = async () => {
    let rows_ = rows;
    if (rows.length == 0) {
      let res = await kernel.anystore.createThing(current.metadata.belongId, 1);
      if (res && res.success) {
        rows_ = res.data;
      } else {
        message.error('创建物失败!');
        return;
      }
    }
    //发起流程tableKey
    if (
      await current.createWorkInstance({
        hook: '',
        content: content,
        contentType: 'Text',
        title: current.metadata.name,
        defineId: current.metadata.id,
        data: JSON.stringify(data),
        thingIds: rows_.map((row: any) => row['Id']),
      })
    ) {
      message.success('发起成功!');
      orgCtrl.currentKey = current.workItem.current.key + GroupMenuType.Apply;
      orgCtrl.changCallback();
    }
  };

  return (
    <div className={cls.content}>
      {forms.length > 0 && (
        <OioForm
          key={forms[0].id}
          belong={current.workItem.current.space}
          form={forms[0]}
          formItems={getItems()}
          formRef={formRef}
          submitter={{
            resetButtonProps: {
              style: { display: 'none' },
            },
            render: (_: any, _dom: any) => <></>,
          }}
          onValuesChange={(_changedValues, values) => {
            setData({ ...data, ...values });
          }}
        />
      )}
      {
        <Thing
          keyExpr="Id"
          height={500}
          dataSource={rows}
          selectable={false}
          menuItems={[
            {
              key: 'remove',
              label: '删除',
              click(row) {
                if (rows.length > 1) {
                  setRows(rows.filter((item: any) => item.Id != row.Id));
                } else {
                  message.error('删除失败,至少需要一条数据');
                }
              },
            },
          ]}
          editingTool={
            <Editing
              allowAdding={false}
              allowDeleting={false}
              selectTextOnEditStart={true}
              useIcons={true}
            />
          }
        />
      }
      <Card className={cls['bootom_content']}>
        <div style={{ display: 'flex', width: '100%' }}>
          <Input.TextArea
            style={{ width: '92%' }}
            placeholder="请填写备注信息"
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
          <div
            style={{
              width: '8%',
              display: 'flex',
              marginTop: '18px',
              marginLeft: '18px',
            }}>
            <Button type="primary" onClick={submit}>
              提交
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkStartDo;
