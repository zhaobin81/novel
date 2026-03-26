import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Message, WorldDesign, Faction, Location } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from '../components/ChatInterface';

const WORLD_BUILDER_PROMPT = `你是一个专业的世界观构建助手。你需要与用户沟通，了解他们想要创作的小说的世界设定。

请遵循以下流程：
1. 首先询问用户想要创作什么样的小说类型（玄幻、科幻、奇幻、现实等）
2. 了解用户对这个世界的初步想法
3. 帮助用户构建：
   - 世界地图/整体格局
   - 势力分布（国家、宗门、帮派等）
   - 重要地点（城市、秘境、战场等）
   - 世界规则（修炼体系、科技水平等）

在对话过程中，当用户提供足够的设定信息后，请生成结构化的世界观文档，并在最后总结并询问用户是否需要保存。

请用中文回答，回复要专业、有深度。`;

export default function WorldBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAPI, setHasAPI] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [worldName, setWorldName] = useState('');
  const [worldDesign, setWorldDesign] = useState<WorldDesign | null>(null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [worldMap, setWorldMap] = useState('');
  const [showFactionModal, setShowFactionModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newFaction, setNewFaction] = useState<Faction>({ id: '', name: '', description: '', influence: '' });
  const [newLocation, setNewLocation] = useState<Location>({ id: '', name: '', description: '', significance: '' });

  useEffect(() => {
    const config = storage.getAPIConfig();
    setHasAPI(!!config);

    const savedWorld = storage.getWorldDesign();
    if (savedWorld) {
      setWorldDesign(savedWorld);
      setWorldName(savedWorld.name);
      setFactions(savedWorld.factions);
      setLocations(savedWorld.locations);
      setWorldMap(savedWorld.map || '');
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.sendMessageNoStream(
        [...messages, userMessage],
        WORLD_BUILDER_PROMPT
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [messages]);

  const handleSaveWorld = () => {
    if (!worldName.trim()) {
      alert('请输入世界名称');
      return;
    }

    const world: WorldDesign = {
      id: worldDesign?.id || uuidv4(),
      name: worldName,
      map: worldMap,
      factions,
      locations,
      createdAt: worldDesign?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    storage.setWorldDesign(world);
    setWorldDesign(world);
    setShowSaveModal(false);
    alert('世界设计已保存！');
  };

  const handleAddFaction = () => {
    if (!newFaction.name.trim()) return;
    setFactions([...factions, { ...newFaction, id: uuidv4() }]);
    setNewFaction({ id: '', name: '', description: '', influence: '' });
    setShowFactionModal(false);
  };

  const handleAddLocation = () => {
    if (!newLocation.name.trim()) return;
    setLocations([...locations, { ...newLocation, id: uuidv4() }]);
    setNewLocation({ id: '', name: '', description: '', significance: '' });
    setShowLocationModal(false);
  };

  const handleDeleteFaction = (id: string) => {
    setFactions(factions.filter(f => f.id !== id));
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  return (
    <Container fluid className="h-100 py-3">
      <Row className="h-100">
        <Col md={4} className="border-end">
          <h4 className="mb-3">世界设计</h4>

          <Form.Group className="mb-3">
            <Form.Label>世界名称</Form.Label>
            <Form.Control
              type="text"
              value={worldName}
              onChange={e => setWorldName(e.target.value)}
              placeholder="输入世界名称"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>世界地图描述</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={worldMap}
              onChange={e => setWorldMap(e.target.value)}
              placeholder="描述你的世界地图..."
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>势力 ({factions.length})</h5>
            <Button size="sm" variant="outline-primary" onClick={() => setShowFactionModal(true)}>
              添加
            </Button>
          </div>
          <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {factions.map(faction => (
              <Card key={faction.id} className="mb-2">
                <Card.Body className="p-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{faction.name}</strong>
                      <p className="mb-0 text-muted small">{faction.description}</p>
                    </div>
                    <Button size="sm" variant="link" onClick={() => handleDeleteFaction(faction.id)}>
                      删除
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>地点 ({locations.length})</h5>
            <Button size="sm" variant="outline-primary" onClick={() => setShowLocationModal(true)}>
              添加
            </Button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {locations.map(location => (
              <Card key={location.id} className="mb-2">
                <Card.Body className="p-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{location.name}</strong>
                      <p className="mb-0 text-muted small">{location.description}</p>
                    </div>
                    <Button size="sm" variant="link" onClick={() => handleDeleteLocation(location.id)}>
                      删除
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          <Button variant="success" className="w-100 mt-3" onClick={() => setShowSaveModal(true)}>
            保存世界设计
          </Button>

          {worldDesign && (
            <Alert variant="info" className="mt-3">
              已保存: {new Date(worldDesign.updatedAt).toLocaleString()}
            </Alert>
          )}
        </Col>

        <Col md={8}>
          {!hasAPI && (
            <Alert variant="warning">
              请先配置 API 设置
            </Alert>
          )}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={!hasAPI}
          />
        </Col>
      </Row>

      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>保存世界设计</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>世界名称</Form.Label>
            <Form.Control
              type="text"
              value={worldName}
              onChange={e => setWorldName(e.target.value)}
              placeholder="输入世界名称"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSaveWorld}>
            保存
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showFactionModal} onHide={() => setShowFactionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>添加势力</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>势力名称</Form.Label>
            <Form.Control
              type="text"
              value={newFaction.name}
              onChange={e => setNewFaction({ ...newFaction, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>描述</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newFaction.description}
              onChange={e => setNewFaction({ ...newFaction, description: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>影响力</Form.Label>
            <Form.Control
              type="text"
              value={newFaction.influence}
              onChange={e => setNewFaction({ ...newFaction, influence: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFactionModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleAddFaction}>
            添加
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>添加地点</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>地点名称</Form.Label>
            <Form.Control
              type="text"
              value={newLocation.name}
              onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>描述</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newLocation.description}
              onChange={e => setNewLocation({ ...newLocation, description: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>重要性</Form.Label>
            <Form.Control
              type="text"
              value={newLocation.significance}
              onChange={e => setNewLocation({ ...newLocation, significance: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLocationModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleAddLocation}>
            添加
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
