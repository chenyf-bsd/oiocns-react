import React, { useRef, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { MenuType } from './config/menuType';
import Content, { TopBarExtra } from './content';
import { MenuItemType } from 'typings/globelType';
import FileSysOperate from './components/FileSysOperate';
import { message, Modal } from 'antd';
import { ProFormInstance } from '@ant-design/pro-components';
import * as config from './config/menuOperate';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import SelectOperation from '../Setting/content/Standard/Flow/Comp/SelectOperation';
import OioForm from '@/bizcomponents/FormDesign/Design/OioForm';
/** 存储模块 */
const Package: React.FC = () => {
  const formRef = useRef<ProFormInstance<any>>();
  const [operateTarget, setOperateTarget] = useState<MenuItemType>();
  const [operateKey, setOperateKey] = useState<string>();
  const [key, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(config.loadStoreMenu);
  const [showData, setShowData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  if (!selectMenu || !rootMenu) return <></>;
  return (
    <MainLayout
      selectMenu={selectMenu}
      onSelect={async (data) => {
        setSelectMenu(data);
      }}
      rightBar={<TopBarExtra key={key} selectMenu={selectMenu} />}
      onMenuClick={async (data, key) => {
        setOperateKey(key);
        setOperateTarget(data);
      }}
      siderMenuData={rootMenu}>
      <FileSysOperate
        operateKey={operateKey}
        operateTarget={
          operateTarget?.itemType === MenuType.FileSystemItem
            ? operateTarget.item
            : undefined
        }
        operateDone={() => {
          setOperateKey(undefined);
          setOperateTarget(undefined);
        }}
      />
      {operateKey == '创建实体' && (
        <Modal
          title={`选择表单`}
          width={800}
          destroyOnClose={true}
          open={true}
          okText="确定"
          onOk={() => {
            if (showData.length == 0 || showData.length > 1) {
              message.warn('只能选择单条数据');
            }
            if (showData.length == 1) {
              setShowForm(true);
              setOperateKey(undefined);
            }
          }}
          onCancel={() => {
            setOperateKey(undefined);
          }}>
          <SelectOperation
            current={selectMenu.item}
            showData={showData}
            setShowData={setShowData}></SelectOperation>
        </Modal>
      )}
      {showForm && (
        <Modal
          title={`创建实体`}
          width={800}
          destroyOnClose={true}
          open={showForm}
          okText="确定"
          onOk={async () => {
            let values = await formRef.current?.validateFields();
            if (values) {
              /**调用创建物接口 */
              let res = await selectMenu.item.space.createThing(values);
              if (res.success) {
                message.success('创建成功');
                setShowForm(false);
              } else {
                message.error('创建失败');
              }
            }
          }}
          onCancel={() => {
            setShowForm(false);
          }}>
          <OioForm
            form={showData[0]?.item}
            formRef={formRef}
            submitter={{
              resetButtonProps: {
                style: { display: 'none' },
              },
              submitButtonProps: {
                style: { display: 'none' },
              },
            }}
            belong={selectMenu.item.space}
          />
        </Modal>
      )}
      <Content key={key} selectMenu={selectMenu} />
    </MainLayout>
  );
};

export default Package;
