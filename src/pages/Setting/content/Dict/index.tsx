import PageCard from '@/components/PageCard';
import { XDict, XDictItem } from '@/ts/base/schema';
import { Button, Card, Descriptions, message } from 'antd';
import React, { useState } from 'react';
import { DictItemColumns } from '../../config/columns';
import CardOrTable from '@/components/CardOrTableComp';
import thingCtrl from '@/ts/controller/thing';
import DictItemModal from '@/pages/Setting/content/Dict/dictItemModal';
import cls from './index.module.less';
/**
 * @description: 分类字典管理
 * @return {*}
 */
const DictInfo: React.FC<any> = (props: { current: XDict }) => {
  const { current } = props;
  const [activeModel, setActiveModel] = useState<string>('');
  const [dictItem] = useState<XDictItem>();
  const renderBtns = () => {
    return (
      <>
        <Button
          type="link"
          onClick={() => {
            setActiveModel('新增字典项');
          }}>
          新增字典项
        </Button>
      </>
    );
  };
  const TitleItems = [
    {
      tab: `字典项`,
      key: 'dictItems',
    },
  ];
  return (
    <Card bordered={false}>
      <Descriptions
        size="middle"
        title="字典"
        bordered
        column={2}
        labelStyle={{
          textAlign: 'left',
          color: '#606266',
          width: 120,
        }}
        contentStyle={{ textAlign: 'left', color: '#606266' }}>
        <Descriptions.Item label="字典名称">{current.name}</Descriptions.Item>
        <Descriptions.Item label="字典代码">{current.code}</Descriptions.Item>
        <Descriptions.Item label="备注">{current.remark}</Descriptions.Item>
      </Descriptions>

      <PageCard
        className={cls[`card-wrap`]}
        bordered={false}
        tabList={TitleItems}
        onTabChange={(_: any) => {}}
        tabBarExtraContent={renderBtns()}>
        <CardOrTable<any>
          dataSource={[]}
          key="member"
          rowKey={'id'}
          request={(page) => thingCtrl.dict!.loadDictItem(current.id, page)}
          columns={DictItemColumns}
          showChangeBtn={false}
        />
      </PageCard>
      <DictItemModal
        open={activeModel.includes('新增') || activeModel.includes('编辑')}
        data={dictItem}
        handleCancel={() => setActiveModel('')}
        handleOk={(_: boolean | undefined) => {
          message.success('操作成功');
          setActiveModel('');
        }}
        current={current}></DictItemModal>
    </Card>
  );
};
export default DictInfo;
