import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { APIConfig } from '../types';
import { storage } from '../services/storage';

export default function Settings() {
  const [config, setConfig] = useState<APIConfig>({
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = storage.getAPIConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  const handleSave = () => {
    storage.setAPIConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    try {
      const response = await fetch(`${config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      });
      if (response.ok) {
        alert('API 连接成功！');
      } else {
        alert('API 连接失败，请检查配置。');
      }
    } catch {
      alert('API 连接失败，请检查配置。');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">API 设置</h2>

      {saved && (
        <Alert variant="success" onClose={() => setSaved(false)} dismissible>
          设置已保存！
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>API 地址</Form.Label>
              <Form.Control
                type="text"
                value={config.baseUrl}
                onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />
              <Form.Text className="text-muted">
                支持 OpenAI 兼容 API，如 OpenAI、Azure 等
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="password"
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>模型名称</Form.Label>
              <Form.Control
                type="text"
                value={config.model}
                onChange={e => setConfig({ ...config, model: e.target.value })}
                placeholder="gpt-3.5-turbo"
              />
              <Form.Text className="text-muted">
                例如: gpt-3.5-turbo, gpt-4, gpt-4-turbo
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleSave}>
                保存设置
              </Button>
              <Button variant="outline-secondary" onClick={handleTest}>
                测试连接
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
