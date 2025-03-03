import { Checkbox, Flex, Modal } from 'antd';
import { useState } from 'react';

type UserManageModalProps = {
  open: boolean;
  onCancel: () => void;
  onExit: (clearData: boolean) => void;
};

export default function LogoutConfirmModal(props: UserManageModalProps) {
  const [clearData, setClearData] = useState(false);
  return (
    <Modal
      width={300}
      open={props.open}
      title="退出登录"
      okText="确认退出"
      onOk={() => props.onExit(clearData)}
      onCancel={() => props.onCancel()}
    >
      <Flex justify="center" style={{ padding: 10 }}>
        <Checkbox onChange={(e) => setClearData(e.target.checked)}>清空本地聊天记录？</Checkbox>
      </Flex>
    </Modal>
  );
}
