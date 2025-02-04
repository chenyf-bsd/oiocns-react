import React from 'react';
import { MenuType } from './menuType';
import * as im from 'react-icons/im';
import TeamIcon from '@/bizcomponents/GlobalComps/teamIcon';
import orgCtrl from '@/ts/controller';
import { MenuItemType } from 'typings/globelType';
import { IMsgChat, TargetType } from '@/ts/core';
import OrgIcons from '@/bizcomponents/GlobalComps/orgIcons';

/** 创建会话菜单 */
const createChatMenu = (chat: IMsgChat, children: MenuItemType[]) => {
  return {
    key: chat.chatdata.fullId,
    item: chat,
    label: chat.chatdata.chatName,
    tag: chat.chatdata.labels,
    itemType: MenuType.Chat,
    menus: loadChatMoreMenus(false, true),
    icon: <TeamIcon notAvatar={true} share={chat.share} size={18} fontSize={16} />,
    children: children,
  };
};

const loadBookMenu = () => {
  const companyItems = [];
  for (const company of orgCtrl.user.companys) {
    const innnerChats = [];
    for (const item of company.departments) {
      innnerChats.push(...item.chats);
    }
    companyItems.push({
      key: company.key + '同事',
      company,
      label: company.metadata.name,
      item: company.chats.filter((i) => i.isMyChat),
      itemType: MenuType.Books,
      icon: <TeamIcon share={company.share} size={18} fontSize={16} />,
      children: [
        createChatMenu(
          company,
          company.memberChats.map((item) => createChatMenu(item, [])),
        ),
        ...company.cohortChats
          .filter((i) => i.isMyChat)
          .map((item) => createChatMenu(item, [])),
      ],
    });
  }
  return [
    {
      key: orgCtrl.user.key,
      label: orgCtrl.user.chatdata.chatName,
      itemType: orgCtrl.user.chatdata.chatName,
      item: orgCtrl.user.chats.filter(
        (i) =>
          i.isMyChat &&
          (i.belongId === i.userId || i.share.typeName === TargetType.Cohort),
      ),
      children: [
        createChatMenu(
          orgCtrl.user,
          orgCtrl.user.memberChats.map((chat) => createChatMenu(chat, [])),
        ),
        ...orgCtrl.user.cohortChats
          .filter((i) => i.isMyChat)
          .map((item) => createChatMenu(item, [])),
      ],
      icon: <TeamIcon share={orgCtrl.user.share} size={18} fontSize={16} />,
    },
    ...companyItems,
  ];
};

/** 加载右侧菜单 */
const loadChatMoreMenus = (allowDelete: boolean, isChat: boolean = false) => {
  const items = [];
  if (isChat) {
    items.push({
      key: '会话详情',
      label: '会话详情',
      icon: <im.ImProfile />,
      model: 'outside',
    });
    if (allowDelete) {
      items.push({
        key: '清空消息',
        label: '清空消息',
        icon: <im.ImBin />,
        model: 'outside',
      });
    }
    items.push({
      key: '标记为未读',
      label: '标记为未读',
      icon: <im.ImBell />,
      model: 'outside',
    });
  }
  return items;
};

/** 加载会话菜单 */
export const loadChatMenu = () => {
  const chatMenus = {
    key: '沟通',
    label: '沟通',
    itemType: 'Tab',
    children: [],
    icon: <OrgIcons chat />,
  } as MenuItemType;
  chatMenus.children = loadBookMenu();
  return chatMenus;
};
