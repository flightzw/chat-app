import { Button, Result } from 'antd';
import './index.scss';
import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      className="not-found"
      status="404"
      title="404"
      subTitle="很抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate('/home')}>
          返回主页
        </Button>
      }
    />
  );
}
