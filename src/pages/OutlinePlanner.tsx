import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Message, Outline, ChapterOutline } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from '../components/ChatInterface';

const OUTLINE_PLANNER_PROMPT = `你是一个专业的小说大纲规划师。你需要与用户沟通，帮助他们构建完整的小说大纲。

请遵循以下流程：
1. 首先了解用户想要创作的小说的基本信息（类型、风格、篇幅等）
2. 了解用户的世界观设计（如果没有，可以引导用户先去世界观智能体设计）
3. 了解用户想要塑造的角色（如果没有，可以引导用户先去角色塑造师设计）
4. 逐步构建：
   - 世界构造：整体世界是什么样的
   - 主线故事：故事的核心冲突和发展方向
   - 人物设计：主要角色在故事中的作用和成长
   - 章节规划：大致的故事走向和关键节点

当对话足够充分后，帮助用户生成粗略大纲，然后根据用户提供的"一句话章节骨架"生成本章节的详细大纲。

请用中文回答，保持对话流畅、专业。`;

export default function OutlinePlanner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAPI, setHasAPI] = useState(false);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [title, setTitle] = useState('');
  const [worldConstruction, setWorldConstruction] = useState('');
  const [mainStory, setMainStory] = useState('');
  const [characterDesign, setCharacterDesign] = useState('');
  const [chapterOutlines, setChapterOutlines] = useState<ChapterOutline[]>([]);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [newChapterSkeleton, setNewChapterSkeleton] = useState('');
  const [generatingChapter, setGeneratingChapter] = useState(false);

  useEffect(() => {
    const config = storage.getAPIConfig();
    setHasAPI(!!config);

    const savedOutline = storage.getOutline();
    if (savedOutline) {
      setOutline(savedOutline);
      setTitle(savedOutline.title);
      setWorldConstruction(savedOutline.worldConstruction);
      setMainStory(savedOutline.mainStory);
      setCharacterDesign(savedOutline.characterDesign);
      setChapterOutlines(savedOutline.chapterOutlines);
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
        OUTLINE_PLANNER_PROMPT
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

  const handleSaveOutline = () => {
    if (!title.trim()) {
      alert('请输入大纲标题');
      return;
    }

    const newOutline: Outline = {
      id: outline?.id || uuidv4(),
      title,
      worldConstruction,
      mainStory,
      characterDesign,
      chapterOutlines,
      createdAt: outline?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    storage.setOutline(newOutline);
    setOutline(newOutline);
    setShowOutlineModal(false);
    alert('大纲已保存！');
  };

  const handleGenerateChapterOutline = async () => {
    if (!newChapterSkeleton.trim()) {
      alert('请输入章节骨架');
      return;
    }

    setGeneratingChapter(true);
    const chapterNumber = chapterOutlines.length + 1;

    try {
      const worldDesign = storage.getWorldDesign();
      const characters = storage.getCharacters();
      const existingOutline = storage.getOutline();

      const contextPrompt = `
当前世界观设计：${worldDesign ? JSON.stringify(worldDesign) : '暂无'}
当前角色列表：${characters.length > 0 ? JSON.stringify(characters) : '暂无'}
当前大纲：${existingOutline ? JSON.stringify(existingOutline) : '暂无'}
用户提供的章节骨架：${newChapterSkeleton}
`;

      const response = await api.sendMessageNoStream(
        [],
        `你是一个专业的小说章节大纲生成器。请根据用户提供的"一句话骨架"生成本章节的详细大纲。

要求：
1. 章节大纲应该包含：场景描写、情节发展、角色互动、情感变化等
2. 要符合整体世界观和人物设定
3. 语言要生动、具体、有画面感
4. 字数控制在 300-500 字

${contextPrompt}`
      );

      const newChapter: ChapterOutline = {
        id: uuidv4(),
        number: chapterNumber,
        skeleton: newChapterSkeleton,
        content: response,
      };

      setChapterOutlines([...chapterOutlines, newChapter]);
      setNewChapterSkeleton('');
      setShowChapterModal(false);
    } catch (error) {
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setGeneratingChapter(false);
    }
  };

  const handleDeleteChapter = (id: string) => {
    const updated = chapterOutlines.filter(c => c.id !== id);
    setChapterOutlines(updated.map((c, i) => ({ ...c, number: i + 1 })));
  };

  return (
    <Container fluid className="h-100 py-3">
      <Row className="h-100">
        <Col md={4} className="border-end">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>大纲设计</h4>
            <Button size="sm" variant="primary" onClick={() => setShowOutlineModal(true)}>
              编辑大纲
            </Button>
          </div>

          {outline && (
            <>
              <Alert variant="success" className="mb-3">
                已保存: {outline.title}
              </Alert>

              <Card className="mb-3">
                <Card.Header>世界构造</Card.Header>
                <Card.Body>
                  <small>{worldConstruction || '暂无'}</small>
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Header>主线故事</Card.Header>
                <Card.Body>
                  <small>{mainStory || '暂无'}</small>
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Header>人物设计</Card.Header>
                <Card.Body>
                  <small>{characterDesign || '暂无'}</small>
                </Card.Body>
              </Card>
            </>
          )}

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>章节大纲 ({chapterOutlines.length})</h5>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => setShowChapterModal(true)}
            >
              添加章节
            </Button>
          </div>

          <div style={{ maxHeight: 'calc(100vh - 550px)', overflowY: 'auto' }}>
            {chapterOutlines.map(chapter => (
              <Card key={chapter.id} className="mb-2">
                <Card.Header className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>第{chapter.number}章</span>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => handleDeleteChapter(chapter.id)}
                    >
                      删除
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-2">
                  <p className="mb-1"><strong>骨架：</strong>{chapter.skeleton}</p>
                  <p className="mb-0 text-muted small">{chapter.content}</p>
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

      <Modal show={showOutlineModal} onHide={() => setShowOutlineModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>编辑大纲</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>大纲标题</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="输入大纲标题"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>世界构造</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={worldConstruction}
                onChange={e => setWorldConstruction(e.target.value)}
                placeholder="描述世界构造..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>主线故事</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={mainStory}
                onChange={e => setMainStory(e.target.value)}
                placeholder="描述主线故事..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>人物设计</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={characterDesign}
                onChange={e => setCharacterDesign(e.target.value)}
                placeholder="描述人物设计..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOutlineModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSaveOutline}>
            保存
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showChapterModal} onHide={() => setShowChapterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>添加章节大纲</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>章节骨架（一句话描述）</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newChapterSkeleton}
              onChange={e => setNewChapterSkeleton(e.target.value)}
              placeholder="例如：主角首次遭遇反派，双方发生激烈战斗..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChapterModal(false)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerateChapterOutline}
            disabled={generatingChapter}
          >
            {generatingChapter ? '生成中...' : '生成大纲'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
