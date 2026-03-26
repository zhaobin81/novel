import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Message, Character } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from '../components/ChatInterface';

const CHARACTER_DESIGNER_PROMPT = `你是一个专业的角色塑造师。你需要与用户沟通，帮助他们设计小说中的角色。

请遵循以下流程：
1. 首先了解用户想要创作的小说类型和故事背景
2. 询问用户需要设计什么类型的角色（主角、配角、反派等）
3. 逐步了解角色的：
   - 外貌特征（面部、身材、服装等）
   - 性格特点（优点、缺点、性格形成原因）
   - 背景故事（出身、经历、转折点）
   - 与其他角色的关系
4. 当角色设计足够完整后，生成结构化的角色档案

请用中文回答，保持对话流畅、自然，像一个经验丰富的编辑在引导作者。`;

export default function CharacterDesigner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAPI, setHasAPI] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
    name: '',
    role: '',
    appearance: '',
    personality: '',
    background: '',
    relationships: '',
  });

  useEffect(() => {
    const config = storage.getAPIConfig();
    setHasAPI(!!config);
    setCharacters(storage.getCharacters());
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
        CHARACTER_DESIGNER_PROMPT
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

  const handleAddCharacter = () => {
    const character: Character = {
      id: uuidv4(),
      name: newCharacter.name || '未命名角色',
      role: newCharacter.role || '',
      appearance: newCharacter.appearance || '',
      personality: newCharacter.personality || '',
      background: newCharacter.background || '',
      relationships: newCharacter.relationships || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.addCharacter(character);
    setCharacters(storage.getCharacters());
    setShowCharacterModal(false);
    setNewCharacter({
      name: '',
      role: '',
      appearance: '',
      personality: '',
      background: '',
      relationships: '',
    });
    alert('角色已添加！');
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setNewCharacter({ ...character });
    setShowCharacterModal(true);
  };

  const handleUpdateCharacter = () => {
    if (!editingCharacter) return;

    const updated: Character = {
      ...editingCharacter,
      ...newCharacter,
      updatedAt: Date.now(),
    };

    storage.updateCharacter(updated);
    setCharacters(storage.getCharacters());
    setShowCharacterModal(false);
    setEditingCharacter(null);
    setNewCharacter({
      name: '',
      role: '',
      appearance: '',
      personality: '',
      background: '',
      relationships: '',
    });
    alert('角色已更新！');
  };

  const handleDeleteCharacter = (id: string) => {
    if (!confirm('确定要删除这个角色吗？')) return;
    storage.deleteCharacter(id);
    setCharacters(storage.getCharacters());
  };

  return (
    <Container fluid className="h-100 py-3">
      <Row className="h-100">
        <Col md={4} className="border-end">
          <h4 className="mb-3">角色列表 ({characters.length})</h4>

          <Button
            variant="primary"
            className="w-100 mb-3"
            onClick={() => {
              setEditingCharacter(null);
              setNewCharacter({
                name: '',
                role: '',
                appearance: '',
                personality: '',
                background: '',
                relationships: '',
              });
              setShowCharacterModal(true);
            }}
          >
            添加角色
          </Button>

          <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
            {characters.length === 0 && (
              <Alert variant="info">
                还没有角色，请添加或通过对话创建
              </Alert>
            )}

            {characters.map(character => (
              <Card key={character.id} className="mb-2">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{character.name}</strong>
                      {character.role && (
                        <span className="text-muted ms-2">({character.role})</span>
                      )}
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => handleEditCharacter(character)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => handleDeleteCharacter(character.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  {character.personality && (
                    <p className="mb-0 text-muted small">
                      {character.personality.substring(0, 100)}
                      {character.personality.length > 100 ? '...' : ''}
                    </p>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
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

      <Modal
        show={showCharacterModal}
        onHide={() => {
          setShowCharacterModal(false);
          setEditingCharacter(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCharacter ? '编辑角色' : '添加角色'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>角色名称</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCharacter.name}
                    onChange={e => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    placeholder="输入角色名称"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>角色定位</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCharacter.role}
                    onChange={e => setNewCharacter({ ...newCharacter, role: e.target.value })}
                    placeholder="主角/配角/反派等"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>外貌特征</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newCharacter.appearance}
                onChange={e => setNewCharacter({ ...newCharacter, appearance: e.target.value })}
                placeholder="描述角色的外貌特征..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>性格特点</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newCharacter.personality}
                onChange={e => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                placeholder="描述角色的性格特点..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>背景故事</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCharacter.background}
                onChange={e => setNewCharacter({ ...newCharacter, background: e.target.value })}
                placeholder="描述角色的背景故事..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>人物关系</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newCharacter.relationships}
                onChange={e => setNewCharacter({ ...newCharacter, relationships: e.target.value })}
                placeholder="描述与其他角色的关系..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={editingCharacter ? handleUpdateCharacter : handleAddCharacter}
          >
            {editingCharacter ? '更新' : '添加'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
